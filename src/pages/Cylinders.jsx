import {
    ActivitySquare,
    Filter,
    Search
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CYLINDER_STATUSES } from '../constants/machineConstants';
import usePermissions from '../hooks/usePermissions';
import { supabase } from '../supabase/config';

// 4 required columns: RFID, Thể tích, Tên khách hàng, Trạng thái (vị trí vỏ bình)
const TABLE_COLUMNS = [
    { key: 'serial_number', label: 'Mã RFID (Serial)' },
    { key: 'volume', label: 'Thể tích / Loại bình' },
    { key: 'customer_name', label: 'Tên Khách Hàng / Vị trí' },
    { key: 'status', label: 'Trạng Thái' },
];

const Cylinders = () => {
    const { role } = usePermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState('ALL');
    const [cylinders, setCylinders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCylinders();
    }, []);

    const fetchCylinders = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('cylinders')
                .select('*')
                .order('created_at', { ascending: false });

            // Ignore missing table error during setup
            if (error && error.code !== '42P01') throw error;
            setCylinders(data || []);
        } catch (error) {
            console.error('Error fetching cylinders:', error);
            // alert('❌ Lỗi tải thiết bị: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'sẵn sàng': return "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-white";
            case 'đang sử dụng':
            case 'đã sử dụng':
            case 'thuộc khách hàng': return "bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-white";
            case 'đang vận chuyển': return "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-white";
            case 'chờ nạp':
            case 'bình rỗng': return "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-white";
            case 'hỏng': return "bg-rose-50 text-rose-500 border-rose-100 group-hover:bg-white";
            default: return "bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-white";
        }
    };

    const getStatusLabel = (status) => {
        const item = CYLINDER_STATUSES.find(s => s.id === status);
        return item ? item.label : status;
    };

    const filteredCylinders = cylinders.filter(c => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = (
            (c.serial_number?.toLowerCase().includes(search)) ||
            (c.volume?.toLowerCase().includes(search)) ||
            (c.customer_name?.toLowerCase().includes(search))
        );

        const matchesStatus = activeStatus === 'ALL' || c.status === activeStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen noise-bg">
            {/* Decorative Background Blobs */}
            <div className="blob blob-emerald w-[500px] h-[500px] -top-20 -left-20 opacity-20"></div>
            <div className="blob blob-teal w-[400px] h-[400px] top-1/2 -right-20 opacity-10"></div>
            <div className="blob blob-cyan w-[300px] h-[300px] bottom-10 left-1/4 opacity-10"></div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-10">
                <div className="hover-lift">
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                        <div className="w-14 h-14 bg-gradient-to-tr from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-100 transition-transform hover:rotate-3 duration-300">
                            <ActivitySquare className="w-8 h-8" />
                        </div>
                        Quản lý Bình khí
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Số hóa và quản lý vòng đời bình khí Plasma</p>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden glass">
                {/* Filters Top Bar */}
                <div className="p-8 bg-white flex flex-col lg:flex-row gap-6 items-center border-b border-slate-50">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm mã RFID, loại bình, khách hàng..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-teal-100 rounded-2xl focus:ring-4 focus:ring-teal-50 outline-none transition-all text-sm font-bold text-slate-600 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                className="w-full lg:w-64 pl-12 pr-10 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-teal-100 rounded-2xl text-sm font-black text-slate-600 outline-none focus:ring-4 focus:ring-teal-50 appearance-none transition-all cursor-pointer shadow-inner"
                                value={activeStatus}
                                onChange={(e) => setActiveStatus(e.target.value)}
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                {CYLINDER_STATUSES.map(stat => (
                                    <option key={stat.id} value={stat.id}>
                                        {stat.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Search className="w-4 h-4 rotate-90" />
                            </div>
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
                                    <th key={col.key} className={`px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-left whitespace-nowrap ${col.key === 'serial_number' ? 'w-[300px]' : ''}`}>
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
                                            <div className="w-14 h-14 border-4 border-teal-50 border-t-teal-600 rounded-full animate-spin"></div>
                                            <p className="text-slate-400 font-black animate-pulse tracking-[0.2em] text-[10px] uppercase">Đang rà soát danh sách bình khí...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCylinders.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length + 1} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-8 text-slate-400">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center">
                                                <ActivitySquare className="w-12 h-12 text-slate-200" />
                                            </div>
                                            <p className="font-black tracking-tight text-xl text-slate-800">
                                                {searchTerm ? `Không có bình nào khớp với "${searchTerm}"` : 'Kho bình hiện đang trống'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCylinders.map((c, idx) => (
                                <tr key={c.id} className="group hover:bg-teal-50/20 transition-all duration-300">
                                    <td className="px-8 py-7 whitespace-nowrap text-center">
                                        <span className="font-black text-slate-300 group-hover:text-teal-500 transition-colors text-lg">{idx + 1}</span>
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-black text-teal-600 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100 uppercase tracking-widest text-[11px] group-hover:bg-white group-hover:shadow-sm transition-all w-max">
                                                {c.serial_number}
                                            </span>
                                            {c.category && <span className="text-[10px] text-slate-400 font-black uppercase mt-1.5 ml-1 tracking-widest opacity-60">Phân loại: {c.category}</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap font-black text-black text-base group-hover:text-teal-600 transition-colors">
                                        <div className="flex flex-col">
                                            <span>{c.volume || '-'}</span>
                                            {c.net_weight && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Trọng lượng nạp: {c.net_weight} kg</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 font-black text-black whitespace-nowrap">
                                        {c.customer_name ? (
                                            <span className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-white transition-all">{c.customer_name}</span>
                                        ) : (
                                            <span className="text-slate-300 font-bold italic text-sm">Vỏ bình tại kho</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(c.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusStyle(c.status).includes('emerald') ? 'bg-emerald-500' : getStatusStyle(c.status).includes('sky') ? 'bg-sky-500' : getStatusStyle(c.status).includes('indigo') ? 'bg-indigo-500' : getStatusStyle(c.status).includes('amber') ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                            {getStatusLabel(c.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total Count Footbar */}
                <div className="p-8 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Tổng số bình khí quản lý: <span className="text-teal-600 mx-2 text-lg">{filteredCylinders.length}</span> đơn vị
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Cylinders;
