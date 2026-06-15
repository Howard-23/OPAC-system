# Milestone M009: Branding & Personalization

## Vision
Enhance the system's professional appearance by allowing administrators to customize key branding elements, starting with the application logo. This ensures the system can be tailored to the specific identity of the institution (e.g., General de Jesus College).

## Slices

### S01: Logo Customization 🔲
- [x] Add "Branding" tab to SettingsPage.
- [x] Implement logo upload/selection using Tauri dialog.
- [x] Persist logo selection in `settings.json` or database.
- [x] Update LoginPage and Dashboard to display the custom logo.
- [x] Implement Advanced Logo Editor ✅:
    - [x] Auto-crop to 1:1 aspect ratio.
    - [x] Rotation and Flip (H/V) controls.
    - [x] Optimization and conversion to best-practice format (WebP).
    - [x] Integrated editor preview before saving.

### S02: Theme Personalization 🔲
- [ ] Add color scheme presets (Legacy, GJC, Modern).
- [ ] Allow fine-tuning of accent colors.

## Technical Decisions
- **D055**: Store custom logo as a base64 string or a local file path in the app data directory.
- **D056**: Use `tauri-plugin-dialog` for file selection.

## Blockers
- None.
