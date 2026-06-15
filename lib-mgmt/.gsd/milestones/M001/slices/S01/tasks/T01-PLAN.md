# T01: Login Page Implementation

**Slice:** S01
**Milestone:** M001

## Goal
Create the visual shell of the login page matching `001-login-empty.webp`.

## Must-Haves

### Truths
- "Page displays the 'infolib. Library Information System' branding."
- "Form contains 'User Name' and 'Password' fields with sunken beveled borders."
- "Page uses the dual-tone background (Light Lavender/Grey)."

### Artifacts
- `src/pages/auth/LoginPage.tsx` — Main login component.
- `src/components/common/BeveledBox.tsx` — Reusable container for the beveled UI.

### Key Links
- `App.tsx` → `LoginPage.tsx` via Route.

## Steps
1. Create `BeveledBox` component to handle the raised/sunken logic.
2. Build the `LoginPage` layout with the top branding area.
3. Implement the login form container with the two-tone background.
4. Add the labels and inputs with `input-classic` styling.
5. Add the "OK" and "Cancel" buttons.

## Context
- Reference `docs/DESIGN-SYSTEM.md` for specific hex codes and bevel logic.
- The top half is a gradient: `#A6CAF0` (left) to `#FFFFFF` (right).
