# Tauri v2 + Phi-3 Offline AI Chat Integration (Ollama)

## 📌 Overview

This document defines the implementation of an offline AI chat using Phi-3 (via Ollama) for a library system inside a Tauri v2 desktop application.

This version focuses on a **single validated use-case**:

> Checking if "Jose Rizal books" are available.

---

## ✅ Initial Requirements (Must Be Met First)

### System

* OS: Windows / Linux / macOS
* RAM: ≥ 8GB (16GB recommended)
* Disk: ≥ 5GB free

### Model

* Phi-3 Mini (GGUF format)
* Quantized (Q4_K_M recommended)
* Stored locally

### Engine

* llama.cpp compiled and working

### Verification Command

```bash
./llama-cli -m phi-3.gguf -p "Hello"
```

**Expected:**

* Returns valid output
* No crash

---

## 🏗️ Architecture

React (Frontend)
→ Tauri `invoke()`
→ Rust Command
→ llama.cpp
→ Response back to UI

---

## 🧠 Prompt Design (Strict)

### System Prompt

### System Prompt

```
You are infoLib AI, a friendly, intelligent, and highly conversational library assistant.
Always respond naturally, as if you are a real human librarian chatting with the user.
You must be chattable—if the user just says 'hello', greet them warmly without immediately mentioning the catalog or search results unless relevant.
If the user asks about books or topics, use the context provided below. If the context has nothing relevant, say you couldn't find it in our offline database but remain helpful.
Do NOT sound like a robot. Speak like a smart, helpful human companion.

User Message: "{{user_input}}"

Library Catalog Context (use only if relevant):
{{context_data}}
```

---

### User Prompt Template

```
User: {{user_input}}

Context:
{{database_result_or_mock_data}}

Respond in JSON only.
```

---

## 🧪 Example Use Case

### Input

```
User: is jose rizal books available?
Context:
Available books:
- Noli Me Tangere (available)
- El Filibusterismo (borrowed)
```

---

### Expected Output

```json
{
  "available": true,
  "book": "Jose Rizal books",
  "message": "Some Jose Rizal books are available."
}
```

---

## ⚙️ Tauri Implementation

### Rust Command

```rust
#[tauri::command]
fn ask_ai(prompt: String) -> String {
    use std::process::Command;

    let output = Command::new("llama-cli")
        .arg("-m")
        .arg("models/phi-3.gguf")
        .arg("-p")
        .arg(prompt)
        .output()
        .expect("failed");

    String::from_utf8_lossy(&output.stdout).to_string()
}
```

---

### Frontend (React)

```ts
import { invoke } from "@tauri-apps/api/core";

export async function sendMessage(input: string) {
  const res = await invoke("ask_ai", { prompt: input });
  return JSON.parse(res);
}
```

---

## 🧪 QA TEST (MANDATORY)

### Test Case: Availability Check

**Input:**

```
is jose rizal books available?
```

**Mock Context:**

```
Noli Me Tangere - available
El Filibusterismo - borrowed
```

---

### QA Validation Checklist

* [ ] Output is valid JSON
* [ ] No extra text outside JSON
* [ ] Field `available` exists
* [ ] Field `book` exists
* [ ] Field `message` exists
* [ ] No hallucinated data
* [ ] Response time < 10 seconds
* [ ] No application crash

---

### Expected QA Result

```json
{
  "available": true,
  "book": "Jose Rizal books",
  "message": "Some Jose Rizal books are available."
}
```

---

## 🔒 Constraints

* AI must NOT access database directly
* AI must NOT execute actions
* All logic handled in Rust backend
* AI is only for interpretation + response formatting

---

## 📦 Model Storage

Store model in:

```
%APPDATA%/melvin/yourApp/models
```

Do NOT bundle in installer.

---

## 🔄 Extensibility Note

This document is a **minimal implementation spec**.

It can and should be updated to:

* Support full CRUD operations (borrow/return)
* Add structured query generation
* Integrate real database results (RAG)
* Enable streaming responses
* Improve prompt robustness and validation

---

## ✅ Conclusion

This setup ensures:

* Fully offline AI chat
* Deterministic JSON output
* QA-verifiable behavior
* Scalable foundation for full library AI system
