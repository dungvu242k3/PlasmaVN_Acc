import { clsx } from 'clsx';
import { Layers, ListFilter, Save, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MATERIAL_CATEGORIES } from '../../constants/materialConstants';
import { supabase } from '../../supabase/config';

export default function MaterialFormModal({ material, onClose, onSuccess }) {
    const isEdit = !!material;
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    const defaultState = {
        category: MATERIAL_CATEGORIES[0].id,
        name: '',
        extra_number: '',
        extra_text: ''
    };

    const [formData, setFormData] = useState(defaultState);

    const currentCategoryDef = useMemo(() => {
        return MATERIAL_CATEGORIES.find(c => c.id === formData.category) || MATERIAL_CATEGORIES[0];
    }, [formData.category]);

    useEffect(() => {
        if (isEdit) {
            setFormData({
                category: material.category || MATERIAL_CATEGORIES[0].id,
                name: material.name || '',
                extra_number: material.extra_number || '',
                extra_text: material.extra_text || ''
            });
        }
    }, [material, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        setFormData({
            ...formData,
            category: e.target.value,
            extra_number: '',
            extra_text: ''
        });
    };

    const handleNumericChange = (field, value) => {
        let raw = value.replace(/\./g, '').replace(/,/g, '.');
        raw = raw.replace(/[^0-9.]/g, '');
        const dots = raw.split('.');
        if (dots.length > 2) raw = dots[0] + '.' + dots.slice(1).join('');
        setFormData(prev => ({ ...prev, [field]: raw }));
    };

    const formatNumber = (val) => {
        if (val === null || val === undefined || val === '') return '';
        const parts = val.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return parts.join(',');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.name.trim()) {
            setErrorMsg('Vui lòng nhập tên vật tư.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                category: formData.category,
                name: formData.name.trim(),
                extra_number: currentCategoryDef.hasNumberField && formData.extra_number !== '' ? Number(formData.extra_number) : null,
                extra_text: currentCategoryDef.hasTextField ? formData.extra_text.trim() : null,
                updated_at: new Date().toISOString()
            };

            if (isEdit) {
                const { error } = await supabase
                    .from('materials')
                    .update(payload)
                    .eq('id', material.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('materials')
                    .insert([payload]);
                if (error) throw error;
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving material:', error);
            setErrorMsg(error.message || 'Có lỗi xảy ra khi lưu vật tư.');
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <>
            <div className={clsx(
                "fixed inset-0 z-[100005] flex justify-end transition-all duration-300",
                isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
                {/* Backdrop */}
                <div
                    className={clsx(
                        "absolute inset-0 bg-black/45 backdrop-blur-sm animate-in fade-in duration-300",
                        isClosing && "animate-out fade-out duration-300"
                    )}
                    onClick={handleClose}
                />

                {/* Panel */}
                <div
                    className={clsx(
                        "relative bg-slate-50 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-full border-l border-slate-200 animate-in slide-in-from-right duration-500",
                        isClosing && "animate-out slide-out-to-right duration-300"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* Header */}
                    <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-[20px] leading-tight font-bold text-slate-900 tracking-tight">
                                    {isEdit ? 'Chỉnh sửa vật tư' : 'Thêm vật tư'}
                                </h3>
                                <p className="text-slate-500 text-[12px] font-semibold mt-0.5">
                                    {isEdit ? `Phân loại: ${currentCategoryDef.label}` : 'Thiết lập danh mục vật tư dùng chung'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-primary hover:text-primary/90 hover:bg-primary/5 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <div className="p-5 sm:p-6 overflow-y-auto bg-slate-50 custom-scrollbar flex-1 min-h-0 pb-20 sm:pb-6">
                        {errorMsg && (
                            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-[13px] font-semibold text-rose-600 flex items-center gap-2">
                                <X className="w-4 h-4 shrink-0" />
                                {errorMsg}
                            </div>
                        )}

                        <form id="materialForm" onSubmit={handleSubmit} className="space-y-6">
                            <div className="rounded-3xl border border-primary/20 bg-white p-5 sm:p-6 space-y-5 shadow-sm [&_label]:text-primary [&_label_svg]:text-primary/80">
                                <div className="flex items-center gap-2.5 pb-3 border-b border-primary/10">
                                    <ListFilter className="w-4 h-4 text-primary" />
                                    <h4 className="text-[18px] !font-extrabold !text-primary">Nhóm vật tư</h4>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-800">
                                        <ListFilter className="w-4 h-4 text-primary/70" />
                                        Chọn nhóm vật tư <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleCategoryChange}
                                        disabled={isEdit}
                                        className={clsx(
                                            "w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all",
                                            isEdit && "cursor-not-allowed opacity-70"
                                        )}
                                    >
                                        {MATERIAL_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-primary/20 bg-white p-5 sm:p-6 space-y-5 shadow-sm [&_label]:text-primary [&_label_svg]:text-primary/80">
                                <div className="flex items-center gap-2.5 pb-3 border-b border-primary/10">
                                    <Layers className="w-4 h-4 text-primary" />
                                    <h4 className="text-[18px] !font-extrabold !text-primary">Thông tin chi tiết vật tư</h4>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-semibold text-slate-800">
                                            {currentCategoryDef.nameLabel} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder={currentCategoryDef.namePlaceholder}
                                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentCategoryDef.hasNumberField && (
                                            <div className="space-y-1.5">
                                                <label className="text-[14px] font-semibold text-slate-800">
                                                    {currentCategoryDef.numberFieldLabel}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formatNumber(formData.extra_number)}
                                                    onChange={(e) => handleNumericChange('extra_number', e.target.value)}
                                                    placeholder={currentCategoryDef.numberPlaceholder}
                                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all"
                                                />
                                            </div>
                                        )}

                                        {currentCategoryDef.hasTextField && (
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-[14px] font-semibold text-slate-800">
                                                    {currentCategoryDef.textFieldLabel}
                                                </label>
                                                <textarea
                                                    name="extra_text"
                                                    value={formData.extra_text}
                                                    onChange={handleChange}
                                                    placeholder={currentCategoryDef.textPlaceholder}
                                                    rows={3}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-semibold text-slate-800 resize-none focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between gap-3 sticky bottom-0 z-20">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-500 hover:text-slate-700 font-semibold text-[15px] transition-colors outline-none"
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            form="materialForm"
                            disabled={isLoading}
                            className="flex-1 sm:flex-none px-6 py-3 bg-primary hover:bg-primary/90 text-white text-[15px] font-bold rounded-2xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 border border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
