# Theme Engine Guide: Adding New Themes

This document explains infoLib theme architecture and how to add new color themes (e.g. "GJC Gold" or "High Contrast").

## Current Architecture
- **Engine**: Tailwind `selector` strategy.
- **Store**: `src/stores/themeStore.ts` (Zustand).
- **Persistence**: `localStorage` (`infolib-theme`).
- **FOUC Prevention**: Inline script in `index.html`.
- **CSS**: `@layer components` in `index.css` + Tailwind utility classes.

## Step-by-Step: Adding a New Theme

Example: Adding a "Gold" theme.

### 1. Update Theme Store (`src/stores/themeStore.ts`)
Add new theme to types and logic.

```typescript
// Add to ThemeMode type
type ThemeMode = 'light' | 'dark' | 'system' | 'gold';

// Update applyTheme function
function applyTheme(mode: ThemeMode) {
  const resolved = mode === 'system' ? getSystemPreference() : mode;
  
  // Remove all theme classes first
  document.documentElement.classList.remove('dark', 'theme-gold');
  
  // Add active theme class
  if (resolved === 'dark') document.documentElement.classList.add('dark');
  if (resolved === 'gold') document.documentElement.classList.add('theme-gold');
}
```

### 2. Update FOUC Script (`index.html`)
Prevent flash of unstyled content for new theme.

```html
<script>
  (function() {
    var t = localStorage.getItem('infolib-theme') || 'light';
    if (t === 'system') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    // Add logic for new theme
    if (t === 'dark') document.documentElement.classList.add('dark');
    if (t === 'gold') document.documentElement.classList.add('theme-gold');
  })();
</script>
```

### 3. Add Tailwind Tokens (`tailwind.config.cjs`)
Define custom colors if needed.

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Existing colors...
        'gold-surface': '#FFF8DC',
        'gold-panel': '#F5DEB3',
        // ...
      }
    }
  }
}
```

### 4. Apply CSS Overrides (`src/index.css`)
Add selector overrides next to `.dark` styles.

```css
/* Gold Mode Overrides */
.theme-gold .btn-classic {
  @apply bg-gold-panel text-black;
  box-shadow: 2px 2px 0px #FFFFFF inset, -2px -2px 0px #B8860B inset;
}

.theme-gold .title-bar {
  background: linear-gradient(to right, #DAA520 0%, #FFD700 100%);
  color: #000000;
}
```

### 5. Update UI Components
If using inline classes, use arbitrary variants (e.g., `[.theme-gold_&]:bg-gold-surface`) or stick to `index.css` for cleaner HTML.

Based on the dark mode implementation, the following components, layouts, and dialogs must be updated to fully support a new theme:

**Pages & Layouts**
- `src/pages/auth/LoginPage.tsx` (Background, Branding Gradient, Form Area)
- `src/pages/dashboard/DashboardPage.tsx` (Status bar footers)
- `src/pages/settings/SettingsPage.tsx` (Theme toggle, Settings dialog background)
- `src/components/layout/MainLayout.tsx` (Outer background container, Main BeveledBox)
- `src/components/layout/TitleBar.tsx` (Gradient background, Text colors)

**Dashboard Components**
- `src/components/dashboard/Toolbar.tsx` (Toolbar container background, Separators, Branding text)
- `src/components/dashboard/ToolbarItem.tsx` (Icon color, Text color, Hover states)
- `src/components/dashboard/SearchBar.tsx` (Container backgrounds, Input fields, Dropdown, Text)
- `src/components/dashboard/RecordNavigator.tsx` (Container background, Text colors, Separators)

**Common UI & Grid**
- `src/components/common/DataGrid.tsx` (Table background, Selection highlight, Hover states, Empty text)
- `src/components/common/GroupBox.tsx` (Border colors, Shadow colors, Label background)

**Dialogs & Modals**
- `src/components/auth/ErrorDialog.tsx` (Backgrounds, Text colors)
- `src/components/dashboard/DeleteDialog.tsx` (Container background, Text colors)
- `src/components/dashboard/ExportDialog.tsx` (Container background, Labels, Inputs)
- `src/components/layout/AboutDialog.tsx` (Container, Logo circle, Info panels, Text)
- `src/components/inventory/AuditDialog.tsx` (Container, Table, Status text)
- `src/components/patrons/FinancialReportsDialog.tsx` (Summary boxes, History table)
- `src/components/inventory/AcquisitionsDialog.tsx` (Parameters box, Report table)
- `src/components/circulation/ReservationDialog.tsx` (Reservations grid, Form text)
- `src/components/catalog/AuthorityDialog.tsx` (Toggles, Category lists, Warning box)

**AI Components**
- `src/components/ai/AIChatBadge.tsx` (Badge backgrounds, Chat panel, Message bubbles, Input field, Status bar)

### 6. Add UI Toggle (`src/pages/settings/SettingsPage.tsx`)
Add option to Display tab.

```tsx
// Inside Display tab options array
[
  ['light', '☀️', 'Light', 'Classic appearance'],
  ['dark', '🌙', 'Dark', 'Dark mode'],
  ['gold', '🏆', 'Gold', 'GJC Institutional Gold'], // New option
  ['system', '💻', 'System', 'Follow OS']
].map(...)
```

## Summary
Add type → Update apply logic → Update FOUC script → Add CSS rules → Add UI toggle. No hardcoded logic in components. Global `.theme-name` class on `<html>` drives everything.
