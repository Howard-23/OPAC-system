# M003 Context: Patron & Circulation Management

## Objective
Implement the core transactional logic of the library: managing patrons (users) and tracking the movement of items (borrowing and returning). This milestone bridges the gap between static cataloging and active library operations.

## Success Criteria
- [ ] CRUD operations for Patrons (tblUser) implemented in Rust/React.
- [ ] Borrowing workflow (Accession check -> Patron check -> tblRent entry).
- [ ] Returning workflow (dteReturn update -> tblHoldings status update).
- [ ] Fine calculation logic implemented.
- [ ] Transaction history view for Patrons.

## Technical Constraints
- **SQLx Transactions**: Use database transactions for all borrow/return operations to ensure atomicity.
- **Tauri Commands**: All business logic must reside in Rust; React only handles state presentation.
- **Legacy Parity**: Match the data types and constraints of `tblUser` and `tblRent`.
