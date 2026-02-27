-- SQL Schema for PlasmaVN Suppliers Management
-- Purpose: Tracking partners providing materials and cylinders.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS suppliers CASCADE;

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- 1. Tên Nhà cung cấp
    phone VARCHAR(50) NOT NULL, -- 2. Số điện thoại
    address TEXT NOT NULL, -- 3. Địa chỉ
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments for clarity
COMMENT ON TABLE suppliers IS 'Bảng quản lý Nhà cung cấp PlasmaVN';
COMMENT ON COLUMN suppliers.name IS 'Tên công ty hoặc đối tác cung cấp';
COMMENT ON COLUMN suppliers.phone IS 'Số điện thoại liên hệ';
COMMENT ON COLUMN suppliers.address IS 'Địa chỉ văn phòng hoặc kho của nhà cung cấp';
