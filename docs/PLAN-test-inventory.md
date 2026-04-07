# PLAN: Test Inventory Logic - Hướng Dẫn Kiểm Tra Từng Bước

> Mục tiêu: Verify 5 fixes tồn kho hoạt động đúng. Mỗi test case chỉ rõ **vào đâu**, **làm gì**, **kiểm tra ở đâu**.

---

## 📍 Các trang liên quan (URL)

| Trang | URL | Sidebar / Cách vào |
|-------|-----|---------------------|
| **Đơn hàng** | `/don-hang` | Menu "Đơn hàng kinh doanh" → "Đơn hàng" |
| **Thu hồi máy** | `/thu-hoi-may` | Menu "Thu hồi" → "Thu hồi máy" |
| **Thu hồi vỏ bình** | `/thu-hoi-vo` | Menu "Thu hồi" → "Thu hồi vỏ" |
| **Nhập kho (Phiếu nhập)** | `/nhap-hang` | Menu "Kho" → "Nhập hàng" |
| **Xuất kho (Phiếu xuất)** | `/xuat-tra-ncc` | Menu "Kho" → "Xuất trả NCC" |
| **Báo cáo tồn kho** | `/bao-cao/kho` | Menu "Thống kê" → "Báo cáo kho" |
| **Điều chuyển kho** | `/kho/dieu-chuyen` | Menu "Kho" → "Điều chuyển" |

---

## 🧪 TEST CASE 1: Thu hồi máy khi EDIT → HOÀN THÀNH (Fix #1)

### Mục đích
Kiểm tra: khi tạo phiếu thu hồi nháp, sau đó edit thành HOÀN THÀNH → tồn kho có được cộng không.

### Bước chuẩn bị
1. **Vào `/bao-cao/kho`** → Ghi lại số lượng tồn kho hiện tại cho loại máy cần test (VD: "Máy PlasmaMed-BV" tại kho HN)
   - 📋 **GHI LẠI**: Số tồn kho trước = `___`

### Bước thực hiện
2. **Vào `/thu-hoi-may`** (Thu hồi máy)
3. Nhấn **"+ Tạo phiếu thu hồi"**
4. Điền thông tin:
   - Chọn khách hàng (KH đang có máy mượn)
   - Chọn kho nhận về (VD: kho HN)
   - **Status: để "CHO_PHAN_CONG" (CHƯA hoàn thành)**
   - Quét/nhập serial máy (VD: `PLT-25D1-50-TM`)
5. Nhấn **"Lưu"** → Phiếu tạo thành công ở trạng thái nháp
6. **Quay lại list → Nhấn nút Edit** phiếu vừa tạo
7. **Đổi Status sang "HOÀN THÀNH"**
8. Nhấn **"Lưu"**

### Kiểm tra kết quả
9. **Vào `/bao-cao/kho`** → Tìm kho HN → kiểm tra:
   - ✅ "Máy PlasmaMed-BV" (hoặc tên máy tương ứng) tăng đúng số lượng thu hồi
   - 📋 **Số tồn kho sau** = `___` (phải = trước + số máy thu hồi)

10. **Kiểm tra `inventory_transactions`** (nếu có giao diện xem, hoặc qua Supabase):
    - Phải có 1 dòng `transaction_type = 'IN'`, `reference_code = mã phiếu`, `quantity_changed = số máy`

### ❌ Kết quả THẤT BẠI nếu:
- Tồn kho không tăng
- Tên sản phẩm hiện "Máy thu hồi" thay vì tên gốc

---

## 🧪 TEST CASE 2: Thu hồi bình KHÔNG cộng double khi re-edit (Fix #2)

### Mục đích
Kiểm tra: khi edit lại phiếu thu hồi bình đã HOÀN THÀNH → tồn kho KHÔNG bị cộng thêm lần nữa.

### Bước chuẩn bị
1. **Vào `/bao-cao/kho`** → Ghi lại tồn "Bình 4L" hoặc "Bình 8L" tại kho HN
   - 📋 **Tồn kho trước** = `___`

