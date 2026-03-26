-- ==============================================================================
-- SQL Views for Sales Report
-- Purpose: Aggregate revenue and order counts for sales reporting
-- ==============================================================================

-- 1. Monthly Sales Summary by Customer and Salesperson
CREATE OR REPLACE VIEW view_sales_summary_monthly AS
SELECT 
    customer_name,
    sales_person as nvkd,
    customer_category as loai_khach,
    warehouse as kho,
    EXTRACT(YEAR FROM created_at)::int as nam,
    EXTRACT(MONTH FROM created_at)::int as thang,
    SUM(total_amount) as doanh_so,
    COUNT(id) as so_don_hang
FROM orders
WHERE status IN ('HOAN_THANH', 'CHO_DOI_SOAT', 'DOI_SOAT_THAT_BAI', 'DANG_GIAO_HANG')
GROUP BY customer_name, sales_person, customer_category, warehouse, nam, thang;

COMMENT ON VIEW view_sales_summary_monthly IS 'Báo cáo doanh số tổng hợp theo khách hàng, NVKD và thời gian.';
