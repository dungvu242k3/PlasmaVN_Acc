# Plan: Tạo ô placeholders Thêm Nhà cung cấp và Thêm mới ĐVVC

## MỤC TIÊU
Thêm 2 ô (cards) mới vào giao diện lưới (grid) tại trang chủ (`Home.jsx`) phục vụ cho các module "Thêm nhà cung cấp" và "Thêm đơn vị vận chuyển", hiện tại chỉ để làm placeholder chưa cần chức năng.

## LOẠI DỰ ÁN
**WEB** (React ứng dụng Vite/TailwindCSS) - Sử dụng agent `frontend-specialist`.

## RÀNG BUỘC KIẾN TRÚC & GIAO DIỆN (Từ `frontend-design`)
1. **Topological Design:** 
   - Đảm bảo duy trì hoặc làm nổi bật ngôn ngữ thiết kế (Rounded cards, hover effects theo card hiện có).
   - Card mới sẽ sử dụng các màu gradient/shadow mượt mà, nhưng thuộc nhóm màu phù hợp chức năng.
2. **Color Psychology:** 
   - *Thêm Nhà cung cấp:* Hành động tạo mới đối tác -> Chọn màu **Teal/Cyan** (Sự tươi mới, kết nối).
   - *Thêm ĐVVC:* Hành động tạo mới, vận tải -> Chọn màu **Rose/Orange** (Năng động, dịch chuyển).
   - 🚫 TUYỆT ĐỐI KHÔNG DÙNG MÀU TÍM/PURPLE (Purple Ban).
3. **Animations:**
   - Kế thừa animation hover hiện tại (`hover:-translate-y-2`, `group-hover:rotate-6`).

## KẾ HOẠCH CÁC BƯỚC (TASKS)

### Task 1: Cập nhật Icon và Dữ liệu `DASHBOARD_FEATURES` trong `Home.jsx`
- **Tác nhân:** `frontend-specialist`
- **Kỹ năng:** `frontend-design`, `clean-code`
- **Chi tiết Output:**
  1. Import thêm các Icon từ `lucide-react`: `Building` hoặc `PlusSquare` (cho Thêm Nhà cung cấp) và `Truck` hoặc `PlusCircle` (cho Thêm ĐVVC - hiện đã có import `Truck` và `Plus`, có thể dùng lại hoặc import thêm icon phù hợp).
  2. Thêm 2 object mới vào mảng `DASHBOARD_FEATURES` trong `src/pages/Home.jsx`.
    - Object 1: Thêm Nhà cung cấp (`id: "add-supplier", color: "teal", icon: Building / PlusSquare`).
    - Object 2: Thêm ĐVVC mới (`id: "add-shipper-card", ...` khác id trong danh sách, `color: "rose"`, đã có ở dòng 163 nhưng chỉ cần đảm bảo render đúng). *Lưu ý: "Thêm ĐVVC mới" đã nằm trong hệ thống ở dòng 163, tuy nhiên user đề cập lại, cần bật hoặc cập nhật nội dung cho phù hợp.*
  3. Kiểm tra xem "Thêm nhà cung cấp" / "Nhà cung cấp" đã có trong `SIDEBAR_ITEMS` hay chưa, nếu chưa, thêm vào sidebar.
- **Tiêu chí Kiểm tra (Verify):**
  - Mảng `DASHBOARD_FEATURES` có tăng số lượng phần tử.
  - Sidebar cập nhật mục "Thêm nhà cung cấp".

### Phase X: Xác nhận hoàn thành
- [ ] Render UI thành công không lỗi React.
- [ ] Không có mã màu Tím/Violet (kiểm tra các property `color`).
- [ ] Chạy linter `npm run lint` để đảm bảo code sạch.
- [ ] Layout grid không bị vỡ trên các thiết bị.

---
## Yêu cầu xem xét
Vui lòng xem qua kế hoạch này, tôi sẽ tiến hành thêm vào file `Home.jsx` ngay khi bạn đồng ý!
