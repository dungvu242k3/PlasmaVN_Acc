# Project Plan: Refactor Phiếu Đề Nghị Xuất Máy

## 1. Context and Goals
- **Objective:** Thay đổi giao diện nhập liệu của "Giấy Đề Nghị Xuất Máy" (`MachineIssueRequestForm.jsx`) từ dạng "điền chữ lên mặt giấy" sang dạng Form nhập liệu tiêu chuẩn (Data Entry Form). 
- **Motivation:** Giao diện tờ giấy A4 cũ gây khó khăn khi thao tác trên điện thoại di động (chữ bị lệch, khó căn lề, bị che khuất).
- **Core Requirement:** 
  - Chỉ hiển thị form nhập liệu trên màn hình trình duyệt (chuẩn lưới Tailwind).
  - Khi nhấn "In", trình duyệt chỉ xuất bản mẫu giấy A4 truyền thống (ẩn form nhập liệu đi).
  - Tuân thủ phương châm "Chốt cơ bản": Không cần tạo bảng database mới, giữ nguyên tính năng tự động tìm Khách hàng qua SĐT.

## 2. Technical Architecture & Component Strategy

### 2.1. Tách biệt hai lớp giao diện (View Separation)
Sửa file `MachineIssueRequestForm.jsx` theo kiến trúc "Screen View" vs "Print View":
- `<div className="print:hidden">`: Hiển thị form chuẩn nhập liệu (Grid layout). Box input to, rõ ràng, tối ưu chạm trên mobile. Bố trí các checkbox (dạng xuất, dạng xe vận chuyển, loại màu, loại máy) thành các thẻ radio/checkbox dễ bấm.
- `<div className="hidden print:block">`: Hiển thị lại y xì đúc bản in A4 cũ (như hiện trạng). Các thẻ `<input>` trên bản in cũ được chuyển thành thẻ `<span>` thuần để tránh lỗi layout khi xuất PDF.

### 2.2. Chi tiết Form Nhập liệu (Mobile-first UI)
- **Thông tin chung:** Họ tên người đề nghị, NV phụ trách máy.
- **Khách hàng:** Tên KH, Cơ sở, Địa chỉ, Số điện thoại (vẫn giữ logic `<input type="tel">` gọi API tự động điền các trường còn lại).
- **Phân loại xuất:** Loại máy (Checkbox group), Màu máy (Checkbox group).
- **Thông số:** Số lượng (Number input), Mã máy.
- **Lịch trình:** Ngày cần máy, Ngày giao, Ngày thu hồi (Date input / text).
- **Logistics:** Phương thức vận chuyển, Dạng xuất (Checkbox/Radio).
- **Ghi chú:** Textarea tiêu chuẩn.
- **Nút bấm:** Một nút duy nhất "Xem trước & In" (gọi `window.print()`).

### 2.3. Logic state (React Hooks)
- Toàn bộ state `formData` hiện tại vẫn giữ nguyên cấu trúc object.
- Chỉ đơn giản là map (ràng buộc) từ Form Nhập mới xuống view In ẩn bên dưới.

## 3. Task Breakdown & Assignments

| Phase | Task | Details | Assigned Agent |
|-------|------|---------|----------------|
| 1 | Backup & Refactor Structure | Wrap toàn bộ HTML cũ vào `div.hidden.print:block`. Biến các `input` cũ trong view print thành hiển thị text thẳng (`{formData.xxx}`). | `@frontend-specialist` |
| 2 | Code Mobile Form | Xây dựng phần `<form className="print:hidden">` dùng Tailwind Card, Grid Layout (1 cột mobile, 2/3 cột PC). Bind state vào. | `@frontend-specialist` |
| 3 | Print Optimization | Chỉnh lại CSS CSS media `@media print` đảm bảo không bị tràn chữ khi đổi layout. | `@frontend-specialist` |

## 4. Verification Checklist
- [ ] Giao diện Web hiển thị dưới dạng Form điện tủ chuẩn (Card, Label trọn vẹn), cực kỳ dễ điền trên điện thoại.
- [ ] Bản in giấy (Ctrl + P) cho ra kết quả giấy A4 hệt như mẫu cũ.
- [ ] Khả năng Auto-Fill thông tin Khách hàng qua SĐT vẫn hoạt động nhanh nhạy.
- [ ] Các loại Checkbox (Màu máy, Loại máy, Dạng xuất) trên bản in hiện chữ "v" / đánh dấu "X" chuẩn xác theo Form.
