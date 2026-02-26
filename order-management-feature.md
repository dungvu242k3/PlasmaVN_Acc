# Order Management Feature Plan

## Goal
Build a comprehensive Order Management module for PlasmaVN with status filtering, CRUD operations, and printing support.

## Tasks
- [x] **Task 0: Database Design (SQL)**
    - [x] Create `orders` table schema → Verify: Schema runs without errors in DB.
    - [x] Define Enum/Check constraints for 10 order statuses → Verify: Status validation works.
- [x] **Task 1: Core Navigation & Routing**
    - [x] Register `/quan-ly-don-hang` in `App.jsx` → Verify: URL access works.
    - [x] Enable feature card in `Home.jsx` → Verify: Card is clickable and navigates.
- [x] **Task 2: UI Structure (Orders.jsx)**
    - [x] Implement Status Tabs (Chờ duyệt, Điều chỉnh, v.v...) → Verify: Tabs switch state.
    - [x] Create Data Table with specified columns (Mã ĐH, Loại khách, v.v...) → Verify: Columns display correctly.
- [ ] **Task 3: Dedicated Create Order Page**
    - [ ] Extract form logic from `Orders.jsx` to `CreateOrder.jsx`.
    - [ ] Implement full-page layout for the 13-field form.
    - [ ] Ensure Supabase connection and validation work in the new context.
- [ ] **Task 4: Navigation Refactor**
    - [ ] Add "Tạo đơn hàng" to Sidebar in `Home.jsx`.
    - [ ] Register new route `/tao-don-hang` in `App.jsx`.
    - [ ] Remove auto-open and modal logic from `Orders.jsx`.
- [ ] **Task 5: Final Verification**
    - [ ] Verify form behavior and mobile responsiveness.

## Done When
- [ ] **Database schema is implemented and validated.**
- [ ] Users can browse orders by 10 different statuses.
- [ ] The table shows all 9 required data columns.
- [ ] Printing triggers the browser print dialog.
- [ ] Routing and sidebar navigation are fully synchronized.

## Notes
- Using `SIDEBAR_ITEMS` and `DASHBOARD_FEATURES` as reference for non-hardcoded configuration.
- UI will follow the clean, blue-themed PlasmaVN aesthetic.
