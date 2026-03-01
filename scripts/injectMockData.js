import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function injectMockData() {
    console.log('Injecting mock data for Machine History...');

    const mockOrders = [
        {
            order_code: 'DEMO-213-01',
            customer_category: 'PK',
            customer_name: 'Phòng khám Đa khoa Quốc tế',
            recipient_name: 'Nguyễn Văn A',
            recipient_address: '123 Đường ABC, Quận 1',
            recipient_phone: '0901234567',
            order_type: 'Cho thuê máy (Mẫu)',
            product_type: 'Máy Plasma',
            department: '213',
            status: 'DA_DUYET',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            order_code: 'DEMO-213-02',
            customer_category: 'BV',
            customer_name: 'Bệnh viện Chợ Rẫy',
            recipient_name: 'Trần Thị B',
            recipient_address: '201B Nguyễn Chí Thanh, Q5',
            recipient_phone: '0987654321',
            order_type: 'Thu hồi máy (Mẫu)',
            product_type: 'Máy Plasma',
            department: '213',
            status: 'HOAN_THANH',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            order_code: 'DEMO-122-01',
            customer_category: 'TM',
            customer_name: 'Thẩm mỹ viện Răng Hàm Mặt',
            recipient_name: 'Lê Văn C',
            recipient_address: '456 Đường XYZ, Quận 3',
            recipient_phone: '0912345678',
            order_type: 'Bán đứt (Mẫu)',
            product_type: 'Máy tĩnh mạch',
            department: '1223141',
            status: 'DA_DUYET',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    const { data, error } = await supabase.from('orders').insert(mockOrders);

    if (error) {
        console.error('Error injecting mock data:', error);
    } else {
        console.log('Successfully injected 3 mock orders!');
    }
}

injectMockData();
