import { Building2, MapPin, Save, User, Warehouse, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WAREHOUSE_STATUSES } from '../../constants/warehouseConstants';
import { supabase } from '../../supabase/config';

export default function WarehouseFormModal({ warehouse, onClose, onSuccess }) {
    const isEdit = !!warehouse;
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const defaultState = {
        name: '',
        manager_name: '',
        address: '',
        capacity: 0,
        status: 'Đang hoạt động',
    };

    const [formData, setFormData] = useState(defaultState);

    useEffect(() => {
        if (isEdit) {
            setFormData({
                name: warehouse.name || '',
                manager_name: warehouse.manager_name || '',
                address: warehouse.address || '',
                capacity: warehouse.capacity || 0,
                status: warehouse.status || 'Đang hoạt động',
            });
        }
    }, [warehouse, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.name.trim() || !formData.manager_name.trim()) {
            setErrorMsg('Vui lòng điền đầy đủ Tên kho và Tên thủ kho.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                name: formData.name.trim(),
                manager_name: formData.manager_name.trim(),
                address: formData.address.trim(),
                capacity: parseInt(formData.capacity) || 0,
                status: formData.status,
                updated_at: new Date().toISOString()
            };

            if (isEdit) {
                const { error } = await supabase
                    .from('warehouses')
                    .update(payload)
                    .eq('id', warehouse.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('warehouses')
                    .insert([payload]);
                if (error) throw error;
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving warehouse:', error);
            setErrorMsg(error.message || 'Có lỗi xảy ra khi lưu thông tin kho.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-amber-100 flex items-center justify-between shrink-0 bg-amber-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white">
                            <Warehouse className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">
                                {isEdit ? 'Cập nhật Kho hàng' : 'Thêm Cơ sở Kho mới'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                                {isEdit ? `Kho: ${warehouse.name}` : 'Mở rộng mạng lưới lưu trữ và vận hành'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
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

                    <form id="warehouseForm" onSubmit={handleSubmit} className="space-y-8">

                        {/* Định danh và Thủ kho */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" />
                                    Tên cơ sở kho *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="VD: Kho trung tâm, Kho Đông Anh..."
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 font-bold text-lg shadow-sm transition-all text-slate-900"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    Thủ kho phụ trách *
                                </label>
                                <input
                                    type="text"
                                    name="manager_name"
                                    value={formData.manager_name}
                                    onChange={handleChange}
                                    placeholder="Tên nhân sự quản lý trực tiếp"
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 font-bold text-lg shadow-sm transition-all text-slate-900"
                                    required
                                />
                            </div>
                        </div>

                        {/* Địa chỉ và Sức chứa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Địa chỉ kho hàng
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Vị trí bến bãi, nhà xưởng..."
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 font-bold text-base shadow-sm transition-all text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <Warehouse className="w-3.5 h-3.5" />
                                    Sức chứa (Vỏ bình)
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 font-black text-lg shadow-sm transition-all text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                Tình trạng vận hành *
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {WAREHOUSE_STATUSES.map(status => (
                                    <button
                                        key={status.id}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, status: status.label }))}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm border transition-all ${formData.status === status.label
                                                ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-100'
                                                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                                            }`}
                                    >
                                        {status.label}
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
                        form="warehouseForm"
                        disabled={isLoading}
                        className="px-12 py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-black rounded-xl shadow-xl shadow-amber-200 transition-all flex items-center gap-3 border border-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isEdit ? 'Lưu thay đổi' : 'Xác nhận Thêm kho'}
                    </button>
                </div>

            </div>
        </div>
    );
}
