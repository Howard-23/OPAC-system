# Task Plan: T01 — Holdings Management Mode

**Parent Slice:** S04 — Inventory & Authority
**Status:** Planned

## 1. Objective
Implement the "Holdings" mode within the `CatalogForm` to allow registration and deletion of physical copies.

## 2. Technical Specs
- **Background**: Solid blue (#0000FF or similar high-contrast blue).
- **Layout**: 
  - Left Panel: "ADD / EDIT Holdings" (Accession, Location fields).
  - Right Panel: "DELETE Holdings" (Accession field).
- **Trigger**: "Holdings" button in `CatalogForm` footer.

## 3. Implementation Steps
1. Add `isHoldingsMode` state to `CatalogForm`.
2. Wrap the form content in a conditional layout that switches to the blue inventory panel.
3. Implement the split pane layout for Add/Delete actions.
4. Add "Cancel" to return to bibliographic metadata view.

## 4. Verification Criteria
- [ ] Clicking "Holdings" changes the form background to bright blue.
- [ ] Both Add and Delete panels are visible and logically separated.
- [ ] Returning to "Metadata" mode preserves existing form data.
