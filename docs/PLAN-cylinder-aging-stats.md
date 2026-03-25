# Project Plan: Thống kê ngày tồn bình của khách hàng

## 1. Context and Goals
- **Objective:** Bổ sung tính năng thống kê "Ngày tồn" của bình khí (thời gian thực tế khách hàng đang nắm giữ).
- **Categorization:** Phân nhóm các bình đang bị khách giữ quá hạn thành các mốc: `> 30 ngày`, `> 60 ngày`, `> 90 ngày`.
- **UI Location:** Hiển thị trực quan tại tab **Thống kê** trên Trang chủ (`Dashboard.jsx` / `Home.jsx`).

## 2. Technical Architecture & Data Strategy

### 2.1. Cấu trúc Database (Supabase)
Hiện tại, bảng `cylinders` có trường `expiry_date` (ngày hết hạn kiểm định), nhưng chưa có trường ngày giao cụ thể cho từng khách hàng để làm mốc tính thời gian tồn.
- **Action:** 
  - Bổ sung trường `assigned_to_customer_at` (TIMESTAMPTZ) vào bảng `cylinders`.
  - Dữ liệu này sẽ được tự động cập nhật mỗi khi phiếu xuất kho được duyệt và bình chuyển sang trạng thái "đang sử dụng" hoặc "thuộc khách hàng".
  - Chỉnh sửa `goods_issues` hoặc endpoint xuất kho để đảm bảo ghi nhận ngày này.

### 2.2. SQL Views (Database Layer)
- **Action:** Tạo một View mới trong `schema_report_views.sql` (ví dụ: `view_cylinder_aging_stats`).
- **Logic Tính toán:**
  - `so_ngay_ton = CURRENT_DATE - assigned_to_customer_at`
  - Phân nhóm: 
    - `qua_han_30`: `so_ngay_ton > 30 AND so_ngay_ton <= 60`
    - `qua_han_60`: `so_ngay_ton > 60 AND so_ngay_ton <= 90`
    - `qua_han_90`: `so_ngay_ton > 90`

### 2.3. Data Integration (React Hooks)
- **Action:** Mở rộng file `src/hooks/useReports.js` để thêm hàm `fetchCylinderAgingStats()`. Hàm này sẽ gọi View vừa tạo để trả về số liệu đã được phân nhóm.

### 2.4. UI Implementation (Dashboard.jsx)
- **Action:** 
  - Thêm một section/card thống kê mới vào màn hình Tab "Thống kê" trong `Dashboard.jsx`.
  - Hiển thị UI theo dạng 3 thông số nổi bật (hoặc biểu đồ Bar/Pie Chart) theo các mốc `> 30 ngày`, `> 60 ngày`, `> 90 ngày` với màu sắc cảnh báo tăng dần (Vàng - Cam - Đỏ).

## 3. Task Breakdown & Assignments

| Phase | Task | Details | Assigned Agent |
|-------|------|---------|----------------|
| 1 | DB Schema Updates & Trigger | Thêm `assigned_to_customer_at`. Tạo logic (trigger hoặc CJS) ghi nhận thời gian khi giao bình. | `@backend-specialist` |
| 2 | SQL Views & Hook API | Cập nhật `schema_report_views.sql`, viết View phân nhóm 30/60/90. Thêm hàm vào `useReports.js`. | `@backend-specialist` |
| 3 | Frontend Integration | Gọi API lấy dữ liệu. Design UI thống kê dạng card/chỉ báo tại `Dashboard.jsx`. | `@frontend-specialist` |
| 4 | Test & Verify | Đảm bảo tính nhất quán của số liệu khi bình được trả về (thu hồi) thì ngày đếm bị reset. | `@orchestrator` |

## 4. Verification Checklist
- [ ] Bảng `cylinders` lưu chính xác được ngày thực tế bình được giao cho khách.
- [ ] View báo cáo lấy đúng công thức ngày hiện tại trừ đi ngày giao.
- [ ] Trang Chủ -> Tab Thống kê hiển thị rõ ràng 3 con số: >30 ngày, >60 ngày, >90 ngày.
- [ ] Giao diện Responsive trên thiết bị di động.
- [ ] Xử lý an toàn khi xuất/thu hồi bình (ngày đếm phải reset về null hoặc bị vô hiệu hoá khi bình không còn ở KH).
