# T02-SUMMARY: Item Reservations Implementation

## Status
- **Task**: T02 — Full Implementation
- **Milestone**: M005 — Authority Control & Advanced Services
- **Slice**: S02 — Item Reservations
- **Status**: COMPLETED

## Changes

### Backend (Rust)
- **New Struct**: `Reservation` added to `models.rs` (RecNumber, Idno, Accession, DateReserve, ReserveUntil, IsServed, patron_name, item_title).
- **New Commands**:
  - `get_reservations` — fetches all active reservations (`IsServed = 'N'`) joined to patron name and control number.
  - `add_reservation(idno, accession)` — inserts a new reservation with `DateReserve = NOW()` and `ReserveUntil = NOW() + 7 days`. Generates `RecNumber` as `MAX + 1`.
  - `serve_reservation(rec_number)` — sets `IsServed = 'Y'`.
  - `cancel_reservation(rec_number)` — hard-deletes the reservation record.
- All commands registered in `tauri::generate_handler!`.

### Frontend (React)
- **New Component**: `ReservationDialog.tsx`
  - High-density DataGrid showing active reservations (Patron ID, Patron Name, Accession, Control No, Date Reserved).
  - Action row: "Mark Served" and "Cancel" for selected reservation.
  - New Reservation form: Patron ID + Accession inputs with "Reserve" button, inline error display.
- **Integration**: Added to `MainLayout.tsx` state (`showReservation`).
- **Toolbar**: Added `BookmarkPlus` "Reserve" button to `Toolbar.tsx`.

## Verification
- `cargo check` passes with no errors.
- Dialog accessible via the "Reserve" button in the toolbar.

## Residual Risks
- None.
