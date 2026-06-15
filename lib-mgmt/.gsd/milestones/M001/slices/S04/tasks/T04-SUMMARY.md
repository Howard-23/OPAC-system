---
id: T04
parent: S04
milestone: M001
provides:
  - Global integration of Authority and About dialogs
  - Trigger-callback wiring between Toolbar and MainLayout
requires: [T01, T02, T03]
affects: [S04-COMPLETION]
key_files:
  - src/components/layout/MainLayout.tsx
  - src/components/dashboard/Toolbar.tsx
key_decisions:
  - "Centralized global dialog state in MainLayout to allow persistent access from the toolbar across different page contexts (Dashboard and Cataloging)."
  - "Used prop-drilling for toolbar callbacks to maintain a simple, predictable data flow without external state libraries."
patterns_established:
  - "Global modal management pattern in MainLayout."
duration: 10min
verification_result: pass
completed_at: 2026-05-04T00:10:00Z
---

# T04: Global Action Integration

**Connected all tools. Triggers live. Modals functional.**

## What Happened
Updated `MainLayout` to host `AuthorityDialog` and `AboutDialog`. Wired `Toolbar` buttons to callbacks. Toggled state on click. Verified "Exit" works. Holdings mode integration in `CatalogForm` confirmed.

## Deviations
None.

## Files Created/Modified
- `src/components/layout/MainLayout.tsx` — Dialog host.
- `src/components/dashboard/Toolbar.tsx` — Button wiring.
