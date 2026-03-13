// Constants cho Phiếu Xuất Kho (Trở lại NCC hoặc xuất khác)

export const ISSUE_STATUSES = [
    { id: 'ALL', label: 'Tất cả', color: 'gray' },
    { id: 'CHO_DUYET', label: 'Chờ duyệt', color: 'yellow' },
    { id: 'DA_XUAT', label: 'Đã xuất kho', color: 'blue' },
    { id: 'HOAN_THANH', label: 'Hoàn thành', color: 'green' },
    { id: 'HUY', label: 'Đã hủy', color: 'red' },
];

export const ISSUE_TYPES = [
    { id: 'TRA_VO', label: 'Xuất trả vỏ' },
    { id: 'TRA_BINH_LOI', label: 'Xuất trả bình lỗi' },
    { id: 'TRA_MAY', label: 'Xuất trả máy' }
];

export const ISSUE_TABLE_COLUMNS = [
    { key: 'issue_code', label: 'Mã phiếu' },
    { key: 'issue_date', label: 'Ngày xuất' },
    { key: 'issue_type', label: 'Loại xuất' },
    { key: 'supplier_id', label: 'Đơn vị nhận (NCC)' },
    { key: 'warehouse_id', label: 'Từ kho' },
    { key: 'total_items', label: 'Khối lượng/Số lượng' },
    { key: 'created_by', label: 'Người tạo' },
    { key: 'status', label: 'Trạng thái' },
];
