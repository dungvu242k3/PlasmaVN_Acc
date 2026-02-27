// Constants defining the 7 types of materials (components) for Machines and Cylinders
export const MATERIAL_CATEGORIES = [
    {
        id: 'cylinder_volume',
        label: 'Thể tích bình',
        nameLabel: 'Tên thể tích',
        namePlaceholder: 'Ví dụ: Bình 4L/CGA870',
        hasNumberField: true,
        numberFieldLabel: 'Giá trị',
        numberPlaceholder: 'Nhập giá trị số',
        hasTextField: false
    },
    {
        id: 'gas_type',
        label: 'Loại khí',
        nameLabel: 'Tên loại khí',
        namePlaceholder: 'Ví dụ: ArgonMed',
        hasNumberField: true,
        numberFieldLabel: 'Ký hiệu',
        numberPlaceholder: 'Nhập mã/ký hiệu số',
        hasTextField: false
    },
    {
        id: 'valve_type',
        label: 'Loại van',
        nameLabel: 'Tên loại van',
        namePlaceholder: 'Ví dụ: Van Messer/Phi 6/CB TRẮNG',
        hasNumberField: false,
        hasTextField: false
    },
    {
        id: 'handle_type',
        label: 'Loại quai',
        nameLabel: 'Tên loại quai',
        namePlaceholder: 'Ví dụ: Không quai',
        hasNumberField: false,
        hasTextField: false
    },
    {
        id: 'machine_type',
        label: 'Loại máy',
        nameLabel: 'Tên loại cấu hình',
        namePlaceholder: 'Ví dụ: TM',
        hasNumberField: false,
        hasTextField: false
    },
    {
        id: 'output_type',
        label: 'Đầu phát',
        nameLabel: 'Tên đầu phát',
        namePlaceholder: 'Ví dụ: Tia thường - Dây SD/PC',
        hasNumberField: false,
        hasTextField: true,
        textFieldLabel: 'Mô tả thêm',
        textPlaceholder: 'Nhập mô tả hoặc ghi chú phụ'
    },
    {
        id: 'component_type',
        label: 'Linh kiện',
        nameLabel: 'Tên linh kiện',
        namePlaceholder: 'Ví dụ: Bánh xe',
        hasNumberField: false,
        hasTextField: true,
        textFieldLabel: 'Thông tin bổ sung',
        textPlaceholder: 'Nhập thông tin phụ trợ'
    }
];
