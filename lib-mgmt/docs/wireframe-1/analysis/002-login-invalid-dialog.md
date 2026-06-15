# UI Analysis: infoLib Login Error Dialog

This document provides a technical specification of the "User Not Allowed" dialog as seen in `002-login-invalid-dialog.webp`.

## 1. Visual Overview
A small, standard modal dialog box used to communicate authentication failure or permission denial. It follows the "classic" Windows message box pattern.

## 2. Layout Specifications
*Estimated dimensions.*

| Component | Width | Height | Positioning |
| :--- | :--- | :--- | :--- |
| **Dialog Window** | ~220px | ~160px | Centered over Login window |
| **Message Area** | 100% | ~100px | Top section (white) |
| **Button Area** | 100% | ~60px | Bottom section (grey) |

## 3. Component Breakdown

### A. Title Bar
*   **Text**: "Login" (matches the parent window title).
*   **Controls**: Standard 'X' close button only.

### B. Content Area
*   **Background**: White (#FFFFFF).
*   **Message**: "User Not Allowed" in black sans-serif font.
*   **Alignment**: Centered both horizontally and vertically within the white area.

### C. Action Footer
*   **Background**: Standard system grey (#D4D0C8).
*   **Button**: A single "OK" button.
*   **Button Styling**: Raised beveled edge, centered.

## 4. Logical Behavior
1.  **Trigger**: This dialog appears when a user attempts to log in with credentials that are valid but lack access permissions, or after a failed authentication attempt.
2.  **Modality**: This is a modal window; it blocks interaction with the main login screen until dismissed.
3.  **Dismissal**: Clicking "OK", pressing "Enter", or clicking the 'X' closes the dialog and returns focus to the "User Name" field on the login page.

## 5. Modernization Recommendations
*   **Iconography**: Add a "Warning" or "Error" icon (e.g., a red circle with an 'X') to the left of the message for better visual cues.
- **Toast Notifications**: In a web implementation, consider replacing this modal with a non-intrusive toast notification in the corner of the screen.
- **Specific Feedback**: If possible, distinguish between "Incorrect Password" and "Account Disabled" for better UX.
