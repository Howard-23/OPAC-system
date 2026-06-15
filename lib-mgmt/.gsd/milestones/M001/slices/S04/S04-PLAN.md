# Slice Plan: S04 — Inventory & Authority

**Goal:** Implement physical inventory management and controlled vocabulary (Authority) tools with 100% aesthetic parity.

## 1. Scope & Objectives
- Develop the "Holdings" mode for the `CatalogForm` (Inventory management).
- Build the `AuthorityDialog` for Author and Subject management.
- Implement the `AboutDialog` for system information.
- Ensure all triggers (buttons) correctly open the appropriate modal/state.

## 2. Success Criteria
- [ ] "Holdings" mode features a high-contrast blue background and split Add/Delete panels.
- [ ] "Authority" window supports Author/Subject toggling and features the red system warning.
- [ ] "About" dialog displays branding and version info in a beveled popup.
- [ ] All management tools follow the #D4D0C8 beveled design system.

## 3. Atomic Tasks
| ID | Task Name | Description | Dependency |
| :--- | :--- | :--- | :--- |
| **T01** | Holdings Management Mode | Implement the blue-themed inventory panel in `CatalogForm`. | S03 |
| **T02** | Authority Control Dialog | Create the Author/Subject management window with legacy warning. | S02 |
| **T03** | About Dialog UI | Build the simple system information popup. | S02 |
| **T04** | Global Action Integration | Connect all toolbar/form buttons to trigger the new tools. | T01, T02, T03 |

## 4. Technical Constraints
- **State**: Use local component state for mode toggles (e.g., `isHoldingsMode`).
- **Styling**: Strict color tokens for Holdings mode (Background: Blue).
- **Parity**: Red bold warnings in Authority window must match wireframe exactly.

## 5. Verification Plan
- **Static**: Confirm field alignment against `007` and `008` analysis docs.
- **Visual**: Verify "Holdings" mode provides strong visual feedback (Color change).
- **Behavioral**: Ensure "Exit" from any tool returns to the previous context.
