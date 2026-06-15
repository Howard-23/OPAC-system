---
id: T04
parent: S01
milestone: M002
provides:
  - Dynamic window resizing logic
requires: [T03]
affects: [UI/UX]
key_files:
  - src-tauri/src/lib.rs
  - src/stores/authStore.ts
key_decisions:
  - "Used Tauri commands (maximize/reset) to control window state programmatically upon authentication events."
patterns_established:
  - "App-driven window resizing pattern."
duration: 10min
verification_result: pass
completed_at: 2026-05-04T00:29:00Z
---

# T04: Invoke Bridge

**Implemented resize commands. AuthStore integration live.**
