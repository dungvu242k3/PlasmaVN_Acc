-- Update Order Views to include 'BAN' and 'THUE' in 'Xuất bán' conditions

-- 1. view_sales_summary_monthly
CREATE OR REPLACE VIEW view_sales_summary_monthly AS
SELECT 
    o.customer_name,
    o.sales_person as nvkd,
    o.customer_category as loai_khach,
    CASE 
        WHEN w.name IS NOT NULL THEN w.name
        WHEN o.warehouse = 'HN' THEN 'Kho Hà Nội'
        WHEN o.warehouse = 'TP.HCM' THEN 'Kho TP.HCM'
        WHEN o.warehouse = 'TH' THEN 'Kho Thanh Hóa'
        WHEN o.warehouse = 'DN' THEN 'Kho Đà Nẵng'
        ELSE o.warehouse 
    END::VARCHAR(50) AS kho,
    EXTRACT(YEAR FROM o.created_at)::int as nam,
    EXTRACT(MONTH FROM o.created_at)::int as thang,
    SUM(o.total_amount) as doanh_so,
    COUNT(o.id) as so_don_hang
FROM orders o
LEFT JOIN warehouses w ON (w.id::text = o.warehouse OR w.name = o.warehouse)
WHERE o.order_type IN ('THUONG', 'BAN', 'THUE', 'Xuất bán')
AND o.status IN (
    'DA_DUYET', 
    'CHO_GIAO_HANG', 
    'DANG_GIAO_HANG', 
    'CHO_DOI_SOAT', 
    'HOAN_THANH',
    'DOI_SOAT_THAT_BAI'
)
GROUP BY 
    o.customer_name, 
    o.sales_person, 
    o.customer_category, 
    CASE 
        WHEN w.name IS NOT NULL THEN w.name
        WHEN o.warehouse = 'HN' THEN 'Kho Hà Nội'
        WHEN o.warehouse = 'TP.HCM' THEN 'Kho TP.HCM'
        WHEN o.warehouse = 'TH' THEN 'Kho Thanh Hóa'
        WHEN o.warehouse = 'DN' THEN 'Kho Đà Nẵng'
        ELSE o.warehouse 
    END::VARCHAR(50), 
    EXTRACT(YEAR FROM o.created_at), 
    EXTRACT(MONTH FROM o.created_at);

-- 2. view_customer_stats (Cập nhật logic binh_ban)
CREATE OR REPLACE VIEW view_customer_stats AS
SELECT 
    c.id,
    c.code AS ma_khach_hang,
    c.name AS ten_khach_hang,
    c.customer_type AS loai_khach_hang,
    CASE 
        WHEN w.name IS NOT NULL THEN w.name
        WHEN c.warehouse_id = 'HN' THEN 'Kho Hà Nội'
        WHEN c.warehouse_id = 'TP.HCM' THEN 'Kho TP.HCM'
        WHEN c.warehouse_id = 'TH' THEN 'Kho Thanh Hóa'
        WHEN c.warehouse_id = 'DN' THEN 'Kho Đà Nẵng'
        ELSE c.warehouse_id 
    END::VARCHAR(50) AS kho,
    c.category AS loai_khach,
    (SELECT COUNT(*) FROM machines m WHERE m.customer_name = c.name) AS may_dang_su_dung,
    (SELECT COUNT(*) FROM cylinders cy WHERE cy.customer_name = c.name) AS binh_hien_co,
    c.borrowed_cylinders AS vo_binh_dang_muon,
    
    -- Số bình xuất (tất cả đơn đã duyệt)
    COALESCE((
        SELECT SUM(o.quantity) 
        FROM orders o 
        WHERE o.customer_name = c.name 
        AND o.status IN ('DA_DUYET', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'HOAN_THANH')
    ), 0) AS binh_xuat,
    
    -- Số bình bán (đơn xuất bán hoặc loại BAN/THUE/THUONG)
    COALESCE((
        SELECT SUM(o.quantity) 
        FROM orders o 
        WHERE o.customer_name = c.name 
        AND o.order_type IN ('Xuất bán', 'BAN', 'THUE', 'THUONG')
        AND o.status IN ('DA_DUYET', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'HOAN_THANH')
    ), 0) AS binh_ban,
    
    -- Số bình demo
    COALESCE((
        SELECT SUM(o.quantity) 
        FROM orders o 
        WHERE o.customer_name = c.name 
        AND o.order_type IN ('Demo', 'DEMO')
        AND o.status IN ('DA_DUYET', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'HOAN_THANH')
    ), 0) AS binh_demo,
    
    -- Số vỏ thu hồi
    COALESCE((
        SELECT SUM(cri.total_items)
        FROM cylinder_recoveries cri
        JOIN customers c2 ON c2.id = cri.customer_id
        WHERE c2.id = c.id
        AND cri.status = 'HOAN_THANH'
    ), 0) AS vo_thu_hoi,
    
    -- NVKD phụ trách
    c.care_by AS nhan_vien_kinh_doanh,
    c.last_order_date AS ngay_dat_hang_gan_nhat,
    c.machines_in_use AS danh_sach_may,
    (SELECT STRING_AGG(serial_number, ', ') FROM cylinders cy WHERE cy.customer_name = c.name) AS danh_sach_binh
    
FROM customers c
LEFT JOIN warehouses w ON (w.id::text = c.warehouse_id OR w.name = c.warehouse_id);

