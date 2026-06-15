# Task: Source Data Analysis & Mapping

## Status
- **Priority:** High
- **Assigned to:** Dev
- **Status:** 🔲 PENDING

## Source Data Analysis
- **Source:** `docs/legacy-database/glDB.postgres.sql` (2.3MB SQL Dump).
- **Format:** PostgreSQL INSERT statements (multi-row VALUES).
- **Encoding Issues:** Identified Mojibake in Author names (e.g., `CariÃƒÂ±o`). Likely legacy encoding misinterpretation.

## Legacy Field Mapping (Confirmed)
| Legacy Field | PG Table | PG Column | Type | Notes |
|---|---|---|---|---|
| controlno | tblCat | controlno | TEXT | Matches Primary Key |
| Title | tblCat | title | TEXT | |
| AuthorCode | tblCat | author_code | INT | Links to tblAuthor.AuthorCode |
| Callno | tblCat | callno | TEXT | |
| Edition | tblCat | edition | TEXT | |
| Pagination | tblCat | pagination | TEXT | |
| Publisher | tblCat | publisher | TEXT | |
| Pubplace | tblCat | pubplace | TEXT | |
| Copyright | tblCat | copyright | TEXT | |
| ISBN | tblCat | isbn | TEXT | |
| Subject1Code | tblCat | subject1_code | INT | Links to tblSubject.SubjectCode |
| Material | tblCat | material | TEXT | |

## Verification Steps
- [ ] Count total records in `tblCat` (Estimate: 16,000).
- [ ] Check for dangling `AuthorCode` in `tblCat` not present in `tblAuthor`.
- [ ] Identify character replacement map for Mojibake (ÃƒÂ± → ñ).
