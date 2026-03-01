import { CalendarDays, Gift, Save, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';

const CUSTOMER_TYPES = [
    { id: 'TM', label: 'Thương mại (TM)' },
    { id: 'ĐL', label: 'Đại lý (ĐL)' },
    { id: 'Khác', label: 'Khác' },
];

export default function PromotionFormModal({ promotion, onClose, onSuccess }) {
    const isEdit = !!promotion;
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const defaultState = {
        code: '',
        free_cylinders: '',
        start_date: '',
        end_date: '',
        customer_type: CUSTOMER_TYPES[0].id,
    };

    const [formData, setFormData] = useState(defaultState);

    useEffect(() => {
        if (isEdit) {
            setFormData({
                code: promotion.code || '',
                free_cylinders: promotion.free_cylinders || '',
                start_date: promotion.start_date || '',
                end_date: promotion.end_date || '',
                customer_type: promotion.customer_type || CUSTOMER_TYPES[0].id,
            });
        }
    }, [promotion, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, free_cylinders: value === '' ? '' : parseInt(value, 10) }));
    };

    const formatNumber = (val) => {
        if (val === null || val === undefined || val === '') return '';
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.code.trim()) {
            setErrorMsg('Vui lòng nhập Mã khuyến mãi.');
            return;
        }
        if (!formData.free_cylinders || Number(formData.free_cylinders) <= 0) {
            setErrorMsg('Số lượng bình KM phải lớn hơn 0.');
            return;
        }
        if (!formData.start_date || !formData.end_date) {
            setErrorMsg('Vui lòng chọn ngày bắt đầu và kết thúc.');
            return;
        }
        if (formData.end_date < formData.start_date) {
            setErrorMsg('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                code: formData.code.trim().toUpperCase(),
                free_cylinders: Number(formData.free_cylinders),
                start_date: formData.start_date,
                end_date: formData.end_date,
                customer_type: formData.customer_type,
                is_active: isEdit ? promotion.is_active : true,
                updated_at: new Date().toISOString()
            };

            if (isEdit) {
                const { error } = await supabase
                    .from('app_promotions')
                    .update(payload)
                    .eq('id', promotion.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('app_promotions')
                    .insert([payload]);
                if (error) throw error;
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving promotion:', error);
            if (error.code === '23505') {
                setErrorMsg(`Mã khuyến mãi "${formData.code}" đã tồn tại!`);
            } else {
                setErrorMsg(error.message || 'Có lỗi xảy ra khi lưu chương trình khuyến mãi.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-rose-100 flex items-center justify-between shrink-0 bg-rose-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-700">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">
                                {isEdit ? 'Cập nhật Mã KM' : 'Tạo Chương trình KM mới'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                                {isEdit ? `Mã: ${promotion.code}` : 'Thiết lập chính sách ưu đãi bình khí'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-8 overflow-y-auto">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-bold text-rose-600 flex items-center gap-2">
                            <X className="w-5 h-5 shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    <form id="promoForm" onSubmit={handleSubmit} className="space-y-8">

                        {/* Mã và số bình */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" />
                                    Mã Khuyến mãi *
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="VD: KM02, KM_VIP..."
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-500 font-bold text-lg shadow-sm transition-all text-slate-900 uppercase"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <Gift className="w-3.5 h-3.5" />
                                    Số lượng bình KM *
                                </label>
                                <input
                                    type="text"
                                    value={formatNumber(formData.free_cylinders)}
                                    onChange={handleNumericChange}
                                    placeholder="VD: 2.000"
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-500 font-bold text-lg shadow-sm transition-all text-slate-900 text-center"
                                    required
                                />
                            </div>
                        </div>

                        {/* Thời gian */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    Ngày bắt đầu *
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-500 font-bold text-lg shadow-sm transition-all text-slate-900"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    Ngày kết thúc *
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-500 font-bold text-lg shadow-sm transition-all text-slate-900"
                                    required
                                />
                            </div>
                        </div>

                        {/* Đối tượng áp dụng */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                Loại khách hàng áp dụng *
                            </label>
                            <select
                                name="customer_type"
                                value={formData.customer_type}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-500 font-bold text-lg shadow-sm transition-all text-slate-900 appearance-none cursor-pointer"
                            >
                                {CUSTOMER_TYPES.map(type => (
                                    <option key={type.id} value={type.id}>{type.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-400 ml-2 font-medium italic">Chỉ khách hàng thuộc loại này mới được áp dụng khấu trừ tự động.</p>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-slate-100 shrink-0 flex items-center justify-end gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                        disabled={isLoading}
                    >
                        Hủy thoát
                    </button>
                    <button
                        type="submit"
                        form="promoForm"
                        disabled={isLoading}
                        className="px-10 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-black rounded-xl shadow-xl shadow-rose-200 transition-all flex items-center gap-2 border border-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isEdit ? 'Lưu cập nhật' : 'Xác nhận Tạo mã'}
                    </button>
                </div>

            </div>
        </div>
    );
}
