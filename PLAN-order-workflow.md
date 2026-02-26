# Kế hoạch Triển khai (Project Plan): Order Workflow

**Mô tả:** Hệ thống quản lý vòng đời đơn hàng (Tạo đơn -> Duyệt qua các cấp -> Vận chuyển -> Đối soát thành công)
**Project Type:** WEB (React / Vite)

## Overview (Tổng quan)
Số hóa và quản lý tập trung 3 quy trình cốt lõi của đơn hàng:
1. Quy trình Tạo đơn hàng (Admin, Sale, Thủ kho, Khách).
2. Quy trình Duyệt đơn hàng (Sale -> Thủ kho -> ĐVVC).
3. Quy trình Vận đơn & Đối soát (Thủ kho -> Người giao hàng -> Khách báo nhận).

## Success Criteria (Tiêu chí thành công)
- Toàn bộ các trạng thái đơn hàng xuyên suốt quy trình được lưu tập trung vào Database.
- Workflow chạy mượt mà đúng quyền hạn: Form cập nhật phân quyền theo Role (Thủ Kho mới xuất kho, Người giao hàng mới update ảnh chèn thực tế phần đối soát,...).
- Dễ dàng thay đổi trạng thái (Drop-down / Hành động nhanh). 
- Các báo cáo / Board danh sách được bổ sung Filter trạng thái rõ ràng.

## Tech Stack
- Frontend: React + Tailwind CSS (Bám sát UI kit đang tồn tại).
- Database: Supabase PostgreSQL (Bổ sung Schema & RLS Policies).

## File Structure (Cấu trúc File Dự Kiến)
- `src/database/sql/schema_orders.sql`: Code bổ sung/tạo mới các trường (ĐVVC, Hình ảnh chứng từ giao hàng thực tế, Trạng thái đầy đủ).
- `src/pages/Orders.jsx`: Bổ sung filter / tabs / data table cho Đơn hàng.
- `src/components/Orders/OrderStatusUpdater.jsx`: Component UI dùng chung để thay đổi "Trạng thái" một cách minh bạch (Dropdown / form chèn ảnh).
- `src/constants/orderConstants.js`: Enum khai báo danh sách trạng thái cứng.

## Task Breakdown

### Task 1: Thiết Kế & Cập Nhật Database (SQL Schema)
**Agent:** `backend-specialist` / `database-architect` | **Skill:** `database-design`
- `[x] INPUT`: Cần mở rộng bảng `orders` (bổ sung cột Ảnh chứng từ từ Giao Vận, Tên ĐVVC, Trường trạng thái chứa workflow từ Chờ Duyệt -> Hoàn Thành).
- `[x] OUTPUT`: Đoạn mã cập nhật Schema an toàn `ALTER TABLE`, hoặc Cập nhật `schema_orders.sql` mới, kèm config Storage cho Ảnh.
- `[x] VERIFY`: Schema chạy không lỗi, bảng `orders` có đủ cột thiết yếu để theo dõi cả 3 hệ thống quy trình của khách.

### Task 2: Cấu Hình Logic Trạng Thái & Phân Quyền UI (Role-based State Machine)
**Agent:** `frontend-specialist` | **Skill:** `frontend-design`
- `[x] INPUT`: Ma trận Roles x Action (Sale Duyệt -> Thủ kho Xuất/Chọn ĐVVC -> ĐVVC Nhận/Giao -> Khách/Sale Đối soát).
- `[x] OUTPUT`: Config trong `orderConstants.js` map Role nào được quyền làm action gì. Cập nhật `CheckAction` để block/allow action.
- `[x] VERIFY`: Role không liên quan không thấy nút chuyển trạng thái nhạy cảm.

### Task 3: Giao Diện Board Đơn Hàng & Thao Tác Chuyển Trạng Thái / Upload Ảnh
**Agent:** `frontend-specialist` | **Skill:** `frontend-design`
- `[x] INPUT`: Trả về giao diện Danh sách đơn hàng, bổ sung Component Cập nhật Vận Đơn (Dropdown Trạng Thái).
- `[x] OUTPUT`: `Orders.jsx` (List & Khung tìm kiếm), Modal "Cập nhật Vận đơn" có input Type = Dropbox cho Trạng Thái, có bổ sung ô chọn/Upload Ảnh.
- `[x] VERIFY`: Modal bật lên nhẹ, upload ảnh được, List table render đúng dòng và Trạng thái tương ứng.

### Task 4: Tích Hợp Flow Nối Tiếp Nhau & Testing
**Agent:** `frontend-specialist` / `backend-specialist` | **Skill:** `webapp-testing`
- `[x] INPUT`: Database Schema đã lên đủ + UI components đã có.
- `[x] OUTPUT`: Submit form đẩy đúng state lên Database và refresh bản ghi.
- `[x] VERIFY`: Đi luồng end-to-end: Role Tạo -> Chờ Duyệt -> Role Sale kiểm -> Role Thủ kho -> Role Giao hàng update ảnh -> Role Sale Update Đối Soát Hoàn Thành.

## ✅ PHASE X: VERIFICATION CHECKLIST
- [x] Chạy `npm run lint` để check lỗi syntax.
- [x] Test Mobile Audit (`.agent/scripts/mobile_audit.py`): Để đảm bảo Upload ảnh trên thiết bị di động của User Giao Vận hiển thị tốt (Nút to / Dropdown chạm mượt).
- [x] Validate Bảo mật: Kế toán / User không có quyền không được phép chuyển trạng thái lung tung.
- [x] Walkthrough Review: Thử bấm qua các role từ Tạo -> Duyệt -> Xem ảnh chèn thực tế đối soát có lên không.
