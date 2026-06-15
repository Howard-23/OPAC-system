# Task: Execute Sanitized SQL Import

## Status
- **Priority:** High
- **Assigned to:** Dev
- **Status:** 🔲 PENDING

## Objectives
1. Load `docs/legacy-database/glDB.sanitized.sql` into the local PostgreSQL database.
2. Verify that all tables (`tblCat`, `tblHoldings`, `tblAuthor`, `tblSubject`) are populated.
3. Check for any relational errors or truncated strings.

## Commands
```bash
# Set password if needed: set PGPASSWORD=password
psql -U postgres -d infolib -f "docs/legacy-database/glDB.sanitized.sql"
```

## Verification Steps
- [ ] Run `SELECT count(*) FROM "tblCat";` (Expected: ~16,000).
- [ ] Run `SELECT "Author" FROM "tblAuthor" WHERE "Author" LIKE '%Cariño%';` (Verify encoding fix).
- [ ] Launch application and check Dashboard for migrated records.
