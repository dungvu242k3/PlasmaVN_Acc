// Constants for User Management Module

export const USER_ROLES = [
    { id: 'Admin', label: 'Quản trị viên (Admin)' },
    { id: 'Nhân viên kinh doanh', label: 'Nhân viên kinh doanh' },
    { id: 'Nhân viên kỹ thuật', label: 'Nhân viên kỹ thuật' },
    { id: 'Kế toán', label: 'Kế toán' },
    { id: 'Thủ kho', label: 'Thủ kho' },
    { id: 'Quản lý CSKH', label: 'Quản lý CSKH' },
    { id: 'Nhân viên CSKH', label: 'Nhân viên CSKH' }
];

export const USER_STATUSES = [
    { id: 'Hoạt động', label: 'Hoạt động', color: 'green' },
    { id: 'Dừng hoạt động', label: 'Dừng hoạt động', color: 'red' }
];

export const TABLE_COLUMNS = [
    { key: 'info', label: 'Thông tin nhân sự' },
    { key: 'contact', label: 'Liên lạc' },
    { key: 'role', label: 'Vai trò / Công việc' },
    { key: 'status', label: 'Trạng thái' },
];
