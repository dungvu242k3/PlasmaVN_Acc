import {
    Filter,
    Search,
    Warehouse
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { WAREHOUSE_STATUSES } from '../constants/warehouseConstants';
import usePermissions from '../hooks/usePermissions';
import { supabase } from '../supabase/config';

const TABLE_COLUMNS = [
    { key: 'name', label: 'Tên Kho' },
    { key: 'manager_name', label: 'Thủ Kho' },
    { key: 'address', label: 'Địa Chỉ' },
    { key: 'capacity', label: 'Sức Chứa' },
    { key: 'status', label: 'Trạng Thái' },
];

const Warehouses = () => {
    const { role } = usePermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState('ALL');
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('warehouses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error && error.code !== '42P01') throw error;
            setWarehouses(data || []);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Đang hoạt động': return "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-white";
            case 'Tạm ngưng': return "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-white";
            case 'Đóng cửa': return "bg-rose-50 text-rose-500 border-rose-100 group-hover:bg-white";
            default: return "bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-white";
        }
    };

    const filteredWarehouses = warehouses.filter(w => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = (
            (w.name?.toLowerCase().includes(search)) ||
            (w.manager_name?.toLowerCase().includes(search))
        );
        const matchesStatus = activeStatus === 'ALL' || w.status === activeStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen noise-bg">
            {/* Decorative Background Blobs */}
            <div className="blob blob-amber w-[500px] h-[500px] -top-20 -left-20 opacity-20"></div>
            <div className="blob blob-orange w-[400px] h-[400px] top-1/2 -right-20 opacity-10"></div>
            <div className="blob blob-yellow w-[300px] h-[300px] bottom-10 left-1/4 opacity-10"></div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-10">
                <div className="hover-lift">
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                        <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-100 transition-transform hover:rotate-3 duration-300">
                            <Warehouse className="w-8 h-8" />
                        </div>
                        Hệ thống Kho hàng
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Quản lý địa điểm lưu trữ, sức chứa và nhân sự vận hành</p>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden glass">
                {/* Filters Top Bar */}
                <div className="p-8 bg-white flex flex-col lg:flex-row gap-6 items-center border-b border-slate-50 glass">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm tên kho hoặc thủ kho..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-amber-100 rounded-2xl focus:ring-4 focus:ring-amber-50 outline-none transition-all text-sm font-bold text-slate-600 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                className="w-full lg:w-64 pl-12 pr-10 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-amber-100 rounded-2xl text-sm font-black text-slate-600 outline-none focus:ring-4 focus:ring-amber-50 appearance-none transition-all cursor-pointer shadow-inner"
                                value={activeStatus}
                                onChange={(e) => setActiveStatus(e.target.value)}
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                {WAREHOUSE_STATUSES.map(stat => (
                                    <option key={stat.id} value={stat.id}>
                                        {stat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse min-w-[1000px]">
                        <thead className="glass-header">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center w-24">STT</th>
                                {TABLE_COLUMNS.map(col => (
                                    <th key={col.key} className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-left whitespace-nowrap">
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length + 1} className="px-8 py-28 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-14 h-14 border-4 border-amber-50 border-t-amber-600 rounded-full animate-spin"></div>
                                            <p className="text-slate-400 font-black animate-pulse tracking-[0.2em] text-[10px] uppercase">Đang rà soát danh sách kho hàng...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredWarehouses.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length + 1} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-8 text-slate-400">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center">
                                                <Warehouse className="w-12 h-12 text-slate-200" />
                                            </div>
                                            <p className="font-black tracking-tight text-xl text-slate-800">
                                                {searchTerm ? `Không tìm thấy kho nào khớp với "${searchTerm}"` : 'Hệ thống chưa ghi nhận dữ liệu kho'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredWarehouses.map((w, idx) => (
                                <tr key={w.id} className="group hover:bg-amber-50/20 transition-all duration-300">
                                    <td className="px-8 py-7 whitespace-nowrap text-center">
                                        <span className="font-black text-slate-300 group-hover:text-amber-500 transition-colors text-lg">{idx + 1}</span>
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap">
                                        <span className="font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 uppercase tracking-widest text-[11px] group-hover:bg-white group-hover:shadow-sm transition-all shadow-inner">
                                            {w.name}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap font-black text-black text-base group-hover:text-amber-600 transition-colors">
                                        {w.manager_name}
                                    </td>
                                    <td className="px-8 py-7 text-slate-900 font-bold text-sm leading-relaxed max-w-[300px] truncate" title={w.address}>
                                        {w.address}
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap font-black text-black text-base">
                                        {w.capacity?.toLocaleString('vi-VN')} <span className="text-slate-300 font-black uppercase tracking-widest text-[10px] ml-1 opacity-60">Vỏ bình</span>
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${getStatusStyle(w.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusStyle(w.status).includes('emerald') ? 'bg-emerald-500' : getStatusStyle(w.status).includes('amber') ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                            {w.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Stats Footer */}
                <div className="p-8 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        Quy mô mạng lưới: <span className="text-amber-600 mx-2 text-lg">{filteredWarehouses.length}</span> cơ sở kho bãi
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Warehouses;
