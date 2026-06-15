use serde::{Deserialize, Serialize};
use crate::db::DbState;
use crate::models::CatalogRecord;
use sqlx::Row;

// --- Ollama API types (current /api/embed endpoint) ---

#[derive(Debug, Serialize)]
struct OllamaEmbedRequest {
    model: String,
    input: String,
}

#[derive(Debug, Deserialize)]
struct OllamaEmbedResponse {
    embeddings: Vec<Vec<f32>>,
}

#[derive(Debug, Serialize)]
struct OllamaGenerateRequest {
    model: String,
    prompt: String,
    stream: bool,
}

#[derive(Debug, Deserialize)]
struct OllamaGenerateResponse {
    response: String,
}

// --- State ---

pub struct AiState {
    pub ollama_url: String,
    pub embedding_model: String,
    pub chat_model: String,
}

impl Default for AiState {
    fn default() -> Self {
        Self {
            ollama_url: "http://localhost:11434".to_string(),
            embedding_model: "nomic-embed-text".to_string(),
            chat_model: "phi3".to_string(),
        }
    }
}

// --- Helpers ---

/// Call Ollama /api/embed, return Vec<f32>
async fn get_embedding(text: &str, ai_state: &AiState) -> Result<Vec<f32>, String> {
    println!("[AI] Embedding request: \"{}\"", text);
    let client = reqwest::Client::new();
    let res = client
        .post(format!("{}/api/embed", ai_state.ollama_url))
        .json(&OllamaEmbedRequest {
            model: ai_state.embedding_model.clone(),
            input: text.to_string(),
        })
        .send()
        .await
        .map_err(|e| {
            println!("[AI] ERROR connect Ollama: {}", e);
            format!("Ollama connection failed: {}", e)
        })?;

    let status = res.status();
    if !status.is_success() {
        let body = res.text().await.unwrap_or_default();
        println!("[AI] ERROR Ollama HTTP {}: {}", status, body);
        return Err(format!("Ollama returned {}: {}", status, body));
    }

    let response: OllamaEmbedResponse = res.json().await.map_err(|e| {
        println!("[AI] ERROR parse Ollama JSON: {}", e);
        format!("Failed to parse Ollama response: {}", e)
    })?;

    let embedding = response.embeddings.into_iter().next()
        .ok_or_else(|| "Ollama returned empty embeddings".to_string())?;

    println!("[AI] Embedding OK (dim={})", embedding.len());
    Ok(embedding)
}

/// Format Vec<f32> as pgvector-compatible string "[0.1,0.2,...]"
fn vec_to_pgvector_string(v: &[f32]) -> String {
    format!(
        "[{}]",
        v.iter().map(|f| f.to_string()).collect::<Vec<String>>().join(",")
    )
}

// --- Tauri commands ---

#[tauri::command]
pub async fn search_catalog_semantic(
    query: String,
    db_state: tauri::State<'_, DbState>,
    ai_state: tauri::State<'_, AiState>,
) -> Result<Vec<CatalogRecord>, String> {
    let embedding = get_embedding(&query, &ai_state).await?;
    let embedding_str = vec_to_pgvector_string(&embedding);

    println!("[AI] Querying pgvector...");
    let rows = sqlx::query(
        r#"
        SELECT
          c."controlno",
          c."Title" as title,
          a."Author" as author,
          c."Callno" as callno,
          c."Copyright" as year
        FROM "public"."tblCat" c
        LEFT JOIN "public"."tblAuthor" a ON c."AuthorCode" = a."AuthorCode"
        WHERE c.embedding IS NOT NULL
        ORDER BY c.embedding <=> $1::vector
        LIMIT 20
        "#
    )
    .bind(&embedding_str)
    .fetch_all(&db_state.get_pool().await?)
    .await
    .map_err(|e| {
        println!("[AI] ERROR pgvector query: {}", e);
        format!("Database search failed: {}", e)
    })?;

    let records: Vec<CatalogRecord> = rows.into_iter().enumerate().map(|(i, row)| CatalogRecord {
        id: i as i32 + 1,
        controlno: row.try_get("controlno").unwrap_or_default(),
        title: row.try_get("title").unwrap_or_default(),
        author: row.try_get::<Option<String>, _>("author").unwrap_or_default().unwrap_or_else(|| "Unknown".to_string()),
        callno: row.try_get("callno").unwrap_or_default(),
        year: row.try_get("year").unwrap_or_default(),
    }).collect();

    println!("[AI] Found {} records.", records.len());
    Ok(records)
}

