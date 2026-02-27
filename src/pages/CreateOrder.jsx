import {
    Package,
    Plus
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CUSTOMER_CATEGORIES,
    MOCK_CUSTOMERS,
    ORDER_TYPES,
    PRODUCT_TYPES,
    WAREHOUSES
} from '../constants/orderConstants';
import { supabase } from '../supabase/config';

const CreateOrder = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getNewOrderCode = () => Math.floor(1000 + Math.random() * 9000).toString();

    const initialFormState = {
        orderCode: getNewOrderCode(),
        customerCategory: 'TM',
        warehouse: 'HN',
        customerId: '',
        recipientName: '',
        recipientAddress: '',
        recipientPhone: '',
        orderType: 'THUONG',
        note: '',
        productType: 'BINH',
        quantity: 0,
        department: '',
        promotion: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const resetForm = () => {
        setFormData({
            ...initialFormState,
            orderCode: getNewOrderCode()
        });
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters

        if (value === '') {
            setFormData({ ...formData, quantity: 0 });
            return;
        }

        const parsedValue = parseInt(value, 10);
        setFormData({ ...formData, quantity: parsedValue });
    };

    const handleCustomerChange = (e) => {
        const customerId = parseInt(e.target.value);
        const customer = MOCK_CUSTOMERS.find(c => c.id === customerId);
        if (customer) {
            setFormData({
                ...formData,
                customerId: customer.id,
                recipientName: customer.recipient,
                recipientAddress: customer.address,
                recipientPhone: customer.phone,
                customerCategory: customer.category
            });
        }
    };

    const handleCreateOrder = async () => {
        if (!formData.customerId || !formData.recipientName || !formData.recipientAddress || !formData.recipientPhone || formData.quantity <= 0) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc và số lượng phải lớn hơn 0 (*)');
            return;
        }

        setIsSubmitting(true);
        try {
            const customerName = MOCK_CUSTOMERS.find(c => c.id === formData.customerId)?.name || '';
            const { error } = await supabase
                .from('orders')
                .insert([
                    {
                        order_code: formData.orderCode,
                        customer_category: formData.customerCategory,
                        warehouse: formData.warehouse,
                        customer_name: customerName,
                        recipient_name: formData.recipientName,
                        recipient_address: formData.recipientAddress,
                        recipient_phone: formData.recipientPhone,
                        order_type: formData.orderType,
                        note: formData.note,
                        product_type: formData.productType,
                        quantity: formData.quantity,
                        department: formData.department,
                        promotion_code: formData.promotion,
                        status: 'CHO_DUYET',
                        ordered_by: 'Admin'
                    }
                ]);

            if (error) throw error;

            alert('🎉 Tạo đơn hàng thành công!');
            resetForm(); // Tự động reset form để nhập đơn tiếp theo

        } catch (error) {
            console.error('Error creating order:', error);
            alert('❌ Có lỗi xảy ra: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Main Content Card */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50/30">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                            <Plus className="w-5 h-5" />
                        </div>
                        Thông tin đơn hàng
                    </h3>
                    <p className="text-gray-500 text-xs md:text-sm mt-1 md:ml-10">Vui lòng điền đầy đủ các thông tin bắt buộc được đánh dấu (*)</p>
                </div>

                <div className="p-6 md:p-10 space-y-8 md:space-y-10">
                    {/* Section 1: Thông tin định danh */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">1. Mã đơn hàng (Tự động)</label>
                            <input value={formData.orderCode} disabled className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-2xl font-black text-gray-500 text-base cursor-not-allowed shadow-inner" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">2. Loại khách hàng *</label>
                            <select
                                value={formData.customerCategory}
                                onChange={(e) => setFormData({ ...formData, customerCategory: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base transition-all shadow-sm"
                            >
                                {CUSTOMER_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">3. Kho</label>
                            <select
                                value={formData.warehouse}
                                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base transition-all shadow-sm"
                            >
                                {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Section 2: Thông tin khách hàng & Người nhận */}
                    <div className="p-6 md:p-8 bg-blue-50/40 rounded-[1.5rem] md:rounded-[2.5rem] border border-blue-100 space-y-6 md:space-y-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                <Package className="w-4 h-4" /> 4. Chọn Khách hàng *
                            </label>
                            <select
                                onChange={handleCustomerChange}
                                className="w-full px-5 py-4 bg-white border border-blue-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base shadow-md transition-all cursor-pointer"
                            >
                                <option value="">-- Chọn khách hàng trong hệ thống --</option>
                                {MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">5. Tên người nhận *</label>
                                <input
                                    value={formData.recipientName}
                                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                    placeholder="Hệ thống tự động hiển thị..."
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base shadow-sm transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">7. SĐT người nhận *</label>
                                <input
                                    value={formData.recipientPhone}
                                    onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                                    placeholder="Ví dụ: 0399749111"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base shadow-sm transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">6. Địa chỉ nhận *</label>
                            <input
                                value={formData.recipientAddress}
                                onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                                placeholder="Hệ thống tự động hiển thị..."
                                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base shadow-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Section 3: Chi tiết đơn hàng & Hàng hóa */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                        <div className="space-y-6 md:space-y-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">8. Loại đơn hàng *</label>
                                <select
                                    value={formData.orderType}
                                    onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base transition-all shadow-sm"
                                >
                                    {ORDER_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">9. Ghi chú</label>
                                <textarea
                                    rows="4"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="Thông tin bổ sung để admin duyệt đơn..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium text-base transition-all shadow-sm resize-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">10. Hàng hóa *</label>
                                    <select
                                        value={formData.productType}
                                        onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base transition-all shadow-sm"
                                    >
                                        {PRODUCT_TYPES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">11. Số lượng *</label>
                                    <input
                                        type="text"
                                        value={formatNumber(formData.quantity)}
                                        onChange={handleQuantityChange}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-black text-lg text-blue-700 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">12. Khoa sử dụng máy / Mã máy</label>
                                <input
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="Ví dụ: Mã máy đang sử dụng"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">13. Khuyến mãi (Áp dụng mã)</label>
                                <select
                                    value={formData.promotion}
                                    onChange={(e) => setFormData({ ...formData, promotion: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base transition-all shadow-sm"
                                >
                                    <option value="">-- Không có mã khuyến mãi --</option>
                                    <option value="KMB02">KMB02 - Ưu đãi bình mới</option>
                                    <option value="KM_MAY_01">KM_MAY_01 - Giảm giá máy</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-10 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-gray-400 font-medium italic w-full text-center md:text-left">* Vui lòng kiểm tra kỹ thông tin trước khi nhấn Xác nhận.</p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button
                            onClick={resetForm}
                            className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 bg-white border border-gray-200 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all shadow-sm"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleCreateOrder}
                            disabled={isSubmitting}
                            className={`w-full sm:w-auto px-10 md:px-16 py-4 md:py-5 text-white font-black text-lg rounded-2xl shadow-2xl transition-all ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-blue-200 hover:scale-[1.02] active:scale-95'
                                }`}
                        >
                            {isSubmitting ? 'Đang lưu đơn...' : 'Xác nhận tạo đơn hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOrder;
