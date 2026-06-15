# T01: Fine Payment Implementation - Summary

## Task Objective
Implement the logic and UI for recording fine payments, allowing librarians to reduce a patron's outstanding balance.

## Deliverables
- [x] **Backend Command**:
    - Implemented `pay_fine` in `src-tauri/src/lib.rs`.
    - Uses `GREATEST(0, "UnpaidFine" - $1)` to ensure balances never become negative.
- [x] **Patron Store**: Added `payFine` action to `patronStore.ts` with automatic state refresh.
- [x] **UI: Payment Workflow**:
    - Created `PaymentDialog.tsx` with a high-visibility balance display and quick "Pay Full Amount" action.
    - Integrated **"Pay Fine"** button into the global toolbar (Wallet icon).
    - Added context validation to ensure payments are only initiated when a patron is selected.

## Verification Method
- Code review: Verified that the SQL update uses atomic subtraction.
- UI Testing: Confirmed that "Pay Full Amount" correctly populates the input and the dialog closes after successful transaction.
- State Sync: Verified that the Patron grid and Dashboard stats (total fines) reflect the payment immediately.

## Residual Risks
- **Audit Log**: While the balance is updated, there is no historical log of individual payments in the database. This would require a new `tblPayments` table for a full accounting trail.
- **Overpayment**: The UI caps the payment at the current balance, but the backend uses `GREATEST(0, ...)` as a secondary safety measure.
