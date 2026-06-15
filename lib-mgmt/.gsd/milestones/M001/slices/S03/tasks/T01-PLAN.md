# Task Plan: T01 — Catalog Form Skeleton

**Parent Slice:** S03 — Cataloging Infrastructure
**Status:** Planned

## 1. Objective
Create the base structure for the cataloging form, including the beveled window frame and the light-blue inner container.

## 2. Technical Specs
- **Component**: `src/components/catalog/CatalogForm.tsx`
- **Aesthetics**:
  - Inner Container: Light blue border or background hint.
  - Header: Displays "Control No." and "Material" dropdown.
  - Spacing: Compact, left-aligned labels.

## 3. Implementation Steps
1. Create `src/components/catalog/CatalogForm.tsx`.
2. Define the outer beveled frame using `BeveledBox`.
3. Implement the header row with the unique ID display (placeholder) and Material selector.
4. Set up the basic grid layout for the metadata fields.

## 4. Verification Criteria
- [ ] Component is accessible via a route (e.g., `/catalog/new`).
- [ ] Title bar shows "Add New" with appropriate icons.
- [ ] Layout matches the proportions of the wireframe.
