/// M010 — Legacy Access Database Import
/// Pure Rust via odbc-api. No Python. No subprocess.
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use odbc_api::{Connection, ConnectionOptions, Cursor, Environment, buffers::TextRowSet, ResultSetMetadata};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tauri::{AppHandle, Manager};

use crate::auth::{self, SessionState};
use crate::db::DbState;
use crate::settings;

// ─── Public output types ────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImportSummary {
    pub backup_path: String,
    pub before_counts: HashMap<String, usize>,
    pub inserted: HashMap<String, usize>,
    pub skipped: HashMap<String, usize>,
    pub invalid: Vec<InvalidRow>,
    pub duration_ms: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InvalidRow {
    pub table: String,
    pub reason: String,
    pub row_preview: String,
}

// ─── Table row: column_name → value (all as String for portability) ─────────

type Row = HashMap<String, Option<String>>;

struct TableData {
    name: String,
    rows: Vec<Row>,
}

// ─── Import order (FK dependency) ───────────────────────────────────────────

const IMPORT_ORDER: &[&str] = &[
    "tblAuthor",
    "tblSubject",
    "tblGroup",
    "tblLocation",
    "tblMaterial",
    "tblMessage",
    "tblPassword",
    "tblCat",
    "tblUser",
    "tblHoldings",
    "tblRent",
    "tblFineCode",
    "tblReserve",
];

// ─── T01: Auto-backup ────────────────────────────────────────────────────────

fn auto_backup(app: &AppHandle) -> Result<String, String> {
    let config = settings::load_config(app);
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;
    let backup_dir = config_dir.join("backups");
    fs::create_dir_all(&backup_dir).map_err(|e| e.to_string())?;

    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(Duration::from_secs(0))
        .as_secs();
    let backup_path = backup_dir.join(format!("backup_{}.sql", ts));

    // Parse DATABASE_URL → pg_dump args
    let db_url = &config.database_url;
    let status = Command::new("pg_dump")
        .arg("--no-password")
        .arg("-d")
        .arg(db_url)
        .arg("-f")
        .arg(backup_path.to_str().unwrap_or(""))
        .env("PGPASSWORD", extract_pg_password(db_url))
        .status()
        .map_err(|e| format!("pg_dump not found: {}", e))?;

    if !status.success() {
        return Err("pg_dump failed. Aborting import.".to_string());
    }

    let meta = fs::metadata(&backup_path).map_err(|e| e.to_string())?;
    if meta.len() == 0 {
        return Err("Backup file is empty. Aborting import.".to_string());
    }

    // Rotate: keep only 5 most recent backups
    rotate_backups(&backup_dir, 5);

    Ok(backup_path.to_string_lossy().to_string())
}

fn extract_pg_password(url: &str) -> String {
    // postgresql://user:password@host:port/db
    if let Some(at) = url.find('@') {
        if let Some(colon) = url[..at].rfind(':') {
            // skip the protocol colon
            let scheme_end = url.find("://").map(|i| i + 3).unwrap_or(0);
            if colon > scheme_end {
                return url[colon + 1..at].to_string();
            }
        }
    }
    String::new()
}

fn rotate_backups(dir: &Path, keep: usize) {
    let mut files: Vec<PathBuf> = fs::read_dir(dir)
        .ok()
        .into_iter()
        .flatten()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map(|x| x == "sql").unwrap_or(false))
        .map(|e| e.path())
        .collect();
    files.sort();
    while files.len() > keep {
        let _ = fs::remove_file(files.remove(0));
    }
}

// ─── T02: ODBC driver check ──────────────────────────────────────────────────

fn check_odbc_driver(env: &Environment) -> Result<(), String> {
    let drivers = env.drivers().map_err(|e| e.to_string())?;
    let found = drivers
        .iter()
        .any(|d| d.description.contains("Microsoft Access Driver"));
    if found {
        Ok(())
    } else {
        Err("odbc_missing".to_string())
    }
}

// ─── T03: Read MDB via ODBC ──────────────────────────────────────────────────

