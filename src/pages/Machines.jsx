import {
    Activity,
    Filter,
    MonitorIcon // or similar icon
    ,









    Search
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { MACHINE_STATUSES } from '../constants/machineConstants';
import usePermissions from '../hooks/usePermissions';
import { supabase } from '../supabase/config';

// 5 required columns: Mã máy, Loại máy, Tên khách hàng, Trạng thái, Tên đơn vị / KD phụ trách
const TABLE_COLUMNS = [
    { key: 'serial_number', label: 'Mã Máy (Serial)' },
    { key: 'machine_type', label: 'Loại Máy' },
    { key: 'customer_name', label: 'Tên Khách Hàng' },
    { key: 'status', label: 'Trạng Thái' },
    { key: 'department_in_charge', label: 'Bộ Phận Phụ Trách' },
];

// MACHINE_STATUSES removed as it is now imported

const Machines = () => {
    const { role } = usePermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState('ALL');
    const [machines, setMachines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMachines();
    }, []);

    const fetchMachines = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('machines')
                .select('*')
                .order('created_at', { ascending: false });

            // Ignore table missing error during UI development if not yet created.
            if (error && error.code !== '42P01') throw error;
            setMachines(data || []);
        } catch (error) {
            console.error('Error fetching machines:', error);
            // alert('❌ Lỗi tải thiết bị: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'sẵn sàng':
            case 'Dang_su_dung':
            case 'thuộc khách hàng': return "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-white";
            case 'kiểm tra':
            case 'bảo trì': return "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-white";
            case 'đang sửa':
            case 'Hong': return "bg-rose-50 text-rose-500 border-rose-100 group-hover:bg-white";
            default: return "bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-white";
        }
    };

    const getStatusLabel = (status) => {
        const item = MACHINE_STATUSES.find(s => s.id === status);
        return item ? item.label : status;
    };

    const filteredMachines = machines.filter(m => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = (
            (m.serial_number?.toLowerCase().includes(search)) ||
            (m.machine_type?.toLowerCase().includes(search)) ||
            (m.customer_name?.toLowerCase().includes(search)) ||
            (m.department_in_charge?.toLowerCase().includes(search))
        );

        const matchesStatus = activeStatus === 'ALL' || m.status === activeStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen noise-bg">
            {/* Decorative Background Blobs */}
            <div className="blob blob-indigo w-[500px] h-[500px] -top-20 -left-20 opacity-20"></div>
            <div className="blob blob-violet w-[400px] h-[400px] top-1/2 -right-20 opacity-10"></div>
            <div className="blob blob-blue w-[300px] h-[300px] bottom-10 left-1/4 opacity-10"></div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-10">
                <div className="hover-lift">
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                        <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transition-transform hover:rotate-3 duration-300">
                            <MonitorIcon className="w-8 h-8" />
                        </div>
                        Máy móc & Thiết bị
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Quản lý danh mục và trạng thái máy móc hệ thống</p>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden glass">
                {/* Filters Top Bar */}
                <div className="p-8 bg-white flex flex-col lg:flex-row gap-6 items-center border-b border-slate-50">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm mã máy, khách hàng, bộ phận phụ trách..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-bold text-slate-600 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                className="w-full lg:w-64 pl-12 pr-10 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-black text-slate-600 outline-none focus:ring-4 focus:ring-indigo-50 appearance-none transition-all cursor-pointer shadow-inner"
                                value={activeStatus}
                                onChange={(e) => setActiveStatus(e.target.value)}
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                {MACHINE_STATUSES.map(stat => (
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
                                    <td colSpan={TABLE_COLUMNS.length} className="px-8 py-28 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-14 h-14 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                                            <p className="text-slate-400 font-black animate-pulse tracking-[0.2em] text-[10px] uppercase">Đang rà soát danh sách thiết bị...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMachines.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-8 text-slate-400">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center">
                                                <Activity className="w-12 h-12 text-slate-200" />
                                            </div>
                                            <p className="font-black tracking-tight text-xl text-slate-800">
                                                {searchTerm ? `Không tìm thấy máy nào khớp với "${searchTerm}"` : 'Kho thiết bị hiện đang trống'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMachines.map((m) => (
                                <tr key={m.id} className="group hover:bg-indigo-50/20 transition-all duration-300">
                                    <td className="px-8 py-7 whitespace-nowrap">
                                        <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-widest text-[11px] group-hover:bg-white group-hover:shadow-sm transition-all">
                                            {m.serial_number}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap font-black text-black text-base group-hover:text-indigo-600 transition-colors">
                                        {m.machine_type || '-'}
                                    </td>
                                    <td className="px-8 py-7 font-black text-black whitespace-nowrap">
                                        {m.customer_name ? (
                                            <span className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-white transition-all">{m.customer_name}</span>
                                        ) : (
                                            <span className="text-slate-300 font-bold italic text-sm">Sẵn sàng xuất kho</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(m.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusStyle(m.status).includes('emerald') ? 'bg-emerald-500' : getStatusStyle(m.status).includes('amber') ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                            {getStatusLabel(m.status)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7 text-slate-900 font-bold text-sm leading-relaxed max-w-[250px] truncate" title={m.department_in_charge}>
                                        {m.department_in_charge || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total Count Footbar */}
                <div className="p-8 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Tổng số thiết bị quản lý: <span className="text-indigo-600 mx-2 text-lg">{filteredMachines.length}</span> máy móc
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Machines;
