import { CalendarDays, Gift, Save, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { supabase } from '../../supabase/config';
import { CUSTOMER_CATEGORIES } from '../../constants/orderConstants';

export default function PromotionFormModal({ promotion, onClose, onSuccess }) {
    const isEdit = !!promotion;
    const [isLoading, setIsLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const defaultState = {
        code: '',
        free_cylinders: '',
        start_date: '',
        end_date: '',
        customer_type: CUSTOMER_CATEGORIES[0].id,
    };

    const [formData, setFormData] = useState(defaultState);

    useEffect(() => {
        if (isEdit) {
            setFormData({
                code: promotion.code || '',
                free_cylinders: promotion.free_cylinders || '',
                start_date: promotion.start_date || '',
                end_date: promotion.end_date || '',
                customer_type: promotion.customer_type || CUSTOMER_CATEGORIES[0].id,
            });
        }
    }, [promotion, isEdit]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

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

    const renderContent = (
        <div className={clsx(
            "fixed inset-0 z-[100005] flex justify-end transition-all duration-300",
            isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
            {/* Backdrop */}
            <div 
                className={clsx(
                    "absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300",
                    isClosing && "animate-out fade-out duration-300"
                )}
                onClick={handleClose}
            />

            {/* Panel */}
            <div 
                className={clsx(
                    "relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-500 ease-out",
                    isClosing && "animate-out slide-out-to-right duration-300"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-[17px] font-black text-slate-900 tracking-tight leading-none mb-1.5 uppercase">
                                {isEdit ? 'Chỉnh sửa KM' : 'Thêm mới KM'}
                            </h3>
                            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                {isEdit ? `Mã: ${promotion.code}` : 'Thiết lập chính sách ưu đãi'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50/30">
                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[13px] font-bold text-red-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <X className="w-4 h-4 shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    <form id="promoForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-5 shadow-sm">
                            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-50">
                                <Tag className="w-4 h-4 text-primary" />
                                <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-wide">Thông tin khuyến mãi</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700">
                                        Mã khuyến mãi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="VD: KM02, KM_VIP..."
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 uppercase focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700">
                                        Số lượng bình KM <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formatNumber(formData.free_cylinders)}
                                        onChange={handleNumericChange}
                                        placeholder="VD: 2.000"
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-5 shadow-sm">
                            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-50">
                                <CalendarDays className="w-4 h-4 text-primary" />
                                <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-wide">Thời gian & đối tượng</h4>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700">
                                            Ngày bắt đầu <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700">
                                            Ngày kết thúc <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-700">Loại khách hàng áp dụng <span className="text-red-500">*</span></label>
                                    <select
                                        name="customer_type"
                                        value={formData.customer_type}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all"
                                    >
                                        {CUSTOMER_CATEGORIES.map(type => (
                                            <option key={type.id} value={type.id}>{type.label}</option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-400 font-bold italic">* Khấu trừ tự động cho khách hàng thuộc loại này.</p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] z-10">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 font-bold text-[14px] transition-all uppercase tracking-widest"
                        disabled={isLoading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        form="promoForm"
                        disabled={isLoading}
                        className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white text-[12px] font-black rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isEdit ? 'Lưu thay đổi' : 'Tạo khuyến mãi'}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(renderContent, document.body);
}
