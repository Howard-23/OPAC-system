# T01-PLAN: Authority Control Planning

## Objective
Implement Authority Control to ensure data consistency across `tblAuthor` and `tblSubject`. This allows librarians to view, edit, and delete standardized authority records.

## Proposed Changes

### 1. Backend (Rust)
- Add structs `Author` and `Subject` to `models.rs`.
- Implement CRUD commands:
  - `get_authors`, `update_author`, `delete_author`
  - `get_subjects`, `update_subject`, `delete_subject`
- Register commands in the Tauri builder.

### 2. Frontend (React)
- Create `AuthorityDialog.tsx`:
  - A tabbed or dual-list interface (Authors vs. Subjects).
  - High-density DataGrid for viewing records.
  - Inline editing or a simple edit form for correcting authority records.
- Integrate into `MainLayout.tsx` state.
- Add an `Archive` (or similar) icon to `Toolbar.tsx` to launch the dialog.

## Technical Considerations
- **Orphaned Records**: If an author is deleted, what happens to catalog records (`tblCat`) referencing `AuthorCode`? We will not enforce strict cascaded deletes at the DB level, but we should handle it gracefully in the UI or leave it as `LEFT JOIN` handling (which we already do, using "Unknown").
- **Aesthetic**: Use Windows 98 beveled boxes, native-looking tabs, and standard system fonts.
