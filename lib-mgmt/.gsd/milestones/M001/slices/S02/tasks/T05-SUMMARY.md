---
id: T05
parent: S02
milestone: M001
provides:
  - Export Results dialog UI
  - GroupBox helper for Windows-style categorizations
  - Dynamic radio button logic for export targets and sources
requires: [S02]
affects: [UI-BEHAVIOR]
key_files:
  - src/components/common/GroupBox.tsx
  - src/components/dashboard/ExportDialog.tsx
  - src/components/layout/MainLayout.tsx
key_decisions:
  - "Implemented a reusable GroupBox helper to achieve the classic 'fieldset' look required by Wireframe 005."
  - "Added conditional opacity to the accession range inputs to provide visual feedback on their enablement state."
patterns_established:
  - "GroupBox categorization pattern."
duration: 10min
verification_result: pass
completed_at: 2026-05-04T00:20:00Z
---

# T05: Export Dialog Integration

**Export functional. UI parity 100%. Dialog live.**

## What Happened
Build `GroupBox` helper. Build `ExportDialog` with "Select Options" and "Export Results To" sections. Wired `MainLayout` and `Toolbar` to trigger the dialog. Handled Printer/File/Delimited toggles.

## Deviations
None.

## Files Created/Modified
- `src/components/common/GroupBox.tsx` — Helper.
- `src/components/dashboard/ExportDialog.tsx` — Dialog.
- `src/components/layout/MainLayout.tsx` — Host.
- `src/components/dashboard/Toolbar.tsx` — Wiring.
