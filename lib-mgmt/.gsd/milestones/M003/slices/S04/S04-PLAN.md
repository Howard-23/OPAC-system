# S04: Circulation Dashboard - Implementation Plan

The objective of this slice is to provide librarians with a high-level overview of the circulation status, specifically tracking overdue items and active loans.

## 1. Backend: Rust Commands (tauri/src/lib.rs)
- [ ] Implement `get_circulation_stats`:
    - Count of active loans (`dteReturn IS NULL`).
    - Count of overdue items (`now > dteDue` and `dteReturn IS NULL`).
    - Total outstanding fines (`SUM(UnpaidFine)` from `tblUser`).
- [ ] Implement `get_overdue_items`:
    - Returns detailed list of active loans that are overdue (joins `tblRent`, `tblUser`, `tblCat`, `tblHoldings`).

## 2. Frontend: State & UI
- [ ] **Store**: Update `circulationStore.ts` with statistics and overdue list actions.
- [ ] **Dashboard View**:
    - A new page/tab or a modal for "Circulation Overview".
    - High-density grids for "Overdue Items" and "Active Loans".
    - Summary cards with classic Windows beveled styling.

## 3. UI Aesthetics
- Use "Classic Windows Dashboard" style (multiple sunken panes within a raised box).
- Red text highlights for overdue items.

## 4. Verification
- Verify counts match database state.
- Ensure "Overdue" logic correctly identifies items past their due date.
