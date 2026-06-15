---
id: T02
parent: S04
milestone: M001
provides:
  - AuthorityDialog component for Authors/Subjects
  - Red bold system warning for database operations
  - Category switching logic between Author and Subject authorities
requires: [S02]
affects: [S04-IMPLEMENTATION]
key_files:
  - src/components/catalog/AuthorityDialog.tsx
key_decisions:
  - "Included the red legacy warning verbatim: 'NOTE : CLOSE ALL THE WORKSTATIONS BEFORE UPDATING THE AUTHORITY' to maintain 100% parity with Wireframe 008."
  - "Utilized the existing DataGrid component for the authority list to maintain visual consistency."
patterns_established:
  - "Controlled vocabulary management pattern."
duration: 10min
verification_result: pass
completed_at: 2026-05-04T00:09:00Z
---

# T02: Authority Control Dialog

**Implemented management window. Author/Subject lists. Red warning.**

## What Happened
Created `AuthorityDialog`. Toggles for Author/Subject lists. Red bold "Workstation" warning matches `008`. Edit field at bottom populates on selection. Update/Delete/Exit buttons functional.

## Deviations
None.

## Files Created/Modified
- `src/components/catalog/AuthorityDialog.tsx` — Dialog component.
