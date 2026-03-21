# Repair Ticket Error Category Implementation

## Goal
Add a `loai_loi` field to differentiate between "Máy" (Machine) and "Bình" (Cylinder) in repair tickets.

## Tasks
- [x] Task 1: Update Database Schema → Verify: Column `loai_loi` exists in `repair_tickets` table.
- [x] Task 2: Update `RepairTicketForm` State & Payload → Verify: Form handles `errorCategory` field.
- [x] Task 3: Add UI to `RepairTicketForm` → Verify: "**Tên lỗi**" (Máy/Bình) selector appears and works.
- [x] Task 4: Keep existing "Loại lỗi" unchanged.
- [x] Task 5: Update `RepairTickets` List View → Verify: "Tên lỗi" column displays data.
- [x] Task 6: Final Verification (Phase X) → Verify: All checks pass.

## Success Criteria
- [x] Field `loai_loi` is saved to DB.
- [x] Field `loai_loi` is visible in List View as "**Tên lỗi**".
- [x] Existing `error_type` label remains "**Loại lỗi**".
- [x] Form auto-populates "Máy/Bình" when device is selected.

## Tech Stack
- Supabase (PostgreSQL)
- React (Tailwind CSS)

## Phase X: Verification
- [ ] Lint check: `npm run lint`
- [ ] Manual test: Create and edit ticket with "Máy" and "Bình" options.
