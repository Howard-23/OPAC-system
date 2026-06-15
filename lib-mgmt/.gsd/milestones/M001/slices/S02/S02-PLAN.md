# Slice Plan: S02 — Dashboard & Navigation

**Goal:** Implement the main dashboard interface with 100% aesthetic parity to the legacy wireframes, providing a functional layout for catalog browsing and navigation.

## 1. Scope & Objectives
- Create a reusable `MainLayout` shell with a classic Windows title bar.
- Implement a modular `Toolbar` for primary actions.
- Develop a high-density `DataGrid` component for record display.
- Ensure all components follow the `#D4D0C8` beveled design system.

## 2. Success Criteria
- [ ] Application title bar matches the blue-gradient Aero style.
- [ ] Toolbar actions are visually consistent with wireframe-1 (32x32px icons).
- [ ] DataGrid supports scrollable content and sticky headers.
- [ ] Search bar allows filtering by keyword/scope.
- [ ] User can "Logout" via the toolbar/menu.

## 3. Atomic Tasks
| ID | Task Name | Description | Dependency |
| :--- | :--- | :--- | :--- |
| **T01** | Main Layout Infrastructure | Implement `MainLayout` shell, TitleBar, and Window container. | None |
| **T02** | Global Action Toolbar | Implement the top toolbar with 6 action buttons (New, Delete, Export, Authority, About, Exit). | T01 |
| **T03** | Search & Filter Controls | Create the `ComboSearch` component for catalog queries. | T01 |
| **T04** | DataGrid UI Component | Implement the scrollable catalog table with mock data. | T01 |
| **T05** | Dashboard Assembly | Integrate all components into `DashboardPage.tsx` and hook up routing. | T02, T03, T04 |

## 4. Technical Constraints
- **Styling**: Tailwind `border-outset` and `border-inset` (custom tokens if needed) or manual CSS bevels.
- **State**: Use `authStore` for user context in the header.
- **Parity**: Compact spacing (4-10px), Inter/Roboto font at 12px for body.

## 5. Verification Plan
- **Static**: Confirm component reuse from `BeveledBox.tsx`.
- **Visual**: Compare `DashboardPage` screenshot against `003-dashboard-main.webp`.
- **Behavioral**: Verify logout redirects to `/login`.
