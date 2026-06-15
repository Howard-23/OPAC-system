# M004 Roadmap: Inventory & Financials

This milestone focuses on closing the financial loop (fine payments) and implementing physical audit tools to maintain database-to-shelf parity.

## Slices
- [x] **S01: Fine Payments** `risk:low`
  > Interface and logic for patrons to pay off overdue fines.
- [x] **S02: Inventory Audit (Shelf-Read)** `risk:medium`
  > Workflow for scanning shelves and marking items as 'Verified' or 'Missing'.
- [x] **S03: Financial Reports** `risk:low`
  > Summary reports of fines collected and outstanding balances.
- [x] **S04: Acquisitions Report** `risk:low`
  > Listing new items added within a date range.

## Boundary Map
- **M03 Boundary**: Transactions and active circulation.
- **M04 Boundary**: Financial reconciliation and physical inventory.