-- 3. view_salesperson_stats
CREATE OR REPLACE VIEW view_salesperson_stats AS
WITH salesperson_names AS (
    SELECT DISTINCT name FROM app_users WHERE role NOT IN ('Admin', 'admin')
    UNION
    SELECT DISTINCT care_by FROM customers WHERE care_by IS NOT NULL AND care_by != ''
    UNION
    SELECT DISTINCT sales_person FROM orders WHERE sales_person IS NOT NULL AND sales_person != ''
)
SELECT 
    u.id,
    sn.name AS ten_nhan_vien,
    COALESCE(u.phone, '-') AS so_dien_thoai,
    COALESCE(u.role, 'Kinh doanh') AS vai_tro,
    
    -- Tổng số khách hàng phụ trách
    (SELECT COUNT(*) FROM customers c WHERE c.care_by = sn.name) AS tong_khach_hang,
    
    -- Tổng đơn xuất bán
    (SELECT COUNT(*) FROM orders o WHERE o.sales_person = sn.name AND o.order_type IN ('Xuất bán', 'BAN', 'THUE', 'THUONG') AND o.status IN ('DA_DUYET', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'HOAN_THANH')) AS don_xuat_ban,
    
    -- Số bình bán
    (SELECT COALESCE(SUM(o.quantity), 0) FROM orders o WHERE o.sales_person = sn.name AND o.order_type IN ('Xuất bán', 'BAN', 'THUE', 'THUONG') AND o.status IN ('DA_DUYET', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'HOAN_THANH')) AS binh_ban,
    
    -- Tổng đơn demo
    (SELECT COUNT(*) FROM orders o WHERE o.sales_person = sn.name AND o.order_type IN ('Demo', 'DEMO') AND o.status IN ('DA_DUYET', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'HOAN_THANH')) AS don_demo,
    
    -- Số bình demo
    (SELECT COALESCE(SUM(o.quantity), 0) FROM orders o WHERE o.sales_person = sn.name AND o.order_type IN ('Demo', 'DEMO') AND o.status IN ('DA_DUYET', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'HOAN_THANH')) AS binh_demo,
    
    -- Tổng đơn thu hồi
    (SELECT COUNT(*) FROM cylinder_recoveries cr JOIN customers c ON c.id = cr.customer_id WHERE c.care_by = sn.name AND cr.status = 'HOAN_THANH') AS don_thu_hoi,
    
    -- Số bình thu hồi
    (SELECT COALESCE(SUM(cr.total_items), 0) FROM cylinder_recoveries cr JOIN customers c ON c.id = cr.customer_id WHERE c.care_by = sn.name AND cr.status = 'HOAN_THANH') AS binh_thu_hoi,
    
    -- Số máy bán (thuộc khách hàng)
    (SELECT COUNT(*) FROM machines m JOIN customers c ON c.name = m.customer_name WHERE c.care_by = sn.name AND m.status = 'thuộc khách hàng') AS may_ban,
    
    -- Số máy đang sử dụng (cho thuê/demo)
    (SELECT COUNT(*) FROM machines m JOIN customers c ON c.name = m.customer_name WHERE c.care_by = sn.name AND m.status = 'đang sử dụng') AS may_dang_su_dung,

    -- Tổng tồn kho (bình tại các kho mà nhân viên phụ trách KH)
    (SELECT COALESCE(SUM(inv.quantity), 0) FROM inventory inv WHERE inv.item_type = 'BINH' AND inv.warehouse_id IN (SELECT DISTINCT warehouse_id FROM customers WHERE care_by = sn.name)) AS binh_ton_kho
    
FROM salesperson_names sn
LEFT JOIN app_users u ON u.name = sn.name
WHERE (u.role IS NULL OR u.role NOT IN ('Admin', 'admin'));

-- 4. view_dashboard_summary
CREATE OR REPLACE VIEW view_dashboard_summary AS
SELECT 
    (SELECT COUNT(*) FROM customers) AS tong_khach_hang,
    (SELECT COUNT(*) FROM orders WHERE status IN ('DA_DUYET', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'CHO_DOI_SOAT', 'HOAN_THANH', 'DOI_SOAT_THAT_BAI')) AS tong_don_hang,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_type IN ('THUONG', 'BAN', 'THUE', 'Xuất bán') AND status IN ('DA_DUYET', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'CHO_DOI_SOAT', 'HOAN_THANH', 'DOI_SOAT_THAT_BAI')) AS tong_doanh_thu,
    (SELECT COUNT(*) FROM cylinders WHERE status = 'sẵn sàng') AS binh_ton_kho,
    (SELECT COUNT(*) FROM cylinders WHERE status = 'hỏng') AS binh_loi,
    (SELECT COUNT(*) FROM machines WHERE status = 'sẵn sàng') AS may_ton_kho,
    (SELECT COUNT(*) FROM machines WHERE status = 'thuộc khách hàng') AS may_da_ban,
    (SELECT COUNT(*) FROM customers WHERE last_order_date < CURRENT_DATE - INTERVAL '30 days' AND last_order_date IS NOT NULL) AS khach_hang_qua_han,
    (SELECT COUNT(*) FROM cylinders WHERE expiry_date < CURRENT_DATE AND expiry_date IS NOT NULL) AS binh_qua_han;
