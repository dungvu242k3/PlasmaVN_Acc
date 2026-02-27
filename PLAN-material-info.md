# Dự án Quản lý Thông tin Vật tư (Material Information)

- **User Request:** Xây dựng tính năng quản lý danh mục vật tư cấu tạo nên Máy và Bình (Thể tích bình, Loại khí, Loại van, Loại quai, Loại máy, Đầu phát, Linh kiện).
- **Mode:** PLANNING ONLY (Dự thảo kế hoạch).
- **Project Type:** WEB (React/Next JS).

## Tổng quan (Overview)
Tính năng cho phép Quản trị viên lưu trữ các từ điển vật tư (Danh mục lõi) để sau này sử dụng cho việc lắp ráp Máy và Bình. 
Dựa vào hình ảnh được cung cấp, có 7 loại vật tư với cấu trúc dữ liệu tương đồng nhau (đều cần nhập `Tên` - bắt buộc). Một số loại đặc thù có thêm trường phụ (ví dụ: `Số / Giá trị`, `Ký hiệu`, hoặc `Đoạn Text mô tả thêm`). Do đó, phương án thiết kế tối ưu nhất là dùng **MỘT bảng CSDL duy nhất** (`materials`), sử dụng cột phân loại (`category`) và các cột phụ trợ đa dụng (`extra_number`, `extra_text`).

## Tiêu chí thành công (Success Criteria)
1. **Database:** 1 bảng `materials` bao quát được 7 loại danh mục.
2. **Giao diện Danh sách (List):** Một màn hình Quản lý Vật tư, có Tab/Dropdown để lọc nhanh từng nhóm vật tư (vd: chọn xem riêng "Loại khí").
3. **Giao diện Thêm mới (Create):** Chuyển đổi động linh hoạt (Dynamic Form). Khi chọn "Chọn loại vật tư: Thể tích bình", form tự hiện thêm ô nhập "Giá trị (Number)". Khi chọn "Đầu phát", tự hiện thêm ô nhập "Đoạn text phụ trợ".
4. **Validation:** Bắt buộc nhập Tên vật tư ở mọi trường hợp.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Lucide React icons. Áp dụng Design Thinking (không dùng màu tím, không dùng bento grid, dùng glassmorphism nhẹ chuẩn chỉnh).
- **Backend/DB:** Supabase (PostgreSQL).

## File Structure (Cấu trúc thư mục)
```text
src/
├── database/sql/
│   └── schema_materials.sql       # [NEW] Cấu trúc bảng materials
├── constants/
│   └── materialConstants.js       # [NEW] Định nghĩa 7 loại vật tư (category) & cấu hình form
├── pages/
│   ├── Materials.jsx              # [NEW] Màn hình danh sách vật tư theo Tab
│   └── CreateMaterial.jsx         # [NEW] Màn hình thêm mới vật tư
└── App.jsx                        # [MODIFY] Thêm các Route /vat-tu, /tao-vat-tu
```

## Task Breakdown (Chia nhỏ công việc)

### Task 1: Thiết kế Cơ sở dữ liệu (Database)
- **Agent:** `database-architect` / `backend-specialist`
- **INPUT:** Cấu trúc 7 loại vật tư (Tên, Thể tích[number], Ký hiệu[number], Text phụ[text]).
- **OUTPUT:** File `schema_materials.sql`.
- **VERIFY:** Chạy file trên Supabase thành công, tạo bảng `materials` gồm: `category`, `name`, `extra_number`, `extra_text`.

### Task 2: Định nghĩa Constants & Cấu hình UI logic
- **Agent:** `frontend-specialist`
- **INPUT:** File `materialConstants.js`.
- **OUTPUT:** Array lưu 7 loại category (id, label) và chỉ dẫn hiện UI (vd: `hasNumberField: true, numberFieldLabel: 'Giá trị'`).
- **VERIFY:** Dễ dàng import vào các component.

### Task 3: Xây dựng màn hình Danh sách (Materials.jsx)
- **Agent:** `frontend-specialist`
- **INPUT:** Giao diện Table chia Tab lọc theo `category`.
- **OUTPUT:** `src/pages/Materials.jsx` với giao diện cao cấp.
- **VERIFY:** Hiển thị 7 loại vật tư, chọn loại nào thì filter danh sách loại đó.

### Task 4: Xây dựng màn hình Thêm mới (CreateMaterial.jsx)
- **Agent:** `frontend-specialist`
- **INPUT:** Dynamic Form từ Constants.
- **OUTPUT:** `src/pages/CreateMaterial.jsx`.
- **VERIFY:** 
  - Đổi category -> Form tự đổi layout (thêm ô Number/Text nếu cần).
  - Submit ghi đúng xuống bảng `materials`.

### Task 5: Cấu hình Menu và Navigation
- **Agent:** `frontend-specialist`
- **INPUT:** `Home.jsx` và `App.jsx`.
- **OUTPUT:** Nút / Card điều hướng vào Quản lý Vật tư.
- **VERIFY:** Chuyển trang thành công, không bị lỗi 404.

## Phase X: Verification Checklist
Dùng để kiểm tra tổng thể khi code xong:
- [ ] Chạy lệnh `npm run lint`.
- [ ] Chạy kịch bản `python .agent/skills/frontend-design/scripts/ux_audit.py .`.
- [ ] Thử submit form với *Thể tích bình* (kèm Number) -> Xác minh lưu đúng.
- [ ] Thử submit form với *Đầu phát* (kèm Text phụ) -> Xác minh lưu đúng.
- [ ] Giao diện tuyệt đối không dùng màu tím (Purple ban).
