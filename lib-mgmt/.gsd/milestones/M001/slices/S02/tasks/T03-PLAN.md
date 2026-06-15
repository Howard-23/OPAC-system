# Task Plan: T03 — Search & Filter Controls

**Parent Slice:** S02 — Dashboard & Navigation
**Status:** Planned

## 1. Objective
Implement the `ComboSearch` component which combines a text input and a scope dropdown, matching the legacy dashboard search row.

## 2. Technical Specs
- **Component**: `src/components/dashboard/SearchBar.tsx`
- **Aesthetics**:
  - Input: Sunken (`inset`) appearance.
  - Dropdown: Classic Windows-style select box.
  - Button: Raised (`outset`) search trigger.
  - Layout: Horizontal flex with tight spacing.

## 3. Implementation Steps
1. Create `src/components/dashboard/SearchBar.tsx`.
2. Implement a dropdown for search scope (Keyword, Title, Author, etc.).
3. Implement the text input with a placeholder.
4. Integrate the "Search" button with a beveled style.

## 4. Verification Criteria
- [ ] Search input and dropdown are correctly aligned.
- [ ] The "Search" button uses the `Button-Classic` styling.
- [ ] Changing the dropdown value updates the search context (mocked logic).
