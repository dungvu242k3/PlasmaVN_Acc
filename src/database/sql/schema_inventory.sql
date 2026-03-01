-- SQL Schema for PlasmaVN Inventory Management
-- Purpose: Track real-time inventory counts and historical transactions.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;

-- Master: Kho + Loại + Tên = Số Lượng Tồn Kho
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id VARCHAR(50) NOT NULL, -- HN, TP.HCM, TH, DN
    item_type VARCHAR(50) NOT NULL,    -- MAY, BINH, VAT_TU
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique combination for easy upsert
    UNIQUE(warehouse_id, item_type, item_name)
);

-- Detail: Lịch sử xuất/nhập (Log nhảy số)
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'IN' (nhập kho), 'OUT' (xuất kho)
    reference_id UUID,                     -- receipt_id or order_id
    reference_code VARCHAR(100),           -- PN001, PN002 or Order Code
    quantity_changed INTEGER NOT NULL,     -- Số lượng thay đổi (vd: 50)
    note TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Constraints
ALTER TABLE inventory ADD CONSTRAINT check_inventory_warehouse CHECK (
    warehouse_id IN ('HN', 'TP.HCM', 'TH', 'DN')
);

ALTER TABLE inventory ADD CONSTRAINT check_inventory_item_type CHECK (
    item_type IN ('MAY', 'BINH', 'VAT_TU')
);

ALTER TABLE inventory_transactions ADD CONSTRAINT check_transaction_type CHECK (
    transaction_type IN ('IN', 'OUT')
);

-- Comments
COMMENT ON TABLE inventory IS 'Bảng tổng hợp số lượng tồn kho theo Kho và Sản Phẩm';
COMMENT ON TABLE inventory_transactions IS 'Lịch sử giao dịch Nhập/Xuất tác động lên số lượng tồn kho';
