# S01: Fine Payments - Implementation Plan

The objective of this slice is to provide a way for librarians to record fine payments from patrons, reducing their `UnpaidFine` balance in `tblUser`.

## 1. Backend: Rust Commands (tauri/src/lib.rs)
- [ ] Implement `pay_fine`:
    - Updates `tblUser` by subtracting a specific amount from `UnpaidFine`.
    - Ensures `UnpaidFine` never goes below zero.
    - (Optional) Record the payment in a `tblPayments` table if it exists (check schema).

## 2. Frontend: State & UI
- [ ] **Store**: Update `patronStore.ts` with `payFine` action.
- [ ] **UI: Payment Interface**:
    - Add a "Pay Fine" button to the `PatronPage` toolbar or context menu.
    - Create a simple `PaymentDialog` for entering the amount.
    - Integration with the existing `Toolbar` or a secondary action row.

## 3. UI Aesthetics
- Use a "Cash Register" or "Wallet" icon for payments.
- Display the current balance clearly in the payment dialog.

## 4. Verification
- Verify that paying a partial amount reduces the balance correctly.
- Ensure the balance cannot be reduced below zero.
- Check that the Patron grid updates immediately after payment.
