# S01: Authentication System

**Goal:** Implement a secure, wireframe-parity login experience.
**Demo:** User visits the root URL, sees the infoLib login screen, and can enter credentials.

## Must-Haves
- [ ] Visual parity with `001-login-empty.webp` (Beveled form, Lavender gradient).
- [ ] Error handling parity with `002-login-invalid-dialog.webp`.
- [ ] Client-side state for auth status (Zustand).

## Tasks

- [x] **T01: Login Page Implementation**
  Build the main login screen with the beveled form and branding.
  
- [x] **T02: Auth State & Validation Logic**
  Implement the Zustand store and the mock login validation.

- [x] **T03: Error Dialog Component**
  Create the "User Not Allowed" modal dialog.

## Files Likely Touched
- src/pages/auth/LoginPage.tsx
- src/stores/authStore.ts
- src/components/auth/LoginDialog.tsx
