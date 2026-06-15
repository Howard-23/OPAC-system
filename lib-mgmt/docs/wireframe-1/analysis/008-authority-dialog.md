# UI Analysis: infoLib Authority Control

This document provides a technical specification for the Authority management interface as seen in `008-authority-dialog.webp`.

## 1. Visual Overview
The Authority window manages controlled vocabularies (Authors and Subjects). It uses a list-based management approach with a prominent administrative warning.

## 2. Component Breakdown

### A. Contextual Toolbar
*   **Author Authority**: Toggles the list to show Author names (Selected state).
*   **Subject Authority**: Toggles the list to show Subject headings.
*   **Exit**: Closes the authority manager.

### B. System Warning
*   **Text**: "NOTE : CLOSE ALL THE WORKSTATIONS BEFORE UPDATING THE AUTHORITY"
*   **Styling**: Bold, red, all-caps.
*   **Purpose**: Indicates a database-level lock requirement or a lack of concurrent update handling in the legacy system.

### C. Management Area
*   **Authority List**: A single-column data grid with a scrollbar. Displays existing entries in the selected category.
*   **Edit Field**: A full-width text box at the bottom for typing a new entry or editing an existing one selected from the list.
*   **Action Buttons**:
    *   **Update**: Saves the entry from the text box into the database.
    *   **Delete**: Removes the selected entry from the database.

## 3. Logical Behavior
*   **Selection Logic**: Clicking an item in the list should populate the text box below for editing.
*   **Validation**: The "Update" button should check for duplicates before saving.

## 4. Modernization Recommendations
*   **Real-time Search**: Add a filter box above the list to quickly find specific authors or subjects.
*   **Merge Functionality**: Add a feature to merge two similar authorities (e.g., "Rowling, J.K." and "J.K. Rowling") into one record and update all linked catalog entries.
*   **Conflict Resolution**: Instead of requiring "all workstations closed," implement row-level locking or a robust background update system.
