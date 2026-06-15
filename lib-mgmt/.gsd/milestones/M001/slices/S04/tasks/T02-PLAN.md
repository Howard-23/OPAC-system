# Task Plan: T02 — Authority Control Dialog

**Parent Slice:** S04 — Inventory & Authority
**Status:** Planned

## 1. Objective
Create the `AuthorityDialog` for managing Authors and Subject headings.

## 2. Technical Specs
- **Component**: `src/components/catalog/AuthorityDialog.tsx`
- **Aesthetics**: 
  - Standard beveled window.
  - Red bold warning: "NOTE : CLOSE ALL THE WORKSTATIONS BEFORE UPDATING THE AUTHORITY".
  - Toggle buttons for "Author Authority" and "Subject Authority".
- **Interaction**: List selection populates the edit field at the bottom.

## 3. Implementation Steps
1. Create the `AuthorityDialog` component.
2. Implement the category toggle (Author/Subject).
3. Add the single-column `DataGrid` for authority list.
4. Add the edit field and Update/Delete/Exit buttons.

## 4. Verification Criteria
- [ ] Warning text is prominent, red, and all-caps.
- [ ] Toggling between Author/Subject updates the list content.
- [ ] Dialog is visually consistent with the main dashboard style.
