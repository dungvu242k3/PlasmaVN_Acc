-- ==============================================================================
-- SQL Views for Machine Inventory Report
-- Purpose: Calculate monthly inventory (balance) of machines at customers/warehouses
-- ==============================================================================

-- 1. Combine all machine movements (Orders and Goods Receipts)
CREATE OR REPLACE VIEW view_machine_movements_combined AS
WITH movements AS (
    -- Delivered Machines from Orders (to Customers)
    SELECT 
        c.id as customer_id,
        c.name as customer_name,
        o.warehouse as warehouse_id,
        EXTRACT(YEAR FROM o.created_at)::int as nam,
        EXTRACT(MONTH FROM o.created_at)::int as thang,
        o.quantity as xuat,
        0 as thu_hoi
    FROM orders o
    JOIN customers c ON c.name = o.customer_name
    WHERE o.status IN ('DA_DUYET', 'CHO_GIAO_HANG', 'DANG_GIAO_HANG', 'HOAN_THANH') 
      AND (o.product_type LIKE '%MAY%' OR o.product_type = 'MAY')
    
    UNION ALL
    
    -- Received Machines from Goods Receipts (Returns from Customers)
    -- We assume if supplier_name in goods_receipt matches a customer, it's a return.
    SELECT 
        c.id as customer_id,
        c.name as customer_name,
        gr.warehouse_id as warehouse_id,
        EXTRACT(YEAR FROM gr.receipt_date)::int as nam,
        EXTRACT(MONTH FROM gr.receipt_date)::int as thang,
        0 as xuat,
        gri.quantity as thu_hoi
    FROM goods_receipts gr
    JOIN goods_receipt_items gri ON gri.receipt_id = gr.id
    JOIN customers c ON c.name = gr.supplier_name
    WHERE gr.status = 'DA_NHAP' AND gri.item_type = 'MAY'
)
SELECT 
    customer_id,
    customer_name,
    warehouse_id as kho,
    nam,
    thang,
    SUM(xuat) as xuat,
    SUM(thu_hoi) as thu_hoi,
    SUM(xuat - thu_hoi) as chenh_lech
FROM movements
GROUP BY customer_id, customer_name, warehouse_id, nam, thang;

-- 2. View with cumulative balances (Opening/Closing)
CREATE OR REPLACE VIEW view_machine_monthly_balance AS
SELECT 
    m.*,
    -- Running total per customer
    SUM(m.chenh_lech) OVER (PARTITION BY m.customer_id ORDER BY m.nam, m.thang) as closing_balance,
    (SUM(m.chenh_lech) OVER (PARTITION BY m.customer_id ORDER BY m.nam, m.thang)) - m.chenh_lech as opening_balance
FROM view_machine_movements_combined m;

COMMENT ON VIEW view_machine_monthly_balance IS 'Báo cáo máy thuộc khách: Tồn đầu, Nhập, Xuất, Tồn cuối theo tháng.';
