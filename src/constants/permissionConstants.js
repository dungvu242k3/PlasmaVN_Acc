// Constants for Permission Matrix

export const MODULE_PERMISSIONS = [
    { id: 'dashboard', label: 'Dashboard / Báo cáo' },
    { id: 'users', label: 'Quản lý Người dùng' },
    { id: 'roles', label: 'Quản lý Phân quyền' },
    { id: 'materials', label: 'Từ điển Nguồn Vật tư' },
    { id: 'suppliers', label: 'Nhà cung cấp vật tư' },
    { id: 'shippers', label: 'Đơn vị vận chuyển (Nhà xe)' },
    { id: 'warehouses', label: 'Danh sách Kho' },
    { id: 'cylinders', label: 'Bình khí (RFID)' },
    { id: 'orders', label: 'Vận đơn & Đơn hàng' }
];

export const ACTION_TYPES = [
    { id: 'view', label: 'Xem', colorClass: 'text-blue-700 bg-blue-50 focus:ring-blue-500' },
    { id: 'create', label: 'Thêm', colorClass: 'text-emerald-700 bg-emerald-50 focus:ring-emerald-500' },
    { id: 'edit', label: 'Sửa', colorClass: 'text-amber-700 bg-amber-50 focus:ring-amber-500' },
    { id: 'delete', label: 'Xóa', colorClass: 'text-rose-700 bg-rose-50 focus:ring-rose-500' }
];
