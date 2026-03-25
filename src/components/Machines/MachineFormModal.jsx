import { Activity, Bluetooth, ChevronDown, Cpu, Hash, MapPin, MonitorIcon, Package, Radio, Save, ScanLine, Search, Settings2, Wind, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    CYLINDER_VOLUMES,
    EMISSION_HEAD_TYPES,
    GAS_TYPES,
    MACHINE_STATUSES,
    MACHINE_TYPES,
    VALVE_TYPES
} from '../../constants/machineConstants';
import { supabase } from '../../supabase/config';
import BarcodeScanner from '../Common/BarcodeScanner';
import clsx from 'clsx';

export default function MachineFormModal({ machine, onClose, onSuccess }) {
    const isEdit = !!machine;
    const [isLoading, setIsLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);

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
        emission_head_type: 'không',
        customer_name: '',
        department_in_charge: ''
    };

    const [formData, setFormData] = useState(defaultState);
    const [warehousesList, setWarehousesList] = useState([]);
    const [customersList, setCustomersList] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const customerDropdownRef = useRef(null);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    }, [onClose]);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const { data, error } = await supabase
                    .from('warehouses')
                    .select('id, name')
                    .eq('status', 'Đang hoạt động')
                    .order('name');
                if (!error && data) {
                    setWarehousesList(data);
                    if (!isEdit && data.length > 0 && !formData.warehouse) {
                        setFormData(prev => ({ ...prev, warehouse: data[0].id }));
                    }
                }

                const { data: customerData, error: customerError } = await supabase
                    .from('customers')
                    .select('name')
                    .order('name');
                if (!customerError && customerData) {
                    setCustomersList(customerData);
                }
            } catch (err) {
                console.error('Error fetching warehouses:', err);
            }
        };
        fetchWarehouses();
    }, [isEdit]);

    const filteredCustomers = customersList.filter(c =>
        c.name?.toLowerCase().includes(customerSearch.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
                setShowCustomerDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isEdit) {
            setFormData({
                serial_number: machine.serial_number || '',
                machine_account: machine.machine_account || '',
                status: machine.status || 'chưa xác định',
                warehouse: machine.warehouse || '',
                bluetooth_mac: machine.bluetooth_mac || '',
                machine_type: machine.machine_type || 'BV',
                version: machine.version || '',
                cylinder_volume: machine.cylinder_volume || 'không',
                gas_type: machine.gas_type || 'Air',
                valve_type: machine.valve_type || 'không',
                emission_head_type: machine.emission_head_type || 'không',
                customer_name: machine.customer_name || '',
                department_in_charge: machine.department_in_charge || ''
            });
            setCustomerSearch(machine.customer_name || '');
        }
    }, [machine, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'serial_number') {
                newState.machine_account = value;
            }
            return newState;
        });
    };

    const handleCustomerSelect = (name) => {
        setFormData(prev => ({ ...prev, customer_name: name }));
        setCustomerSearch(name);
        setShowCustomerDropdown(false);
    };

    const handleCustomerSearchChange = (e) => {
        setCustomerSearch(e.target.value);
        setFormData(prev => ({ ...prev, customer_name: e.target.value }));
        setShowCustomerDropdown(true);
    };

    const handleScanSuccess = useCallback((decodedText) => {
        setFormData(prev => ({
            ...prev,
            serial_number: decodedText,
            machine_account: decodedText
        }));
        setIsScannerOpen(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.serial_number || !formData.machine_type) {
            setErrorMsg('Vui lòng điền các trường bắt buộc (*)');
            return;
        }

        setIsLoading(true);

        try {
            const payload = { ...formData, updated_at: new Date().toISOString() };

            if (isEdit) {
                const { error } = await supabase
                    .from('machines')
                    .update(payload)
                    .eq('id', machine.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('machines')
                    .insert([payload]);
                if (error) throw error;
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving machine:', error);
            if (error.code === '23505') {
                setErrorMsg(`Mã Serial "${formData.serial_number}" đã tồn tại.`);
            } else {
                setErrorMsg(error.message || 'Có lỗi xảy ra khi lưu thiết bị.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const sideDrawerContent = (
        <div className={clsx(
            "fixed inset-0 z-[100005] flex justify-end transition-all duration-300",
            isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
            <BarcodeScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
                title="Quét mã Serial máy"
            />
            {/* Backdrop */}
            <div
                className={clsx(
                    "absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300",
                    isClosing && "animate-out fade-out duration-300"
                )}
                onClick={handleClose}
            />

            {/* Drawer Panel */}
            <div
                className={clsx(
                    "relative bg-white shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-full border-l border-slate-200 animate-in slide-in-from-right duration-500 ease-out",
                    isClosing && "animate-out slide-out-to-right duration-300"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                            <MonitorIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-[17px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">
                                {isEdit ? 'Cập nhật thiết bị' : 'Thêm máy mới'}
                            </h3>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                {isEdit ? `Serial: ${formData.serial_number}` : 'Thông tin cấu hình hệ thống'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                    {errorMsg && (
                        <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-[13px] font-bold text-red-600 flex items-center gap-2 animate-shake">
                            <X className="w-4 h-4 shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    <form id="machineForm" onSubmit={handleSubmit} className="space-y-5">
                        {/* Định danh */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                            <h4 className="flex items-center gap-2 text-[13px] font-black text-primary uppercase tracking-widest border-b border-slate-50 pb-3">
                                <Hash className="w-4 h-4" /> Định danh thiết bị
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Mã Serial (Serial Number) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="serial_number"
                                            value={formData.serial_number}
                                            onChange={handleChange}
                                            placeholder="VD: PLT-25D1-50-TM"
                                            className="w-full h-11 pl-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsScannerOpen(true)}
                                            className="absolute right-1.5 top-1.5 bottom-1.5 px-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center"
                                        >
                                            <ScanLine className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Tài khoản máy (Auto)</label>
                                    <input
                                        type="text"
                                        value={formData.machine_account}
                                        readOnly
                                        className="w-full h-11 px-4 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Trạng thái máy <span className="text-red-500">*</span></label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900 cursor-pointer"
                                    >
                                        {MACHINE_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Kho quản lý</label>
                                    <select
                                        name="warehouse"
                                        value={formData.warehouse || ''}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900 cursor-pointer"
                                    >
                                        <option value="">-- Chưa xác định --</option>
                                        {warehousesList.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Thông số kỹ thuật */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                            <h4 className="flex items-center gap-2 text-[13px] font-black text-primary uppercase tracking-widest border-b border-slate-50 pb-3">
                                <Settings2 className="w-4 h-4" /> Cấu hình & Thông số
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Bluetooth MAC</label>
                                    <input
                                        type="text"
                                        name="bluetooth_mac"
                                        value={formData.bluetooth_mac}
                                        onChange={handleChange}
                                        placeholder="VD: 00:1A:2B:3C:4D:5E"
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Loại máy <span className="text-red-500">*</span></label>
                                    <select
                                        name="machine_type"
                                        value={formData.machine_type}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900 cursor-pointer"
                                    >
                                        {MACHINE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Phiên bản (Version)</label>
                                    <input
                                        type="text"
                                        name="version"
                                        value={formData.version}
                                        onChange={handleChange}
                                        placeholder="VD: v2.5.1"
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Phụ kiện */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                            <h4 className="flex items-center gap-2 text-[13px] font-black text-primary uppercase tracking-widest border-b border-slate-50 pb-3">
                                <Package className="w-4 h-4" /> Phụ kiện & Bình khí
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Thể tích bình</label>
                                    <select
                                        name="cylinder_volume"
                                        value={formData.cylinder_volume}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900 cursor-pointer"
                                    >
                                        {CYLINDER_VOLUMES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Loại khí</label>
                                    <select
                                        name="gas_type"
                                        value={formData.gas_type}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900 cursor-pointer"
                                    >
                                        {GAS_TYPES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Loại van</label>
                                    <select
                                        name="valve_type"
                                        value={formData.valve_type}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900 cursor-pointer"
                                    >
                                        {VALVE_TYPES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Loại đầu phát</label>
                                    <select
                                        name="emission_head_type"
                                        value={formData.emission_head_type}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900 cursor-pointer"
                                    >
                                        {EMISSION_HEAD_TYPES.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Phụ trách */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                            <h4 className="flex items-center gap-2 text-[13px] font-black text-primary uppercase tracking-widest border-b border-slate-50 pb-3">
                                <MapPin className="w-4 h-4" /> Thông tin sử dụng
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 relative" ref={customerDropdownRef}>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Khách hàng đang dùng</label>
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={customerSearch}
                                            onChange={handleCustomerSearchChange}
                                            onFocus={() => setShowCustomerDropdown(true)}
                                            placeholder="Tìm kiếm khách hàng..."
                                            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                    {showCustomerDropdown && (
                                        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                                            {filteredCustomers.length > 0 ? (
                                                filteredCustomers.map((c, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => handleCustomerSelect(c.name)}
                                                        className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-slate-600 hover:bg-primary/5 hover:text-primary transition-all"
                                                    >
                                                        {c.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-[12px] font-medium text-slate-400 italic">Không tìm thấy khách hàng</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Bộ phận phụ trách</label>
                                    <input
                                        type="text"
                                        name="department_in_charge"
                                        value={formData.department_in_charge}
                                        onChange={handleChange}
                                        placeholder="VD: Khoa Chẩn đoán hình ảnh"
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] z-10">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 text-[13px] font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        form="machineForm"
                        disabled={isLoading}
                        className="min-w-[160px] h-11 px-6 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEdit ? 'Cập nhật' : 'Hoàn tất'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(sideDrawerContent, document.body);
}
