# UI Analysis: infoLib Catalog Entry Form

This document provides a technical specification for the "Add New" record form as seen in `006-new-catalog-entry-form.webp`.

## 1. Visual Overview
A comprehensive data entry form for library cataloging. It utilizes a multi-field layout optimized for keyboard-heavy data entry (typical for librarians).

## 2. Layout Specifications
*   **Window Title**: "Add New"
*   **Primary Container**: A light blue border surrounding the form fields.
*   **Input Density**: High density with labels positioned to the left of input fields.

## 3. Component Breakdown

### A. Contextual Toolbar
*   **Add New**: Disabled (since the window is already in this mode).
*   **Save**: Primary submission action.
*   **Holdings**: Switches view to manage physical copies (see `007`).
*   **Exit**: Returns to the main dashboard.

### B. Header Fields
*   **Control No.**: `050326201802` (Auto-generated unique ID, highlighted in green).
*   **Material**: Dropdown selection (e.g., Book, Journal, Media).

### C. Primary Metadata
*   **Title**: Large single-line text field (expandable/multi-line in implementation recommended).
*   **Author**: Standard text field.
*   **Dual-Column Fields**:
    *   ISBN | Call No.
    *   Publisher | Pub Place
    *   Date | Physical Desc
    *   Edition | (Blank/Spacer)

### D. Extended Metadata
*   **Subject**: Three separate lines/fields for multiple subject headings.
*   **Added Entry (Title)**: Secondary titles.
*   **Series Title**: Title of the series if applicable.
*   **Added Entry Author**: Three separate fields for co-authors or contributors.
*   **Notes**: Large multi-line text area for general annotations.

## 4. Logical Behavior
*   **ID Generation**: The "Control No." should be generated upon opening the form.
*   **Validation**: Required fields likely include Title and Control No.
*   **Accessibility**: Full Tab-index support is critical for this form.

## 5. Modernization Recommendations
*   **Auto-Complete**: Implement ISBN lookup (e.g., OpenLibrary API) to auto-fill Title, Author, and Publisher.
*   **Dynamic Lists**: Use a chips-style input for "Subject" and "Added Entry Author" instead of fixed multiple text boxes.
*   **Sticky Header**: Keep the Toolbar visible while scrolling long forms.
