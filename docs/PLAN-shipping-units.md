# PLAN: Quản lý Đơn vị vận chuyển (Shipping Units)

## Overview
Xây dựng tính năng Quản lý Đơn vị vận chuyển bao gồm bảng dữ liệu dưới backend, trang danh sách dạng bảng quản trị, và giao diện form thêm mới. Tính năng này giúp doanh nghiệp theo dõi thông tin các đơn vị vận chuyển nội bộ hoặc chuyên chở thuê ngoài.

## Project Type
WEB

## Success Criteria
- [ ] Bảng `shippers` được tạo thành công trên Supabase với đầy đủ 4 trường thông tin nghiệp vụ.
- [ ] Trang "Danh sách đơn vị vận chuyển" hiển thị đầy đủ thông tin dạng bảng với thuộc tính trượt ngang trên di động (responsive scroll).
- [ ] Trang "Thêm đơn vị vận chuyển" hiển thị các khối nhập liệu theo chuẩn mobile-first (hiển thị 1 cột trên ĐT, nhiều cột trên Desktop).

## Tech Stack
- Frontend: React, Tailwind CSS, Lucide React (Icons), React Router DOM.
- Backend/DB: Supabase (PostgreSQL).

## File Structure
- `src/database/sql/schema_shippers.sql`
- `src/pages/Shippers.jsx` (Màn hình Danh sách)
- `src/pages/CreateShipper.jsx` (Màn hình Thêm mới)
- Thêm routes trong `src/App.jsx`
- Cập nhật Sidebar/Dashboard trong `src/pages/Home.jsx`
- Tạo hằng số mockup testing `src/constants/shipperConstants.js`

## Task Breakdown

### Task 1: Thiết kế Cơ sở dữ liệu (Database Schema)
- **Agent**: `database-architect`
- **Tóm tắt**: Viết file kịch bản SQL khởi tạo bảng `shippers`
- **Chi tiết**:
  - `id` (UUID, khóa chính mặc định gen_random_uuid)
  - `name` (Text, bắt buộc) - Tên Đơn vị vận chuyển (VD: Công ty)
  - `manager_name` (Text, bắt buộc) - Người quản lý (VD: Nguyễn Văn B)
  - `phone` (Text, bắt buộc) - Số điện thoại (Dùng Text thay vì Number để giữ nguyên chữ số 0 ở đầu)
  - `address` (Text, bắt buộc) - Địa chỉ
  - `status` (Text, mặc định 'Đang hoạt động')
  - `created_at` (Timestamp)
- **INPUT**: Cấu trúc các trường từ yêu cầu user mô tả.
- **OUTPUT**: File `src/database/sql/schema_shippers.sql`
- **VERIFY**: Code SQL chạy thành công trong SQL Editor của Supabase.

### Task 2: Xây dựng Giao diện Trang Danh sách (List View)
- **Agent**: `frontend-specialist`
- **Tóm tắt**: Tạo màn hình tra cứu `src/pages/Shippers.jsx`
- **Chi tiết**:
  - Giao diện UI sao chép tương tự các trang hiện có (VD: `Warehouses.jsx`).
  - Map dữ liệu từ Supabase ra Table 5 cột (Tên ĐVVC, Quản lý, SĐT, Địa chỉ, Trạng thái).
  - Bọc bảng bằng thẻ `div` với class `overflow-x-auto` để cuộn ngang trên màn hình điện thoại.
- **INPUT**: Dữ liệu dòng từ Supabase Database.
- **OUTPUT**: File `src/pages/Shippers.jsx` hoàn thiện giao diện hiển thị.
- **VERIFY**: Danh sách load đúng dữ liệu, bảng có thể vuốt ngang trên giả lập Mobile.

### Task 3: Xây dựng Giao diện Form Thêm mới (Create View)
- **Agent**: `frontend-specialist`
- **Tóm tắt**: Lên màn hình tạo mới dữ liệu `src/pages/CreateShipper.jsx`
- **Chi tiết**:
  - 4 Ô nhập liệu được yêu cầu: Tên, Người quản lý, SĐT, Địa chỉ.
  - Sử dụng layout `grid-cols-1 md:grid-cols-2` để hỗ trợ đa thiết bị thay vì dồn cột trên màn hình nhỏ.
  - Khởi tạo Validator chặn người dùng không để trống bất kỳ trường thông tin nào trước khi lưu.
  - Tích hợp gọi Supabase Client lưu bản ghi vào hệ thống.
- **INPUT**: Tương tác nhập thông tin trên bàn phím.
- **OUTPUT**: `src/pages/CreateShipper.jsx` xử lý được API và UX thao tác thành công.
- **VERIFY**: Gõ nội dung mẫu -> Bấm lưu -> Xuất hiện Alert Báo Thành Công -> Tự động quay về Danh sách.

### Task 4: Tích hợp Hệ thống Điều hướng (Navigation)
- **Agent**: `frontend-specialist`
- **Tóm tắt**: Đưa tính năng mới vào bản đồ Navigation chung.
- **Chi tiết**:
  - Cấu hình 2 đối tượng `Route` định tuyến trên URL thông qua `src/App.jsx`.
  - Bổ sung biểu tượng `Truck` cho thẻ chức năng trong `SIDEBAR_ITEMS` và `DASHBOARD_FEATURES` tại `src/pages/Home.jsx`.
- **INPUT**: Components được lập trình tại Task 2 & Task 3.
- **OUTPUT**: Màn hình Home có sự xuất hiện của module lộ trình và kết nối vào hệ thống.
- **VERIFY**: Bấm nút "Thêm ĐVVC" từ Dashboard phải load được đúng nội dung trang Form.

## Phase X: Verification
- [x] Tuân thủ Clean Code: Giữ cho source code các file React dễ hiểu, tránh comment thừa.
- [x] Mobile Web: Trải nghiệm UI Responsive phải hoạt động ở tất cả các break-points (sm, md, lg).
- [x] Security: Các lệnh insert/select Supabase sử dụng API public key hiện thời với RLS được tắt.
- [x] Design: Không sử dụng màu tím vỡ nguyên tắc thiết kế `frontend-specialist`.
- [x] Performance: Đủ 60fps trên trải nghiệm lướt Table dữ liệu.

## ✅ Giai đoạn X (Trang thái: Hoàn tất)
