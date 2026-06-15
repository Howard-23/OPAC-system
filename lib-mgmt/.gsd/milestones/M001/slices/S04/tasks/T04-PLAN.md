# Task Plan: T04 — Global Action Integration

**Parent Slice:** S04 — Inventory & Authority
**Status:** Planned

## 1. Objective
Connect all trigger buttons in the Dashboard and Catalog forms to open the new dialogs and modes.

## 2. Technical Specs
- **Triggers**:
  - Dashboard Toolbar -> Authority
  - Dashboard Toolbar -> About
  - Catalog Form -> Holdings
- **Mechanism**: Use a simple UI state manager or local component props to handle visibility.

## 3. Implementation Steps
1. Update `DashboardPage` to handle `Authority` and `About` button clicks.
2. Update `CatalogForm` to toggle `isHoldingsMode`.
3. Ensure modal backdrops (if used) maintain the classic look.

## 4. Verification Criteria
- [ ] Clicking "Authority" on the dashboard opens the dialog.
- [ ] Clicking "About" on the dashboard opens the dialog.
- [ ] All "Exit" or "Close" buttons correctly dismiss the tools.
