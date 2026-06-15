# UI Analysis: infoLib Catalog Entry Form (Edit Mode)

This document provides a technical specification for the "Edit" record form as seen in `010-edit-catalog-entry.webp`.

## 1. Visual Overview
The edit mode for an existing library catalog record. It is nearly identical to the "Add New" form (`006`) but populated with existing data.

## 2. Layout Specifications
*   **Window Title**: "Edit"
*   **Primary Container**: A light blue border surrounding the form fields.
*   **Input Density**: High density with labels positioned to the left of input fields.

## 3. Component Breakdown

### A. Contextual Toolbar
*   **Add New**: Enabled (allows jumping from editing one record to creating a new one).
*   **Save**: Updates the existing record in the database.
*   **Holdings**: Switches view to manage physical copies/holdings for this specific control number (see `011`).
*   **Exit**: Returns to the main dashboard without saving.

### B. Header Fields
*   **Control No.**: `081007084930` (Existing unique ID, read-only/highlighted).
*   **Material**: Dropdown selection (e.g., "Filipinian").

### C. Primary Metadata
*   **Title**: Pre-populated (e.g., "A brief history of the Filipino flag").
*   **Author**: Pre-populated (e.g., "Kalaw, Pura V.").
*   **Dual-Column Fields**:
    *   ISBN | Call No. (e.g., "929.92 K14")
    *   Publisher (e.g., "Bureau of Printing") | Pub Place (e.g., "Manila")
    *   Date (e.g., "1947") | Physical Desc (e.g., "20p. : ill. ; 23cm.")
    *   Edition | (Blank/Spacer)

### D. Extended Metadata
*   **Subject**: Three separate lines (e.g., "Flags - History - Philippines").
*   **Added Entry (Title)**: Pre-populated if exists.
*   **Series Title**: Pre-populated if exists.
*   **Added Entry Author**: Three separate fields for co-authors.
*   **Notes**: Large multi-line text area for annotations.

## 4. Logical Behavior
*   **Data Binding**: Fields must be bound to the selected record's database values.
*   **Read-Only Constraint**: The Control No. cannot be edited during this mode.
*   **Concurrency**: Should ideally check if the record was modified by another user before saving.

## 5. Modernization Recommendations
*   **Version History**: Show when and who last edited the record.
*   **Soft Delete**: Add a "Delete" button directly in the toolbar for faster workflow (currently a separate dialog).
