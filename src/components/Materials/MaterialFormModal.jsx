import { Layers, ListFilter, Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MATERIAL_CATEGORIES } from '../../constants/materialConstants';
import { supabase } from '../../supabase/config';

export default function MaterialFormModal({ material, onClose, onSuccess }) {
    const isEdit = !!material;
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

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

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-emerald-100 flex items-center justify-between shrink-0 bg-emerald-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">
                                {isEdit ? 'Cập nhật Vật tư' : 'Định nghĩa Vật tư mới'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                                {isEdit ? `Phân loại: ${currentCategoryDef.label}` : 'Thiết lập danh mục vật tư dùng chung'}
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

                    <form id="materialForm" onSubmit={handleSubmit} className="space-y-8">

                        {/* Nhóm vật tư */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                <ListFilter className="w-3.5 h-3.5" />
                                Chọn nhóm vật tư *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleCategoryChange}
                                disabled={isEdit}
                                className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 font-bold text-lg shadow-sm ${isEdit ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} text-emerald-900 transition-all`}
                            >
                                {MATERIAL_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tên vật tư */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                    {currentCategoryDef.nameLabel} *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={currentCategoryDef.namePlaceholder}
                                    className="w-full px-5 py-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 font-bold shadow-sm transition-all text-slate-900 text-lg"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cột Number */}
                                {currentCategoryDef.hasNumberField && (
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                            {currentCategoryDef.numberFieldLabel}
                                        </label>
                                        <input
                                            type="text"
                                            value={formatNumber(formData.extra_number)}
                                            onChange={(e) => handleNumericChange('extra_number', e.target.value)}
                                            placeholder={currentCategoryDef.numberPlaceholder}
                                            className="w-full px-5 py-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 font-bold shadow-sm transition-all text-emerald-700"
                                        />
                                    </div>
                                )}

                                {/* Cột Text */}
                                {currentCategoryDef.hasTextField && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                            {currentCategoryDef.textFieldLabel}
                                        </label>
                                        <textarea
                                            name="extra_text"
                                            value={formData.extra_text}
                                            onChange={handleChange}
                                            placeholder={currentCategoryDef.textPlaceholder}
                                            rows={3}
                                            className="w-full px-5 py-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 font-medium shadow-sm transition-all text-slate-700 resize-none"
                                        />
                                    </div>
                                )}
                            </div>
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
                        form="materialForm"
                        disabled={isLoading}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-emerald-200 transition-all flex items-center gap-2 border border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isEdit ? 'Lưu thay đổi' : 'Lưu hồ sơ Vật tư'}
                    </button>
                </div>

            </div>
        </div>
    );
}
