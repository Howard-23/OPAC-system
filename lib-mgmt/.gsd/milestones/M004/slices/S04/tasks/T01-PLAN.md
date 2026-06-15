# T01-PLAN: Acquisitions Report Planning

## Objective
Implement an acquisitions report to track new physical items added to the library collection within a specified date range.

## Proposed Changes

### 1. Database Schema
- **Migration**: Added `date_acquired` (TIMESTAMP) with default `NOW()` to `tblHoldings`.
- **Documentation**: Update `docs/DATABASE-SCHEMA.md`.

### 2. Backend (Rust)
- **New Struct**: `AcquisitionRecord`.
- **New Command**: `get_acquisitions_report(start_date: String, end_date: String)`.
  - Logic:
    1. Query `tblHoldings` joined with `tblCat` and `tblAuthor`.
    2. Filter by `date_acquired` BETWEEN `start_date` AND `end_date`.
    3. Return list of items (Accession, Title, Author, Date Acquired).

### 3. Frontend (React)
- **Component**: `src/components/inventory/AcquisitionsDialog.tsx`.
- **UI Structure**:
  - Date Range Pickers (Start/End).
  - Search Button.
  - Table showing acquisitions history.
  - Export functionality.

### 4. Aesthetic Parity
- Win95/98 modal design.
- GroupBox for filter settings.
- Scrollable DataGrid-style table.

## Verification Plan
1. **Database**: Verify default `NOW()` behavior by adding a dummy item (if test command exists).
2. **Backend**: Invoke `get_acquisitions_report` with current date range and verify results.
