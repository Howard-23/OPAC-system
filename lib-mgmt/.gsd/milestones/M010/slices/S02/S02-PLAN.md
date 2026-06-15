# S02 — MDB Import Frontend UI

## Objective
Implement the "Import Legacy Data" feature in the React frontend: a toolbar button (Advanced Mode), a multi-step dialog, progress feedback, and a final import summary report.

## New Files
- `src/components/management/ImportMdbDialog.tsx` — main dialog component
- `src/components/management/ImportSummaryView.tsx` — summary display sub-component

## Tasks

### T01 — Toolbar Button (Advanced Mode Only)
- [ ] Add "Import" button to the Advanced Mode toolbar section in `MainLayout.tsx`
- [ ] Icon: `DatabaseBackup` (lucide-react) or `Upload`
- [ ] Visible ONLY when Advanced Mode is active
- [ ] Opens `ImportMdbDialog`

### T02 — Import Dialog (Multi-Step)
The dialog follows the same beveled Win95 style as other existing dialogs.

**Step 1: File Selection**
- [ ] Title: "Import Legacy Access Database"
- [ ] Description: Explain what will happen (backup → validate → import)
- [ ] "Browse…" button opens native file picker (`.mdb` filter via `tauri-plugin-dialog`)
- [ ] Show selected file path
- [ ] Warning banner: "A full database backup will be created automatically before import."
- [ ] "Next →" button proceeds to Step 2

**Step 2: Pre-Import Checklist (Validation)**
- [ ] Show animated loading state: "Checking ODBC driver…", "Reading MDB file…", "Validating records…"
- [ ] Invoke `import_mdb_database` with `{ mdb_path, dry_run: true }` first
- [ ] Display validation results:
  - ✅ N records ready to import
  - ⚠️ N duplicates will be skipped
  - ❌ N invalid records (show details)
- [ ] If `odbc_missing` error: show special dialog with download link
- [ ] "Start Import" button proceeds to Step 3

**Step 3: Importing (Progress)**
- [ ] Invoke `import_mdb_database` with `{ mdb_path, dry_run: false }`
- [ ] Show animated spinner: "Backing up database…", "Importing records…"
- [ ] Disable all buttons during import

**Step 4: Summary Report**
- [ ] Show `ImportSummaryView` with results table per-table:

| Table | Inserted | Skipped | Errors |
|-------|----------|---------|--------|
| tblCat | 198 | 6,619 | 0 |
| tblAuthor | 12 | 6,549 | 0 |
| … | … | … | … |

- [ ] Show backup file path (copyable)
- [ ] Show total duration
- [ ] "Done" button closes and refreshes the catalog dashboard

### T03 — Error Handling
- [ ] ODBC missing → show download link dialog
- [ ] Backup failed → "Import aborted. No changes were made." with error details
- [ ] Transaction failed → "Import failed. Database has been rolled back. Your backup is safe at [path]."
- [ ] All errors must NOT be silent — always surface to user in the dialog

### T04 — Store Integration
- [ ] After successful import, call `catalogStore.fetchRecords()` to refresh the dashboard
- [ ] Show a toast/status bar message: "Import complete: 198 new records added"

## UI Reference
Style: Match existing dialogs (`AboutDialog`, `SyncLogsDialog`) — beveled box, title bar with close button, dark mode compatible.

## Acceptance Criteria
- [ ] Button only visible in Advanced Mode
- [ ] File picker correctly filters to `.mdb` files only
- [ ] All 4 dialog steps render correctly
- [ ] ODBC missing error shows download link
- [ ] Dashboard refreshes automatically after successful import
- [ ] Dark mode compatible
