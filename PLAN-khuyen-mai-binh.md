# Bảng kế hoạch: Tính năng Khuyến mãi bình (Promotions)

## 1. Overview (Tổng quan)
- **Mục tiêu:** Cho phép kế toán tạo và áp dụng các Mã Khuyến mãi (Coupon) để khấu trừ số lượng bình cho Khách hàng hoặc Đại lý khi tạo đơn hàng.
- **Project Type:** WEB (React, Supabase, Tailwind CSS).

## 2. Success Criteria (Tiêu chí thành công)
- [ ] Kế toán có một giao diện để Quản lý (Thêm/Sửa/Xóa) danh sách Mã Khuyến Mãi.
- [ ] Mã Khuyến mãi khi áp dụng vào Đơn hàng sẽ tự động:
  - Kiểm tra xem khách hàng có đúng loại không (vd: chỉ áp dụng cho loại `TM`).
  - Kiểm tra xem Mã còn Hạn sử dụng không.
- [ ] Số lượng bình khuyến mãi (khấu trừ) được lưu vào Đơn hàng và hiển thị trên giao diện Đơn hàng / Báo cáo.

## 3. Tech Stack & Database
- **Frontend:** React (JSX), Tailwind CSS, Lucide Icons.
- **Backend/DB:** Supabase (PostgreSQL).

### Đề xuất Cấu trúc Bảng Database (`app_promotions`)
| Column Name | Type | Rationale / Constraints |
| :--- | :--- | :--- |
| `id` | UUID | Khóa chính |
| `code` | VARCHAR | Mã nhận diện (VD: KM02), UNIQUE. |
| `free_cylinders`| INTEGER | Số lượng bình khuyến mãi/khấu trừ. |
| `start_date` | DATE | Ngày bắt đầu hiệu lực. |
| `end_date` | DATE | Ngày hết hạn hiệu lực. |
| `customer_type` | VARCHAR | Loại khách hàng áp dụng (VD: 'TM'). |
| `is_active` | BOOLEAN | (Trạng thái) Kích hoạt/Vô hiệu hóa nhanh. |

*(Bên bảng `orders` sẽ cần thêm một cột phụ như `promotion_code` và `free_cylinders_applied` để lưu lại thời điểm chốt đơn).*

## 4. Task Breakdown (Chi tiết công việc)

### Phase 1: Database Setup & Infrastructure
- [ ] **Task 1.1:** Viết file SQL script `schema_promotions.sql` tạo bảng `app_promotions`. Thêm RLS Policy cho Admin/Kế toán.
  - *Agent:* `backend-specialist`
  - *Input:* Schema đề xuất ở trên.
  - *Output:* File SQL chạy thành công trên Supabase.
- [ ] **Task 1.2:** Bổ sung cột ghi nhận KM vào bảng `orders` (nếu cần thiết cho phần thống kê).

### Phase 2: Giao diện Quản lý Danh mục (Dashboard/Admin)
- [ ] **Task 2.1:** Tạo Component `Promotions.jsx` (List View).
  - *Agent:* `frontend-specialist`
  - *Feature:* Hiển thị danh sách KM, Lọc theo Trạng thái (Còn hạn/Hết hạn), Nút "Tạo mới".
- [ ] **Task 2.2:** Tạo Modal `CreatePromotionModal.jsx` (hoặc form) để thêm mới/sửa Mã KM (gồm Tên, Số vỏ, Hạn dùng, Loại KH).
  - *Agent:* `frontend-specialist`
  - *Feature:* Validate form đầu vào (Ngày hết hạn > Ngày bắt đầu).

### Phase 3: Tích hợp vào Luồng Đặt hàng
- [ ] **Task 3.1:** Cập nhật màn hình `Tạo Đơn Hàng`.
  - *Agent:* `frontend-specialist`
  - *Feature:* Bổ sung ô nhập/chọn "Mã Khuyến mãi".
- [ ] **Task 3.2:** Logic kiểm tra (Validation) mã KM khi áp dụng.
  - *Feature:* Kiểm tra khớp `customer_type` không? Ngày hiện tại có nằm trong khoảng `[start_date, end_date]` không? Ném lỗi nếu sai.

## 5. Phase X: Verification (Nghiệm thu)
- [ ] **Lint and Type Check:** `npm run lint` pass.
- [ ] Luồng test: Tạo thành công Mã `KM02` → Hạn tuần sau → Cho khách `TM`. Lên thử 1 đơn hàng khách `TM`, áp mã `KM02` thấy hiện chữ "Khuyến mãi: 2 bình".
