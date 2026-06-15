# M003 Roadmap

## Slices
- [x] **S01: Patron Management** `risk:low`
  > CRUD for tblUser. User groups and permissions.
- [x] **S02: Borrowing Workflow** `risk:high`
  > Transactional logic for checking out books. Validating due dates.
- [x] **S03: Returning & Fines** `risk:medium`
  > Processing returns and calculating overdue fines.
- [x] **S04: Circulation Dashboard** `risk:low`
  > Overview of active loans and overdue items.

## Boundary Map
- **M02 Boundary**: Core DB connection and Cataloging.
- **M03 Boundary**: Transactions, Users, and Fines.
