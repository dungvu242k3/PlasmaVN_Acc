-- ==============================================================================
-- SQL Schema for Error Reporting - PlasmaVN
-- Source: Aggregated from repair_tickets
-- ==============================================================================

-- Create view for error summarization
CREATE OR REPLACE VIEW view_error_summary_monthly AS
SELECT 
    rt.id,
    rt.stt,
    rt.date AS ngay_bao_loi,
    rt.loai_loi AS error_category, -- 'Máy' hoặc 'Bình'
    ret.name AS ten_loi,
    rt.machine_serial AS serial_thiet_bi,
    rt.machine_name AS ten_thiet_bi,
    c.name AS ten_khach_hang,
    c.warehouse_id AS kho,
    c.category AS loai_khach,
    u_created.name AS nguoi_bao_loi,
    u_tech.name AS ky_thuat_xu_ly,
    rt.status AS trang_thai_phieu,
    rt.error_details AS mo_ta_chi_tiet,
    -- Time dimensions
    DATE_TRUNC('month', rt.date)::DATE AS thang_nam,
    EXTRACT(YEAR FROM rt.date) AS nam,
    EXTRACT(MONTH FROM rt.date) AS thang,
    EXTRACT(QUARTER FROM rt.date) AS quy
FROM repair_tickets rt
LEFT JOIN repair_error_types ret ON ret.id = rt.error_type_id
LEFT JOIN customers c ON c.id = rt.customer_id
LEFT JOIN app_users u_created ON u_created.id = rt.created_by
LEFT JOIN app_users u_tech ON u_tech.id = rt.technician_id;

-- Comment for documentation
COMMENT ON VIEW view_error_summary_monthly IS 'Tổng hợp lỗi máy và bình theo thời gian từ phiếu sửa chữa';
