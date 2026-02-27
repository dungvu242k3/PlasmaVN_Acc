-- SQL Schema for PlasmaVN Material Information Management
-- Purpose: Tracking core component dictionaries (cylinder volumes, gas types, valves, handles, machine types, output types, components)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS materials CASCADE;

CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL, -- Enum: cylinder_volume, gas_type, valve_type, handle_type, machine_type, output_type, component_type
    name VARCHAR(255) NOT NULL, -- Core name of the material
    extra_number NUMERIC NULL, -- Optional number field for volume value or gas code
    extra_text TEXT NULL, -- Optional text field for output type description or component details
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Constraint for material categories
ALTER TABLE materials ADD CONSTRAINT check_material_category CHECK (
    category IN (
        'cylinder_volume',
        'gas_type',
        'valve_type',
        'handle_type',
        'machine_type',
        'output_type',
        'component_type'
    )
);

-- Index for faster filtering by category
CREATE INDEX idx_materials_category ON materials(category);

-- Comments for clarity
COMMENT ON TABLE materials IS 'Bảng từ điển quản lý tất cả các loại vật tư cấu tạo Máy và Bình';
COMMENT ON COLUMN materials.category IS 'Phân loại vật tư';
COMMENT ON COLUMN materials.name IS 'Tên hiển thị của vật tư';
COMMENT ON COLUMN materials.extra_number IS 'Giá trị số phụ trợ (vd: thể tích bình, mã số ký hiệu khí)';
COMMENT ON COLUMN materials.extra_text IS 'Văn bản phụ trợ (vd: mô tả chi tiết đầu phát, linh kiện)';
