import XLSX from 'xlsx';

try {
    const headers = [
        'Mã máy (Serial)',
        'Loại máy (BV/TM/FM/IOT)',
        'Tài khoản máy',
        'Bluetooth MAC',
        'Phiên bản',
        'Thể tích bình',
        'Loại khí',
        'Loại van',
        'Loại đầu phát',
        'Bộ phận phụ trách',
        'Kho quản lý',
        'Khách hàng đang sử dụng máy',
    ];

    const exampleData = [
        {
            'Mã máy (Serial)': 'PLT-25D1-50-TM',
            'Loại máy (BV/TM/FM/IOT)': 'TM',
            'Tài khoản máy': 'ACC-001',
            'Bluetooth MAC': '00:1A:2B:3C:4D:5E',
            'Phiên bản': 'V1.0',
            'Thể tích bình': 'Bình 4L/ CGA870',
            'Loại khí': 'ArgonMed',
            'Loại van': 'Van Messer',
            'Loại đầu phát': 'Tia thường',
            'Bộ phận phụ trách': 'Kỹ thuật',
            'Kho quản lý': 'Kho tổng',
            'Khách hàng đang sử dụng máy': 'Bệnh viện Đa khoa Tỉnh',
        },
    ];

    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Import Máy');
    const filePath = 'C:/Users/dungv/.gemini/antigravity/brain/c25824d0-7ab7-4ae4-a5e7-97c1d070c695/mau_import_may_moc.xlsx';
    XLSX.writeFile(wb, filePath);
    console.log('File created successfully at: ' + filePath);
} catch (err) {
    console.error('ERROR OCCURRED:');
    console.error(err);
    process.exit(1);
}
