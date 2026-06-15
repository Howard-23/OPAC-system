# M005-S06-PLAN: Legacy Data Migration

## Vision
Populate the system with real production data from the legacy SQL dump. This verifies the scalability of the new architecture, specifically the effectiveness of the "No-Scroll" pagination on a 6,000+ record dataset.

## Proposed Slice: S06 — Legacy Data Migration
**Milestone:** M005 — Authority Control & Advanced Services
**Status:** COMPLETED
**Outcome:** Successful import of 6,619 catalog records and 9,740 holdings.

### Tasks

#### 1. Database Preparation
- [x] **T01: Reset Schema**
  - Performed `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` to ensure a clean slate.
- [x] **T02: Execute Legacy Script**
  - Successfully ran `glDB.postgres.sql` using `psql`.
  - Verified counts: `tblCat` (6,619), `tblHoldings` (9,740).

#### 2. Verification
- [x] **T03: Dashboard Stress Test**
  - Verified that the dashboard loads the first 20 records instantly.
  - Verified that the "Record Navigator" correctly reflects "Page 1 of 331".

## Logical Decisions
- **D033**: Used `psql` directly for the migration to handle large-scale `INSERT` transactions (2.3MB SQL dump).
- **D034**: Retained legacy table naming (`tblCat`, `tblHoldings`) for 1:1 parity during import.
