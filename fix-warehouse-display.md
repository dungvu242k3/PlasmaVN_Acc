# Fix Warehouse Display

## Overview
The "Thao tác đơn hàng" (Order Actions) modal currently displays the raw `warehouse_id` UUID instead of the human-readable warehouse name. This happens because the modal only receives the `order` object which stores the warehouse ID.

## Project Type
WEB

## Success Criteria
The "Kho xuất" field in the Order Actions modal correctly displays the human-readable warehouse name (e.g., "Kho trung tâm") rather than a UUID.

## Tech Stack
React, TailwindCSS

## File Structure
- `src/pages/Orders.jsx`: Renders the `<OrderStatusUpdater>` modal.
- `src/components/Orders/OrderStatusUpdater.jsx`: Displays the order information.

## Task Breakdown
- [x] Task 1: Supply `warehouseName` to `<OrderStatusUpdater>` modal.
      - **Agent:** `frontend-specialist`
      - **Skill:** `clean-code`
      - **INPUT:** `Orders.jsx` currently calls `<OrderStatusUpdater order={selectedOrder} ... />`.
      - **OUTPUT:** Add `warehouseName={getLabel(warehousesList, selectedOrder.warehouse)}` prop.
      - **VERIFY:** Code structure is correct and matches React conventions.
      
- [x] Task 2: Render `warehouseName` in the modal UI.
      - **Agent:** `frontend-specialist`
      - **Skill:** `clean-code`
      - **INPUT:** `OrderStatusUpdater.jsx` extracts `{order}` and prints `{order.warehouse}`.
      - **OUTPUT:** Extract `{warehouseName}` in component props and display `{warehouseName || order.warehouse}` in the "Kho xuất" field.
      - **VERIFY:** Component renders cleanly.

## Phase X: Verification
- [x] **Lint Check**: Run `python .agent/scripts/checklist.py .` to ensure no errors.
- [x] **Manual Testing**: Start `npm run dev`, go to the Orders list page, click the "Thao tác" (Package icon) button on any order, and observe the "Kho xuất" field format.

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-03-22
