# Task Plan: T04 — DataGrid UI Component

**Parent Slice:** S02 — Dashboard & Navigation
**Status:** Planned

## 1. Objective
Create a high-parity `DataGrid` component for displaying library records in a scrollable, high-density table format.

## 2. Technical Specs
- **Component**: `src/components/common/DataGrid.tsx`
- **Aesthetics**:
  - Background: `#FFFFFF` (Surface-Light).
  - Header: `#E0E0E0` with 1px dark borders.
  - Text: 12px Sans-Serif, Black.
  - Selection: Blue background (#000080) for active rows.
  - Border: 2px inset (`border-inset`) for the table container.

## 3. Implementation Steps
1. Create `DataGrid.tsx` with support for columns and data props.
2. Implement sticky headers using `thead` and `sticky top-0`.
3. Add horizontal grid lines between rows.
4. Add basic row-selection state management.

## 4. Verification Criteria
- [ ] Table headers are visible and remain fixed during scrolling.
- [ ] Row selection changes the background color to `Primary-Blue`.
- [ ] The grid uses `border-collapse: separate` with 1px spacing if needed for classic look.
