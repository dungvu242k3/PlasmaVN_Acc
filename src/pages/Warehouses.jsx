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
            case 'Đang hoạt động': return "bg-green-50 text-green-700 border-green-200";
            case 'Tạm ngưng': return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case 'Đóng cửa': return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
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
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 flex items-center gap-3 md:gap-4 tracking-tight">
                        <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-200">
                            <Warehouse className="w-7 h-7" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Danh sách Kho hàng
                        </span>
                    </h1>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-6 bg-white flex flex-col lg:flex-row gap-4 items-center border-b border-gray-100">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm tên kho hoặc thủ kho..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[1rem] focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none transition-all text-sm font-medium hover:bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                                className="w-full lg:w-60 pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-[1rem] text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 appearance-none transition-all cursor-pointer hover:bg-gray-50"
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
                                            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-500 font-bold animate-pulse tracking-widest text-xs uppercase">Đang tải danh sách kho...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredWarehouses.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Warehouse className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <p className="font-bold tracking-widest text-sm text-gray-500">
                                                {searchTerm ? `Không có kho nào khớp với "${searchTerm}"` : 'Hệ thống chưa có dữ liệu kho'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredWarehouses.map((w) => (
                                <tr key={w.id} className="group hover:bg-amber-50/40 transition-all text-sm">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-black text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 uppercase tracking-wider">
                                            {w.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                        {w.manager_name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 max-w-[300px] truncate" title={w.address}>
                                        {w.address}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-black text-gray-900">
                                        {w.capacity?.toLocaleString('vi-VN')} <span className="text-gray-400 font-medium text-xs ml-1">vỏ</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(w.status)}`}>
                                            {w.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                        Tổng số kho quản lý: <span className="text-gray-900 font-black text-lg">{filteredWarehouses.length}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Warehouses;
