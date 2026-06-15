# Task: Manual QA on clean Windows VM

## Status
- **Priority:** High
- **Assigned to:** QA / PM
- **Status:** 🔲 PENDING

## Objectives
1. Verify "Clean Slate" install behavior (no pre-existing PG/Ollama).
2. Verify "Upgrade" or "Side-by-side" install behavior (existing system PG/Ollama detected).
3. Verify uninstaller stops services and cleans registry.

## Steps
- [ ] Prepare VM (Windows 10/11) with no developer tools.
- [ ] PM: Place real binaries in `src-tauri/deps/`.
- [ ] Dev: Generate installer `infoLib_0.1.0_x64-setup.exe`.
- [ ] Run installer on VM.
- [ ] Check if `%APPDATA%\ph.edu.gendejesus.infolib\db_config.json` is created with correct URL.
- [ ] Check if `pgsql\data` is initialized.
- [ ] Launch app, verify Login screen appears.
- [ ] Test Settings > Database > Test Connection.
- [ ] Test Settings > AI Engine > Pull (verify download progress).
- [ ] Uninstall app, check if folder is cleaned up and pg_ctl process stopped.
