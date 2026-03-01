import {
    CalendarDays,
    Gift,
    Save,
    Tag
} from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';

const CUSTOMER_TYPES = [
    { id: 'TM', label: 'Thương mại (TM)' },
    { id: 'ĐL', label: 'Đại lý (ĐL)' },
    { id: 'Khác', label: 'Khác' },
];

const INITIAL_FORM_STATE = {
    code: '',
    free_cylinders: '',
    start_date: '',
    end_date: '',
    customer_type: CUSTOMER_TYPES[0].id,
};

const CreatePromotion = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const editPromo = state?.promo;

    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(editPromo ? {
        code: editPromo.code,
        free_cylinders: editPromo.free_cylinders,
        start_date: editPromo.start_date,
        end_date: editPromo.end_date,
        customer_type: editPromo.customer_type,
    } : INITIAL_FORM_STATE);

    const handleReset = () => {
        setFormData(editPromo ? {
            code: editPromo.code,
            free_cylinders: editPromo.free_cylinders,
            start_date: editPromo.start_date,
            end_date: editPromo.end_date,
            customer_type: editPromo.customer_type,
        } : INITIAL_FORM_STATE);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const formatNumber = (val) => {
        if (val === null || val === undefined || val === '') return '';
        const parts = val.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return parts.join(',');
    };

    const handleNumericChange = (field, value) => {
        const rawValue = value.replace(/\D/g, '');
        if (rawValue === '') {
            setFormData(prev => ({ ...prev, [field]: '' }));
            return;
        }
        setFormData(prev => ({ ...prev, [field]: parseInt(rawValue, 10) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (!formData.code.trim()) return alert('Vui lòng nhập Mã khuyến mãi!');
        if (!formData.free_cylinders || Number(formData.free_cylinders) <= 0) return alert('Số lượng bình KM phải lớn hơn 0!');
        if (!formData.start_date || !formData.end_date) return alert('Vui lòng chọn ngày bắt đầu và kết thúc!');
        if (formData.end_date < formData.start_date) return alert('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!');

        setSaving(true);
        try {
            const payload = {
                code: formData.code.trim().toUpperCase(),
                free_cylinders: Number(formData.free_cylinders),
                start_date: formData.start_date,
                end_date: formData.end_date,
                customer_type: formData.customer_type,
                is_active: editPromo ? editPromo.is_active : true,
            };

            if (editPromo) {
                const { error } = await supabase
                    .from('app_promotions')
                    .update(payload)
                    .eq('id', editPromo.id);
                if (error) throw error;
                alert('Cập nhật mã khuyến mãi thành công!');
                navigate('/khuyen-mai');
            } else {
                const { error } = await supabase
                    .from('app_promotions')
                    .insert([payload]);
                if (error) throw error;
                alert('Tạo mã khuyến mãi thành công!');
                handleReset();
            }
        } catch (error) {
            console.error('Error creating promotion:', error);
            if (error.code === '23505') {
                alert(`Mã khuyến mãi "${formData.code}" đã tồn tại! Vui lòng đặt tên khác.`);
            } else {
                alert('Có lỗi xảy ra khi tạo mã khuyến mãi.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-[900px] mx-auto font-sans min-h-screen noise-bg">
            {/* Animated Blobs */}
            <div className="blob blob-rose w-[350px] h-[350px] -top-20 -right-20 opacity-20"></div>
            <div className="blob blob-amber w-[300px] h-[300px] bottom-1/3 -left-20 opacity-15"></div>

            {/* Header */}
            <div className="mb-8 relative z-10">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <Gift className="w-8 h-8 text-rose-600" />
                    {editPromo ? 'Cập nhật Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi mới'}
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Thiết lập thông tin mã khuyến mãi bình cho khách hàng hoặc đại lý</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-rose-900/10 border border-white overflow-hidden relative z-10">
                    <div className="p-6 md:p-10 space-y-8">

                        {/* Row 1: Mã KM + Số bình */}
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" />
                                    Mã Khuyến mãi *
                                </label>
                                <input
                                    value={formData.code}
                                    onChange={(e) => handleChange('code', e.target.value)}
                                    placeholder="VD: KM02, KM_VIP..."
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-lg shadow-sm transition-all text-gray-900 uppercase"
                                />
                                <p className="text-xs text-gray-400 ml-2 font-medium">Kế toán tự đặt tên phù hợp với chương trình</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <Gift className="w-3.5 h-3.5" />
                                    Số lượng bình KM *
                                </label>
                                <input
                                    type="text"
                                    value={formatNumber(formData.free_cylinders)}
                                    onChange={(e) => handleNumericChange('free_cylinders', e.target.value)}
                                    placeholder="VD: 2.000"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-lg shadow-sm transition-all text-gray-900"
                                />
                                <p className="text-xs text-gray-400 ml-2 font-medium">Số bình khấu trừ cho khách khi áp dụng mã này</p>
                            </div>
                        </div>

                        {/* Row 2: Ngày bắt đầu + kết thúc */}
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    Ngày bắt đầu *
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => handleChange('start_date', e.target.value)}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-lg shadow-sm transition-all text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    Ngày kết thúc *
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => handleChange('end_date', e.target.value)}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-lg shadow-sm transition-all text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Row 3: Loại khách hàng */}
                        <div className="space-y-2 max-w-md">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                Loại khách hàng *
                            </label>
                            <select
                                value={formData.customer_type}
                                onChange={(e) => handleChange('customer_type', e.target.value)}
                                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-lg shadow-sm transition-all text-gray-900 appearance-none cursor-pointer"
                            >
                                {CUSTOMER_TYPES.map(type => (
                                    <option key={type.id} value={type.id}>{type.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 ml-2 font-medium">Chỉ khách hàng thuộc loại này mới được áp dụng mã</p>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="bg-gray-50 border-t border-gray-100 px-6 md:px-10 py-6 flex flex-col md:flex-row justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-8 py-3.5 border border-gray-200 bg-white text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:shadow-lg transition-all shadow-blue-200 shadow-md disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Đang lưu...' : editPromo ? 'Cập nhật Mã KM' : 'Tạo Mã KM'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreatePromotion;
