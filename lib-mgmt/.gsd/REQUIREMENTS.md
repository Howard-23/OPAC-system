# Requirements: infoLib LMS

## Functional Requirements
- [ ] User authentication with "User Not Allowed" error handling.
- [ ] Dashboard with search filtering by Keyword, Title, Author, etc.
- [ ] Multi-column data grid with record selection.
- [ ] Full Cataloging form with auto-generated Control Numbers.
- [ ] Holdings management (Accession/Location) within catalog flow.
- [ ] Authority control for Authors and Subjects with workstation lock warnings.
- [ ] Export functionality to Text, Printer, and Delimited formats.
- [ ] Premium "Colorized" Installer (GJC Branding: Green #00401A, Gold #C5A059).
- [ ] NSIS-level PostgreSQL/Ollama bundling with **system detection** (skip if already installed).
- [x] **Legacy Access Database Import**: Management-only toolbar button to import `.mdb` files from the legacy VB6/Access system. Pure Rust via `odbc-api`. Includes auto-backup, deduplication, encoding sanitization, FK validation, and import summary report.
- [ ] Custom NSIS credentials page for DB host/port/user/pass/dbname.
- [ ] In-app Settings dialog (Database + AI Engine tabs) accessible from Toolbar.
- [ ] Secure Settings Backup (Export/Import to secured drive).
- [ ] Failsafe recovery on blackout/WiFi drop during install or model pull.
- [ ] App boots directly to Login (no first-boot wizard).

## Non-Functional Requirements
- **Visual Parity**: Must match `wireframe-1` layout and aesthetics (Classic Grey, Bevels).
- **Branding**: Installer must align with General de Jesus College identity.
- **Portability**: Users must be able to backup and restore system configuration files easily.
- **Reliability**: Bundled dependencies (PostgreSQL, Ollama) must initialize correctly in Windows environments.
- **Maintainability**: Follow DRY principles for UI components (Buttons, Inputs, Dialogs).

## Out of Scope (Current Milestone)
- Advanced reporting and analytics.
- Real-time notification system.
- Offline-sync (focus on connected mode first).