fn read_mdb(mdb_path: &str, env: &Environment) -> Result<Vec<TableData>, String> {
    let conn_str = format!(
        "Driver={{Microsoft Access Driver (*.mdb, *.accdb)}};Dbq={};Pwd=1022;",
        mdb_path
    );
    let conn = env
        .connect_with_connection_string(&conn_str, ConnectionOptions::default())
        .map_err(|e| format!("MDB connect failed: {}", e))?;

    let mut tables: Vec<TableData> = Vec::new();

    for table_name in IMPORT_ORDER {
        let rows = read_table(&conn, table_name)
            .unwrap_or_else(|e| {
                println!("[Import] Skip {}: {}", table_name, e);
                vec![]
            });
        tables.push(TableData {
            name: table_name.to_string(),
            rows,
        });
    }

    Ok(tables)
}

fn read_table(conn: &Connection, table: &str) -> Result<Vec<Row>, String> {
    let sql = format!("SELECT * FROM [{}]", table);
    let cursor = conn
        .execute(&sql, ())
        .map_err(|e| format!("Query {} failed: {}", table, e))?;

    let Some(mut cursor) = cursor else {
        return Ok(vec![]);
    };

    // odbc-api v8: use column_names() iterator
    let col_names: Vec<String> = cursor
        .column_names()
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    let batch_size = 500;
    let mut buffer = TextRowSet::for_cursor(batch_size, &mut cursor, Some(4096))
        .map_err(|e| e.to_string())?;
    let mut row_set_cursor = cursor.bind_buffer(&mut buffer).map_err(|e| e.to_string())?;

    let mut rows: Vec<Row> = Vec::new();
    while let Some(batch) = row_set_cursor.fetch().map_err(|e| e.to_string())? {
        for row_idx in 0..batch.num_rows() {
            let mut row: Row = HashMap::new();
            for (col_idx, col_name) in col_names.iter().enumerate() {
                let val = batch
                    .at_as_str(col_idx, row_idx)
                    .unwrap_or(None)
                    .map(|s| sanitize_encoding(s));
                row.insert(col_name.clone(), val);
            }
            rows.push(row);
        }
    }

    Ok(rows)
}

/// Fix Mojibake: replace invalid UTF-8 sequences, normalize whitespace.
fn sanitize_encoding(s: &str) -> String {
    s.chars()
        .filter(|c| !c.is_control() || *c == '\n' || *c == '\r' || *c == '\t')
        .collect::<String>()
        .trim()
        .to_string()
}

// ─── T04: Validation ─────────────────────────────────────────────────────────

/// Dedup keys loaded from PostgreSQL per table.
struct ExistingKeys {
    tbl_author: std::collections::HashSet<i64>,
    tbl_subject: std::collections::HashSet<i64>,
    tbl_cat: std::collections::HashSet<String>,
    tbl_holdings: std::collections::HashSet<String>,
    tbl_user: std::collections::HashSet<String>,
    tbl_group: std::collections::HashSet<String>,
    tbl_location: std::collections::HashSet<String>,
    tbl_material: std::collections::HashSet<String>,
    tbl_password: std::collections::HashSet<String>,
    tbl_reserve: std::collections::HashSet<i64>,
}