### Bước thực hiện
2. **Vào `/thu-hoi-vo`** (Thu hồi vỏ bình)
3. Nhấn **"+ Tạo phiếu"**
4. Điền thông tin:
   - Chọn khách hàng
   - Chọn kho HN
   - **Status: "HOÀN THÀNH"** (hoàn thành luôn)
   - Quét/nhập mã serial bình (VD: `QR04116`)
5. Nhấn **"Lưu"** → OK, phiếu tạo + inventory cộng lần 1

### Kiểm tra lần 1
6. **Vào `/bao-cao/kho`** → kiểm tra "Bình 4L" hoặc "Bình 8L"
   - 📋 **Tồn kho sau lần 1** = `___` (phải = trước + số bình)

### Test double-counting
7. **Quay lại `/thu-hoi-vo`** → **Edit phiếu vừa tạo** (phiếu đã HOÀN THÀNH)
8. Sửa ghi chú hoặc thông tin bất kỳ (không đổi status)
9. Nhấn **"Lưu"** lại

### Kiểm tra lần 2
10. **Vào `/bao-cao/kho`** lại:
    - ✅ Tồn kho **PHẢI GIỐNG lần 1**, KHÔNG được tăng thêm
    - 📋 **Tồn kho sau lần 2** = `___` (phải = tồn kho sau lần 1)

### ❌ Kết quả THẤT BẠI nếu:
- Tồn kho tăng thêm sau lần edit thứ 2

---

## 🧪 TEST CASE 3: Hủy đơn hàng → Tự động hoàn trả tồn kho (Fix #3)

### Mục đích
Kiểm tra: khi hủy đơn hàng đã xuất kho → tồn kho được hoàn trả tự động + bình/máy giải phóng.

### Bước chuẩn bị
1. **Vào `/bao-cao/kho`** → Ghi lại tồn kho sản phẩm sẽ đặt (VD: "Bình 4L" kho HN)
   - 📋 **Tồn trước** = `___`

### Bước thực hiện - Tạo đơn và xuất kho
2. **Vào `/don-hang`** (Đơn hàng)
3. Tạo đơn hàng mới:
   - Chọn KH, sản phẩm: Bình 4L, số lượng: 2
   - Kho xuất: HN
4. Duyệt đơn qua các trạng thái: **Chờ duyệt → Lead duyệt → Công ty duyệt → Kho xử lý**
5. Tại "Kho xử lý": quét mã bình → nhấn **"Kho Báo Đã Xuất"**
   - ⚡ Lúc này tồn kho đã bị TRỪ

### Kiểm tra giữa chừng
6. **Vào `/bao-cao/kho`** → xác nhận tồn kho đã giảm
   - 📋 **Tồn sau xuất** = `___` (phải = trước - 2)

### Test hủy đơn
7. **Quay lại `/don-hang`** → Mở đơn vừa tạo
8. Nhấn **"Hủy đơn"** (đơn đang ở trạng thái CHO_GIAO_HANG)
9. Xác nhận hủy

### Kiểm tra kết quả
10. **Vào `/bao-cao/kho`**:
    - ✅ Tồn kho **hoàn trả** lại: phải = tồn ban đầu
    - 📋 **Tồn sau hủy** = `___` (phải = tồn trước ban đầu)

11. **Vào `/binh`** (Danh sách bình):
    - ✅ Các bình đã gán phải quay về status **"sẵn sàng"**
    - ✅ `customer_name` phải trống (null)

12. **Kiểm tra `inventory_transactions`**:
    - Phải có dòng `IN` với note chứa "Hoàn trả kho" + "Hủy đơn"

### ❌ Kết quả THẤT BẠI nếu:
- Tồn kho không hoàn trả
- Bình vẫn ở trạng thái "đang vận chuyển"

---

## 🧪 TEST CASE 4: Phiếu xuất kho (GoodsIssues) → Trừ tồn kho (Fix #4)

### Mục đích
Kiểm tra: khi tạo phiếu xuất trả NCC → tồn kho bị trừ đúng.

### Bước chuẩn bị
1. **Vào `/bao-cao/kho`** → Ghi lại tồn kho loại bình/máy sẽ xuất
   - 📋 **Tồn trước** = `___`

