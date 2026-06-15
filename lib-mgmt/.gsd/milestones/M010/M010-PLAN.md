# M010 — Legacy Access Database Import

## Objective
Provide a one-click management tool to import data from the university's legacy Microsoft Access database (`glDB.mdb`) into the new PostgreSQL-based infoLib system. This eliminates manual data re-entry for the library encoder who has been adding ~200 new books monthly in the old system during our development period.

## Business Context
- The legacy system runs on **Visual Basic 6** with a **Microsoft Access (.mdb)** backend.
- The legacy `.mdb` file is password-protected (password: `1022`).
- Our new infoLib app was architecturally designed with **exact schema parity** to the legacy database, making a direct column-mapped import feasible.
- The library encoder at GJC has continued cataloging in the old system. We must provide a way to absorb those new records without manual re-entry.

## Success Criteria
1. A "Management > Import Legacy Data" button accessible from the Toolbar (Advanced Mode only).
2. User selects a `.mdb` file via native file dialog.
3. System auto-backs up the current PostgreSQL database before any import.
4. System reads the `.mdb` file natively via Rust ODBC (`odbc-api` crate), validates data, and inserts into PostgreSQL in a single transaction.
5. Incoming data is validated before insertion (duplicate detection, encoding sanity, FK integrity).
6. Import summary dialog shows: Before/After comparison, records added, duplicates skipped, errors encountered.
7. Zero data loss on the existing PostgreSQL data.

## Slices
- **S01**: Backend — MDB-to-PostgreSQL converter integration, auto-backup, validation pipeline
- **S02**: Frontend — Import dialog UI, progress indicator, summary report

## Implementation Approach
**Pure Rust via ODBC.** The `.mdb` file is read using the `odbc-api` crate (Windows ODBC layer), which connects to the Access database via the Microsoft Access Database Engine driver. This is fully compiled into the Tauri binary — no Python runtime, no subprocess, no extra bundling.

The Python scripts in `college-OPAC/` served as the proof-of-concept for the schema mapping and MDB reading logic. The Rust implementation will replicate that logic natively.

## Architecture
```
Frontend (React)
  └─ [Import MDB Button] → invoke('import_mdb_database', { mdb_path })
        ↓
Backend (Rust - src-tauri/src/import.rs)
  ├─ 1. auto_backup()          → pg_dump to %APPDATA%/backups/
  ├─ 2. read_mdb_via_odbc()    → odbc-api crate → Vec<TableData>
  ├─ 3. validate_incoming()    → dedup, encoding, FK checks
  ├─ 4. import_transaction()   → sqlx transaction → PostgreSQL
  └─ 5. return ImportSummary   → { before_counts, inserted, skipped, errors }
```

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| MDB file corruption | Low | High | Validate MDB header before processing |
| Encoding issues (Mojibake) | Medium | Medium | Apply same sanitization from D053 |
| Duplicate records on re-import | High | Medium | Deduplicate on `controlno` (tblCat), `Accession` (tblHoldings), `AuthorCode` (tblAuthor) |
| ODBC driver missing | Medium | High | Pre-check and show user-friendly error with install link |
| Backup failure before import | Low | Critical | Abort import if backup fails |

## Rust Crates Required
| Crate | Purpose |
|-------|---------|
| `odbc-api` | Read `.mdb` tables via Windows ODBC / Access Database Engine |
| `sqlx` | Already in use — execute validated INSERTs in a transaction |
| `tokio` | Already in use — async execution |
| `serde` / `serde_json` | Serialize ImportSummary back to frontend |

## Host Prerequisite (One-Time Setup)
The **Microsoft Access Database Engine 2016 Redistributable** must be installed.
- Download: https://www.microsoft.com/en-us/download/details.aspx?id=54920
- The app will pre-check for this ODBC driver and show a user-friendly error with the link if missing.
- Will be documented in the installer prerequisites and `README.md`.
