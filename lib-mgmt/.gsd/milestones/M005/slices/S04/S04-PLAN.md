# M005-S04-PLAN: Catalog Record Refinement (Full Parity Edit)

## Vision
Implement the "Edit" catalog record workflow as specified in wireframes `010-edit-catalog-entry.webp` and `011-edit-catalog-holdings.webp`. This ensures that existing records can be fully updated and their physical holdings managed with 100% aesthetic and functional parity.

## Proposed Slice: S04 — Catalog Record Refinement
**Milestone:** M005 — Authority Control & Advanced Services
**Status:** PROPOSED
**Risk:** Medium (Requires complex form binding and holdings sub-management)

### Tasks

#### 1. Backend Implementation (Rust)
- [x] **T01: Full Entry Retrieval**
  - Implement `get_catalog_entry(controlno: String)` in `lib.rs`.
  - Maps `tblCat` columns to the `CatalogEntry` struct.
- [x] **T02: Update Logic**
  - Implement `update_catalog_record(entry: CatalogEntry)` in `lib.rs`.
  - Performs a comprehensive `UPDATE` on `tblCat`.
- [x] **T03: Holdings Management**
  - Implement `get_holdings(controlno: String)` to fetch physical items.
  - Implement `upsert_holding(holding: Holdings)` and `delete_holding(accession: String)`.

#### 2. Frontend Implementation (React)
- [x] **T04: Edit Dialog UI**
  - Create `EditCatalogDialog.tsx` mirroring wireframe `010`.
  - Integrate with `catalogStore` for data fetching on mount.
- [x] **T05: Holdings Panel UI**
  - Create `HoldingsManagementPanel.tsx` mirroring wireframe `011` (the blue box overlay).
  - Support adding and deleting physical copies.
- [x] **T06: Grid Integration**
  - Replace the "Not implemented" alert in `DashboardPage.tsx` with a call to open the new Edit Dialog.
- [ ] **T07: Pagination UI**
  - Implement `RecordNavigator.tsx` to handle page state and grid refresh.

## Logical Decisions
- **D029**: Use the same form structure as `CatalogForm` but with field population and "Control No" lock.
- **D030**: Holdings management will be implemented as a togglable view within the Edit Dialog to match legacy behavior.
- **D031**: Fixed dashboard item count to 20 per page to achieve a "No Scrolling" UX on standard resolutions.

## Next Steps: Pagination Implementation
**Proposed Slice: S05 — Dashboard Pagination**
1. **Backend**: Add `page` parameter to `get_catalog_records` and `get_total_records_count`.
2. **Frontend**: Create `RecordNavigator.tsx` for the status bar.
3. **Store**: Add `currentPage`, `totalCount`, and `setPage` to `catalogStore.ts`.
