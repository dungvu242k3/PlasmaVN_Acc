-- ==============================================================================
-- MIGRATION: Cập nhật Phân Quyền cho Báo cáo
-- DESCRIPTION: Thêm quyền báo cáo và tạo các role NVKD, ThuKho, CSKH
-- ==============================================================================

-- 1. Cập nhật role Admin với quyền báo cáo đầy đủ
UPDATE app_roles 
SET permissions = '{
    "dashboard": {"view": true, "create": true, "edit": true, "delete": true},
    "reports": {"view_all": true, "export": true, "update": true, "schedule": true},
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
}'::jsonb,
updated_at = NOW()
WHERE name = 'Admin';

-- 2. Tạo role NVKD (Nhân viên kinh doanh)
INSERT INTO app_roles (name, type, permissions)
VALUES (
    'NVKD',
    'group',
    '{
        "dashboard": {"view": true},
        "reports": {"view_own": true, "export": true},
        "orders": {"view": true, "create": true},
        "customers": {"view": true, "create": true, "edit": true},
        "machines": {"view": true},
        "cylinders": {"view": true},
        "warehouses": {"view": true},
        "shippers": {"view": true},
        "materials": {"view": true},
        "promotions": {"view": true}
    }'::jsonb
)
ON CONFLICT (name) DO UPDATE 
SET permissions = EXCLUDED.permissions,
    type = 'group',
    updated_at = NOW();

-- 3. Tạo role ThuKho (Thủ kho)
INSERT INTO app_roles (name, type, permissions)
VALUES (
    'ThuKho',
    'group',
    '{
        "dashboard": {"view": true},
        "reports": {"view_warehouse": true, "export": true},
        "orders": {"view": true},
        "customers": {"view": true},
        "machines": {"view": true, "create": true, "edit": true},
        "cylinders": {"view": true, "create": true, "edit": true},
        "warehouses": {"view": true, "create": true, "edit": true},
        "suppliers": {"view": true},
        "shippers": {"view": true},
        "materials": {"view": true, "create": true, "edit": true}
    }'::jsonb
)
ON CONFLICT (name) DO UPDATE 
SET permissions = EXCLUDED.permissions,
    type = 'group',
    updated_at = NOW();

-- 4. Tạo role CSKH (Chăm sóc khách hàng)
INSERT INTO app_roles (name, type, permissions)
VALUES (
    'CSKH',
    'group',
    '{
        "dashboard": {"view": true},
        "reports": {"view_errors": true},
        "orders": {"view": true},
        "customers": {"view": true},
        "machines": {"view": true},
        "cylinders": {"view": true, "edit": true}
    }'::jsonb
)
ON CONFLICT (name) DO UPDATE 
SET permissions = EXCLUDED.permissions,
    type = 'group',
    updated_at = NOW();

-- 5. Tạo role QuanLy (Quản lý - quyền cao hơn NVKD nhưng không bằng Admin)
INSERT INTO app_roles (name, type, permissions)
VALUES (
    'QuanLy',
    'group',
    '{
        "dashboard": {"view": true},
        "reports": {"view_all": true, "export": true},
        "orders": {"view": true, "create": true, "edit": true, "delete": true},
        "customers": {"view": true, "create": true, "edit": true, "delete": true},
        "machines": {"view": true, "create": true, "edit": true, "delete": true},
        "cylinders": {"view": true, "create": true, "edit": true, "delete": true},
        "warehouses": {"view": true, "create": true, "edit": true},
        "suppliers": {"view": true, "create": true, "edit": true},
        "shippers": {"view": true, "create": true, "edit": true},
        "materials": {"view": true, "create": true, "edit": true},
        "promotions": {"view": true, "create": true, "edit": true, "delete": true},
        "users": {"view": true}
    }'::jsonb
)
ON CONFLICT (name) DO UPDATE 
SET permissions = EXCLUDED.permissions,
    type = 'group',
    updated_at = NOW();

-- In thông báo thành công
DO $$ 
BEGIN 
  RAISE NOTICE 'Đã cập nhật quyền báo cáo và tạo các role: Admin, NVKD, ThuKho, CSKH, QuanLy!'; 
END $$;
