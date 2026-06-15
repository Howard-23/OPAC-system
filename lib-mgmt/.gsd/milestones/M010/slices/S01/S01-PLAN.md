# S01 — MDB Import Backend (Pure Rust)

## Objective
Build the backend Tauri command `import_mdb_database` in pure Rust that: auto-backs up PostgreSQL, reads the `.mdb` file via ODBC, validates all incoming data, and imports it in a safe transaction.

## New File
`src-tauri/src/import.rs` — all import logic lives here, registered in `lib.rs`.

---

## Tasks

### T01 — Auto-Backup Before Import
**Priority**: CRITICAL — must pass before any import proceeds.
- [ ] Invoke `pg_dump` via `std::process::Command` (synchronous, blocking)
- [ ] Backup path: `{app_config_dir}/backups/backup_{timestamp}.sql`
- [ ] Verify backup file exists and `size > 0`
- [ ] Rotate: keep only the 5 most recent backups, delete older ones
- [ ] Return `Err(...)` from the Tauri command if backup fails → aborts entire operation

### T02 — ODBC Driver Pre-Check
**Priority**: HIGH — must run before attempting any MDB connection.
- [ ] Use `odbc-api` to attempt listing ODBC data sources
- [ ] Check if any driver name contains `"Microsoft Access Driver"` or `"Microsoft Access Text Driver"`
- [ ] If not found, return structured error: `{ error: "odbc_missing", url: "https://..." }`
- [ ] Frontend will show a special dialog with the download link for this error code

### T03 — Read MDB via ODBC
**Priority**: HIGH
- [ ] Connect to `.mdb` using connection string:
  `Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq={path};Pwd=1022;`
- [ ] Enumerate all 13 target tables (hardcoded list matching schema parity)
- [ ] For each table: fetch all rows as `Vec<HashMap<String, OdbcValue>>`
- [ ] Handle NULL values gracefully — map to `Option<String>` / `Option<i32>`
- [ ] Apply encoding sanitization: strip invalid UTF-8 bytes, normalize whitespace (Mojibake fix from D053)

### T04 — Validation Pipeline
**Priority**: HIGH — runs on in-memory data before any DB write.

Validation rules per table:

| Table | Required Fields | Dedup Key | FK Check |
|-------|----------------|-----------|----------|
| tblAuthor | Author (non-empty) | AuthorCode | — |
| tblSubject | subject (non-empty) | SubjectCode | — |
| tblCat | Title (non-empty), controlno (non-empty) | controlno | AuthorCode → tblAuthor |
| tblHoldings | Accession (non-empty), controlno | Accession | controlno → tblCat |
| tblUser | Idno (non-empty) | Idno | — |
| tblGroup | Groupname (non-empty) | Groupname | — |
| tblLocation | Location (non-empty) | Location | — |
| tblMaterial | Material (non-empty) | Material | — |
| tblPassword | username (non-empty) | username | — |
| tblRent | Accession, Idno | (composite) | — |
| tblFineCode | Idno | (append-only) | — |
| tblReserve | RecNumber | RecNumber | — |
| tblMessage | — | (replace) | — |

- [ ] Load existing PKs from PostgreSQL into memory (one query per table) for dedup
- [ ] Classify each incoming row: `Valid`, `Duplicate`, `Invalid(reason)`
- [ ] Build `ValidationReport { valid_counts, duplicate_counts, invalid_rows }`

### T05 — Import Transaction
**Priority**: HIGH — only runs after T01 backup succeeds and T04 validation completes.
- [ ] Insert in FK-dependency order (see M010-PLAN.md import order)
- [ ] Use a single `sqlx` transaction: `BEGIN` … `COMMIT`, `ROLLBACK` on any error
- [ ] Use `INSERT ... ON CONFLICT DO NOTHING` for all tables (safe dedup at DB level as a second safety net)
- [ ] Count actual rows inserted per table
- [ ] Return `ImportSummary` struct:
```rust
pub struct ImportSummary {
    pub backup_path: String,
    pub inserted: HashMap<String, usize>,
    pub skipped: HashMap<String, usize>,
    pub invalid: Vec<InvalidRow>,
    pub duration_ms: u64,
}
```

### T06 — Wire into lib.rs
- [ ] Add `mod import;` to `lib.rs`
- [ ] Register `import::import_mdb_database` in `generate_handler![]`
- [ ] Add `odbc-api` to `Cargo.toml` with `features = ["odbc_version_3_5"]`

---

## Schema Mapping (MDB column → PostgreSQL column)
All 13 tables share **identical** column names and types between the legacy MDB and our PostgreSQL schema (by design). No column renaming or type transformation required.

## Import Order (FK dependency chain)
1. tblAuthor → 2. tblSubject → 3. tblGroup → 4. tblLocation → 5. tblMaterial → 6. tblMessage → 7. tblPassword → 8. tblCat → 9. tblUser → 10. tblHoldings → 11. tblRent → 12. tblFineCode → 13. tblReserve

## Acceptance Criteria
- [ ] Import of `glDB.mdb` with ~200 new records completes in < 30s
- [ ] Existing 6,619 catalog records remain untouched after re-import
- [ ] Backup file present in `backups/` directory with correct timestamp
- [ ] No Mojibake in any imported text field
- [ ] `ON CONFLICT DO NOTHING` confirmed working via re-import test (same file twice = 0 new inserts on second run)
