import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Lỗi: Thiếu cấu hình Supabase VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong file .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
    console.log('🚀 Bắt đầu quá trình tạo 10 đơn hàng (data test) và tự kiểm tra lỗi...');

    try {
        // Lấy thử 3 khách hàng đầu tiên trong danh sách làm data mẫu
        const { data: customers, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .limit(3);

        if (customerError) throw new Error('Không lấy được khách hàng: ' + customerError.message);

        if (!customers || customers.length === 0) {
            console.warn('⚠️ Cảnh báo: DB chưa có Khách hàng thực tế. Sẽ dùng tên mặc định.');
        }

        const testOrders = [];

        for (let i = 1; i <= 10; i++) {
            // Sinh mã ngẫu nhiên 
            const orderCode = `TEST_${Math.floor(10000 + Math.random() * 90000)}_${i}`;

            // Random KH
            const customer = customers && customers.length > 0
                ? customers[i % customers.length]
                : { name: 'KH Test ' + i, category: 'TM', phone: '09xx', address: 'HN', recipient: 'Ng. Test' };

            // Data payload chuẩn form Order
            const payload = {
                order_code: orderCode,
                customer_category: customer.category || 'TM',
                warehouse: 'HN',
                customer_name: customer.name || 'Khách Demo',
                recipient_name: customer.representative_name || customer.recipient || 'Test Representative',
                recipient_address: customer.shipping_address || customer.address || 'Hà Nội',
                recipient_phone: customer.phone || '0988123456',
                order_type: i % 2 === 0 ? 'THUONG' : 'DEMO',
                product_type: i % 3 === 0 ? 'MAY' : 'BINH',
                quantity: Math.floor(i * 1.5) + 1,
                department: 'Khoa Ngoại',
                status: i % 2 === 0 ? 'CHO_DUYET' : 'DA_DUYET',
                ordered_by: 'Auto_Test_Script',
                note: 'Đơn hàng tự sinh để check lỗi hệ thống'
            };

            testOrders.push(payload);
        }

        // Push array in single request or multiple
        console.log(`⏳ Đang Insert ${testOrders.length} Dữ liệu...`);
        const { data, error } = await supabase
            .from('orders')
            .insert(testOrders)
            .select();

        if (error) {
            throw new Error('❌ Insert Lỗi SQL: ' + error.message);
        }

        console.log(`✅ Thành công! Đã tạo xong ${data.length} đơn hàng.`);
        console.log(`-----------------------------------------------`);
        console.log('📝 Dữ liệu mẫu (3 record đầu):');
        data.slice(0, 3).forEach(d => {
            console.log(` - ID: ${d.id} | Mã: ${d.order_code} | KH: ${d.customer_name} | Trạng thái: ${d.status}`);
        });
        console.log(`-----------------------------------------------`);
        console.log(`Bạn có thể quay lại UI Web trang Danh sách -> Refresh để xem đơn hàng đã nhảy lên.`);

    } catch (error) {
        console.error(error.message);
    }
}

runTest();