### Bước thực hiện
2. **Vào `/xuat-tra-ncc`** (Xuất trả NCC)
3. Nhấn **"Trả vỏ"** hoặc **"Trả máy"**
4. Điền thông tin:
   - Chọn kho xuất (VD: HN)
   - Chọn NCC
   - Chọn sản phẩm từ danh sách kho (bảng "Chọn nhanh tài sản từ kho")
   - Hoặc nhập manual serial
5. Nhấn **"Lưu"**

### Kiểm tra kết quả
6. **Vào `/bao-cao/kho`**:
    - ✅ Tồn kho giảm đúng số lượng đã xuất
    - 📋 **Tồn sau** = `___` (phải = trước - số lượng xuất)

7. **Kiểm tra `inventory_transactions`**:
    - Phải có dòng `OUT` với `reference_code = mã phiếu xuất`, note chứa "Xuất kho"

### ❌ Kết quả THẤT BẠI nếu:
- Tồn kho không giảm sau khi tạo phiếu xuất

---

## 🧪 TEST CASE 5: Tên sản phẩm thống nhất (Fix #5)

### Mục đích
Kiểm tra: khi thu hồi máy/bình, tên sản phẩm trong inventory khớp với tên khi xuất.

### Bước thực hiện
1. **Thực hiện Test Case 1** (Thu hồi máy)
2. Sau khi hoàn thành, **vào `/bao-cao/kho`**

### Kiểm tra kết quả
3. Trong báo cáo kho, tìm record vừa cộng:
   - ✅ Tên phải là **"Máy PlasmaMed-BV"** (nếu máy BV) hoặc **"Máy Thẩm Mỹ"** (nếu máy TM)
   - ❌ KHÔNG được hiện "Máy thu hồi"

4. Tương tự cho bình:
   - ✅ Tên phải là **"Bình 4L"** hoặc **"Bình 8L"**
   - ❌ KHÔNG được hiện "Vỏ bình thu hồi"

5. **Kiểm tra `inventory_transactions`**:
   - Note phải chứa tên sản phẩm gốc, VD: "Thu hồi 1 Máy PlasmaMed-BV từ khách hàng"

---

## 📊 BẢNG GHI KẾT QUẢ

Dùng bảng này ghi lại kết quả test:

| Test | Mô tả | Tồn kho trước | Hành động | Tồn kho sau | Đúng? |
|------|--------|---------------|-----------|-------------|-------|
| TC1 | Thu hồi máy (edit→HT) | ___ | Cộng ___ | ___ | ☐ |
| TC2a | Thu hồi bình (lần 1) | ___ | Cộng ___ | ___ | ☐ |
| TC2b | Re-edit bình (lần 2) | ___ | Không đổi | ___ | ☐ |
| TC3a | Xuất đơn hàng | ___ | Trừ ___ | ___ | ☐ |
| TC3b | Hủy đơn | ___ | Hoàn trả ___ | ___ | ☐ |
| TC4 | Phiếu xuất NCC | ___ | Trừ ___ | ___ | ☐ |
| TC5 | Tên sản phẩm đúng? | — | — | — | ☐ |

---

## 🔧 Cách kiểm tra `inventory_transactions` (nâng cao)

Nếu muốn kiểm tra bảng audit log chi tiết, vào **Supabase Dashboard** → Table Editor → `inventory_transactions`:

```sql
-- Xem 20 giao dịch gần nhất
SELECT 
  t.transaction_type,
  t.quantity_changed,
  t.reference_code,
  t.note,
  t.created_at,
  i.item_name,
  i.item_type
FROM inventory_transactions t
JOIN inventory i ON i.id = t.inventory_id
ORDER BY t.created_at DESC
LIMIT 20;
```

---

## ⚡ THỨ TỰ TEST KHUYẾN NGHỊ

```
1. TC5 (tên sản phẩm) → test cùng lúc TC1
2. TC1 (thu hồi máy edit)
3. TC2 (thu hồi bình double)
4. TC3 (hủy đơn hoàn trả) → phức tạp nhất, test sau cùng
5. TC4 (phiếu xuất NCC)  
```

> 💡 **Tip**: Mở 2 tab - 1 tab `/bao-cao/kho` và 1 tab trang đang test. Refresh tab báo cáo sau mỗi thao tác để kiểm tra tồn kho realtime.
