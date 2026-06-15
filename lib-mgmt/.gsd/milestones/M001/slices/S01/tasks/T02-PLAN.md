# T02: Auth State & Validation Logic

**Slice:** S01
**Milestone:** M001

## Goal
Implement the application's authentication state and the logic for validating user credentials.

## Must-Haves

### Truths
- "Store tracks `isAuthenticated`, `user`, and `loading` states."
- "Login attempt triggers validation and updates store state."
- "Successful login redirects user to the Dashboard."

### Artifacts
- `src/stores/authStore.ts` — Zustand store for auth.
- `src/pages/auth/LoginPage.tsx` — Updated to handle form state and submission.

### Key Links
- `LoginPage.tsx` → `authStore.ts` via `useAuthStore` hook.

## Steps
1. Install `zustand` (already in package.json).
2. Create `src/stores/authStore.ts` with `login`, `logout`, and session persistence logic.
3. Update `LoginPage.tsx` to use `useState` for form fields.
4. Implement the `handleLogin` function to call the store's login method.
5. Add navigation logic using `react-router-dom` to redirect on success.

## Context
- Follow the `DESIGN-SYSTEM.md` requirement for "User Not Allowed" dialog handling (logic for T03).
- For now, implement a mock validation (e.g., username "admin" works).
