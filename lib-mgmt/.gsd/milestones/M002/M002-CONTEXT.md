# M002 Context: Backend Infrastructure & Desktop Integration

## Objective
Establish a robust Rust-based backend using Tauri v2, integrate PostgreSQL for persistent storage, and implement desktop-specific UX patterns (window management, system tray) to match the legacy system's operational feel.

## Success Criteria
- [ ] Application starts in windowed Login mode.
- [ ] Window dynamically resizes/maximizes upon successful login.
- [ ] Database connection to PostgreSQL is stable and pooled.
- [ ] Initial CRUD operations (Catalog Read/Delete) are ported to native Rust commands.
- [ ] Project running with Bun for all frontend tasks.

## Technical Constraints
- **Tauri v2**: Use latest RC versions.
- **SQLx**: Native SQL queries (no ORM) for database interactions.
- **Bun**: Used as the package manager and runner.
- **Windows Parity**: Maintain strict adherence to screen size transitions.
