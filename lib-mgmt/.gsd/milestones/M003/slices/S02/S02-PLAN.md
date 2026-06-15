# S02: Borrowing Workflow - Implementation Plan

The objective of this slice is to implement the transactional logic for checking out library materials, ensuring data integrity across `tblUser`, `tblHoldings`, and `tblRent`.

## 1. Backend: Rust Commands (tauri/src/lib.rs)
- [ ] Implement `check_out_item`:
    - Check if Patron (`Idno`) exists.
    - Check if Item (`Accession`) exists and is 'Available'.
    - Calculate `due_date` based on Patron's `GroupName` (fetch `GrpDuration` from `tblGroup`).
    - Use a SQL Transaction:
        1. Insert record into `tblRent`.
        2. Update `tblHoldings` status to 'Checked Out' and set `DueDate`.
- [ ] Implement `get_active_loans`: Fetches items currently borrowed by a specific `Idno`.

## 2. Frontend: State & UI
- [ ] **Store**: Update `patronStore.ts` or create a new `circulationStore.ts` to manage active loans.
- [ ] **Checkout Component**:
    - A "Check Out" dialog/panel.
    - Scanning/Input for `Patron ID`.
    - Scanning/Input for `Accession No`.
    - Real-time validation and feedback.

## 3. UI Aesthetics
- Maintain Windows 95/98 beveled look.
- Use high-contrast status indicators (e.g., green for available, red for blocked).

## 4. Verification
- Test with various user groups (Student vs. Faculty) to ensure correct loan durations.
- Verify that `tblHoldings` status updates immediately upon checkout.
