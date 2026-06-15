# Milestone M007: Distribution & Premium Deployment

## Vision
Finalize production-ready distribution for infoLib LMS. Premium, school-branded NSIS installer bundles ALL dependencies (PostgreSQL, Ollama), detects existing system installations, and provides zero-config deployment. App boots directly to login — all initialization handled by the installer. Post-install configuration accessible via in-app Settings dialog.

## Architecture
```
infoLib_0.1.0_x64-setup.exe (NSIS)
├── PREINSTALL Hook
│   ├── Detect system PostgreSQL (PATH / service / install dirs)
│   ├── Detect system Ollama (PATH / API / install dirs)
│   └── Custom DB Credentials Page (host/port/user/pass/dbname)
├── Welcome Page (GJC Branding: Sidebar + Header)
├── License Page
├── Install Directory Page
├── POSTCOPY Hook
│   ├── IF no system PG → Extract + initdb + pg_ctl start + createdb
│   ├── IF no system Ollama → Extract bundled binary
│   ├── Write db_config.json to %APPDATA%
│   └── Register INFOLIB_HOME in registry
├── Finish Page → Launch infoLib
└── PREUNINSTALL Hook
    ├── Stop bundled pg_ctl if present
    └── Clean registry
```

## App Boot Flow (Post-Install)
```
Launch infoLib.exe
├── Spawn Ollama sidecar (if bundled)
├── Spawn pg_ctl sidecar (if bundled)
├── Async DB pool init (non-fatal)
└── Show LoginPage
    └── After auth → Dashboard + Toolbar (with Settings ⚙ button)
```

## Slices

### S01: Branded Installer Infrastructure ✅
- Custom Tauri v2 NSIS with GJC Colors (#00401A, #C5A059).
- Custom header.bmp + sidebar.bmp.
- Bundle identifier: `ph.edu.gendejesus.infolib`.

### S02: NSIS System Detection & Dependency Bundling ✅
- `installer_hooks.nsh` with 3 hooks: PREINSTALL, POSTCOPY, PREUNINSTALL.
- **System detection** (3 methods each):
  - PostgreSQL: `where pg_ctl` → service query → file path check.
  - Ollama: `where ollama` → API ping → file path check.
- Skip bundled install if system dependency already present.
- Proper initdb flow: cluster init → pg_ctl start → wait → set password → createdb.

### S03: In-App Settings Dialog ✅
- `SettingsPage.tsx`: Tabbed dialog (Database | AI Engine).
- **Database Tab**: Connection URL editor, test connection, save, export/import backup.
- **AI Tab**: Model status table (phi3, nomic-embed-text), per-model Pull button, progress bar.
- Accessible from Toolbar ⚙ Settings button.

### S04: Non-Fatal Boot ✅
- `DbState` uses `Arc<Mutex<Option<PgPool>>>`.
- App never crashes on DB failure — shows login, commands return error gracefully.
- `check_db_connection` auto-retries init_db if pool is missing.
- Removed SetupPage first-boot intercept. Login shows immediately.

### S05: Packaging & QA 🔲
- [ ] Drop real PostgreSQL 18 portable into `src-tauri/deps/pgsql/`.
- [ ] Drop real Ollama binary into `src-tauri/deps/ollama/`.
- [ ] `bun tauri build` — verify NSIS hooks compile.
- [ ] Manual QA on clean Windows VM (VMware).
- [ ] Verify system detection skips install on machine with existing PG.
- [ ] Test uninstaller cleanup (pg_ctl stop, registry clean).

## Technical Decisions
- **D041**: GJC Brand Colors for all deployment artifacts.
- **D042**: NSIS `installerHooks` for dependency injection (not full template override).
- **D046**: Custom NSIS credentials page writes db_config.json to %APPDATA%.
- **D047**: Dependencies extracted to $INSTDIR subdirectories for portability.
- **D048**: NSIS auto-detects existing PostgreSQL/Ollama — skips bundled install if found.
- **D049**: Removed SetupPage intercept. Login is first screen. Settings accessible from Toolbar.

## Failsafe Matrix
| Failure | Recovery |
|---|---|
| Blackout during install | Re-run EXE. NSIS skips already-extracted files. |
| WiFi drop during model pull | Settings > AI > Pull button. Ollama pull is resumable. |
| Wrong DB credentials | Settings > Database > edit URL + Test Connection. |
| Corrupt config | Settings > Database > Import backup from drive. |
| System PG already installed | NSIS detects and skips. Uses system PG. |
| System Ollama already running | NSIS detects and skips. Uses system Ollama. |
