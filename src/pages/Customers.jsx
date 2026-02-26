import {
    Edit,
    Filter,
    Search,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerFormModal from '../components/Customers/CustomerFormModal';
import { WAREHOUSES } from '../constants/orderConstants';
import usePermissions from '../hooks/usePermissions';
import { supabase } from '../supabase/config';

const Customers = () => {
    const { role } = usePermissions();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const CUSTOMER_CATEGORIES = [
        { id: 'BV', label: 'Bệnh viện' },
        { id: 'TM', label: 'Thẩm mỹ viện' },
        { id: 'PK', label: 'Phòng khám' },
        { id: 'NG', label: 'Khách ngoại giao' },
    ];

    const TABLE_COLUMNS = [
        { key: 'code', label: 'Mã khách hàng' },
        { key: 'name', label: 'Tên khách hàng' },
        { key: 'phone', label: 'Số điện thoại' },
        { key: 'address', label: 'Địa chỉ' },
        { key: 'legal_rep', label: 'Người đại diện pháp luật' },
        { key: 'managed_by', label: 'Nhân viên phụ trách' },
        { key: 'category', label: 'Loại khách hàng' },
        { key: 'current_cylinders', label: 'Số bình hiện có' },
        { key: 'current_machines', label: 'Số máy hiện có' },
        { key: 'borrowed_cylinders', label: 'Vỏ bình đang mượn' },
        { key: 'machines_in_use', label: 'Mã máy đang sử dụng' },
        { key: 'care_by', label: 'KD chăm sóc' },
    ];

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            alert('❌ Không thể tải danh sách khách hàng: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getLabel = (list, id) => {
        return list.find(item => item.id === id)?.label || id;
    };

    const filteredCustomers = customers.filter(c => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = (
            (c.code?.toLowerCase().includes(search)) ||
            (c.name?.toLowerCase().includes(search)) ||
            (c.phone?.toLowerCase().includes(search)) ||
            (c.address?.toLowerCase().includes(search))
        );

        const matchesCategory = activeCategory === 'ALL' || c.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setIsFormModalOpen(true);
    };

    const handleFormSubmitSuccess = () => {
        fetchCustomers();
        setIsFormModalOpen(false);
    };

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 flex items-center gap-3 md:gap-4 tracking-tight">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                            <Users className="w-7 h-7" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Danh sách khách hàng
                        </span>
                    </h1>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Filters Top Bar */}
                <div className="p-6 bg-white flex flex-col lg:flex-row gap-4 items-center border-b border-gray-100">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã KH, tên, sđt, địa chỉ..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[1rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium hover:bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                                className="w-full lg:w-60 pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-[1rem] text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none transition-all cursor-pointer hover:bg-gray-50"
                                value={activeCategory}
                                onChange={(e) => setActiveCategory(e.target.value)}
                            >
                                <option value="ALL">Tất cả phân loại</option>
                                {CUSTOMER_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse min-w-[2000px] md:min-w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {TABLE_COLUMNS.map(col => (
                                    <th key={col.key} className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">
                                        {col.label}
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right whitespace-nowrap bg-gray-50 sticky right-0 z-10 border-l border-gray-100 shadow-sm">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length + 1} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-500 font-bold animate-pulse tracking-widest text-xs uppercase">Đang tải biểu ghi khách hàng...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length + 1} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Users className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <p className="font-bold tracking-widest text-sm text-gray-500">
                                                {searchTerm ? `Không có khách hàng nào khớp với "${searchTerm}"` : 'Chưa có dữ liệu khách hàng'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCustomers.map((c) => (
                                <tr key={c.id} className="group hover:bg-blue-50/40 transition-all text-sm">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-black text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-wider">
                                            {c.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                        {c.name}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800 whitespace-nowrap">
                                        {c.phone || '-'}
                                    </td>
                                    <td className="px-6 py-4 min-w-[200px]">
                                        {c.address || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                        {c.legal_rep || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                                        {c.managed_by || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                            {getLabel(CUSTOMER_CATEGORIES, c.category)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-cyan-700">
                                        {c.current_cylinders || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-indigo-700">
                                        {c.current_machines || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-orange-700">
                                        {c.borrowed_cylinders || 0}
                                    </td>
                                    <td className="px-6 py-4 min-w-[150px] text-gray-700 font-medium">
                                        {c.machines_in_use || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                                        {c.care_by || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap border-l border-gray-100 bg-white group-hover:bg-blue-50/40 sticky right-0 z-10 transition-all">
                                        <button
                                            onClick={() => handleEditCustomer(c)}
                                            className="p-2 text-gray-400 hover:text-blue-600 rounded transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            title="Chỉnh sửa Khách Hàng"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total Count Footbar */}
                <div className="p-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                        Tổng số: <span className="text-gray-900 font-black text-lg">{filteredCustomers.length}</span> khách hàng
                    </p>
                </div>
            </div>

            {/* Modal */}
            {isFormModalOpen && (
                <CustomerFormModal
                    customer={selectedCustomer}
                    onClose={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSubmitSuccess}
                    categories={CUSTOMER_CATEGORIES}
                    warehouses={WAREHOUSES}
                />
            )}
        </div>
    );
};

export default Customers;
