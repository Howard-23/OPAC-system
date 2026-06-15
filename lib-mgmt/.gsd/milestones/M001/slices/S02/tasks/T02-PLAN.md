# Task Plan: T02 — Toolbar

**Parent Slice:** S02 — Dashboard & Navigation
**Status:** Planned

## 1. Objective
Implement the top toolbar with large icons and labels, providing primary functions like "New", "Delete", and "Export".

## 2. Technical Specs
- **Component**: `src/components/dashboard/Toolbar.tsx`
- **Aesthetics**:
  - Height: ~90px.
  - Items: Vertical stack of Icon (32x32px) and Label (10px-12px).
  - Spacing: Evenly distributed or left-aligned with padding.
  - Border: Bottom beveled edge to separate from search row.

## 3. Implementation Steps
1. Create `src/components/dashboard/ToolbarItem.tsx` for reusable action buttons.
2. Implement `Toolbar.tsx` with buttons for: New, Delete, Export, Authority, About, Exit.
3. Hook up "Exit" (Logout) to the `authStore`.
4. Integrate into the dashboard header area.

## 4. Verification Criteria
- [ ] Six primary buttons are visible with correct labels.
- [ ] Hovering a button shows a raised beveled effect.
- [ ] "Exit" button successfully logs the user out and redirects to `/login`.
