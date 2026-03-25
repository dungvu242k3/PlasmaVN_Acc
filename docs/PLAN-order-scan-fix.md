# Plan: Fix Order Scanning and Duplicate Issues

Address two main issues in the "Add Order" flow:
1. Missing immediate duplicate warning for scanned/manual codes.
2. False "Mã không tồn tại" errors due to case/whitespace mismatch.

## Proposed Changes

### [Frontend] Order Management

#### [MODIFY] [CreateOrder.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/CreateOrder.jsx)

- **Immediate Duplicate Detection**:
    - Update `handleCylinderSerialChange` to check if the entered code already exists in other slots of the `assignedCylinders` array.
    - Show a `toast.warning` or `toast.error` immediately when a duplicate is detected.
    - Add a `duplicates` state or derived logic to highlight (red border) the duplicate input fields for better UX.
- **Robust Scanning**:
    - Ensure `handleScanSuccess` properly handles fast-paced scanning and concurrent state updates.
- **Sanitized Validation**:
    - In `handleCreateOrder`, before sending codes to Supabase:
        - `.trim()` all serial numbers.
        - `.toUpperCase()` all serial numbers (to match standard DB format).
        - Filter out empty strings effectively.
- **Improved Feedback**:
    - Update the error message for "Mã bình không tồn tại" to be more descriptive and helpful.

---

## Verification Plan

### Automated Tests
- None available for this specific UI component.

### Manual Verification
1. **Scenario 1: Manual Duplicate Entry**
    - Go to "Thêm đơn hàng".
    - Enter `TEST001` in slot 1.
    - Enter `TEST001` in slot 2.
    - **Expected**: Immediate warning toast and/or red highlight on the duplicate fields.
2. **Scenario 2: Scanning Duplicate**
    - Use the scanner to scan the same code twice.
    - **Expected**: Toast warning "Mã ... đã được gán vào đơn hàng này rồi!".
3. **Scenario 3: Case/Whitespace Resilience**
    - Enter ` tn123 ` (mixed case + spaces) for a known cylinder `TN123`.
    - Submit the order.
    - **Expected**: Order successfully created without "Mã không tồn tại" error.
4. **Scenario 4: Batch Scanning**
    - Perform a batch scan of 3 different cylinders.
    - **Expected**: All codes correctly assigned to consecutive slots.
