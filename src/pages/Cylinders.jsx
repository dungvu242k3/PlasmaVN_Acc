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
            case 'sẵn sàng': return "bg-green-50 text-green-700 border-green-200";
            case 'đang sử dụng':
            case 'đã sử dụng':
            case 'thuộc khách hàng': return "bg-blue-50 text-blue-700 border-blue-200";
            case 'đang vận chuyển': return "bg-purple-50 text-purple-700 border-purple-200";
            case 'chờ nạp':
            case 'bình rỗng': return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case 'hỏng': return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
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
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 flex items-center gap-3 md:gap-4 tracking-tight">
                        <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-200">
                            <ActivitySquare className="w-7 h-7" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Danh sách bình khí
                        </span>
                    </h1>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Filters Top Bar */}
                <div className="p-6 bg-white flex flex-col lg:flex-row gap-4 items-center border-b border-gray-100">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm mã RFID, loại bình, khách hàng..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[1rem] focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-sm font-medium hover:bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                                className="w-full lg:w-60 pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-[1rem] text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 appearance-none transition-all cursor-pointer hover:bg-gray-50"
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
                                            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-500 font-bold animate-pulse tracking-widest text-xs uppercase">Đang tải danh sách bình...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCylinders.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                                <ActivitySquare className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <p className="font-bold tracking-widest text-sm text-gray-500">
                                                {searchTerm ? `Không có bình nào khớp với "${searchTerm}"` : 'Kho bình đang trống'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCylinders.map((c) => (
                                <tr key={c.id} className="group hover:bg-teal-50/40 transition-all text-sm">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-100 uppercase tracking-wider w-max">
                                                {c.serial_number}
                                            </span>
                                            {c.category && <span className="text-xs text-gray-400 font-bold mt-1 ml-1">{c.category}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                        <div className="flex flex-col">
                                            <span>{c.volume || '-'}</span>
                                            {c.net_weight && <span className="text-xs text-gray-500 font-medium">{c.net_weight} kg</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800 whitespace-nowrap">
                                        {c.customer_name || <span className="text-gray-400 italic font-normal">Tại kho Plasma</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(c.status)}`}>
                                            {getStatusLabel(c.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total Count Footbar */}
                <div className="p-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                        Tổng số bình quản lý: <span className="text-gray-900 font-black text-lg">{filteredCylinders.length}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Cylinders;
