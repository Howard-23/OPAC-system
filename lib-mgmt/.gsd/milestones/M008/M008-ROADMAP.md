# Milestone M008: Legacy Data Migration

## Vision
Migrate the full library database from the legacy system (likely DBF or CSV exports) into the new PostgreSQL schema. Ensure 100% data integrity, resolve duplicate entries, and normalize authority records (Authors/Subjects). This is the final step before the system goes "Live" in the school library.

## Slices

### S01: Source Data Analysis & Mapping ✅
- [x] Extract raw data from legacy system (`docs/legacy-database/glDB.postgres.sql`).
- [x] Map legacy fields to new PostgreSQL schema.
- [x] Identify data quality issues (Mojibake detected in Authors).

### S02: Normalization & Authority Cleansing ✅
- [x] Deduplicate `tblAuthor` and `tblSubject` entries (Validated in SQL).
- [x] Link catalog records to normalized authority IDs.
- [x] Validate character encoding (`glDB.sanitized.sql` generated).

### S03: High-Performance Batch Import 🔲
- [ ] Develop optimized `COPY` or batch insert scripts.
- [ ] Handle relational constraints during import (Authors → Catalog → Holdings).
- [ ] Log and report import errors (skipped records).

### S04: Integrity Verification 🔲
- [ ] Compare record counts between legacy and new system.
- [ ] Spot-check bibliographic details (Titles, Call Numbers).
- [ ] Verify Patron balances and circulation history.

## Technical Decisions
- **D053**: Use `sqlx` batch inserts or direct `psql COPY` for multi-thousand record imports.
- **D054**: Implement "Dry Run" mode to validate mappings before writing to disk.

## Blockers
- **B002**: Awaiting final raw data export from GJC Library legacy terminal.
