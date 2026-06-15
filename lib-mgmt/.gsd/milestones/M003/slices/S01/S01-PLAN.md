# S01: Patron Management - Implementation Plan

The objective of this slice is to implement the full CRUD operations for library patrons (tblUser), bridging the Rust backend with a Windows 95/98 beveled UI.

## 1. Backend: Rust Commands (tauri/src/lib.rs)
- [ ] Update `models.rs` with `Patron` struct (mapping to `tblUser`).
- [ ] Implement `get_patrons`: Fetches all records from `tblUser`.
- [ ] Implement `add_patron`: Parameterized INSERT into `tblUser`.
- [ ] Implement `update_patron`: Parameterized UPDATE for existing `tblUser` record.
- [ ] Implement `delete_patron`: Parameterized DELETE from `tblUser` by `Idno`.
- [ ] Register commands in `tauri::generate_handler!`.

## 2. Frontend: State Management (src/stores/patronStore.ts)
- [ ] Create `Patron` interface matching Rust model.
- [ ] Implement Zustand store for `patrons`.
- [ ] Add `fetchPatrons` action (invokes `get_patrons`).
- [ ] Add `addPatron`, `updatePatron`, `deletePatron` actions.

## 3. UI: Patron Management (src/components/patrons/)
- [ ] `PatronDashboard.tsx`: High-density grid for browsing patrons.
- [ ] `PatronForm.tsx`: Modal dialog for Adding/Editing patrons.
- [ ] Integrate with `MainLayout` (Toolbar actions).

## 4. Verification
- [ ] Verify DB connection and operations via console logs.
- [ ] Visual parity check with Windows 95 beveled aesthetics.
- [ ] Run `bun run tauri dev` to test the full flow.
