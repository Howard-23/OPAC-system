# Task Plan: T05 — Form Logic & Submission

**Parent Slice:** S03 — Cataloging Infrastructure
**Status:** Planned

## 1. Objective
Integrate the form with validation logic and handle the "Save" and "Exit" actions.

## 2. Technical Specs
- **Validation**:
  - `Title` is required.
  - `Control No.` is required.
  - `ISBN` (optional) should follow standard length rules if possible.
- **Actions**:
  - Save: Validates and logs the record to console (mock persistence).
  - Exit: Redirects back to `/dashboard`.

## 3. Implementation Steps
1. Define the Zod schema for the catalog record.
2. Integrate `useForm` with the `CatalogForm` component.
3. Implement the `onSubmit` handler.
4. Hook up the "Exit" button in the toolbar.

## 4. Verification Criteria
- [ ] Submitting without a Title shows an error or prevents action.
- [ ] Clicking "Save" with valid data displays a success message (mock).
- [ ] Clicking "Exit" successfully returns the user to the dashboard.
