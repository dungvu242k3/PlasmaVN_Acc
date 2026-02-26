import {
    ArrowLeft,
    CheckCircle2,
    Warehouse
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    WAREHOUSE_NAMES,
    WAREHOUSE_STATUSES
} from '../constants/warehouseConstants';
import { supabase } from '../supabase/config';

const CreateWarehouse = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialFormState = {
        name: 'Hà Nội',
        manager_name: '',
        address: '',
        capacity: '',
        status: 'Đang hoạt động'
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleCreateWarehouse = async () => {
        if (!formData.name || !formData.manager_name || !formData.address || !formData.capacity) {
            alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
            return;
        }

        setIsSubmitting(true);
        try {
            // Convert capacity to number
            const payload = {
                ...formData,
                capacity: parseInt(formData.capacity, 10)
            };

            const { error } = await supabase
                .from('warehouses')
                .insert([payload]);

            if (error) throw error;

            alert('🎉 Đã thêm kho hàng mới thành công!');
            navigate('/danh-sach-kho');
        } catch (error) {
            console.error('Error creating warehouse:', error);
            if (error.code === '23505') {
                alert(`❌ Lỗi: Tên kho "${formData.name}" đã tồn tại trên hệ thống.`);
            } else {
                alert('❌ Có lỗi xảy ra: ' + error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto font-sans bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 md:mb-8">
                <button
                    onClick={() => navigate('/danh-sach-kho')}
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all shadow-sm self-start sm:self-auto"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <Warehouse className="w-8 h-8 text-amber-600" />
                    Thêm kho hàng mới
                </h1>
            </div>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-10 space-y-10 md:space-y-12">
                    {/* Section 1: Thông tin cơ bản */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 md:pb-4">
                            <span className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">1</span>
                            <h3 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight">Thông tin cơ sở Kho</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Tên kho *</label>
                                <select
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 font-bold text-base shadow-sm cursor-pointer text-gray-900"
                                >
                                    {WAREHOUSE_NAMES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Thủ kho *</label>
                                <input
                                    value={formData.manager_name}
                                    onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                                    placeholder="Nguyễn Văn B"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 font-bold shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Trạng thái *</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 font-bold text-base shadow-sm cursor-pointer text-gray-900"
                                >
                                    {WAREHOUSE_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Vị trí & Quy mô */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 md:pb-4">
                            <span className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">2</span>
                            <h3 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight">Vị trí & Quy mô</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Địa chỉ (Text) *</label>
                                <input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Ví dụ: Văn Quán - Hà Nội"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 font-bold shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Sức chứa (Số lượng vỏ bình) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    placeholder="5000"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 font-bold shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 md:p-10 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-gray-400 text-sm font-medium italic">* Kiểm tra kỹ các thông tin trước khi lưu.</p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/danh-sach-kho')}
                            className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all shadow-sm text-center"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleCreateWarehouse}
                            disabled={isSubmitting}
                            className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-white text-lg shadow-xl shadow-amber-100 transition-all flex justify-center items-center gap-3 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 active:scale-95'}`}
                        >
                            {isSubmitting ? 'Đang lưu...' : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Lưu hồ sơ Kho
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateWarehouse;
