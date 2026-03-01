import {
    Activity,
    History,
    MapPin,
    MonitorIcon,
    Package,
    Thermometer,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';

export default function MachineDetailsModal({ machine, onClose }) {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!machine) return;
        fetchMachineHistory();
    }, [machine]);

    const fetchMachineHistory = async () => {
        setLoading(true);
        try {
            // Lấy các Đơn hàng (Orders) có đề cập đến Serial Máy này
            // Trong quy trình, Mã Máy được nhập vào cột `department` (Khoa sd / Mã máy)
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .ilike('department', `%${machine.serial_number}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching machine history:', error);
            alert('Lỗi tải dữ liệu lịch sử máy!');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const getStatusStyle = (status) => {
        if (['DA_DUYET', 'HOAN_THANH'].includes(status)) {
            return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        }
        if (['HUY_DON', 'DOI_SOAT_THAT_BAI'].includes(status)) {
            return 'bg-rose-50 text-rose-600 border-rose-200';
        }
        return 'bg-amber-50 text-amber-600 border-amber-200';
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-slate-50 rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[80vh] mt-12">

                {/* Header Profile */}
                <div className="bg-white px-8 py-6 border-b border-slate-200 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none"></div>

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <MonitorIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight flex items-center gap-3">
                                    Máy {machine.serial_number}
                                </h2>
                                <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                                    <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400" /> {machine.machine_type || '—'}</span>
                                    <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-slate-400" /> {machine.status || '—'}</span>
                                    {machine.customer_name && (
                                        <span className="flex items-center gap-1.5 text-indigo-600"><MapPin className="w-4 h-4 text-indigo-400" /> Đang ở: {machine.customer_name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2.5 bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-6 mt-8 border-b border-slate-200 relative z-10">
                        <button className="pb-4 px-2 text-sm font-black uppercase tracking-wider transition-all duration-300 border-b-2 text-indigo-600 border-indigo-600">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4" /> Lịch sử Đơn Hàng (Thuê / Trả)
                                <span className="bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-[10px] ml-1">{orders.length}</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Body Details */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-4">
                            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-slate-400 animate-pulse">Đang tải dữ liệu Máy móc...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                            {orders.length === 0 ? (
                                <div className="p-16 text-center flex flex-col items-center">
                                    <Package className="w-16 h-16 text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold text-lg">Thiết bị này chưa có biên bản giao dịch nào</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã đơn</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Khách Hàng (Tên Đơn)</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Loại Hàng / Ghi Chú</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày tạo</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Tình trạng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {orders.map(o => (
                                            <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-black text-sm text-slate-700">{o.order_code}</td>
                                                <td className="px-6 py-4 text-sm font-black text-slate-800">
                                                    <div>{o.customer_name}</div>
                                                    <div className="text-[11px] text-slate-400 font-bold mt-1">{o.order_type}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-500 max-w-[250px] truncate" title={o.note || '—'}>
                                                    <div>{o.product_type}</div>
                                                    {o.note && <div className="text-[11px] opacity-70 mt-1 italic">{o.note}</div>}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-500">{formatDate(o.created_at)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg border ${getStatusStyle(o.status)}`}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
