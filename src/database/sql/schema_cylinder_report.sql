-- ==============================================================================
-- SQL Views for Customer Cylinder Report
-- Purpose: Calculate monthly inventory (balance) of cylinders at customers
-- ==============================================================================

-- 1. Combine all cylinder movements (Orders and Recoveries)
CREATE OR REPLACE VIEW view_customer_cylinder_movements AS
WITH monthly_movements AS (
    -- Group orders by customer and month
    SELECT 
        c.id as customer_id,
        c.name as customer_name,
        c.warehouse_id as kho,
        c.category as loai_khach,
        EXTRACT(YEAR FROM o.created_at)::int as nam,
        EXTRACT(MONTH FROM o.created_at)::int as thang,
        SUM(o.quantity) as xuat,
        0 as thu_hoi
    FROM orders o
    JOIN customers c ON c.name = o.customer_name
    WHERE o.status IN ('DA_DUYET', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'HOAN_THANH')
    GROUP BY c.id, c.name, c.warehouse_id, c.category, nam, thang
    
    UNION ALL
    
    -- Group recoveries by customer and month
    SELECT 
        c.id as customer_id,
        c.name as customer_name,
        c.warehouse_id as kho,
        c.category as loai_khach,
        EXTRACT(YEAR FROM cr.created_at)::int as nam,
        EXTRACT(MONTH FROM cr.created_at)::int as thang,
        0 as xuat,
        SUM(cr.total_items) as thu_hoi
    FROM cylinder_recoveries cr
    JOIN customers c ON c.id = cr.customer_id
    WHERE cr.status = 'HOAN_THANH'
    GROUP BY c.id, c.name, c.warehouse_id, c.category, nam, thang
)
SELECT 
    customer_id,
    customer_name,
    kho,
    loai_khach,
    nam,
    thang,
    SUM(xuat) as xuat,
    SUM(thu_hoi) as thu_hoi,
    SUM(xuat - thu_hoi) as chenh_lech
FROM monthly_movements
GROUP BY customer_id, customer_name, kho, loai_khach, nam, thang;

-- 2. View with cumulative balances (Opening/Closing)
CREATE OR REPLACE VIEW view_customer_cylinder_monthly_balance AS
SELECT 
    m.*,
    -- Running total per customer
    SUM(m.chenh_lech) OVER (PARTITION BY m.customer_id ORDER BY m.nam, m.thang) as closing_balance,
    (SUM(m.chenh_lech) OVER (PARTITION BY m.customer_id ORDER BY m.nam, m.thang)) - m.chenh_lech as opening_balance
FROM view_customer_cylinder_movements m;

COMMENT ON VIEW view_customer_cylinder_monthly_balance IS 'Báo cáo bình thuộc khách: Tồn đầu, Nhập, Xuất, Tồn cuối theo tháng.';
