# GSD State

**Active Milestone:** M008 — Legacy Data Migration (PAUSED)
**Active Milestone:** M009 — Branding & Personalization
**Active Slice:** S02 — Theme Engine
**Active Task:** T03 — Implement Dark Mode & Theme Scalability
**Phase:** Review

## Recent Decisions
- D001: Use React + Tailwind for UI implementation (Parity-first).
- D002: Use Lucide-React for iconography (Modern equivalent).
- D003: Strictly follow beveled border styling for legacy parity.
- D004: Removed Sidebar navigation in favor of a top-heavy Toolbar to match wireframe 003-dashboard-main.
- D005: Implemented high-density DataGrid with sticky headers for catalog browsing.
- D026: Added Basic/Advanced mode toggle in the top Toolbar. Basic mode shows New, Delete, Export, Authority, About, and Exit.
- D027: Resolved missing database state initialization in Tauri run loop and fixed PostgreSQL case-sensitivity in migrations.
- D028: Analyzed legacy "Edit" wireframes (010, 011) to ensure full parity of the catalog update and holdings management workflow.
- D029: Planned S04 to implement the full Edit Catalog Record workflow.
- D030: Holdings management will be implemented as a sub-panel within the Edit Dialog.
- D031: Enforced 20 items per page limit for "No-Scroll" UI parity.
- D032: Implemented classic "Record Navigator" (Page X of Y) for dashboard data navigation.
- D033: Used psql for bulk import of 16,000+ legacy records.
- D034: Reset database to full legacy schema for 100% data parity.
- D035: Selected Phi-3 Mini via Ollama for offline-first AI privacy (Transitioned from Gemma 4 per user request).
- D036: Chose pgvector for integrated semantic search in PostgreSQL.
- D037: Designed AI Badge with dynamic opacity (30% idle, 100% hover) to prevent UI clutter.
- D006: Adopted Caveman plugin for communication to reduce token usage (~75% reduction).
- D007: Implemented auto-generating timestamp ID (Control No) and full bibliographic form validation.
- D008: Centralized global dialog management in MainLayout for multi-context access.
- D009: Implemented global catalogStore (Zustand) to sync selection between Dashboard and Toolbar actions.
- D010: Context-aware Toolbar 'New' button based on current route.
- D011: Unified Patron state in patronStore using idno as primary identifier.
- D012: Added Edit button and double-click to edit support in DataGrid.
- D013: Implemented transactional Borrowing workflow in Rust with automatic DueDate calculation.
- D014: Integrated CheckoutDialog with real-time active loan monitoring.
- D015: Implemented Return logic with automatic fine calculation and account accumulation.
- D017: Implemented Circulation Dashboard with real-time statistics and overdue reporting.
- D018: Initiated M004 for financial reconciliation and inventory management.
- D019: Implemented atomic fine payment logic with GREATEST safety floor.
- D020: Integrated PaymentDialog with high-density balance visualization.
- D021: Implemented Inventory Audit (Shelf-Read) with automatic last_audit timestamping and Missing status auto-recovery.
- D022: Implemented Financial Reporting with transactional payment recording in tblFineCode.
- D023: Implemented Acquisitions Reporting with date_acquired tracking and multi-criteria filtering.
- D024: Implemented Authority Control backend and frontend for centralized Author and Subject management.
- D025: Implemented Item Reservations queue using tblReserve with serve/cancel workflow and 7-day expiry.
- D038: Built pgvector v0.8.2 from source via VS2022 and installed into PostgreSQL 18. Extension verified operational.
- D039: Connected Tauri backend to local Ollama (nomic-embed-text) for real-time query vectorization and semantic catalog search.
- D040: Upgraded AI system prompt to behave like a natural conversational partner (similar to famous chatbots) instead of a mechanical search robot.
- D041: Adopted General de Jesus College (GJC) color scheme for the installer and premium UI elements (Primary: #00401A, Secondary: #C5A059).
- D042: Selected Tauri v2 NSIS bundling for "colorized" MSI/EXE with custom branding templates.
- D043: Bundle PostgreSQL + Ollama inside NSIS installer EXE (not sidecars).
- D044: Implemented secure settings export/import for backup on external drives.
- D045: Enabled user-configurable database credentials via the application setup flow.
- D046: Custom NSIS credentials page writes db_config.json to %APPDATA% during install.
- D047: Dependencies extracted to $INSTDIR subdirectories for full portability.
- D048: NSIS auto-detects existing PostgreSQL/Ollama installations — skips bundled install if found.
- D049: Removed SetupPage first-boot intercept. Login is first screen. Settings accessible from Toolbar.
- D050: Registered tauri-plugin-dialog and tauri-plugin-shell in Rust builder to fix settings crash.
- D051: Applied glassmorphism and GJC branding to all premium dialogs.
- D052: Refactored SettingsPage into a tabbed interface with system status monitoring.
- D053: Sanitized legacy SQL dump to fix Mojibake using byte-level replacement script.
- D054: Source data identified as PostgreSQL SQL dump in docs/legacy-database/.
- D055: Implemented logo customization in Settings using `upload_logo` command.
- D056: Logo is persisted in `db_config.json` and resolved to absolute path via `get_logo_path`.
- D057: Chose WebP as best-practice format for logo optimization.
- D058: Enabled explicit `dialog` and `shell` permissions in Tauri v2 capabilities.
- D059: Implemented timestamp-based logo filenames (`logo_<ts>.webp`) to prevent Windows file locking and browser caching issues.
- D060: Reverted GJC branding (Green/Gold) to classic Windows 95/98 Blue/White theme.
- D061: Unified all blue accents and gradients to match the "sky blue" (`#A6CAF0` to `#7FA8E0`) found in the dashboard TitleBar for design consistency.
- D062: Implemented Firebase Auto-Sync architecture with background interval processing.
- D063: Added Sync/Logs ComboButton to the main Toolbar for manual override and status monitoring.
- D064: Deprecated Supabase provider in favor of Firebase strictly, while maintaining Supabase healthcheck for legacy infrastructure monitoring.
- D065: Finalized Windows 95/98 Dark Mode remediations across all components.

- D062: Implemented comprehensive Win95/98 Dark Mode using Tailwind `.dark` selector strategy.
- D063: Created `THEME-ENGINE-GUIDE.md` per management request to ensure future theme scalability.
- D064: Refactored `index.css` to centralize theme tokens, avoiding inline class bloat.

## Blockers
- **B002**: Awaiting final raw data export from GJC Library legacy terminal.

- D066: Upgraded authentication to support Social Login (Google), controlled via `VITE_ENABLE_SOCIAL_LOGIN` feature flag.
- D067: Implemented offline detection to dynamically disable social login UI components with fallback messaging.
- D068: Architected access token lifecycle management with auto-refresh mechanism.
- D069: Updated database schema `tblPassword` to support `auth_provider` and `social_id`.
- D070: Verified codebase integrity via `tsc --noEmit` and addressed all lint/type issues in auth and layout components.
- D071: Implemented Win95-styled `UserProfile` component in the main window TitleBar.
- D072: Integrated role-based metadata (Administrator, Librarian, etc.) into the authentication state and UI.
- D073: Repositioned both `UserProfile` and `Close` buttons to the top-right group per user request.
- D074: Implemented `DEV_DATABASE_URL` env var bypass in `settings.rs` to skip NSIS-installed `db_config.json` during development. Activated `dotenvy` in `main.rs` (was a dead dependency).
- D075: Planned M010 — Legacy Access Database Import. Pure Rust implementation via `odbc-api` crate. No Python runtime dependency.
- D076: S01 (backend) defines 6-task pipeline: auto-backup → ODBC check → MDB read → validate → transact → wire. S02 (frontend) defines 4-step import dialog (Advanced Mode only).
- D077: Implemented M010-S02 (Frontend). Added `ImportMdbDialog` and `ImportSummaryView`. Added `DatabaseBackup` icon to `Toolbar` (visible in Advanced Mode). Wired to `MainLayout`.
- D078: Fixed dark mode visibility in `ImportMdbDialog` for selected file path by using standard `input-classic` class. Verified M010 requirements in `REQUIREMENTS.md`.

## Caveman Mode
**Status:** Active. Fast, terse agentic execution protocol enabled.

## Next Action
## Next Action
M010 completed. Handoff to Lead Project Manager (LPM) for next feature planning or final review.
