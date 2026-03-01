import { MapPin, Phone, Save, Truck, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SHIPPING_TYPES } from '../../constants/shipperConstants';
import { supabase } from '../../supabase/config';

export default function ShipperFormModal({ shipper, onClose, onSuccess }) {
    const isEdit = !!shipper;
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const defaultState = {
        name: '',
        shipping_type: SHIPPING_TYPES[0].id,
        manager_name: '',
        phone: '',
        address: '',
        status: 'Đang hoạt động',
    };

    const [formData, setFormData] = useState(defaultState);

    useEffect(() => {
        if (isEdit) {
            setFormData({
                name: shipper.name || '',
                shipping_type: shipper.shipping_type || SHIPPING_TYPES[0].id,
                manager_name: shipper.manager_name || '',
                phone: shipper.phone || '',
                address: shipper.address || '',
                status: shipper.status || 'Đang hoạt động',
            });
        }
    }, [shipper, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.name.trim() || !formData.manager_name.trim() || !formData.phone.trim()) {
            setErrorMsg('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                name: formData.name.trim(),
                shipping_type: formData.shipping_type,
                manager_name: formData.manager_name.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                status: formData.status,
                updated_at: new Date().toISOString()
            };

            if (isEdit) {
                const { error } = await supabase
                    .from('shippers')
                    .update(payload)
                    .eq('id', shipper.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('shippers')
                    .insert([payload]);
                if (error) throw error;
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving shipper:', error);
            setErrorMsg(error.message || 'Có lỗi xảy ra khi lưu đối tác vận chuyển.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-blue-100 flex items-center justify-between shrink-0 bg-blue-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">
                                {isEdit ? 'Cập nhật Đối tác' : 'Thêm Đối tác vận chuyển'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                                {isEdit ? shipper.name : 'Đăng ký thông tin nhà xe / đơn vị vận tải mới'}
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

                    <form id="shipperForm" onSubmit={handleSubmit} className="space-y-8">

                        {/* Tên đơn vị */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5" />
                                    Tên đơn vị vận chuyển *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="VD: J&T, GHTK, Nhà xe Thanh Tùng..."
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base shadow-sm transition-all text-slate-900"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                    Loại hình vận tải
                                </label>
                                <select
                                    name="shipping_type"
                                    value={formData.shipping_type}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base shadow-sm transition-all text-slate-900 appearance-none cursor-pointer"
                                >
                                    {SHIPPING_TYPES.map(type => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Quản lý và SĐT */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    Người quản lý / Tài xế *
                                </label>
                                <input
                                    type="text"
                                    name="manager_name"
                                    value={formData.manager_name}
                                    onChange={handleChange}
                                    placeholder="Tên người phụ trách trực tiếp"
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base shadow-sm transition-all text-slate-900"
                                    required
                                />
                            </div>
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
                                    placeholder="03xxxxxxxx..."
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base shadow-sm transition-all text-slate-900"
                                    required
                                />
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                Địa chỉ văn phòng / Bến bãi
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Số nhà, đường, tỉnh/thành..."
                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-base shadow-sm transition-all text-slate-900"
                            />
                        </div>

                        {/* Trạng thái */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                Trạng thái hợp tác
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {['Đang hoạt động', 'Tạm ngưng', 'Ngừng hợp tác'].map(status => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, status }))}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm border transition-all ${formData.status === status
                                                ? 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-100'
                                                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
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
                        Đóng lại
                    </button>
                    <button
                        type="submit"
                        form="shipperForm"
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
