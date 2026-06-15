# M005 Roadmap: Authority Control & Advanced Services

This milestone focuses on maintaining the integrity of bibliographic data (Authority Control) and implementing advanced circulation features like Reservations and Renewals.

## Slices
- [x] **S01: Authority Control** `risk:medium`
  > Full implementation of the Authority dialog (Wireframe 008) for Author and Subject management.
- [x] **S02: Item Reservations** `risk:high`
  > Queue-based system for reserving unavailable items (`tblReserve`).
- [ ] **S03: Loan Renewals** `risk:low`
  > Logic to extend `dteDue` for active loans.
- [ ] **S04: Catalog Record Refinement** `risk:medium`
  > Implementation of the "Edit" record and "Holdings" management sub-view (Wireframes 010, 011).

## Boundary Map
- **M04 Boundary**: Inventory tracking and basic financial reconciliation.
- **M05 Boundary**: Data consistency and complex transaction queues.
