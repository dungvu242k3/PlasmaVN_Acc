import {
    CheckCircle2,
    MonitorIcon
} from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    CYLINDER_VOLUMES,
    EMISSION_HEAD_TYPES,
    GAS_TYPES,
    MACHINE_STATUSES,
    MACHINE_TYPES,
    VALVE_TYPES
} from '../constants/machineConstants';
import { WAREHOUSES } from '../constants/orderConstants';
import { supabase } from '../supabase/config';

const CreateMachine = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const editMachine = state?.machine;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultState = {
        serial_number: '',
        machine_account: '',
        status: 'chưa xác định',
        warehouse: '',
        bluetooth_mac: '',
        machine_type: 'BV',
        version: '',
        cylinder_volume: 'không',
        gas_type: 'Air',
        valve_type: 'không',
        emission_head_type: 'không'
    };

    const initialFormState = editMachine || defaultState;
    const [formData, setFormData] = useState(initialFormState);

    const handleSerialChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            serial_number: val,
            machine_account: val // Auto-fill Account with Serial
        }));
    };

    const handleCreateMachine = async () => {
        if (!formData.serial_number || !formData.machine_type) {
            alert('Vui lòng điền các trường bắt buộc (*)');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (editMachine) {
                delete payload.id;
                delete payload.created_at;
                delete payload.updated_at;

                const { error } = await supabase
                    .from('machines')
                    .update(payload)
                    .eq('id', editMachine.id);

                if (error) throw error;
                alert('🎉 Đã cập nhật máy thành công!');
            } else {
                const { error } = await supabase
                    .from('machines')
                    .insert([payload]);

                if (error) throw error;
                alert('🎉 Đã thêm máy mới thành công!');
            }

            navigate('/danh-sach-may');
        } catch (error) {
            console.error('Error creating machine:', error);
            if (error.code === '23505') {
                alert(`❌ Lỗi: Serial "${formData.serial_number}" đã tồn tại.`);
            } else {
                alert('❌ Lỗi: ' + error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
    };

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto font-sans min-h-screen noise-bg">
            {/* Animated Blobs */}
            <div className="blob blob-violet w-[400px] h-[400px] -top-20 -left-20 opacity-20"></div>
            <div className="blob blob-indigo w-[350px] h-[350px] bottom-1/4 -right-20 opacity-15"></div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 md:mb-8 relative z-10">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <MonitorIcon className="w-8 h-8 text-indigo-600" />
                    {editMachine ? 'Cập nhật thiết bị hệ thống' : 'Thêm máy mới vào hệ thống'}
                </h1>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-white overflow-hidden relative z-10">
                <div className="p-6 md:p-10 space-y-10 md:space-y-12">
                    {/* Section 1: Định danh máy */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 md:pb-4">
                            <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">1</span>
                            <h3 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight">Định danh thiết bị</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Serial (Mã máy) *</label>
                                <input
                                    value={formData.serial_number}
                                    onChange={handleSerialChange}
                                    placeholder="PLT-25D1-50-TM"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold text-base shadow-sm transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Tài khoản máy</label>
                                <input
                                    value={formData.machine_account}
                                    disabled
                                    placeholder="Tự động theo Serial..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-500 text-base cursor-not-allowed shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Trạng thái *</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold text-base shadow-sm cursor-pointer"
                                >
                                    {MACHINE_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Kho quản lý</label>
                                <select
                                    value={formData.warehouse}
                                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold text-base shadow-sm cursor-pointer"
                                >
                                    <option value="">-- Chưa xác định --</option>
                                    {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Cấu hình kỹ thuật */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 md:pb-4">
                            <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">2</span>
                            <h3 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight">Thông tin kỹ thuật</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">BluetoothMAC</label>
                                <input
                                    value={formData.bluetooth_mac}
                                    onChange={(e) => setFormData({ ...formData, bluetooth_mac: e.target.value })}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Loại máy *</label>
                                <select
                                    value={formData.machine_type}
                                    onChange={(e) => setFormData({ ...formData, machine_type: e.target.value })}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold cursor-pointer"
                                >
                                    {MACHINE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phiên bản</label>
                                <input
                                    value={formData.version}
                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Phụ kiện & Bình khí */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 md:pb-4">
                            <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">3</span>
                            <h3 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight">Phụ kiện & Bình khí</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Thể tích bình</label>
                                <select
                                    value={formData.cylinder_volume}
                                    onChange={(e) => setFormData({ ...formData, cylinder_volume: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-sm cursor-pointer"
                                >
                                    {CYLINDER_VOLUMES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Loại khí</label>
                                <select
                                    value={formData.gas_type}
                                    onChange={(e) => setFormData({ ...formData, gas_type: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-sm cursor-pointer"
                                >
                                    {GAS_TYPES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Loại van</label>
                                <select
                                    value={formData.valve_type}
                                    onChange={(e) => setFormData({ ...formData, valve_type: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-sm cursor-pointer"
                                >
                                    {VALVE_TYPES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Loại đầu phát</label>
                                <select
                                    value={formData.emission_head_type}
                                    onChange={(e) => setFormData({ ...formData, emission_head_type: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-sm cursor-pointer"
                                >
                                    {EMISSION_HEAD_TYPES.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 md:p-10 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-gray-400 text-sm font-medium italic">* Vui lòng kiểm tra mã Serial trước khi lưu.</p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button
                            onClick={resetForm}
                            className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all shadow-sm text-center"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleCreateMachine}
                            disabled={isSubmitting}
                            className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-white text-lg shadow-xl shadow-indigo-100 transition-all flex justify-center items-center gap-3 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
                        >
                            {isSubmitting ? 'Đang lưu...' : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    {editMachine ? 'Cập nhật hồ sơ máy' : 'Lưu hồ sơ máy'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateMachine;
