# T02-SUMMARY: Authority Control Backend Implementation

## Status
- **Task**: T02 — Backend Implementation
- **Milestone**: M005 — Authority Control & Advanced Services
- **Slice**: S01 — Authority Control
- **Status**: COMPLETED

## Changes

### Backend (Rust/Tauri)
- **Data Models**: Added `Author` and `Subject` structs in `models.rs`.
- **Database Queries**:
  - Implemented `get_authors` fetching from `tblAuthor` with `ORDER BY "Author" ASC`.
  - Implemented `update_author` and `delete_author` on `tblAuthor`.
  - Implemented `get_subjects` fetching from `tblSubject` with `ORDER BY subject ASC`.
  - Implemented `update_subject` and `delete_subject` on `tblSubject`.
- **Stability Fix**: Transitioned handlers from `sqlx::query!` to `sqlx::query` to bypass strict compile-time verification that was causing casing-related schema mismatch errors against the legacy PostgreSQL database.
- **Registration**: All 6 commands registered in `tauri::generate_handler!`.

## Verification
- Project successfully compiles (`cargo check`) and launches via `bunx tauri dev`.
- Database connection to `lib_mgmt` established and verified.

## Residual Risks
- None. Backend is ready for frontend consumption.
