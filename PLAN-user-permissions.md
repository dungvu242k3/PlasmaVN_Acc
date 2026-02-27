# Dự án: Quản lý Phân quyền (User Permissions)

- **User Request:** Xây dựng tính năng Phân quyền. Quản trị viên có thể tạo và gán quyền cho các nhóm người dùng. Gồm "Tên quyền" và "Chọn quyền" (thêm/sửa/xoá/xem cho từng tính năng).
- **Mode:** PLANNING ONLY
- **Project Type:** WEB

## Tổng quan (Overview)
Tính năng cho phép Admin tự định nghĩa các Vai trò (Roles) mới và thiết lập chi tiết quyền hạn (Xem, Thêm, Sửa, Xóa) cho từng chức năng trên hệ thống (ví dụ: Kho, Đơn hàng, Người dùng, Vật tư...). Sau đó, Quản trị viên sẽ dùng các "Vai trò" này để gán cho Nhân viên ở màn hình Quản lý Người dùng.

## Tiêu chí thành công (Success Criteria)
1. **Database:** Có bảng lưu trữ danh mục Vai trò (Roles) và bảng chi tiết Quyền hạn (Permissions mapping).
2. **Giao diện Danh sách:** Hiển thị tên các Nhóm quyền (Tên quyền) hiện có.
3. **Giao diện Thêm mới / Cập nhật:** 
   - Trường 1: Tên quyền (Text input) - Ví dụ: "Thủ kho miền Bắc".
   - Trường 2: Chọn quyền (Select / Checkbox Matrix) - Giao diện trực quan để tick chọn các quyền (Xem/Thêm/Sửa/Xóa) tương ứng với từng Module (Bình khí, Vận đơn, v.v.).

## Tech Stack
- Frontend: React, Tailwind CSS, Lucide React (chuẩn UI/UX hiện tại, không dùng màu tím).
- Backend: Supabase PostgreSQL (JSONB hoặc bảng mapping để lưu trữ quyền).

## File Structure dự kiến
```text
src/
├── database/sql/
│   └── schema_permissions.sql     # [NEW] Cấu trúc bảng roles và role_permissions
├── constants/
│   └── permissionConstants.js     # [NEW] Danh sách các Module cần phân quyền
├── pages/
│   ├── Permissions.jsx            # [NEW] Màn hình Danh sách Nhóm quyền
│   └── CreatePermission.jsx       # [NEW] Màn hình Thêm/Sửa Nhóm quyền
└── App.jsx                        # [MODIFY] Thêm Route /phan-quyen
```

## Task Breakdown

### Task 1: Thiết kế Database & Schema
- **Agent:** `database-architect`
- **Skill:** `database-design`
- **INPUT:** Yêu cầu lưu Tên quyền và Cấu hình quyền chi tiết.
- **OUTPUT:** File `schema_permissions.sql` sử dụng JSONB để lưu cấu hình phân quyền hoặc tạo 2 bảng `roles` và `role_permissions`.
- **VERIFY:** Chạy SQL trên Supabase thành công.

### Task 2: Định nghĩa Module Constants
- **Agent:** `frontend-specialist`
- **Skill:** `clean-code`
- **INPUT:** Liệt kê các chức năng hiện có (Kho, Hàng hoá, Đơn vị vận chuyển...).
- **OUTPUT:** File `permissionConstants.js` định nghĩa danh sách tính năng để render lên form "Chọn quyền".
- **VERIFY:** Array chuẩn syntax, dễ lặp (`.map()`).

### Task 3: Xây dựng màn hình Thêm mới Quyền (CreatePermission)
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **INPUT:** Form gồm Tên (Text) và khu vực Chọn quyền.
- **OUTPUT:** File `CreatePermission.jsx`. Khu vực "Chọn quyền" nên được thiết kế logic (dạng Card hoặc Matrix checkbox) để Admin dễ tick "Xem / Thêm / Sửa / Xóa" cho từng tính năng.
- **VERIFY:** Form render đẹp, lấy được JSON data quyền khi bấm Lưu.

### Task 4: Xây dựng màn hình Danh sách (Permissions) & Navigation
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **INPUT:** Component danh sách quyền và tích hợp vào `Home.jsx` (sửa thẻ Phân quyền đang bị khoá).
- **OUTPUT:** File `Permissions.jsx` và cập nhật `App.jsx`, `Home.jsx`.
- **VERIFY:** Click vào thẻ Phân quyền trên Dashboard sẽ chuyển qua trang danh sách.

## ✅ PHASE X: Verification
- [ ] Lệnh `npm run lint` pass hoàn toàn.
- [ ] Chạy `ux_audit.py` để đảm bảo tuân thủ thiết kế (Purple check, Spacing).
- [ ] Thử tạo 1 quyền "Thủ kho" với các quyền giới hạn và kiểm tra DB.
