# Dự án Quản lý Danh sách Người dùng (User Management)

- **User Request:** Bỏ qua phần Vật tư. Xây dựng trang Danh sách người dùng và Thêm người dùng với các trường: Tên, Tên tài khoản, Vai trò, Số điện thoại, Trạng thái (Hoạt động/Dừng hoạt động).
- **Mode:** PLANNING ONLY (Dự thảo kế hoạch).
- **Project Type:** WEB (React/Next JS).

## Tổng quan (Overview)
Tính năng cho phép Quản trị viên (Admin) quản lý tài khoản nhân viên/người dùng trong hệ thống PlasmaVN.
Module bao gồm 2 trang chính:
1. **Danh sách người dùng:** Hiển thị dạng bảng (Table) các thông tin cơ bản: Tên, Vai trò, Số điện thoại, Trạng thái.
2. **Thêm người dùng:** Biểu mẫu (Form) nhập liệu với 5 trường bắt buộc (Tên, Tên tài khoản, Vai trò, Số điện thoại, Trạng thái).

## Tiêu chí thành công (Success Criteria)
1. **Database:** Cần có bảng `users` (hoặc `employees`) lưu các trường dữ liệu trên. Lưu ý `Số điện thoại` yêu cầu kiểu Number theo tài liệu (hoặc Varchar lưu chuỗi số để tránh mất số 0 ở đầu).
2. **Giao diện Danh sách (List):** Một màn hình gọn gàng có bộ lọc tìm kiếm cơ bản.
3. **Giao diện Thêm mới (Create):** Chứa đủ 5 trường nhập liệu theo đúng kiểu dữ liệu. Reset form sau khi lưu thành công.
4. **Validation:** 5 trường đều là bắt buộc (x). Trạng thái để mặc định là "Hoạt động".

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Lucide React icons. Áp dụng Design Thinking (không dùng màu tím, dùng glassmorphism chuẩn).
- **Backend/DB:** Supabase (PostgreSQL).

## File Structure (Cấu trúc thư mục dự kiến)
```text
src/
├── database/sql/
│   └── schema_users.sql           # [NEW] Cấu trúc bảng người dùng
├── constants/
│   └── userConstants.js           # [NEW] Định nghĩa Vai trò và Trạng thái
├── pages/
│   ├── Users.jsx                  # [NEW] Màn hình danh sách người dùng
│   └── CreateUser.jsx             # [NEW] Màn hình thêm mới người dùng
└── App.jsx                        # [MODIFY] Thêm các Route /nguoi-dung, /tao-nguoi-dung
```

## Task Breakdown (Chia nhỏ công việc)

### Task 1: Thiết kế Cơ sở dữ liệu (Database)
- **Agent:** `database-architect`
- **INPUT:** Cấu trúc bảng (Tên, Tên tài khoản, Vai trò, Số điện thoại, Trạng thái).
- **OUTPUT:** File `schema_users.sql` (bảng `app_users` để tránh trùng lặp từ khoá `users` của hệ thống auth nếu có).
- **VERIFY:** Chạy file trên Supabase thành công.

### Task 2: Cấu hình Constants & UI Logic
- **Agent:** `frontend-specialist`
- **INPUT:** File `userConstants.js`.
- **OUTPUT:** Các Array cho `USER_ROLES` (Admin, Nhân viên,...) và `USER_STATUSES` (Hoạt động, Dừng hoạt động).
- **VERIFY:** Dễ dàng import vào dropdown form.

### Task 3: Xây dựng màn hình Danh sách (Users.jsx)
- **Agent:** `frontend-specialist`
- **INPUT:** Giao diện Table từ file thiết kế chung PlasmaVN.
- **OUTPUT:** `src/pages/Users.jsx`.
- **VERIFY:** Hiển thị list người dùng từ DB, format đúng màu Trạng thái.

### Task 4: Xây dựng màn hình Thêm mới (CreateUser.jsx)
- **Agent:** `frontend-specialist`
- **INPUT:** Form nhập liệu 5 trường bắt buộc.
- **OUTPUT:** `src/pages/CreateUser.jsx`.
- **VERIFY:** Nhập thông tin -> Lưu DB -> Thông báo thành công -> Reset Form.

### Task 5: Cấu hình Menu và Navigation
- **Agent:** `frontend-specialist`
- **INPUT:** `Home.jsx` và `App.jsx`.
- **OUTPUT:** Nút / Card điều hướng vào Quản lý Người dùng tại Sidebar và Dashboard.
- **VERIFY:** Chuyển trang thành công.

## Phase X: Verification Checklist
Dùng để kiểm tra tổng thể khi code xong:
- [ ] Chạy lệnh `npm run lint`.
- [ ] Chạy kịch bản `python .agent/skills/frontend-design/scripts/ux_audit.py .`.
- [ ] Thử submit form lỗi (để trống trường bắt buộc).
- [ ] Thử submit form thành công (check DB coi có dữ liệu chưa).
- [ ] Layout không dùng màu Tím (Purple ban).