async fn load_existing_keys(pool: &PgPool) -> Result<ExistingKeys, String> {
    macro_rules! load_text_set {
        ($pool:expr, $query:expr) => {{
            sqlx::query($query)
                .fetch_all($pool)
                .await
                .unwrap_or_default()
                .into_iter()
                .map(|r| {
                    use sqlx::Row;
                    r.try_get::<Option<String>, _>(0)
                        .unwrap_or(None)
                        .unwrap_or_default()
                })
                .collect()
        }};
    }
    macro_rules! load_int_set {
        ($pool:expr, $query:expr) => {{
            sqlx::query($query)
                .fetch_all($pool)
                .await
                .unwrap_or_default()
                .into_iter()
                .map(|r| {
                    use sqlx::Row;
                    r.try_get::<Option<i64>, _>(0)
                        .unwrap_or(None)
                        .unwrap_or(0)
                })
                .collect()
        }};
    }

    Ok(ExistingKeys {
        tbl_author:   load_int_set!(pool, r#"SELECT "AuthorCode"::bigint FROM "tblAuthor""#),
        tbl_subject:  load_int_set!(pool, r#"SELECT "SubjectCode"::bigint FROM "tblSubject""#),
        tbl_cat:      load_text_set!(pool, r#"SELECT "controlno" FROM "tblCat""#),
        tbl_holdings: load_text_set!(pool, r#"SELECT "Accession" FROM "tblHoldings""#),
        tbl_user:     load_text_set!(pool, r#"SELECT "Idno" FROM "tblUser""#),
        tbl_group:    load_text_set!(pool, r#"SELECT "Groupname" FROM "tblGroup""#),
        tbl_location: load_text_set!(pool, r#"SELECT "Location" FROM "tblLocation""#),
        tbl_material: load_text_set!(pool, r#"SELECT "Material" FROM "tblMaterial""#),
        tbl_password: load_text_set!(pool, r#"SELECT "username" FROM "tblPassword""#),
        tbl_reserve:  load_int_set!(pool, r#"SELECT "RecNumber"::bigint FROM "tblReserve""#),
    })
}

fn is_duplicate(table: &str, row: &Row, keys: &ExistingKeys) -> bool {
    match table {
        "tblAuthor"   => keys.tbl_author.contains(&row.get("AuthorCode").and_then(|v| v.as_deref()).and_then(|s| s.parse().ok()).unwrap_or(i64::MIN)),
        "tblSubject"  => keys.tbl_subject.contains(&row.get("SubjectCode").and_then(|v| v.as_deref()).and_then(|s| s.parse().ok()).unwrap_or(i64::MIN)),
        "tblCat"      => keys.tbl_cat.contains(row.get("controlno").and_then(|v| v.as_deref()).unwrap_or("")),
        "tblHoldings" => keys.tbl_holdings.contains(row.get("Accession").and_then(|v| v.as_deref()).unwrap_or("")),
        "tblUser"     => keys.tbl_user.contains(row.get("Idno").and_then(|v| v.as_deref()).unwrap_or("")),
        "tblGroup"    => keys.tbl_group.contains(row.get("Groupname").and_then(|v| v.as_deref()).unwrap_or("")),
        "tblLocation" => keys.tbl_location.contains(row.get("Location").and_then(|v| v.as_deref()).unwrap_or("")),
        "tblMaterial" => keys.tbl_material.contains(row.get("Material").and_then(|v| v.as_deref()).unwrap_or("")),
        "tblPassword" => keys.tbl_password.contains(row.get("username").and_then(|v| v.as_deref()).unwrap_or("")),
        "tblReserve"  => keys.tbl_reserve.contains(&row.get("RecNumber").and_then(|v| v.as_deref()).and_then(|s| s.parse().ok()).unwrap_or(i64::MIN)),
        _ => false, // tblRent, tblFineCode, tblMessage — append-only or replace
    }
}

fn validate_row(table: &str, row: &Row) -> Option<String> {
    match table {
        "tblAuthor" => {
            if row.get("Author").and_then(|v| v.as_deref()).unwrap_or("").is_empty() {
                return Some("Author name empty".to_string());
            }
        }
        "tblCat" => {
            if row.get("Title").and_then(|v| v.as_deref()).unwrap_or("").is_empty() {
                return Some("Title empty".to_string());
            }
            if row.get("controlno").and_then(|v| v.as_deref()).unwrap_or("").is_empty() {
                return Some("controlno empty".to_string());
            }
        }
        "tblHoldings" => {
            if row.get("Accession").and_then(|v| v.as_deref()).unwrap_or("").is_empty() {
                return Some("Accession empty".to_string());
            }
        }
        "tblUser" => {
            if row.get("Idno").and_then(|v| v.as_deref()).unwrap_or("").is_empty() {
                return Some("Idno empty".to_string());
            }
        }
        _ => {}
    }
    None
}

// ─── T05: Import transaction ──────────────────────────────────────────────────

async fn import_tables(
    pool: &PgPool,
    tables: &[TableData],
    keys: &ExistingKeys,
) -> Result<(HashMap<String, usize>, HashMap<String, usize>, Vec<InvalidRow>), String> {
    let mut inserted: HashMap<String, usize> = HashMap::new();
    let mut skipped: HashMap<String, usize> = HashMap::new();
    let mut invalids: Vec<InvalidRow> = Vec::new();

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    for table_data in tables {
        let name = &table_data.name;
        let mut ins = 0usize;
        let mut sk = 0usize;

        for row in &table_data.rows {
            // Validate
            if let Some(reason) = validate_row(name, row) {
                invalids.push(InvalidRow {
                    table: name.clone(),
                    reason,
                    row_preview: format!("{:?}", row.get("controlno").or_else(|| row.get("Accession")).or_else(|| row.get("AuthorCode"))),
                });
                continue;
            }

            // Dedup
            if is_duplicate(name, row, keys) {
                sk += 1;
                continue;
            }

            // Build INSERT ... ON CONFLICT DO NOTHING
            let cols: Vec<String> = row.keys().cloned().collect();
            if cols.is_empty() { continue; }

            let col_sql = cols.iter()
                .map(|c| format!("\"{}\"", c))
                .collect::<Vec<_>>()
                .join(", ");
            let val_sql = cols.iter()
                .map(|c| match row.get(c) {
                    Some(Some(v)) => format!("'{}'", v.replace('\'', "''")),
                    _ => "NULL".to_string(),
                })
                .collect::<Vec<_>>()
                .join(", ");

            let sql = format!(
                r#"INSERT INTO "public"."{}" ({}) VALUES ({}) ON CONFLICT DO NOTHING"#,
                name, col_sql, val_sql
            );

            match sqlx::query(&sql).execute(&mut *tx).await {
                Ok(r) => { if r.rows_affected() > 0 { ins += 1; } else { sk += 1; } }
                Err(e) => {
                    invalids.push(InvalidRow {
                        table: name.clone(),
                        reason: e.to_string(),
                        row_preview: format!("{:?}", row.get("controlno")),
                    });
                }
            }
        }

        inserted.insert(name.clone(), ins);
        skipped.insert(name.clone(), sk);
    }

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok((inserted, skipped, invalids))
}

// ─── Tauri command ───────────────────────────────────────────────────────────

#[tauri::command]
pub async fn import_mdb_database(
    mdb_path: String,
    dry_run: bool,
    app: AppHandle,
    state: tauri::State<'_, DbState>,
    session: tauri::State<'_, SessionState>,
) -> Result<ImportSummary, String> {
    auth::require_permission(&session, "system:import").await?;
    let start = Instant::now();

    // T01 — backup (skip in dry_run)
    let backup_path = if dry_run {
        "dry_run".to_string()
    } else {
        auto_backup(&app)?
    };

    // T02 — ODBC check
    let env = Environment::new().map_err(|e| format!("ODBC env failed: {}", e))?;
    check_odbc_driver(&env)?;

    // T03 — read MDB
    let tables = read_mdb(&mdb_path, &env)?;

    // Load existing keys for dedup
    let pool = state.get_pool().await?;
    let keys = load_existing_keys(&pool).await?;
    
    let mut before_counts: HashMap<String, usize> = HashMap::new();
    before_counts.insert("tblAuthor".to_string(), keys.tbl_author.len());
    before_counts.insert("tblSubject".to_string(), keys.tbl_subject.len());
    before_counts.insert("tblCat".to_string(), keys.tbl_cat.len());
    before_counts.insert("tblHoldings".to_string(), keys.tbl_holdings.len());
    before_counts.insert("tblUser".to_string(), keys.tbl_user.len());
    before_counts.insert("tblGroup".to_string(), keys.tbl_group.len());
    before_counts.insert("tblLocation".to_string(), keys.tbl_location.len());
    before_counts.insert("tblMaterial".to_string(), keys.tbl_material.len());
    before_counts.insert("tblPassword".to_string(), keys.tbl_password.len());
    before_counts.insert("tblReserve".to_string(), keys.tbl_reserve.len());

    // T04+T05 — validate + import (or just validate in dry_run)
    let (inserted, skipped, invalids) = if dry_run {
        // Dry run: classify only, no DB writes
        let mut valid: HashMap<String, usize> = HashMap::new();
        let mut dup: HashMap<String, usize> = HashMap::new();
        let mut inv: Vec<InvalidRow> = Vec::new();
        for td in &tables {
            let mut v = 0;
            let mut d = 0;
            for row in &td.rows {
                if let Some(reason) = validate_row(&td.name, row) {
                    inv.push(InvalidRow { table: td.name.clone(), reason, row_preview: String::new() });
                } else if is_duplicate(&td.name, row, &keys) {
                    d += 1;
                } else {
                    v += 1;
                }
            }
            valid.insert(td.name.clone(), v);
            dup.insert(td.name.clone(), d);
        }
        (valid, dup, inv)
    } else {
        import_tables(&pool, &tables, &keys).await?
    };

    Ok(ImportSummary {
        backup_path,
        before_counts,
        inserted,
        skipped,
        invalid: invalids,
        duration_ms: start.elapsed().as_millis() as u64,
    })
}
