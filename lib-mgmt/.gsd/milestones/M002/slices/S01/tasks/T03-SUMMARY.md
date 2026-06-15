---
id: T03
parent: S01
milestone: M002
provides:
  - Startup window configuration
requires: [T01]
affects: [UI/UX]
key_files:
  - src-tauri/tauri.conf.json
key_decisions:
  - "Hardcoded 400x500 resizable:false for startup to match legacy login experience."
patterns_established:
  - "Startup window pattern."
duration: 5min
verification_result: pass
completed_at: 2026-05-04T00:28:30Z
---

# T03: Window Configuration

**Configured windowed login startup.**
