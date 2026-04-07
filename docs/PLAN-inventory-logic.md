# PLAN: Phân tích & Hoàn thiện Logic Tồn Kho (Inventory)

## 📋 Tổng quan vấn đề

Bạn muốn đảm bảo: **khi lên đơn (xuất hàng) → trừ tồn kho**, **khi thu hồi về → cộng tồn kho**. Sau khi khảo sát toàn bộ codebase, đây là kết quả.

---

## ✅ Những gì ĐÃ CÓ logic tồn kho

### 1. Xuất đơn hàng → TRỪ tồn kho ✅ (BÌNH + MÁY + VẬT TƯ)

**File:** `src/components/Orders/OrderStatusUpdater.jsx` (dòng 147–217)

Khi đơn hàng chuyển từ `KHO_XU_LY` → `CHO_GIAO_HANG` hoặc `DA_DUYET`:
- Duyệt qua từng `order_items` (hỗ trợ multi-product)
- Kiểm tra tồn kho trong bảng `inventory` theo `warehouse_id` + `item_name`
- **Nếu tồn kho không đủ → báo lỗi, không cho xuất**
- Trừ `quantity` trong bảng `inventory`
- Ghi log `inventory_transactions` với `transaction_type = 'OUT'`
- Với bình (BINH): yêu cầu quét mã serial RFID trước khi xuất, chuyển trạng thái bình sang "đang vận chuyển"

> **Nhận xét:** Logic này đang hoạt động tốt cho tất cả loại sản phẩm (Bình 4L, 8L, Máy BV, TM, FM, ROSY...).

---

### 2. Thu hồi MÁY → CỘNG tồn kho ✅

**File:** `src/components/MachineRecovery/MachineRecoveryFormModal.jsx` (dòng 471–526)

Chỉ khi phiếu thu hồi mới tạo (`!isEdit`) VÀ status = `HOAN_THANH`:
- Update `machines.status = 'sẵn sàng'`, xóa `customer_name` (trả máy về kho)
- Trừ `customers.current_machines`
- Tìm/tạo record trong bảng `inventory` với `item_type = 'MAY'`, `item_name = 'Máy thu hồi'`
- Cộng `quantity` vào inventory
- Ghi log `inventory_transactions` với `transaction_type = 'IN'`

---

### 3. Thu hồi VỎ BÌNH → CỘNG tồn kho ✅

**File:** `src/components/CylinderRecovery/CylinderRecoveryFormModal.jsx` (dòng 528–581)

Chỉ khi status = `HOAN_THANH` (hoàn thành phiếu thu hồi):
- Update `cylinders.status = 'sẵn sàng'`, xóa `customer_name`
- Trừ `customers.borrowed_cylinders`
- Tìm/tạo record trong bảng `inventory` với `item_type = 'BINH'`, `item_name = 'Vỏ bình thu hồi'`
- Cộng `quantity` vào inventory
- Ghi log `inventory_transactions` với `transaction_type = 'IN'`

---

### 4. Nhập kho (Phiếu nhập GoodsReceipts) → CỘNG tồn kho ✅

**File:** `src/pages/GoodsReceipts.jsx` (dòng 516–638)

Khi duyệt phiếu nhập (`handleApproveReceipt`):
- Kiểm tra sức chứa kho (capacity check)
- Upsert bảng `inventory` (tìm theo `warehouse_id + item_type + item_name`)
- Cộng `quantity`
- Ghi log `inventory_transactions` với `transaction_type = 'IN'`

---

### 5. Chuyển kho (InventoryTransfer) → TRỪ kho gốc, CỘNG kho đích ✅

**File:** `src/pages/InventoryTransfer.jsx` (dòng 444–534)

- Trừ kho nguồn (`OUT`)
- Cộng kho đích (`IN`)
- Ghi 2 dòng `inventory_transactions`

---

## ⚠️ Các LỖ HỔNG & VẤN ĐỀ CẦN XỬ LÝ

### ❌ Lỗ hổng 1: Thu hồi máy khi CẬP NHẬT phiếu (isEdit) → KHÔNG cộng tồn kho

**File:** `MachineRecoveryFormModal.jsx` dòng 472

```js
if (!isEdit && dbPayload.status === 'HOAN_THANH') {
```

Logic chỉ chạy khi `!isEdit` (tạo mới phiếu). Nếu bạn **tạo phiếu nháp trước** rồi **edit lại thành HOAN_THANH**, tồn kho sẽ **KHÔNG được cộng**!

> **Mức độ:** 🔴 **NGHIÊM TRỌNG** - Dữ liệu tồn kho sai

**Giải pháp:** Kiểm tra thêm điều kiện: nếu đang edit VÀ status cũ ≠ HOAN_THANH VÀ status mới = HOAN_THANH → cũng phải chạy logic cộng inventory.

---

### ❌ Lỗ hổng 2: Thu hồi vỏ bình khi CẬP NHẬT → CÓ cộng tồn kho nhưng CÓ THỂ cộng lại nhiều lần

**File:** `CylinderRecoveryFormModal.jsx` dòng 529

```js
if (isCompleting) {
```

Logic chạy khi status = `HOAN_THANH` bất kể edit bao nhiêu lần. Nếu edit phiếu đã hoàn thành rồi save lại → **tồn kho cộng lần 2**!

> **Mức độ:** 🔴 **NGHIÊM TRỌNG** - Dữ liệu tồn kho bị "phình"

