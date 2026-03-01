import {
    ActivitySquare,
    CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    CYLINDER_STATUSES,
    CYLINDER_VOLUMES,
    GAS_TYPES,
    HANDLE_TYPES,
    MACHINE_TYPES,
    VALVE_TYPES
} from '../constants/machineConstants';
import { supabase } from '../supabase/config';

const CreateCylinder = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const editCylinder = state?.cylinder;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultState = {
        serial_number: '',
        status: 'sẵn sàng',
        net_weight: '',
        category: 'BV',
        volume: 'bình 4L/ CGA870',
        gas_type: 'AirMAC',
        valve_type: 'Van Messer/Phi 6/ CB Trắng',
        handle_type: 'Có quai'
    };

    const initialFormState = editCylinder || defaultState;
    const [formData, setFormData] = useState(initialFormState);

    const handleCreateCylinder = async () => {
        if (!formData.serial_number) {
            alert('Vui lòng điền mã Serial (*) bắt buộc');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.net_weight) delete payload.net_weight;

            if (editCylinder) {
                // Remove readonly/system fields before update to prevent errors
                delete payload.id;
                delete payload.created_at;
                delete payload.updated_at;
                const { error } = await supabase
                    .from('cylinders')
                    .update(payload)
                    .eq('id', editCylinder.id);

                if (error) throw error;
                alert('🎉 Cập nhật vỏ bình thành công!');
            } else {
                const { error } = await supabase
                    .from('cylinders')
                    .insert([payload]);

                if (error) throw error;
                alert('🎉 Đã thêm vỏ bình mới thành công!');
            }

            navigate('/danh-sach-binh');
        } catch (error) {
            console.error('Error creating cylinder:', error);
            if (error.code === '23505') {
                alert(`❌ Lỗi: RFID Serial "${formData.serial_number}" đã tồn tại trên hệ thống.`);
            } else {
                alert('❌ Có lỗi xảy ra: ' + error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
    };

    const formatNumber = (val) => {
        if (val === null || val === undefined || val === '') return '';
        const parts = val.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return parts.join(',');
    };

    const handleNumericChange = (field, value) => {
        // Convert from Vietnamese display format (1.000,50) to standard float (1000.50)
        let raw = value.replace(/\./g, '').replace(/,/g, '.');
        raw = raw.replace(/[^0-9.]/g, '');

        // Ensure only one decimal point
        const dots = raw.split('.');
        if (dots.length > 2) raw = dots[0] + '.' + dots.slice(1).join('');

        setFormData(prev => ({ ...prev, [field]: raw }));
    };

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto font-sans min-h-screen noise-bg">
            {/* Animated Blobs */}
            <div className="blob blob-emerald w-[400px] h-[400px] -top-20 -right-20 opacity-20"></div>
            <div className="blob blob-blue w-[300px] h-[300px] bottom-1/3 -left-20 opacity-15"></div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 md:mb-8 relative z-10">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <ActivitySquare className="w-8 h-8 text-teal-600" />
                    {editCylinder ? 'Cập nhật vỏ bình / bình khí' : 'Thêm vỏ bình / bình khí mới'}
                </h1>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-teal-900/10 border border-white overflow-hidden relative z-10">
                <div className="p-6 md:p-10 space-y-10 md:space-y-12">
                    {/* Section 1: Thông tin cơ sở */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 md:pb-4">
                            <span className="w-8 h-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center font-bold">1</span>
                            <h3 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight">Thông tin cơ sở vỏ bình</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            <div className="space-y-2 lg:col-span-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Serial RFID *</label>
                                <input
                                    value={formData.serial_number}
                                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                                    placeholder="QR04116"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 font-bold text-base shadow-sm transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Trạng thái *</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 font-bold text-base shadow-sm cursor-pointer text-gray-900"
                                >
                                    {CYLINDER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Thể loại *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 font-bold text-base shadow-sm cursor-pointer text-gray-900"
                                >
                                    {MACHINE_TYPES.filter(t => t.id === 'BV' || t.id === 'TM').map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Thông số kỹ thuật */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 md:pb-4">
                            <span className="w-8 h-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center font-bold">2</span>
                            <h3 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight">Cấu hình & Thông số</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Khối lượng tịnh (kg)</label>
                                <input
                                    type="text"
                                    value={formatNumber(formData.net_weight)}
                                    onChange={(e) => handleNumericChange('net_weight', e.target.value)}
                                    placeholder="Ví dụ: 12,5"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 font-bold shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Thể tích</label>
                                <select
                                    value={formData.volume}
                                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 font-bold shadow-sm cursor-pointer text-sm"
                                >
                                    {CYLINDER_VOLUMES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Loại khí</label>
                                <select
                                    value={formData.gas_type}
                                    onChange={(e) => setFormData({ ...formData, gas_type: e.target.value })}
                                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 font-bold shadow-sm cursor-pointer text-sm"
                                >
                                    {GAS_TYPES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Loại van</label>
                                <select
                                    value={formData.valve_type}
                                    onChange={(e) => setFormData({ ...formData, valve_type: e.target.value })}
                                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 font-bold shadow-sm cursor-pointer text-sm"
                                >
                                    {VALVE_TYPES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Loại quai</label>
                                <select
                                    value={formData.handle_type}
                                    onChange={(e) => setFormData({ ...formData, handle_type: e.target.value })}
                                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 font-bold shadow-sm cursor-pointer text-sm"
                                >
                                    {HANDLE_TYPES.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 md:p-10 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-gray-400 text-sm font-medium italic">* Kiểm tra kỹ mã QR RFID trên vỏ bình trước khi lưu.</p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button
                            onClick={resetForm}
                            className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all shadow-sm text-center"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleCreateCylinder}
                            disabled={isSubmitting}
                            className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-white text-lg shadow-xl shadow-teal-100 transition-all flex justify-center items-center gap-3 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 active:scale-95'}`}
                        >
                            {isSubmitting ? 'Đang lưu...' : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    {editCylinder ? 'Cập nhật hồ sơ Bình' : 'Lưu hồ sơ Bình'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCylinder;
