---
id: T06
parent: S02
milestone: M001
provides:
  - Live delete functionality on Dashboard
  - DeleteDialog with Control No. injection
  - Centralized catalog store for cross-component selection sync
requires: [S02, T01-S04]
affects: [UI-BEHAVIOR]
key_files:
  - src/stores/catalogStore.ts
  - src/components/dashboard/DeleteDialog.tsx
  - src/components/layout/MainLayout.tsx
  - src/pages/dashboard/DashboardPage.tsx
key_decisions:
  - "Introduced useCatalogStore to bridge the gap between Dashboard selection and Toolbar actions (Delete)."
  - "Enforced a 'selection required' check for the delete action to prevent empty dialogs."
patterns_established:
  - "Global selection management with Zustand."
duration: 15min
verification_result: pass
completed_at: 2026-05-04T00:18:00Z
---

# T06: Delete Logic Integration

**Delete functional. Selection synced. Dialog live.**

## What Happened
Build `catalogStore` for global selection. Build `DeleteDialog` from wireframe 009. Wired `MainLayout` to trigger delete when toolbar button clicked. Updated `DashboardPage` to use global state. Deleting removes record from grid.

## Deviations
None.

## Files Created/Modified
- `src/stores/catalogStore.ts` — New.
- `src/components/dashboard/DeleteDialog.tsx` — New.
- `src/components/layout/MainLayout.tsx` — Logic host.
- `src/components/dashboard/Toolbar.tsx` — Callback hook.
- `src/pages/dashboard/DashboardPage.tsx` — State sync.
