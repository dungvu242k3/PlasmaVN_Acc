// Constants for User Management Module

export const USER_ROLES = [
    { id: 'Admin', label: 'Quản trị viên (Admin)' },
    { id: 'Nhân viên kinh doanh', label: 'Nhân viên kinh doanh' },
    { id: 'Nhân viên kỹ thuật', label: 'Nhân viên kỹ thuật' },
    { id: 'Kế toán', label: 'Kế toán' },
    { id: 'Thủ kho', label: 'Thủ kho' }
];

export const USER_STATUSES = [
    { id: 'Hoạt động', label: 'Hoạt động', colorClass: 'text-green-700 bg-green-50 border-green-200' },
    { id: 'Dừng hoạt động', label: 'Dừng hoạt động', colorClass: 'text-red-700 bg-red-50 border-red-200' }
];
