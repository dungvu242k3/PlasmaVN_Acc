# PLAN: Nhập Hàng Từ Nhà Cung Cấp Vào Kho

## Mục tiêu
Xây dựng tính năng **Nhập hàng vào kho** (B1) — bước đầu tiên trong quy trình kinh doanh, hoàn thiện toàn bộ chuỗi:

```mermaid
flowchart LR
    B1["B1: Nhập hàng\nvào kho"] --> B2["B2: NVKD\ntạo order"] --> B3["B3: Team KD\nduyệt đơn"] --> B4["B4: Cty\nduyệt"] --> B5["B5: Kho duyệt\ngán mã bình"] --> B6["B6: Vận chuyển\ntheo BBBG"]
    style B1 fill:#ef4444,color:#fff,stroke:none
```

> **B1 hiện chưa có trên hệ thống.** B2-B6 đã có cơ bản (Orders, Shippers).

---

## Phân Tích Hiện Trạng

| Có sẵn | Chưa có |
|--------|---------|
| Bảng `suppliers` (tên, SĐT, địa chỉ) | Phiếu nhập kho (`goods_receipts`) |
| Bảng `warehouses` (4 kho: HN, HCM, TH, DN) | Chi tiết phiếu nhập (`goods_receipt_items`) |
| Bảng `cylinders` + `machines` | Trang tạo phiếu nhập (`CreateGoodsReceipt`) |
| Constants: `WAREHOUSES`, `SUPPLIER_STATUSES` | Trang danh sách phiếu nhập (`GoodsReceipts`) |
| | Constants nhập hàng (`goodsReceiptConstants.js`) |
| | Routes + Menu trên Home |

---

## Thiết Kế

### DB Schema: `goods_receipts` (Phiếu nhập kho)

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID PK | ID tự sinh |
| `receipt_code` | VARCHAR(20) UNIQUE | Mã phiếu (PN00001) |
| `supplier_id` | UUID FK → suppliers | Nhà cung cấp |
| `warehouse_id` | VARCHAR(50) | Kho nhận (HN, TP.HCM, TH, DN) |
| `receipt_date` | DATE | Ngày nhập |
| `status` | VARCHAR(50) | Trạng thái (CHO_DUYET → DA_NHAP → HOAN_THANH) |
| `note` | TEXT | Ghi chú |
| `received_by` | VARCHAR(255) | Người nhận hàng |
| `approved_by` | VARCHAR(255) | Người duyệt |
| `total_items` | INTEGER | Tổng số mặt hàng |
| `created_at` / `updated_at` | TIMESTAMP | Thời gian |

### DB Schema: `goods_receipt_items` (Chi tiết phiếu nhập)

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UUID PK | ID tự sinh |
| `receipt_id` | UUID FK → goods_receipts | Phiếu nhập |
| `item_type` | VARCHAR(50) | Loại: MÁY / BÌNH / VẬT TƯ |
| `item_name` | VARCHAR(255) | Tên hàng hóa |
| `serial_number` | VARCHAR(100) | Mã serial (nếu có) |
| `quantity` | INTEGER | Số lượng |
| `unit` | VARCHAR(50) | Đơn vị (cái, bình, bộ) |
| `note` | TEXT | Ghi chú |

### Trạng thái phiếu nhập

```
CHO_DUYET → DA_NHAP → HOAN_THANH
                ↘ HUY
```

---

## Files Cần Tạo/Sửa

### Tạo mới (5 files)

| # | File | Mô tả |
|---|------|-------|
| 1 | `schema_goods_receipts.sql` | Schema DB |
| 2 | `goodsReceiptConstants.js` | Constants (statuses, item types, units) |
| 3 | `CreateGoodsReceipt.jsx` | Form tạo phiếu nhập (chọn NCC, kho, thêm items) |
| 4 | `GoodsReceipts.jsx` | Danh sách phiếu nhập (filter theo kho, NCC, trạng thái) |
| 5 | Cập nhật `App.jsx` | Routes mới |

### Sửa (2 files)

| # | File | Thay đổi |
|---|------|----------|
| 6 | `Home.jsx` | Thêm module "Nhập hàng" vào sidebar + dashboard |
| 7 | `App.jsx` | Thêm import + routes cho 2 trang mới |

---

## UI: Form Tạo Phiếu Nhập (`CreateGoodsReceipt`)

### Section 1: Thông tin phiếu nhập
- Mã phiếu (tự sinh: PN00001)
- Nhà cung cấp (dropdown từ bảng `suppliers`)
- Kho nhận hàng (dropdown: HN, HCM, TH, DN)
- Ngày nhập (date picker)
- Người nhận hàng (text)

### Section 2: Danh sách hàng hóa nhập
- Bảng động (thêm/xóa dòng):
  - Loại (Máy / Bình / Vật tư)
  - Tên hàng hóa
  - Serial/Mã (nếu có)
  - Số lượng
  - Đơn vị
  - Ghi chú

### Section 3: Ghi chú chung + Nút lưu

---

## UI: Danh Sách Phiếu Nhập (`GoodsReceipts`)

- Bảng: Mã phiếu | NCC | Kho | Ngày nhập | Số mặt hàng | Trạng thái | Thao tác
- Filter: Theo kho, theo NCC, theo trạng thái, theo ngày
- Nút: Tạo phiếu mới

---

## Thứ Tự Thực Hiện

| Bước | Công việc | Ước tính |
|------|-----------|----------|
| 1 | Schema SQL + Constants | 5 phút |
| 2 | `CreateGoodsReceipt.jsx` (form + logic) | 15 phút |
| 3 | `GoodsReceipts.jsx` (list + filter) | 10 phút |
| 4 | Routes (`App.jsx`) + Menu (`Home.jsx`) | 5 phút |
| 5 | Test trên browser | 5 phút |
| **Tổng** | | **~40 phút** |

---

## Verification

- [ ] Tạo được phiếu nhập mới với đầy đủ thông tin
- [ ] Thêm/xóa dòng hàng hóa trong phiếu
- [ ] Danh sách hiển thị đúng, filter hoạt động
- [ ] Menu trên Home dẫn tới trang nhập hàng
- [ ] Dữ liệu lưu đúng vào Supabase
