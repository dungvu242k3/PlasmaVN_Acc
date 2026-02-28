import {
    ChevronDown,
    Package,
    PackagePlus,
    Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RECEIPT_STATUSES } from '../constants/goodsReceiptConstants';
import { WAREHOUSES } from '../constants/orderConstants';
import { supabase } from '../supabase/config';

const GoodsReceipts = () => {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [warehouseFilter, setWarehouseFilter] = useState('ALL');

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const { data, error } = await supabase
                .from('goods_receipts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReceipts(data || []);
        } catch (error) {
            console.error('Error loading receipts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusObj = RECEIPT_STATUSES.find(s => s.id === status);
        if (!statusObj) return <span className="text-gray-400">—</span>;

        const colorMap = {
            yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            green: 'bg-green-50 text-green-700 border-green-200',
            red: 'bg-red-50 text-red-700 border-red-200',
            gray: 'bg-gray-50 text-gray-700 border-gray-200',
        };

        return (
            <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${colorMap[statusObj.color] || colorMap.gray}`}>
                {statusObj.label}
            </span>
        );
    };

    const getWarehouseLabel = (id) => {
        return WAREHOUSES.find(w => w.id === id)?.label || id;
    };

    const filteredReceipts = receipts.filter(r => {
        const matchSearch = !searchTerm ||
            r.receipt_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const matchWarehouse = warehouseFilter === 'ALL' || r.warehouse_id === warehouseFilter;
        return matchSearch && matchStatus && matchWarehouse;
    });

    const stats = {
        total: receipts.length,
        pending: receipts.filter(r => r.status === 'CHO_DUYET').length,
        imported: receipts.filter(r => r.status === 'DA_NHAP').length,
        completed: receipts.filter(r => r.status === 'HOAN_THANH').length,
    };

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans min-h-screen noise-bg">
            {/* Animated Blobs */}
            <div className="blob blob-emerald w-[400px] h-[400px] -top-20 -right-20 opacity-15"></div>
            <div className="blob blob-teal w-[300px] h-[300px] bottom-1/3 -left-20 opacity-10"></div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/trang-chu')} className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-400 transition-all shadow-sm">
                        ←
                    </button>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-emerald-600" />
                        Nhập hàng từ NCC
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/tao-phieu-nhap')}
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-95 flex items-center gap-2"
                >
                    <PackagePlus className="w-5 h-5" />
                    Tạo phiếu nhập mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 relative z-10">
                {[
                    { label: 'Tổng phiếu', value: stats.total, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50' },
                    { label: 'Chờ duyệt', value: stats.pending, color: 'from-yellow-500 to-amber-600', bg: 'bg-yellow-50' },
                    { label: 'Đã nhập kho', value: stats.imported, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
                    { label: 'Hoàn thành', value: stats.completed, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50' },
                ].map((stat, idx) => (
                    <div key={idx} className={`${stat.bg} rounded-2xl p-5 border border-white shadow-sm`}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white p-4 md:p-6 mb-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm mã phiếu, NCC..."
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 cursor-pointer appearance-none transition-all"
                        >
                            {RECEIPT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={warehouseFilter}
                            onChange={(e) => setWarehouseFilter(e.target.value)}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 cursor-pointer appearance-none transition-all"
                        >
                            <option value="ALL">Tất cả kho</option>
                            {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-emerald-900/10 border border-white overflow-hidden relative z-10">
                {loading ? (
                    <div className="p-16 text-center">
                        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 font-bold">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredReceipts.length === 0 ? (
                    <div className="p-16 text-center">
                        <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold text-lg mb-2">Chưa có phiếu nhập nào</p>
                        <p className="text-gray-300 text-sm">Nhấn "Tạo phiếu nhập mới" để bắt đầu</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center w-16">STT</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Mã phiếu</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Nhà cung cấp</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Kho nhận</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Ngày nhập</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">Số MH</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Người nhận</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredReceipts.map((receipt, idx) => (
                                    <tr key={receipt.id} className="hover:bg-emerald-50/30 transition-colors cursor-pointer">
                                        <td className="px-6 py-5 text-center text-sm font-bold text-gray-400">{idx + 1}</td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                {receipt.receipt_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-slate-900 text-sm">{receipt.supplier_name}</td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                {getWarehouseLabel(receipt.warehouse_id)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-gray-600">
                                            {receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString('vi-VN') : '—'}
                                        </td>
                                        <td className="px-6 py-5 text-center text-sm font-black text-slate-900">{receipt.total_items}</td>
                                        <td className="px-6 py-5 text-sm font-bold text-gray-600">{receipt.received_by || '—'}</td>
                                        <td className="px-6 py-5 text-center">{getStatusBadge(receipt.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoodsReceipts;
