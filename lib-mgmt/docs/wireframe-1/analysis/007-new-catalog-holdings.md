# UI Analysis: infoLib Holdings Management

This document provides a technical specification for the Holdings management sub-interface as seen in `007-new-catalog-holdings.webp`.

## 1. Visual Overview
The Holdings interface is an overlay or state-change within the Catalog Entry form. It uses a high-contrast blue background to distinguish it from the general metadata entry.

## 2. Component Breakdown

### A. Add/Edit Holdings (Left Pane)
Used to register individual physical copies of a title.
*   **Accession**: Text field for the unique accession number of the specific copy.
*   **Location**: Dropdown for specifying where the book is shelved (e.g., "General Collection", "Reference").
*   **Actions**:
    *   **Save**: Commit the specific holding.
    *   **View**: Likely opens a list of currently registered holdings for this title.
    *   **Cancel**: Reverts changes.

### B. Delete Holdings (Right Pane)
A dedicated section for removing record instances.
*   **Heading**: "DELETE Holdings" in white sans-serif.
*   **Accession Input**: Text field to identify the copy to be deleted.
*   **Action**: "Delete" button.

## 3. Interaction Design
*   **State Management**: This view is accessed via the "Holdings" button in the main cataloging toolbar.
*   **Visual Feedback**: The bright blue background acts as a "mode" indicator, signaling that the user is now managing inventory rather than bibliographic metadata.

## 4. Modernization Recommendations
*   **Inline Table**: Instead of a split Add/Delete view, use a dynamic table (CRUD) below the catalog form that lists all holdings with "Edit" and "Delete" icons in each row.
*   **Barcode Support**: The "Accession" field should automatically focus and support scanner input.
*   **Bulk Actions**: Allow users to add multiple copies at once (e.g., adding 5 copies with sequential accession numbers).
