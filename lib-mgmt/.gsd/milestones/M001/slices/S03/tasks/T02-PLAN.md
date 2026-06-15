# Task Plan: T02 — Bibliographic Fields (Primary)

**Parent Slice:** S03 — Cataloging Infrastructure
**Status:** Planned

## 1. Objective
Implement the core bibliographic metadata fields, ensuring strict visual alignment and correct input types.

## 2. Technical Specs
- **Fields**: Title, Author, ISBN, Call No, Publisher, Pub Place, Date, Physical Desc, Edition.
- **Styling**: 
  - Standard classic inputs (`input-classic`).
  - Left-aligned labels with fixed width (~100px).
  - Multi-column rows for shorter fields (e.g., Date and Physical Desc).

## 3. Implementation Steps
1. Create a reusable `FieldGroup` component for consistent label/input pairing.
2. Implement the primary metadata section in `CatalogForm.tsx`.
3. Handle tab-index ordering to ensure smooth keyboard entry.

## 4. Verification Criteria
- [ ] All 9 primary fields are visible and editable.
- [ ] Labels are perfectly aligned to the left.
- [ ] Form remains compact and doesn't waste vertical space.
