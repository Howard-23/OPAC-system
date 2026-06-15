# UI Analysis: infoLib Export Dialog

This document provides a technical specification of the Export functionality as seen in `005-export-dialog.webp`.

## 1. Visual Overview
A structured form for configuring data export parameters. It uses standard Windows "Group Boxes" to categorize logical options.

## 2. Component Breakdown

### A. Option Selection (Group Box)
Allows the user to define *what* is being exported.
*   **Search Results**: Radio button (Default selected). Likely exports the current grid view from the main dashboard.
*   **By Accession Number**: Radio button. Enables the range inputs.
    *   **Range Inputs**: Two text boxes labeled "From" and "To" for specifying a numeric or alphanumeric range of records.

### B. Destination Selection (Group Box)
Labeled "Export Results To:", this defines the *format/target*.
*   **Target Options**:
    *   **Printer**: Sends directly to the system default printer.
    *   **Text File**: Exports as a plain `.txt` file.
    *   **Delimited**: Exports as a CSV or TSV file.
    *   **Accession List**: Likely a specialized report format.
*   **Path/Name Input**: A text field at the bottom of the group for specifying a filename or printer configuration string.

### C. Bottom Controls
*   **Numbered**: Checkbox to toggle line numbering in the output.
*   **Action Buttons**: "OK" (Execute) and "Cancel".

## 3. Interaction Logic
*   **Conditional Enablement**: Selecting "By Accession Number" should enable the "From/To" fields; otherwise, they should be disabled.
*   **Validation**: The "OK" button should be disabled if "By Accession Number" is selected but the range is empty or invalid.

## 4. Modernization Recommendations
*   **File Picker**: Replace the text input with a modern "Browse" button to open a file save dialog.
*   **Format Icons**: Use visual icons for Printer, Excel (CSV), and Text files for faster recognition.
*   **Progress Bar**: Add a progress bar for large exports.
