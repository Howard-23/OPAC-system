# Task Plan: T01 — Main Layout Infrastructure

**Parent Slice:** S02 — Dashboard & Navigation
**Status:** Planned

## 1. Objective
Implement the base application shell (`MainLayout.tsx`) that provides the classic Windows container aesthetics, including the blue-gradient title bar and beveled outer frame.

## 2. Technical Specs
- **Component**: `src/components/layout/MainLayout.tsx`
- **Aesthetics**:
  - Border: 2px outset beveled edge (`#D4D0C8`).
  - Title Bar: Blue gradient (#A6CAF0) with white text.
  - Close Button: Standard 'X' icon in a beveled button (top-right).
  - Main Area: `#D4D0C8` background.

## 3. Implementation Steps
1. Create `src/components/layout/TitleBar.tsx` with gradient styling and window controls.
2. Create `src/components/layout/MainLayout.tsx`.
3. Wrap the main application routes in `App.tsx` with `MainLayout` (where applicable).
4. Ensure the layout handles responsive resizing but maintains a "desktop app" feel.

## 4. Verification Criteria
- [ ] Title bar gradient is visible and matches `#A6CAF0`.
- [ ] Application name "infoLib Library Management System" is displayed in the title bar.
- [ ] The layout uses the `BeveledBox` component for the outer frame.
