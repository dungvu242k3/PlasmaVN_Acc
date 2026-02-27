-- ==============================================================================
-- MIGRATION: Củng cố hệ thống Phân Quyền v2 (RBAC Migration)
-- DESCRIPTION: Hợp nhất toàn bộ phân quyền vào bảng app_roles.
-- Đảm bảo quyền ADMIN có toàn quyền cho tất cả các phân hệ.
-- ==============================================================================

-- 1. Bổ sung cột 'type' để phân biệt Quyền Nhóm và Quyền riêng User
ALTER TABLE app_roles ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'group' CHECK (type IN ('group', 'user'));

-- 2. Dọn dẹp bảng app_users (Xóa cột permissions cũ nếu có)
ALTER TABLE app_users DROP COLUMN IF EXISTS permissions;

-- 3. Cập nhật hoặc Chèn mới role Admin với FULL QUYỀN (bao gồm cả phân hệ Khuyến mãi mới)
INSERT INTO app_roles (name, type, permissions)
VALUES (
    'Admin',
    'group',
    '{
        "dashboard": {"view": true, "create": true, "edit": true, "delete": true},
        "orders": {"view": true, "create": true, "edit": true, "delete": true},
        "customers": {"view": true, "create": true, "edit": true, "delete": true},
        "machines": {"view": true, "create": true, "edit": true, "delete": true},
        "cylinders": {"view": true, "create": true, "edit": true, "delete": true},
        "warehouses": {"view": true, "create": true, "edit": true, "delete": true},
        "suppliers": {"view": true, "create": true, "edit": true, "delete": true},
        "shippers": {"view": true, "create": true, "edit": true, "delete": true},
        "materials": {"view": true, "create": true, "edit": true, "delete": true},
        "promotions": {"view": true, "create": true, "edit": true, "delete": true},
        "users": {"view": true, "create": true, "edit": true, "delete": true},
        "permissions": {"view": true, "create": true, "edit": true, "delete": true}
    }'::jsonb
)
ON CONFLICT (name) DO UPDATE 
SET permissions = EXCLUDED.permissions,
    type = 'group',
    updated_at = NOW();

-- 4. Thêm chú thích
COMMENT ON COLUMN app_roles.type IS 'Loại phân quyền: group (Nhóm quyền) hoặc user (Quyền riêng cho cá nhân)';
COMMENT ON TABLE app_roles IS 'Bảng trung tâm lưu trữ toàn bộ Ma trận phân quyền cho Nhóm và Cá nhân';

-- In thông báo thành công
DO $$ 
BEGIN 
  RAISE NOTICE 'Admin đã được cấp FULL QUYỀN cho tất cả các phân hệ (bao gồm Khuyến mãi)!'; 
END $$;
