# infoLib Design System

This document defines the visual language and component architecture for the Library Management System, ensuring strict parity with the `wireframe-1` specifications while adhering to DRY (Don't Repeat Yourself) principles.

## 1. Visual Language

### Core Color Palette — Light Mode (Default)
| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **Surface-Classic** | `#D4D0C8` | Primary window background and non-interactive areas. |
| **Surface-Light** | `#FFFFFF` | Input fields and data grid backgrounds. |
| **Surface-Accent** | `#008080` | Specialized footers (e.g., About dialog). |
| **Primary-Blue** | `#000080` | Selection highlights and focused text. |
| **Border-Light** | `#FFFFFF` | Top/Left highlight of beveled edges. |
| **Border-Dark** | `#808080` | Bottom/Right shadow of beveled edges. |
| **Text-Main** | `#000000` | Primary labels and grid data. |
| **Text-Green** | `#008000` | Auto-generated identifiers (Control No.). |
| **Text-Error** | `#FF0000` | Critical warnings and error messages. |
| **Aero-Start** | `#A6CAF0` | Title bar gradient start. |
| **Aero-End** | `#7FA8E0` | Title bar gradient end. |

### Dark Mode Color Palette — Win95/98 Dark
| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **dark-surface** | `#2D2D2D` | Primary dark background (replaces `#D4D0C8`). |
| **dark-surface-alt** | `#3A3A3A` | Alternate surfaces (sunken form areas). |
| **dark-panel** | `#404040` | Button face, toolbar items, interactive elements. |
| **dark-input** | `#1E1E1E` | Deep sunken input/grid backgrounds. |
| **dark-border-light** | `#5A5A5A` | Top/Left highlight of dark beveled edges. |
| **dark-border-dark** | `#1A1A1A` | Bottom/Right shadow of dark beveled edges. |
| **dark-text** | `#E0E0E0` | Primary text color in dark mode. |
| **dark-text-muted** | `#A0A0A0` | Secondary/hint text in dark mode. |
| **dark-highlight** | `#666666` | General highlight/separator. |
| **dark-shadow** | `#1A1A1A` | Shadow edges. |
| **dark-title** | `#1E3A6E` | Title bar gradient start (dark). |
| **dark-title-end** | `#2A4F8A` | Title bar gradient end (dark). |
| **dark-accent** | `#6B9BD2` | Accent color for links/IDs/active elements. |
| **dark-selection** | `#1E3A6E` | Selected row background in grids. |

### Design Principles — Dark Mode
1. **No pure black** — `#1A1A1A` is the darkest value, avoiding eye-strain.
2. **Bevels preserved** — 3D bevel effect uses `#5A5A5A` (highlight) / `#1A1A1A` (shadow).
3. **Contrast ratio ≥ 4.5:1** — All text meets WCAG AA accessibility standards.
4. **Title bars darken, not invert** — Navy gradient `#1E3A6E → #2A4F8A` replaces sky-blue.

### Typography
| Level | Font Family | Size | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | Sans-Serif (Inter/Roboto) | 16px | 700 | Branding logos |
| **Heading** | Sans-Serif | 14px | 600 | Dialog titles, Group labels |
| **Body** | Sans-Serif | 12px | 400 | Grid data, Labels, Inputs |
| **Small** | Sans-Serif | 10px | 400 | Help text, system info |

## 2. Theme Architecture

### Strategy
- **Engine**: Tailwind CSS `darkMode: 'selector'` — toggles via `.dark` class on `<html>`.
- **Store**: `src/stores/themeStore.ts` (Zustand) — manages `light | dark | system` mode.
- **Persistence**: `localStorage` key `infolib-theme`.
- **FOUC Prevention**: Inline `<script>` in `index.html` <head> applies `.dark` before first paint.
- **System Sync**: `matchMedia('prefers-color-scheme: dark')` listener auto-updates when mode is `system`.

### Toggle Location
Settings dialog → **Display** tab → Radio group (Light / Dark / System).

### CSS Strategy
All dark overrides live in `src/index.css` under `@layer components` using `.dark .class-name` selectors. Component-level dark mode uses Tailwind `dark:` prefix utilities inline.

## 3. Component Library (DRY Standards)

### A. Action Components
*   **ToolbarItem**: A button containing a 32x32px icon and a bottom-aligned text label.
*   **Button-Classic**: Standard beveled button with 2px padding and centered text.
*   **IconButton**: Small button for list actions or window controls.

### B. Input Components
*   **FieldGroup**: A horizontal flex container with a fixed-width label (approx. 100px) and a flexible input field.
*   **ComboSearch**: A unified input group containing a text field, a scope dropdown, and a search trigger.
*   **RichTextArea**: Multi-line input with support for overflow scrolling.

### C. Layout & Containers
*   **WindowsContainer**: Main application shell with a Blue-Gradient title bar (#A6CAF0 light / #1E3A6E dark).
*   **DataGrid**: A scrollable table with sticky headers, horizontal grid lines, and row-selection states.
*   **GroupBox**: A labeled border container for grouping related fields (e.g., Export options).

### D. Dialogs & Modals
*   **BaseModal**: Centered overlay with a white content area and a grey footer area (#D4D0C8 light / #2D2D2D dark).
*   **MessageDialog**: Specialized modal for short messages (Alerts/Confirmations).

## 4. Parity Guardrails
To maintain strict analyzer approval:
1.  **Strict Bevels**: All inputs must have a "sunken" appearance (`inset` shadow) and all buttons must have a "raised" appearance (`outset` border). Dark mode uses `#5A5A5A / #1A1A1A` instead of `#FFFFFF / #808080`.
2.  **No Modern Spacing**: Use compact spacing (approx. 4px between related elements, 10px between groups) to mimic the high-density legacy UI.
3.  **Title Bar Parity**: Every modal must have a title bar with a matching icon and close 'X'.
4.  **Dark Mode Consistency**: Every component using hardcoded light colors must include `dark:` variant classes.
