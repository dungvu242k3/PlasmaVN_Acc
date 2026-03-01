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

async function runSeed() {
    console.log('🚀 Bắt đầu quá trình nạp nhanh 50 mã vỏ bình vào Kho để tiện TEST...');

    try {
        const testCylinders = [];

        for (let i = 1; i <= 50; i++) {
            const payload = {
                serial_number: `B-0${i.toString().padStart(2, '0')}`, // Mã vạch B-001 -> B-050
                status: 'sẵn sàng',
                net_weight: 15.5,
                category: i % 2 === 0 ? 'TM' : 'BV',
                volume: '40L',
                gas_type: 'Oxy Y Tế',
                valve_type: 'Van Chuẩn',
                handle_type: 'Có quai',
            };

            testCylinders.push(payload);
        }

        console.log(`⏳ Đang Insert ${testCylinders.length} Dữ liệu...`);
        const { data, error } = await supabase
            .from('cylinders')
            .upsert(testCylinders, { onConflict: 'serial_number' }) // Nếu trùng mã thì ghi đè
            .select();

        if (error) {
            throw new Error('❌ Insert Lỗi SQL: ' + error.message);
        }

        console.log(`✅ Thành công! Đã tạo hoặc cập nhật xong 50 vỏ bình (Mã từ B-001 đến B-050).`);
        console.log(`-----------------------------------------------`);
        console.log('💡 HƯỚNG DẪN TEST DÀNH CHO THỦ KHO:');
        console.log(' - Đơn hàng của bạn đang yêu cầu 16 bình.');
        console.log(' - Bạn hãy copy chính xác đoạn text sau (từ B-001 đến B-016 cách nhau bằng dấu phẩy) và dán vào ô nhập mã RFID trên Website nhé:');
        console.log(`\nB-001, B-002, B-003, B-004, B-005, B-006, B-007, B-008, B-009, B-010, B-011, B-012, B-013, B-014, B-015, B-016\n`);

    } catch (error) {
        console.error(error.message);
    }
}

runSeed();
