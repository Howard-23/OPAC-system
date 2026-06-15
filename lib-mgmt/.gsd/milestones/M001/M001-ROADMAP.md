# M001: Core Infrastructure & UI Parity

**Vision:** Establish the foundational UI components and authentication flow, matching the legacy wireframes with 100% aesthetic parity.

**Success Criteria:**
- User can successfully log in or see appropriate error dialogs.
- Main dashboard layout is functional with a scrollable data grid.
- All core UI components (buttons, inputs, bevels) are standardized.

---

## Slices

- [x] **S01: Authentication System** `risk:low` `depends:[]`
  > After this: User can access the application via a branded login screen.

- [x] **S02: Dashboard & Navigation** `risk:medium` `depends:[S01]`
  > After this: Main dashboard is visible with mock data and toolbar navigation.

- [x] **S03: Cataloging Infrastructure** `risk:high` `depends:[S02]`
  > After this: "Add New" form is functional with all metadata fields and ID generation.

- [x] **S04: Inventory & Authority** `risk:medium` `depends:[S03]`
  > After this: Holdings management and Authority control dialogs are implemented.

## Boundary Map

### S01 → S02
Produces:
  authStore.ts → login(), logout(), user state
  LoginModal.tsx → Functional login component

### S02 → S03
Produces:
  MainLayout.tsx → Toolbar, Content area
  DataGrid.tsx → Generic reusable table component

### S03 → S04
Produces:
  CatalogForm.tsx → Metadata entry logic
  useCatalog.ts → CRUD hooks for catalog records
