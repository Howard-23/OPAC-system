# Slice Plan: S03 — Cataloging Infrastructure

**Goal:** Implement the "Add New" cataloging form with 100% aesthetic parity, supporting full bibliographic metadata entry and automatic ID generation.

## 1. Scope & Objectives
- Develop the `CatalogForm` component following the high-density legacy layout.
- Implement auto-generation logic for the unique `Control No.`.
- Support all metadata fields: Title, Author, ISBN, Call No, Subjects, etc.
- Integrate form validation using Zod and React Hook Form.

## 2. Success Criteria
- [ ] "Add New" window features a beveled light-blue inner container.
- [ ] `Control No.` is automatically generated and displayed in green text.
- [ ] All 15+ bibliographic fields are present and correctly aligned.
- [ ] "Save" button triggers validation and (mock) record persistence.
- [ ] "Exit" button returns the user to the main dashboard.

## 3. Atomic Tasks
| ID | Task Name | Description | Dependency |
| :--- | :--- | :--- | :--- |
| **T01** | Catalog Form Skeleton | Create the base `CatalogForm` with beveled frames and header area. | None |
| **T02** | Bibliographic Fields (Primary) | Implement core fields: Title, Author, ISBN, Publisher, Date, etc. | T01 |
| **T03** | Extended Metadata & Notes | Implement Subject, Added Entry, and multi-line Notes fields. | T02 |
| **T04** | Control Number Generator | Implement the auto-generation and display logic for unique identifiers. | T01 |
| **T05** | Form Logic & Submission | Integrate Zod validation and handle "Save/Exit" actions. | T03, T04 |

## 4. Technical Constraints
- **State Management**: Use `react-hook-form` for local form state.
- **Styling**: Maintain high density (compact spacing) and specific color tokens (e.g., green text for IDs).
- **Parity**: Labels must be left-aligned with inputs, mimicking the VB6 form style.

## 5. Verification Plan
- **Static**: Confirm all fields match the `006-new-catalog-entry-form.md` specification.
- **Dynamic**: Verify `Control No.` changes on every new form instantiation.
- **Behavioral**: Ensure required field validation prevents submission of empty records.
