# Task Plan: T04 — Control Number Generator

**Parent Slice:** S03 — Cataloging Infrastructure
**Status:** Planned

## 1. Objective
Implement the logic to generate a unique, timestamp-based `Control No.` for each new catalog entry.

## 2. Technical Specs
- **Format**: `MMDDYYHHMMSS` (Estimated based on wireframe sample `050326201802`).
- **Styling**: Displayed in `Text-Green` (#008000) with a bold weight.
- **Behavior**: Generated once when the form is opened and stays fixed for that session.

## 3. Implementation Steps
1. Create a utility function `generateControlNumber()`.
2. Hook the generation into the `CatalogForm`'s initialization logic.
3. Ensure the value is included in the form state for submission.

## 4. Verification Criteria
- [ ] Every time the "Add New" form is opened, a different ID appears.
- [ ] The ID matches the required 12-digit format.
- [ ] Text color is correctly set to green.
