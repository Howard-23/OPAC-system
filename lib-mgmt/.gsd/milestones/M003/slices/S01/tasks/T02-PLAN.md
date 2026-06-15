# T02: Patron Validation & Testing - Plan

## Objective
Ensure the Patron Management system is robust by refining data validation and verifying the full CRUD cycle between the React frontend and Rust/Postgres backend.

## Tasks
- [ ] **Refine Zod Schema**:
    - Add specific validation for `idno` (e.g., length, format).
    - Ensure `group_name` matches database enum/expectations.
    - Validate `phone` format if applicable.
    - Set default values correctly (e.g., current date for expiration).
- [ ] **Frontend Testing**:
    - Verify that `PatronPage` correctly fetches data on mount.
    - Verify that clicking "New" on the Patron page opens the `PatronForm`.
    - Verify that "Delete" opens the `DeleteDialog` with the correct ID.
- [ ] **Backend Testing (Integration)**:
    - Test `add_patron` with real data.
    - Test `get_patrons` returns the newly added patron.
    - Test `update_patron` changes values correctly.
    - Test `delete_patron` removes the record.
- [ ] **Error Handling**:
    - Ensure database errors (like duplicate IDs) are caught and displayed gracefully in the UI.

## Expected Outcome
A fully functional, bug-free patron management slice ready for production use.
