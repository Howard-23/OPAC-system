# Task Plan: T05 — Dashboard Assembly & Integration

**Parent Slice:** S02 — Dashboard & Navigation
**Status:** Planned

## 1. Objective
Finalize the `DashboardPage` by assembling all components (Layout, Toolbar, Search, Grid) and connecting them to the application state.

## 2. Technical Specs
- **Page**: `src/pages/dashboard/DashboardPage.tsx`
- **Data**: Inject mock catalog records (approx. 50 items) into the DataGrid.
- **Logic**: 
  - Ensure only logged-in users can view this page.
  - Implement basic "Delete" confirmation (alert box).

## 3. Implementation Steps
1. Update `src/pages/dashboard/DashboardPage.tsx` to use `MainLayout`.
2. Map the sub-components into the layout's grid/flex slots.
3. Generate and provide mock data for the `DataGrid`.
4. Implement navigation guards to redirect unauthenticated users.

## 4. Verification Criteria
- [ ] Dashboard is fully functional and resembles `003-dashboard-main.webp`.
- [ ] Mock data is scrollable and readable.
- [ ] Navigation via Toolbar updates the view state.
