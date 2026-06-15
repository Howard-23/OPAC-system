# Slice S01: Logo Customization

## Goal
Allow users to change the application logo via the settings menu.

## Tasks
- [x] **T01**: Update `SettingsPage.tsx` with a Branding tab.
- [x] **T02**: Implement logo storage logic in Rust (or persist in existing config).
- [x] **T03**: Update `LoginPage.tsx` to fetch and display the logo.
- [x] **T04**: Update `MainLayout` or Sidebar if logo is present there.
- [x] **T05**: Implement Advanced Logo Editor (Crop, Rotate, Flip, Optimize).

## Implementation Details
- Use `open` from `@tauri-apps/plugin-dialog` to pick an image.
- Convert image to base64 or copy to `app_data_dir`.
- Update `db_config.json` (or create `branding_config.json`) to store the logo path/data.
