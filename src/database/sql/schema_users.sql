-- SQL Schema for PlasmaVN User Management
-- Purpose: Tracking application users/employees with roles and login information
-- Table name is 'app_users' to avoid conflict with system 'users' tables or auth schemas

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS app_users CASCADE;

CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- 1. Tên người dùng
    username VARCHAR(100) NOT NULL UNIQUE, -- 2. Tên tài khoản (đăng nhập)
    role VARCHAR(100) NOT NULL, -- 3. Vai trò, chức vụ
    phone VARCHAR(50) NOT NULL, -- 4. Số điện thoại
    status VARCHAR(50) NOT NULL DEFAULT 'Hoạt động', -- 5. Trạng thái
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster searching
CREATE INDEX idx_app_users_username ON app_users(username);
CREATE INDEX idx_app_users_role ON app_users(role);

-- Comments for clarity
COMMENT ON TABLE app_users IS 'Bảng quản lý danh sách người dùng/nhân viên trên hệ thống PlasmaVN';
COMMENT ON COLUMN app_users.name IS 'Họ và tên người dùng';
COMMENT ON COLUMN app_users.username IS 'Tên định danh dùng để đăng nhập';
COMMENT ON COLUMN app_users.role IS 'Vai trò hoặc chức vụ để phân quyền (Admin, Nhân viên, v.v.)';
COMMENT ON COLUMN app_users.phone IS 'Số điện thoại liên hệ';
COMMENT ON COLUMN app_users.status IS 'Trạng thái hoạt động của tài khoản (Hoạt động / Dừng hoạt động)';
