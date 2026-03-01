import {
    Activity,
    ActivitySquare,
    LogIn,
    LogOut,
    MapPin,
    Package,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';

export default function CylinderDetailsModal({ cylinder, onClose }) {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!cylinder) return;
        fetchCylinderHistory();
    }, [cylinder]);

    const fetchCylinderHistory = async () => {
        setLoading(true);
        try {
            // Lấy các Đơn hàng (Orders) có đề cập đến Serial Bình này
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .contains('assigned_cylinders', [cylinder.serial_number])
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching cylinder history:', error);
            alert('Lỗi tải dữ liệu lịch sử bình khí!');
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
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none"></div>

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
                                <ActivitySquare className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight flex items-center gap-3">
                                    Vỏ bình {cylinder.serial_number}
                                </h2>
                                <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                                    <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400" /> {cylinder.volume || '—'}</span>
                                    {cylinder.category && <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">{cylinder.category}</span>}
                                    <span className="flex items-center gap-1.5 text-teal-600"><MapPin className="w-4 h-4 text-teal-400" /> {cylinder.status || '—'}</span>
                                    {cylinder.customer_name && (
                                        <span className="flex items-center gap-1.5 text-slate-600">Đang ở: {cylinder.customer_name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2.5 bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-12 mt-8 border-b border-slate-200 relative z-10">
                        <div className="pb-4 px-2 text-sm font-black uppercase tracking-wider border-b-2 text-rose-600 border-rose-600">
                            <div className="flex items-center gap-2">
                                <LogOut className="w-4 h-4" /> Lịch sử Giao Đi / Thuê
                                <span className="bg-rose-100 text-rose-600 py-0.5 px-2 rounded-full text-[10px] ml-1">
                                    {orders.filter(o => o.order_type.toLowerCase().includes('thuê') || o.order_type.toLowerCase().includes('bán') || o.order_type.toLowerCase().includes('giao')).length}
                                </span>
                            </div>
                        </div>
                        <div className="pb-4 px-2 text-sm font-black uppercase tracking-wider border-b-2 text-teal-600 border-teal-600">
                            <div className="flex items-center gap-2">
                                <LogIn className="w-4 h-4" /> Lịch sử Thu Hồi / Nhập về
                                <span className="bg-teal-100 text-teal-600 py-0.5 px-2 rounded-full text-[10px] ml-1">
                                    {orders.filter(o => o.order_type.toLowerCase().includes('thu hồi') || o.order_type.toLowerCase().includes('trả') || o.order_type.toLowerCase().includes('nhập')).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Details - Split View */}
                <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row bg-[#F8FAFC]">
                    {loading ? (
                        <div className="flex flex-col flex-1 items-center justify-center h-40 space-y-4">
                            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-slate-400 animate-pulse">Đang tải lịch sử luân chuyển...</p>
                        </div>
                    ) : (
                        <>
                            {/* Cột 1: Thuê / Giao đi */}
                            <div className="flex-1 p-6 overflow-y-auto border-r border-slate-200 custom-scrollbar">
                                <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-4 flex items-center gap-2"><LogOut className="w-4 h-4" /> Đơn Giao Bình / Cho Thuê</h3>
                                <div className="space-y-4">
                                    {orders.filter(o => o.order_type.toLowerCase().includes('thuê') || o.order_type.toLowerCase().includes('bán') || o.order_type.toLowerCase().includes('giao')).length === 0 ? (
                                        <div className="p-10 text-center flex flex-col items-center border border-dashed border-slate-200 rounded-3xl bg-white">
                                            <Package className="w-10 h-10 text-slate-200 mb-3" />
                                            <p className="text-slate-400 font-bold text-sm">Chưa có giao dịch xuất vỏ</p>
                                        </div>
                                    ) : (
                                        orders.filter(o => o.order_type.toLowerCase().includes('thuê') || o.order_type.toLowerCase().includes('bán') || o.order_type.toLowerCase().includes('giao')).map(o => (
                                            <div key={o.id} className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-400"></div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">{o.order_code}</span>
                                                        <div className="text-[10px] font-bold text-slate-400 mt-2">{formatDate(o.created_at)}</div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded flex items-center gap-1 ${getStatusStyle(o.status)}`}>
                                                        {o.status}
                                                    </span>
                                                </div>
                                                <h4 className="font-black text-slate-800 text-base mb-1">{o.customer_name}</h4>
                                                <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">{o.order_type}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Cột 2: Thu hồi / Trả */}
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                <h3 className="text-sm font-black text-teal-600 uppercase tracking-widest mb-4 flex items-center gap-2"><LogIn className="w-4 h-4" /> Đơn Nhập Bình Về Kho</h3>
                                <div className="space-y-4">
                                    {orders.filter(o => o.order_type.toLowerCase().includes('thu hồi') || o.order_type.toLowerCase().includes('trả') || o.order_type.toLowerCase().includes('nhập')).length === 0 ? (
                                        <div className="p-10 text-center flex flex-col items-center border border-dashed border-slate-200 rounded-3xl bg-white">
                                            <Package className="w-10 h-10 text-slate-200 mb-3" />
                                            <p className="text-slate-400 font-bold text-sm">Chưa có giao dịch thu hồi</p>
                                        </div>
                                    ) : (
                                        orders.filter(o => o.order_type.toLowerCase().includes('thu hồi') || o.order_type.toLowerCase().includes('trả') || o.order_type.toLowerCase().includes('nhập')).map(o => (
                                            <div key={o.id} className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-teal-400"></div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">{o.order_code}</span>
                                                        <div className="text-[10px] font-bold text-slate-400 mt-2">{formatDate(o.created_at)}</div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded flex items-center gap-1 ${getStatusStyle(o.status)}`}>
                                                        {o.status}
                                                    </span>
                                                </div>
                                                <h4 className="font-black text-slate-800 text-base mb-1">{o.customer_name}</h4>
                                                <p className="text-xs font-bold text-teal-500 uppercase tracking-wider">{o.order_type}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