**Giải pháp:** Thêm check: chỉ cộng inventory nếu `status cũ (recovery.status) ≠ HOAN_THANH`.

---

### ❌ Lỗ hổng 3: Phiếu xuất kho (GoodsIssues) → KHÔNG trừ tồn kho

**File:** `src/pages/GoodsIssues.jsx` + `src/pages/CreateGoodsIssue.jsx`

Sau khi search toàn bộ 2 file này, **không tìm thấy bất kỳ logic nào** truy cập bảng `inventory` hoặc `inventory_transactions`. 

> **Mức độ:** 🟡 **TRUNG BÌNH** - Nếu xuất kho qua phiếu xuất này mà không qua đơn hàng → tồn kho không bị trừ.

**Giải pháp:** Thêm logic trừ inventory khi duyệt phiếu xuất kho (tương tự GoodsReceipts nhưng ngược lại, `transaction_type = 'OUT'`).

---

### ❌ Lỗ hổng 4: Tên item_name không nhất quán giữa xuất và thu hồi

Khi **xuất kho** (OrderStatusUpdater): dùng label sản phẩm từ `PRODUCT_TYPES` (vd: `"Bình 4L"`, `"Máy y tế BV"`)

Khi **thu hồi máy** (MachineRecoveryFormModal): dùng hardcoded `"Máy thu hồi"` 

Khi **thu hồi bình** (CylinderRecoveryFormModal): dùng hardcoded `"Vỏ bình thu hồi"`

→ Xuất "Máy y tế BV" nhưng thu hồi đổi thành "Máy thu hồi" → **2 dòng khác nhau trong bảng inventory**, không tự trừ nhau!

> **Mức độ:** 🟡 **TRUNG BÌNH** - Báo cáo tồn kho bị confusing nhưng tổng vẫn hợp lý nếu xem tổng.

**Giải pháp:** Thống nhất `item_name` giữa xuất và nhập. Hoặc thu hồi cũng dùng đúng tên sản phẩm gốc thay vì "Máy thu hồi".

---

### ❌ Lỗ hổng 5: Hủy đơn hàng → KHÔNG hoàn tồn kho

Khi đơn chuyển sang `HUY_DON`, **không có logic** hoàn trả lại `quantity` cho inventory hay chuyển trạng thái bình/máy về "sẵn sàng".

> **Mức độ:** 🟠 **CAO** - Đơn bị hủy sau khi xuất kho → mất hàng trong hệ thống

**Giải pháp:** Thêm logic khi hủy đơn:
1. Nếu đơn đã qua bước `KHO_XU_LY` (đã trừ kho rồi) → hoàn trả inventory
2. Nếu đã gán bình (assigned_cylinders) → chuyển trạng thái bình về "sẵn sàng"

---

## 📊 Bảng tóm tắt

| Hành động | Loại hàng | Logic tồn kho | Trạng thái |
|-----------|-----------|----------------|------------|
| Xuất đơn hàng (KHO_XU_LY → CHO_GIAO) | Bình + Máy + VT | TRỪ inventory + log OUT | ✅ Có |
| Thu hồi máy (tạo mới + HOAN_THANH) | Máy | CỘNG inventory + log IN | ✅ Có |
| Thu hồi máy (edit → HOAN_THANH) | Máy | ❌ KHÔNG cộng | ❌ **Thiếu** |
| Thu hồi vỏ bình (HOAN_THANH) | Bình | CỘNG inventory + log IN | ⚠️ Có nhưng có thể cộng 2 lần khi edit |
| Nhập kho (duyệt phiếu nhập) | Tất cả | CỘNG inventory + log IN | ✅ Có |
| Xuất kho (phiếu xuất GoodsIssue) | Tất cả | ❌ KHÔNG trừ | ❌ **Thiếu** |
| Chuyển kho | Tất cả | TRỪ/CỘNG + log | ✅ Có |
| Hủy đơn hàng | Tất cả | ❌ KHÔNG hoàn trả | ❌ **Thiếu** |
| Đề nghị xuất máy (MachineRequests) | Máy | Chưa có logic riêng | ⚡ N/A (dùng flow order) |

---

## 🎯 Đề xuất ưu tiên sửa

| # | Vấn đề | Ưu tiên | Phức tạp |
|---|--------|---------|----------|
| 1 | Fix thu hồi máy khi edit → HOAN_THANH | 🔴 P0 | Thấp |
| 2 | Fix thu hồi bình không cộng double khi re-edit | 🔴 P0 | Thấp |
| 3 | Thêm logic hoàn trả kho khi hủy đơn | 🟠 P1 | Trung bình |
| 4 | Thêm logic trừ kho cho GoodsIssues | 🟡 P2 | Trung bình |
| 5 | Thống nhất item_name giữa xuất/thu hồi | 🟡 P2 | Thấp |

---

## ❓ Câu hỏi cần xác nhận

1. **GoodsIssues (Phiếu xuất kho)**: Hiện tại module này có đang được sử dụng không? Hay chỉ xuất qua flow đơn hàng?
2. **Hủy đơn**: Khi hủy đơn đã xuất kho, bạn muốn tự động hoàn trả inventory hay cần thao tác tay?
3. **Tên sản phẩm**: Bạn muốn thu hồi dùng tên riêng ("Máy thu hồi") hay giữ đúng tên gốc ("Máy y tế BV")?
4. **Bạn muốn tôi tiến hành fix các lỗ hổng trên không?** Nếu có, tôi sẽ bắt đầu từ P0 (fix #1, #2).
