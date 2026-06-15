# T03: Error Dialog Component

**Slice:** S01
**Milestone:** M001

## Goal
Implement the authentication error dialog as seen in `002-login-invalid-dialog.webp`.

## Must-Haves

### Truths
- "Dialog appears when login fails (username !== 'admin')."
- "Dialog shows the message 'User Not Allowed' centered in a white area."
- "Dialog has a grey footer area with a centered 'OK' button."
- "Clicking 'OK' dismisses the dialog and clears the error in the store."

### Artifacts
- `src/components/auth/ErrorDialog.tsx` — The modal dialog component.
- `src/pages/auth/LoginPage.tsx` — Updated to display the dialog.

### Key Links
- `LoginPage.tsx` → `ErrorDialog.tsx` via conditional rendering based on `authStore.error`.

## Steps
1. Create `src/components/auth/ErrorDialog.tsx` using `BeveledBox` for the classic look.
2. Ensure the dialog has a title bar labeled "Login" and an 'X' close button.
3. Integrate the dialog into `LoginPage.tsx`.
4. Add logic to clear the error state when the dialog is closed.

## Context
- Parity: `002-login-invalid-dialog.webp`.
- Size: Approx 220x160px.
