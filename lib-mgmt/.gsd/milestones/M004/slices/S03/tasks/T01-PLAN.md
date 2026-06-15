# T01-PLAN: Financial Reports Planning

## Objective
Implement financial reporting tools to track fine collection and outstanding liabilities.

## Proposed Changes

### 1. Backend (Rust)
- **New Structs**: `FinancialSummary`, `PaymentRecord`.
- **New Command**: `get_financial_reports(start_date: Option<String>, end_date: Option<String>)`.
  - Logic:
    1. Calculate total collected: `SELECT SUM("AmountPay") FROM tblFineCode`.
    2. Calculate total outstanding: `SELECT SUM("UnpaidFine") FROM tblUser`.
    3. Fetch payment history: `SELECT * FROM tblFineCode ORDER BY "dtePay" DESC LIMIT 50`.
    4. Fetch top debtors: `SELECT "Name", "UnpaidFine" FROM tblUser WHERE "UnpaidFine" > 0 ORDER BY "UnpaidFine" DESC LIMIT 10`.

### 2. Frontend (React)
- **Component**: `src/components/patrons/FinancialReportsDialog.tsx`.
- **UI Structure**:
  - Summary Header: Total Collected vs Total Outstanding.
  - Tabbed interface or split pane:
    - Recent Payments (History).
    - Outstanding Balances (By Patron).
  - Print/Export buttons (using existing `ExportDialog` logic if possible).

### 3. Aesthetic Parity
- Use `GroupBox` for sectioning summaries.
- High-contrast labels for financial totals.
- Standard Win98 table layout for history.

## Verification Plan
1. **Backend**: Invoke `get_financial_reports` and verify sums against manual DB queries.
2. **Frontend**: Ensure numbers update correctly after a `pay_fine` operation.
