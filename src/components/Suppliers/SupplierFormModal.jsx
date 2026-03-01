import { Building2, MapPin, Phone, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';

export default function SupplierFormModal({ supplier, onClose, onSuccess }) {
    const isEdit = !!supplier;
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const defaultState = {
        name: '',
        phone: '',
        address: '',
    };

    const [formData, setFormData] = useState(defaultState);

    useEffect(() => {
        if (isEdit) {
            setFormData({
                name: supplier.name || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
            });
        }
    }, [supplier, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.name.trim() || !formData.phone.trim()) {
            setErrorMsg('Vui lòng điền đầy đủ Tên nhà cung cấp và Số điện thoại.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                updated_at: new Date().toISOString()
            };

            if (isEdit) {
                const { error } = await supabase
                    .from('suppliers')
                    .update(payload)
                    .eq('id', supplier.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('suppliers')
                    .insert([payload]);
                if (error) throw error;
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving supplier:', error);
            setErrorMsg(error.message || 'Có lỗi xảy ra khi lưu nhà cung cấp.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-blue-100 flex items-center justify-between shrink-0 bg-blue-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">
                                {isEdit ? 'Cập nhật NCC' : 'Thêm Nhà cung cấp mới'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                                {isEdit ? supplier.name : 'Khởi tạo hồ sơ đối tác cung ứng vật tư'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
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

                    <form id="supplierForm" onSubmit={handleSubmit} className="space-y-8">

                        {/* Tên NCC */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" />
                                Tên nhà cung cấp *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="VD: Công ty TNHH Oxy Việt Nam, Nhà máy cơ khí..."
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-lg shadow-sm transition-all text-slate-900"
                                required
                            />
                        </div>

                        {/* SĐT */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" />
                                Số điện thoại liên hệ *
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="024xxxxxxxx..."
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-lg shadow-sm transition-all text-slate-900"
                                required
                            />
                        </div>

                        {/* Địa chỉ */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                Địa chỉ trụ sở / Kho bãi
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..."
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium text-base shadow-sm transition-all text-slate-900 resize-none"
                            />
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
                        Đóng lại
                    </button>
                    <button
                        type="submit"
                        form="supplierForm"
                        disabled={isLoading}
                        className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-xl shadow-blue-200 transition-all flex items-center gap-2 border border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isEdit ? 'Lưu thay đổi' : 'Xác nhận Thêm mới'}
                    </button>
                </div>

            </div>
        </div>
    );
}