use futures_util::StreamExt;
use tauri::ipc::Channel;

#[derive(Debug, Deserialize)]
struct OllamaListResponse {
    models: Vec<OllamaModel>,
}

#[derive(Debug, Deserialize)]
struct OllamaModel {
    name: String,
}

#[derive(Debug, Deserialize)]
struct OllamaPullResponse {
    status: String,
    _digest: Option<String>,
    total: Option<i64>,
    completed: Option<i64>,
}

#[tauri::command]
pub async fn check_ollama_model(
    model: String,
    ai_state: tauri::State<'_, AiState>,
) -> Result<bool, String> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!("{}/api/tags", ai_state.ollama_url))
        .send()
        .await
        .map_err(|e| format!("Failed to connect to Ollama: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("Ollama error: {}", res.status()));
    }

    let response: OllamaListResponse = res.json().await.map_err(|e| e.to_string())?;
    Ok(response.models.iter().any(|m| m.name.starts_with(&model)))
}

#[tauri::command]
pub async fn pull_ollama_model(
    model: String,
    ai_state: tauri::State<'_, AiState>,
    on_progress: Channel<String>,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    let res = client
        .post(format!("{}/api/pull", ai_state.ollama_url))
        .json(&serde_json::json!({ "name": model, "stream": true }))
        .send()
        .await
        .map_err(|e| format!("Failed to initiate pull: {}", e))?;

    let mut stream = res.bytes_stream();
    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| e.to_string())?;
        let text = String::from_utf8_lossy(&chunk);
        for line in text.lines() {
            if line.trim().is_empty() { continue; }
            if let Ok(parsed) = serde_json::from_str::<OllamaPullResponse>(line) {
                let msg = if let (Some(t), Some(c)) = (parsed.total, parsed.completed) {
                    format!("{}: {}/{} bytes", parsed.status, c, t)
                } else {
                    parsed.status
                };
                let _ = on_progress.send(msg);
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn chat_with_ai(
    prompt: String,
    context_data: String,
    ai_state: tauri::State<'_, AiState>,
    on_chunk: Channel<String>,
) -> Result<(), String> {
    println!("[AI] Generating streaming chat response...");
    let client = reqwest::Client::new();

    let full_prompt = format!(
        "You are infoLib AI, a friendly, intelligent, and highly conversational library assistant. \
        Always respond naturally, as if you are a real human librarian chatting with the user. \
        You must be chattable—if the user just says 'hello', greet them warmly without immediately mentioning the catalog or search results unless relevant. \
        If the user asks about books or topics, use the context provided below. If the context has nothing relevant, say you couldn't find it in our offline database but remain helpful. \
        Do NOT sound like a robot. Speak like a smart, helpful human companion. \
        \n\nUser Message: \"{}\"\n\nLibrary Catalog Context (use only if relevant):\n{}\n",
        prompt, context_data
    );

    let res = client
        .post(format!("{}/api/generate", ai_state.ollama_url))
        .json(&OllamaGenerateRequest {
            model: ai_state.chat_model.clone(),
            prompt: full_prompt,
            stream: true,
        })
        .send()
        .await
        .map_err(|e| {
            println!("[AI] ERROR connect Phi-3: {}", e);
            format!("Phi-3 connection failed: {}", e)
        })?;

    let status = res.status();
    if !status.is_success() {
        let body = res.text().await.unwrap_or_default();
        println!("[AI] ERROR Phi-3 HTTP {}: {}", status, body);
        return Err(format!("Phi-3 returned {}: {}", status, body));
    }

    let mut stream = res.bytes_stream();
    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| e.to_string())?;
        
        // Ollama sends JSON lines, sometimes multiple per chunk
        let text = String::from_utf8_lossy(&chunk);
        for line in text.lines() {
            if line.trim().is_empty() { continue; }
            if let Ok(parsed) = serde_json::from_str::<OllamaGenerateResponse>(line) {
                let _ = on_chunk.send(parsed.response);
            }
        }
    }

    println!("[AI] Streaming complete.");
    Ok(())
}
