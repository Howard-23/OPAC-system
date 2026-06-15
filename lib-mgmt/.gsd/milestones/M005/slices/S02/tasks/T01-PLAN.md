# T01-PLAN: Item Reservations Planning

## Objective
Implement a queue-based reservation system allowing patrons to reserve items that are currently checked out, using `tblReserve`.

## Schema: `tblReserve`
| Column | Type | Notes |
|---|---|---|
| `RecNumber` | INTEGER | Reservation ID (PK) |
| `Idno` | TEXT | Patron ID (FK → tblUser) |
| `Accession` | TEXT | Item accession (FK → tblHoldings) |
| `DateReserve` | TIMESTAMP | When the reservation was placed |
| `ReserveUntil` | TIMESTAMP | Expiry date for the reservation |
| `IsServed` | TEXT | 'Y' or 'N' — whether the item was served |

## Proposed Changes

### 1. Backend (Rust)
- **New struct**: `Reservation` in `models.rs`
- **New commands**:
  - `get_reservations` — list all active (IsServed = 'N') reservations with patron/item info
  - `add_reservation(idno, accession)` — place a new reservation, set DateReserve = NOW(), ReserveUntil = NOW() + 7 days
  - `serve_reservation(rec_number)` — mark a reservation as served (IsServed = 'Y')
  - `cancel_reservation(rec_number)` — delete reservation record

### 2. Frontend (React)
- **New component**: `ReservationDialog.tsx`
  - Two-pane view: list of active reservations + a form to add a new one
  - "Serve" and "Cancel" actions on selected reservation
- **Integration**: `MainLayout.tsx` state + `Toolbar.tsx` button (using `BookmarkPlus` icon)

## Technical Considerations
- `RecNumber` has no AUTO INCREMENT in the legacy schema; generate it as `MAX(RecNumber) + 1` in the insert.
- Filter active reservations by `IsServed = 'N'`.
