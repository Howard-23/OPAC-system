# M002 Roadmap

## Slices
- [x] **S01: Tauri v2 & Bun Scaffolding** `risk:low`
  > Initialized project structure. Configured startup windows.
- [x] **S02: Database Layer (Postgres)** `risk:medium`
  > Setup SQLx connection pool and schema verification.
- [x] **S03: Window & System Bridge** `risk:low`
  > Finalize dynamic resizing and system tray integration.
- [x] **S04: Core Catalog Commands** `risk:high`
  > Port frontend mock logic to backend Rust commands.

## Boundary Map
- **M01 Boundary**: All UI components and frontend routing.
- **M02 Boundary**: Rust logic, DB connectivity, and OS-level interactions.
