# UI Analysis: Catalog Holdings Management (Edit Mode)

This document provides a technical specification for the "Edit" holdings interface as seen in `011-edit-catalog-holdings.webp`.

## 1. Visual Overview
A specialized management interface for the physical copies (holdings) of a cataloged item. It features a high-contrast blue background for the active management area.

## 2. Layout Specifications
*   **Window Title**: "Edit"
*   **Primary Container**: A blue-background beveled box split vertically.
*   **Context**: This view is triggered by the "Holdings" button on the main Edit form.

## 3. Component Breakdown

### A. Contextual Toolbar
*   **Add New / Save / Holdings / Exit**: Same as the parent form, providing navigation back or saving global record changes.

### B. Left Section: Holdings Update/Add
*   **Header**: "Holdings" (White text on blue).
*   **Fields**:
    *   **Accession**: Unique ID for the physical item.
    *   **Location**: Dropdown for library section/branch.
*   **Buttons**:
    *   **Save**: Upserts the holding record.
    *   **View**: Likely opens a detailed view or print label dialog.
    *   **Cancel**: Clears the holding inputs.

### C. Right Section: DELETE Holdings
*   **Header**: "DELETE Holdings" (White text on blue).
*   **Fields**:
    *   **Accession**: Input to specify which copy to remove.
*   **Button**:
    *   **Delete**: Executes a hard or soft delete of the specific holding record.

### D. Overlay Context
*   **Background Visibility**: The "Added Entry Author" and "Notes" fields from the parent form are still visible at the bottom, indicating this is an overlay or a sub-panel within the main edit window.

## 4. Logical Behavior
*   **Isolation**: Changes in the blue holdings box should ideally be transactional or require an explicit "Save" within that box, separate from the main catalog metadata "Save".
*   **Accession Validation**: Must prevent duplicate accession numbers across the entire system.
*   **Relational Integrity**: Deleting a holding must not delete the parent catalog record.

## 5. Modernization Recommendations
*   **Unified Grid**: Instead of separate "Save" and "Delete" boxes, use a DataGrid to show all current holdings with inline Edit/Delete actions.
*   **Bulk Actions**: Allow selecting multiple holdings for batch location updates.
