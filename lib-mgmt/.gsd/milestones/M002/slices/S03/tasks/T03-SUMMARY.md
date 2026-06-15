---
id: T03
parent: S03
milestone: M002
provides:
  - quit_app Tauri command
requires: [T01]
affects: [APP-LIFECYCLE]
key_files:
  - src-tauri/src/lib.rs
  - src/components/layout/MainLayout.tsx
key_decisions:
  - "Connected the 'Exit' toolbar button directly to the native app::exit command to ensure clean process termination."
patterns_established:
  - "Formal exit pattern."
duration: 5min
verification_result: pass
completed_at: 2026-05-04T00:33:00Z
---

# T03: Exit Command

**Wired UI Exit to native Quit.**
