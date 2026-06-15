# Task Plan: T03 — Extended Metadata & Notes

**Parent Slice:** S03 — Cataloging Infrastructure
**Status:** Planned

## 1. Objective
Complete the form by adding extended metadata fields (Subjects, Added Entries) and the large multi-line notes area.

## 2. Technical Specs
- **Fields**: 
  - Subject (3 fields).
  - Added Entry Title.
  - Series Title.
  - Added Entry Author (3 fields).
  - Notes (Large text area).
- **Styling**: 
  - Notes field should support scrolling and have a larger fixed height.

## 3. Implementation Steps
1. Add the "Subjects" section with three input fields.
2. Add the "Added Entries" section for Titles and Authors.
3. Implement the `Notes` field using a beveled `textarea`.

## 4. Verification Criteria
- [ ] All extended fields are present.
- [ ] "Notes" area allows multi-line input and vertical scrolling.
- [ ] Visual hierarchy separates primary and secondary metadata effectively.
