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
            case 'thuộc khách hàng': return "bg-green-50 text-green-700 border-green-200";
            case 'kiểm tra':
            case 'bảo trì': return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case 'đang sửa':
            case 'Hong': return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
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
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 flex items-center gap-3 md:gap-4 tracking-tight">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                            <MonitorIcon className="w-7 h-7" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Danh sách máy móc
                        </span>
                    </h1>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Filters Top Bar */}
                <div className="p-6 bg-white flex flex-col lg:flex-row gap-4 items-center border-b border-gray-100">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm mã máy, khách hàng, bộ phận phụ trách..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[1rem] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm font-medium hover:bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                                className="w-full lg:w-60 pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-[1rem] text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 appearance-none transition-all cursor-pointer hover:bg-gray-50"
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
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse min-w-[1000px] md:min-w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {TABLE_COLUMNS.map(col => (
                                    <th key={col.key} className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-500 font-bold animate-pulse tracking-widest text-xs uppercase">Đang tải danh sách thiết bị...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMachines.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Activity className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <p className="font-bold tracking-widest text-sm text-gray-500">
                                                {searchTerm ? `Không có máy nào khớp với "${searchTerm}"` : 'Kho thiết bị đang trống'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMachines.map((m) => (
                                <tr key={m.id} className="group hover:bg-indigo-50/40 transition-all text-sm">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 uppercase tracking-wider">
                                            {m.serial_number}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                        {m.machine_type || '-'}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800 whitespace-nowrap">
                                        {m.customer_name || <span className="text-gray-400 italic font-normal">Đang trong kho</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(m.status)}`}>
                                            {getStatusLabel(m.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 max-w-[200px] truncate" title={m.department_in_charge}>
                                        {m.department_in_charge || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total Count Footbar */}
                <div className="p-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                        Tổng số thiết bị quản lý: <span className="text-gray-900 font-black text-lg">{filteredMachines.length}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Machines;
