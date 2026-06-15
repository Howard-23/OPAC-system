# Slice S04: Core Catalog Commands

**Goal:** Replace frontend mock data with live database operations via Tauri invoke commands.

## Tasks
- [ ] **T01: Read Catalog Command** — Implement `get_catalog_records` with JOIN on tblAuthor.
- [ ] **T02: Delete Record Command** — Implement `delete_catalog_record` with transaction support.
- [ ] **T03: Frontend Store Integration** — Update `catalogStore.ts` to call native commands.
- [ ] **T04: Real-time Refresh Logic** — Ensure grid updates after backend mutations.
