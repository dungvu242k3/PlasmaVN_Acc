# Kế Hoạch: Quy Trình Nhập Xuất, Luân Chuyển Từng Bước

## 1. Overview (Tổng Quan)
Dự án nhằm hoàn thiện luồng vận hành (Workflow) thực tế của ngành Khí Công Nghiệp, kết nối liên hoàn 6 bước từ Nhập hàng (Supplier -> Warehouse) đến Xuất tuyến (Warehouse -> Customer) thông qua Đơn Vị Vận Chuyển. 
**Mục đích:** Đảm bảo "nhảy số" tồn kho và công nợ chính xác tại từng điểm chạm (Touchpoint), ngăn chặn xuất lệch/mất vỏ bình nhờ thẻ RFID.

## 2. Project Type
**WEB** (Và có thiết kế UI responsive dạng Mobile Web cho NV Vận Chuyển / NV Kinh Doanh thao tác trên đường).

## 3. Success Criteria (Tiêu Chuẩn Thành Công)
- [ ] Tính năng "Nhập Hàng Từ NCC" (B1) cập nhật tồn kho vỏ/khí ngay khi duyệt phiếu.
- [ ] Luồng duyệt Đơn Hàng có 3 lớp ranh giới rõ ràng: NVKD tạo (B2) ➔ Team KD phân công/duyệt giá (B3) ➔ Kế toán Cty duyệt công nợ (B4).
- [ ] Thủ kho gán được RFID vỏ bình cụ thể (B5) vào Biên Bản Bàn Giao (BBBG).
- [ ] ĐVVC/NV Giao hàng (B6) thao tác nhận đơn, giao thành công và thu hồi vỏ rỗng tự động gạch nợ.

## 4. Tech Stack
- Frontend: React + Tailwind CSS, `lucide-react` cho icons.
- Database/Backend: Bảng Supabase tương ứng (Orders, Goods Receipts, Cylinders, Shippers).
- Các modal dạng trượt dưới lên (BottomSheet) cho Mobile view để NVKD/NV giao hàng dễ bấm.

## 5. File Structure (Dự Đoán)
```text
src/
├── components/
│   ├── Orders/
│   │   ├── OrderApprovalFlow.jsx (Component quản lý trạng thái duyệt)
│   │   └── CylinderAssignmentModal.jsx (Gán mã RFID tại Kho)
│   ├── GoodsReceipts/
│   │   ├── ReceiptFormModal.jsx
│   │   └── ReceiptDetailModal.jsx
│   └── Delivery/
│       └── DeliveryNoteModal.jsx (BBBG cho ĐVVC)
├── pages/
│   ├── GoodsReceipts.jsx
│   └── DeliveryTasks.jsx (Trang công việc cho Shipper)
└── 
```

## 6. Task Breakdown

### TS-B1: Nhập Kho Công Ty (Goods Receipt)
- **Agent**: `backend-specialist` + `frontend-specialist`
- **Skills**: `database-design`, `app-builder`
- **INPUT**: Chọn NCC, Chọn Kho, Danh mục hàng hóa (vỏ mới hoặc sạc khí).
- **OUTPUT**: Lưu Database bảng `goods_receipts` và tự động + điểm tồn kho cho kho đã chọn.
- **VERIFY**: Tạo phiếu nhập > Duyệt > Kiểm tra trang Danh sách Kho xem số lượng có tăng đúng không.

### TS-B2: Tạo Order (NVKD)
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`, `mobile-design`
- **INPUT**: Cải tiến form tạo đơn hàng (đã có), thêm cờ nhận diện nguồn tạo từ Mobile.
- **OUTPUT**: Đơn hàng lưu DB với trạng thái `Chờ KD Duyệt`.
- **VERIFY**: Tạo xong, đơn nằm ở tab "Chờ Duyệt" của Team Lead KD.

### TS-B3-B4: Luồng Duyệt Kép (KD & Kế Toán)
- **Agent**: `backend-specialist`
- **Skills**: `api-patterns`
- **INPUT**: Đơn từ (B2), Role của user hiện tại.
- **OUTPUT**: Nút "Duyệt đơn" thay đổi state theo cấp bậc.
  - Team Lead KD click ➔ State = `Chờ Cty Duyệt`.
  - Admin/Kế toán click ➔ State = `Kho Đang Xử Lý`.
- **VERIFY**: Login bằng 2 roles khác nhau, verify logic duyệt tuần tự. Kế toán không được duyệt nếu KD chưa duyệt.

### TS-B5: Gán Mã Bình (Thủ Kho)
- **Agent**: `frontend-specialist`
- **Skills**: `mobile-design` (dùng súng quét barcode/RFID)
- **INPUT**: Lệnh xuất từ Kế toán (B4). Quét danh sách RFID vỏ bình sẽ xuất.
- **OUTPUT**: Liên kết vỏ bình cụ thể vào Order. Trạng thái Đơn hàng ➔ `Sẵn Sàng Giao`. Trạng thái Bình ➔ `Đang Vận Chuyển`.
- **VERIFY**: Kiểm tra danh sách Bình, các bình quét đã đổi vị trí thành Đang vận chuyển (chưa sang nợ Khách).

### TS-B6: Vận Chuyển & Biên Bản Bàn Giao (BBBG)
- **Agent**: `mobile-developer`
- **Skills**: `mobile-design`, `plan-writing`
- **INPUT**: Màn hình dành riêng cho Shipper/ĐVVC có danh sách đơn Sẵn Sàng Giao. Nút "Đã giao & Nhận vỏ về".
- **OUTPUT**: Hoàn thành đơn hàng. Trạng thái Đơn ➔ `Đã Hoàn Thành`. Trạng thái Bình xuất ➔ `Đang Ở Khách`. Trạng thái Bình thu hồi ➔ `Tại Kho` (gạch nợ).
- **VERIFY**: Bấm "Giao Thành Công", tồn kho Khách hàng tăng nợ số vỏ mới, trừ nợ số vỏ thu hồi.

## Phase X: Verification (Bắt buộc chạy trước khi kết thúc)
- [ ] `npm run lint` pass.
- [ ] Chạy luồng giả lập nội bộ từ Tạo Phiếu Nhập -> Giao Thành Công không lỗi console.
- [ ] Kiểm tra các con số tồn kho (Nhảy số) ở Dashboard và Danh sách khách hàng phải khớp.
