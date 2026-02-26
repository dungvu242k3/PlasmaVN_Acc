-- SQL Schema for PlasmaVN Shipping Units (Shippers) Management
-- Purpose: Tracking internal and external shipping units.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS shippers CASCADE;

CREATE TABLE shippers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- 1. Tên Đơn vị vận chuyển
    manager_name VARCHAR(255) NOT NULL, -- 2. Người quản lý
    phone VARCHAR(50) NOT NULL, -- 3. Số điện thoại
    address TEXT NOT NULL, -- 4. Địa chỉ
    status VARCHAR(100) NOT NULL DEFAULT 'Đang hoạt động', -- 5. Trạng thái
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Constraint for shipper status
ALTER TABLE shippers ADD CONSTRAINT check_shipper_status CHECK (
    status IN (
        'Đang hoạt động', 
        'Tạm ngưng',
        'Ngừng hợp tác'
    )
);

-- Comments for clarity
COMMENT ON TABLE shippers IS 'Bảng quản lý Đơn vị vận chuyển PlasmaVN';
COMMENT ON COLUMN shippers.name IS 'Tên công ty hoặc ĐVVC thuê ngoài';
COMMENT ON COLUMN shippers.manager_name IS 'Tên người quản lý / điều phối';
COMMENT ON COLUMN shippers.phone IS 'Số điện thoại liên hệ';
