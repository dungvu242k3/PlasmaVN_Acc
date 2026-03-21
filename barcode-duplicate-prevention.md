# Cảnh Báo Quét Mã Vỏ Bình Đơn Hàng

## Goal
Ngăn chặn các lỗi thao tác khi kho/shipper dùng máy quét hoặc nhập mã vỏ bình bằng cách báo lỗi trực tiếp:
1. Trùng mã RFID (Mã đã có trong danh sách TextBox).
2. Trạng thái vỏ bình không hợp lệ (Không phải là "sẵn sàng").

## Project Type
WEB

## Success Criteria
- Khi quét một mã đã có trong danh sách, hệ thống tự động lọc bỏ và báo lỗi (VD: "Mã ABCD đã được quét!").
- Khi quét một mã mới, hệ thống truy vấn Supabase (`cylinders` table) để xem `status` có phải mang giá trị "sẵn sàng" hay không. Nếu không, lập tức gạch bỏ chữ mới quét và cảnh báo lỗi (VD: "Mã ABCD hiện đang ở trạng thái CÓ LỖI/ĐANG SỬ DỤNG, không thể xuất kho!").

## Tech Stack
React, Supabase (Tối ưu performance: debounce onChange hoặc xử lý ngắt theo phím `Enter` từ máy quét).

## File Structure
- `src/components/Orders/OrderStatusUpdater.jsx`: Nơi chứa 2 khối quét `<textarea>`.

## Task Breakdown
- [ ] Task 1: Định nghĩa kỹ thuật lắng nghe mã quét mới.
      - **Agent:** `frontend-specialist`, **Skill:** `clean-code`
      - **INPUT:** Chuyển đổi event `onChange` sang phân tích dòng mã mới nhất vừa được thêm vào (dựa trên dấu `\n` mà máy quét tự động sinh).
      - **OUTPUT:** Lấy ra được chuỗi `latestScannedSerial` thay vì phân tích lại từ đầu.
      - **VERIFY:** Console log đúng mã vừa bắn từ máy quét.

- [ ] Task 2: Validate trùng lặp mã trên UI.
      - **Agent:** `frontend-specialist`, **Skill:** `clean-code`
      - **INPUT:** Mảng các mã đã bắn trước đó.
      - **OUTPUT:** Kiểm tra nếu `latestScannedSerial` nằm trong danh sách cũ thì báo lỗi "Mã đã quét", giữ nguyên danh sách cũ.
      - **VERIFY:** Dùng máy bắn RFID 2 lần cùng một mã, báo lỗi, Textarea giữ nguyên dạng 1 dòng.

- [ ] Task 3: Validate API trạng thái "sẵn sàng".
      - **Agent:** `frontend-specialist`, **Skill:** `clean-code`
      - **INPUT:** `latestScannedSerial` hợp lệ không bị trùng.
      - **OUTPUT:** Gọi Supabase tra cứu `cylinders(serial_number, status)` với `serial_number = latestScannedSerial`. Nếu `status !== 'sẵn sàng'`, báo lỗi đỏ, loại bỏ nó khỏi textarea. Nếu là "sẵn sàng", thêm vào textarea.
      - **VERIFY:** Dùng mã đang "đang sử dụng", máy báo lỗi. Dùng mã "sẵn sàng", lên dòng mới bình thường.

## Phase X: Verification
- [x] **Lint Check:** Chạy `python .agent/scripts/checklist.py .` để đảm bảo code format/lint tốt.
- [x] **Manual Testing:** Bật ứng dụng `npm run dev`, mở thao tác đơn hàng, dùng súng bắn mã hoặc copy paste 2 mã giống nhau vào ô quét vỏ bình. Xác thực xem lỗi hiển thị đúng không và text box có tự động bỏ qua mã thứ 2 hay không.

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-03-22
