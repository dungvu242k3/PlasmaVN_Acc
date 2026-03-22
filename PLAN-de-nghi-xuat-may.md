# Project Plan: Giao diện Form Đề Nghị Xuất Máy

## Overview
Xây dựng giao diện form "Giấy Đề Nghị Xuất Máy" (Machine Issue Request) dựa trên mẫu cung cấp. Chức năng cốt lõi:
- Người dùng tự nhập 'Số phiếu' (ô màu cam) và 'Số điện thoại'.
- Tự động điền các thông tin (Tên người đề nghị, Tên khách hàng, Tên cơ sở, Địa chỉ đặt máy) khi nhập xong Số điện thoại.
- Người dùng tích chọn các tùy chọn.
- Sau khi hoàn tất sẽ có nút để in phiếu này ra.

## Project Type
**WEB** (Primary Agent: `frontend-specialist`)

## Success Criteria
1. Giao diện form hiển thị đầy đủ các trường thông tin theo mẫu.
2. Form hỗ trợ in ấn (Print Layout) hiển thị giống y hệt như bản cứng (A4).
3. Logic tự động điền thông tin khách hàng/người đề nghị hoạt động trơn tru sau khi nhập số điện thoại.
4. Có nút "In phiếu" (Print) để in ngay sau khi điền.

## Tech Stack
- **Framework**: React.js / Vite (tương thích với dự án hiện tại)
- **Styling**: Tailwind CSS v4 (tuân thủ color tokens, không dùng colors bị cấm như violet/purple, ưu tiên tone màu brand của dự án)
- **Icons**: `lucide-react`
- **Form Handling**: `react-hook-form` kết hợp với `yup` hoặc `zod` để validation (khuyên dùng theo dự án hiện tại)
- **UI Components**: Tái sử dụng/sử dụng các common UI components trong `src/components/ui/` (như Modals, Inputs) nếu có.

## File Structure
Dự kiến thêm các file sau vào dự án:
```text
src/
└── components/
    └── Machines/
        ├── MachineIssueRequestForm.jsx    # Component chính chứa form
        └── MachineIssueRequestModal.jsx   # (Tùy chọn) Nếu form này hiển thị dạng Modal
└── pages/
    └── CreateMachineIssueRequest.jsx      # Nếu form này là một trang riêng biệt (tương ứng với route đã setup /de-nghi-xuat-may)
```

## Task Breakdown

### Task 1: Khởi tạo Component khung giao diện Form
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`, `clean-code`
- **Priority**: P1
- **Dependencies**: None
- **Chi tiết (INPUT → OUTPUT → VERIFY)**:
  - **INPUT**: Cấu trúc các thẻ bao ngoài form, header, footer, layout grid cơ bản.
  - **OUTPUT**: File `MachineIssueRequestForm.jsx` chứa form layout.
  - **VERIFY**: Header "GIẤY ĐỀ NGHỊ XUẤT MÁY", layout chia 1-2 cột hợp lý hiển thị trên trình duyệt thành công.

### Task 2: Xây dựng Logic Nhập liệu và Tự động điền (Auto-fill)
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`
- **Priority**: P1
- **Dependencies**: Task 1
- **Chi tiết**:
  - **INPUT**: Text input cho 'Số phiếu' (ô màu cam) và 'Số điện thoại'. Logic queries database.
  - **OUTPUT**: Ô nhập liệu hoạt động. Khi nhập xong số điện thoại hợp lệ (onBlur hoặc onChange debounced), hệ thống fetch thông tin Khách hàng tương ứng và điền vào các ô: Họ tên người đề nghị, NV phụ trách (tùy chọn), Tên KH, Tên Cơ sở, Địa chỉ đặt máy (các trường này trạng thái readOnly hoặc disabled).
  - **VERIFY**: Nhập 1 số điện thoại khách hàng có thực trong hệ thống, các trường còn lại nhảy data chính xác. Nhập số không tồn tại sẽ giữ nguyên hoặc cho phép nhập tay.

### Task 3: Xây dựng các khối Checkbox/Radio cho Machine Details & Logistics
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`
- **Priority**: P1
- **Dependencies**: Task 1
- **Chi tiết**:
  - **INPUT**: Checkboxes cho (Loại máy đề xuất, Màu máy TM, Phương thức vận chuyển, Dạng xuất) và Quantity/Date inputs.
  - **OUTPUT**: Giao diện nhóm checkboxes và Date inputs. 
  - **VERIFY**: Click chọn/bỏ chọn checkboxes hoạt động bình thường trên form UI.

### Task 4: Hoàn thiện Preview Form In và Chức Năng In Ấn (Print)
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`
- **Priority**: P2
- **Dependencies**: Task 2, Task 3
- **Chi tiết**:
  - **INPUT**: Giao diện form hoàn chỉnh, Nút "In Phiếu", CSS Media `@media print`.
  - **OUTPUT**: Styling đặc biệt cho bản in (ẩn nút bấm, căn chỉnh layout giống form Word A4 như hình mẫu), đảm bảo in ra đẹp không bị cắt chữ.
  - **VERIFY**: Ấn nút "In Phiếu" mở cửa sổ Print browser, xem trước bản in (Print Preview) ra đúng form Word mẫu được cung cấp. Cấu hình tự ẩn các UI không cần thiết khi in.

---

## ✅ PHASE X: VERIFICATION (Checklist)
- [ ] Lint: Chạy `npm run lint` hoặc tương đương để kiểm tra code không có lỗi.
- [ ] Color Rules: Xác nhận KHÔNG SỬ DỤNG mã màu tím (violet/purple) cho UI thành phần.
- [ ] UX Audit: Các trường Checkbox kích thước chạm (touch target) tối thiểu 44x44px trên mobile.
- [ ] Responsive: Test màn hình điện thoại (mobile width < 600px) layout các input chuyển sang 1 cột.
