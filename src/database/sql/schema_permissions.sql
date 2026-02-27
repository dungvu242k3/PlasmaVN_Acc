-- SQL Schema for User Roles and Permissions (Phân quyền)
-- Uses JSONB to store the permission matrix (view/create/edit/delete) for each module dynamically

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS app_roles CASCADE;

CREATE TABLE app_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE, -- Tên quyền (Thủ kho, Nhập liệu, v.v.)
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb, -- Ma trận phân quyền
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bổ sung role_id vào bảng app_users nếu cần liên kết trực tiếp bằng ID thay vì tên text
-- ALTER TABLE app_users ADD COLUMN role_id UUID REFERENCES app_roles(id) ON DELETE SET NULL;

COMMENT ON TABLE app_roles IS 'Bảng lưu danh sách các Vai trò và Quyền hạn chi tiết trên hệ thống';
COMMENT ON COLUMN app_roles.name IS 'Tên định danh nhóm quyền (Thủ kho, Sale, v.v.)';
COMMENT ON COLUMN app_roles.permissions IS 'JSON object lưu quyền: {"materials": {"view": true, "create": false}, "orders": {...}}';

-- Dữ liệu mẫu ban đầu (Admin có toàn quyền)
INSERT INTO app_roles (name, permissions) VALUES (
    'Admin',
    '{
        "dashboard": {"view": true, "create": true, "edit": true, "delete": true},
        "users": {"view": true, "create": true, "edit": true, "delete": true},
        "roles": {"view": true, "create": true, "edit": true, "delete": true},
        "materials": {"view": true, "create": true, "edit": true, "delete": true},
        "suppliers": {"view": true, "create": true, "edit": true, "delete": true},
        "shippers": {"view": true, "create": true, "edit": true, "delete": true},
        "warehouses": {"view": true, "create": true, "edit": true, "delete": true},
        "cylinders": {"view": true, "create": true, "edit": true, "delete": true},
        "orders": {"view": true, "create": true, "edit": true, "delete": true}
    }'::jsonb
);

-- =========================================================================
-- UPDATE CHO TÍNH NĂNG "PHÂN QUYỀN TRỰC TIẾP CHO NGƯỜI DÙNG"
-- Chạy lệnh thao tác DDL sau để bổ sung cột permissions rỗng cho bảng app_users 
-- cho phép định nghĩa quyền cá nhân (ưu tiên cao hơn quyền nhóm):
-- =========================================================================
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;
COMMENT ON COLUMN app_users.permissions IS 'JSON object lưu quyền riêng cấp User: chèn đè lên quyền của nhóm role hiện tại';
