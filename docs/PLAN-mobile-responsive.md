# Implementation Plan: Mobile Responsive UI cho toàn bộ dự án

Dựa trên yêu cầu của bạn, chúng ta sẽ tối ưu hóa toàn bộ hệ thống (các màn hình hiện có) để có thể hiển thị và thao tác mượt mà trên giao diện điện thoại (Mobile Responsive) theo phương án thiết kế đã được thống nhất.

## Overview & Success Criteria
- **Mục tiêu**: Toàn bộ hệ thống quản lý Khách hàng, Đơn hàng, Máy móc, Vận đơn, Bình khí và Kho hàng phải hoạt động tốt trên màn hình nhỏ (Mobile/Tablet).
- **Project Type**: WEB Frontend (sử dụng Tailwind CSS cho Reaponsive Design).
- **Tiêu chí nghiệm thu**: 
    1. Menu trái gọn gàng gập lại trên điện thoại.
    2. Các form tạo mới chuyển thành 1 cột trên Mobile.
    3. Các bảng (Table) lớn có thể vuốt ngang (Horizontal Scrollbar) không bị vỡ layout hoặc chuyển sang dạng các thẻ thông tin dọc.

---

## Proposed Changes

Chúng ta sẽ sử dụng công cụ responsive của Tailwind CSS (các utility classes `md:`, `lg:`...) để tinh chỉnh lại layout.

### 1. Thành phần Navigation (Điều hướng)
#### [MODIFY] [Home.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/Home.jsx)
- Chuyển đổi `<aside>` (Sidebar) thành Hamburger Menu dạng off-canvas (mở trượt từ trái sang) trên màn hình mobile (`< md`), hoặc hiển thị Bottom bar tùy ngữ cảnh.
- Header hiện tại (`<header>`) cần thu gọn thanh Searchbar và bổ sung nút Toggle Menu.
- Dashboard Grid: Đảm bảo class `grid-cols-1` luôn được ưu tiên trên màn hình mobile.

### 2. Các trang Quản lý Danh sách (Data Tables)
- Áp dụng bọc thẻ `<div>` có `overflow-x-auto` cho toàn bộ các thẻ `<table>` trong hệ thống đề phòng bảng quá rộng bị vỡ.
- Hoặc, chuyển đổi cấu trúc table sang div flex/grid xếp chồng dạng Card trên màn hình dưới 768px (`md:` breakpoint).
#### [MODIFY] [Customers.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/Customers.jsx)
#### [MODIFY] [Machines.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/Machines.jsx)
#### [MODIFY] [Cylinders.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/Cylinders.jsx)
#### [MODIFY] [Warehouses.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/Warehouses.jsx)
#### [MODIFY] [Orders.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/Orders.jsx)

### 3. Các trang Thêm mới (Forms)
- Cấu trúc lại Grid (`grid-cols-X`) để đảm bảo form luôn nằm 1 cột trên giao diện Mobile (`grid-cols-1`) và chỉ bung ra nhiều cột trên Tablet/Desktop (`md:grid-cols-2`, `lg:grid-cols-3`...).
- Tối ưu Padding phần khung ngoài (`p-4` thay cho `p-8` hoặc `p-10`).
#### [MODIFY] [CreateCustomer.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/CreateCustomer.jsx)
#### [MODIFY] [CreateMachine.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/CreateMachine.jsx)
#### [MODIFY] [CreateCylinder.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/CreateCylinder.jsx)
#### [MODIFY] [CreateWarehouse.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/CreateWarehouse.jsx)
#### [MODIFY] [CreateOrder.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/pages/CreateOrder.jsx)

### 4. Thành phần Container chung
- Các thẻ bọc ngoài màn hình (Ví dụ: `div className="p-8 max-w-[1400px]..."`) cần thêm breakpoint responsive (ví dụ: `p-4 md:p-8`).

---

## Verification Plan (Phase X)
1. **Manual Check:** Mở Chrome DevTools, chuyển sang chế độ Device Toggle (iPhone 12/13/14 Pro) và kiểm tra:
    - [ ] Nav Menu hoạt động (đóng/mở trơn tru).
    - [ ] Các Form hiển thị tốt 1 cột, không bị chữ lọt quá lề phải.
    - [ ] Các bảng dữ liệu (Table) có thể vuốt tay trượt sang phải mượt mà.
2. **Automated Scripts:** Chạy `npm run lint` tự động để đảm bảo không lỗi cú pháp React.
