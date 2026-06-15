# T01-PLAN: Inventory Audit Planning

## Objective
Implement the backend and frontend infrastructure for physical inventory audits (shelf-reads).

## Proposed Changes

### 1. Database Schema
- Modify `tblHoldings` to include `last_audit` timestamp.
- **Action**: Update `docs/DATABASE-SCHEMA.md` and execute migration.
- **SQL**: `ALTER TABLE tblHoldings ADD COLUMN last_audit TIMESTAMP;`

### 2. Backend (Rust)
- **File**: `src-tauri/src/models.rs`
  - Update `Holdings` struct to include `last_audit: Option<chrono::DateTime<chrono::Utc>>`.
- **File**: `src-tauri/src/lib.rs`
  - Implement `audit_item(accession: String)` command.
  - Logic:
    1. Fetch item from `tblHoldings` joined with `tblCat` (to get Title).
    2. Update `last_audit` to `NOW()`.
    3. Return `AuditResult` { accession, title, location, status, last_audit }.

### 3. Frontend (React)
- **Store**: `src/stores/auditStore.ts`
  - Track `scannedItems` array.
  - Track `isScanning` state.
- **Component**: `src/components/inventory/AuditWindow.tsx`
  - High-density layout (Win98 style).
  - Rapid-fire barcode input (auto-focus, clears on enter).
  - Table showing: Accession, Title, Expected Location, DB Status, Audit Time.
  - Color-coding for discrepancies (e.g., if DB status is "Checked Out" but scanned on shelf).

### 4. Aesthetic Parity
- Use `BeveledBox` for the main window.
- Use `btn-classic` for actions (Start Session, Close, Export).
- Scrollable list for high-density scan history.

## Verification Plan
1. **Database**: Verify column addition via `psql` or SQLx logs.
2. **Backend**: Test `audit_item` command via Tauri invoke.
3. **Frontend**: Verify rapid scanning behavior and session state retention.
