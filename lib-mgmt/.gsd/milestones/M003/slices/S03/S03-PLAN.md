# S03: Returning & Fines - Implementation Plan

The objective of this slice is to implement the returning logic for library materials, including automatic fine calculation based on overdue days and patron group rates.

## 1. Backend: Rust Commands (tauri/src/lib.rs)
- [ ] Implement `return_item`:
    - Find active loan in `tblRent` by `Accession`.
    - Fetch Patron (`Idno`) and their group's fine rate (`GrpFine` from `tblGroup`).
    - Calculate overdue days: `now - dteDue`.
    - If overdue, calculate fine: `days * GrpFine`.
    - Use a SQL Transaction:
        1. Update `tblRent`: set `dteReturn = now`.
        2. Update `tblHoldings`: set `Status = 'Available'`, `DueDate = NULL`.
        3. If fine > 0: Update `tblUser`: increment `UnpaidFine`.
- [ ] Implement `get_overdue_fines`: (Optional) Helper to list fine history for a patron.

## 2. Frontend: State & UI
- [ ] **Store**: Update `circulationStore.ts` with `returnItem` action.
- [ ] **Return Component**:
    - A "Return" dialog/panel.
    - Scanning/Input for `Accession No`.
    - Real-time display of calculated fines.
    - Integration with `MainLayout` (Toolbar action).

## 3. UI Aesthetics
- Maintain Windows 95/98 beveled look.
- Use a "Sunken" status bar for fine alerts (e.g., yellow background for fines).

## 4. Verification
- Test returning on-time vs. overdue items.
- Verify `UnpaidFine` accumulation in `tblUser`.
- Ensure item status resets to 'Available'.
