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
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 transition-transform hover:scale-105 duration-300">
                            <Users className="w-8 h-8" />
                        </div>
                        Khách hàng
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Lưu trữ và theo dõi hồ sơ khách hàng toàn hệ thống</p>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden">
                {/* Filters Top Bar */}
                <div className="p-8 bg-white flex flex-col lg:flex-row gap-6 items-center border-b border-slate-50">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã KH, tên, sđt, địa chỉ..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-bold text-slate-600 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                className="w-full lg:w-64 pl-12 pr-10 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-black text-slate-600 outline-none focus:ring-4 focus:ring-blue-50 appearance-none transition-all cursor-pointer shadow-inner"
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
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Search className="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse min-w-[2000px]">
                        <thead>
                            <tr className="bg-slate-50/30 border-b border-slate-50">
                                {TABLE_COLUMNS.map(col => (
                                    <th key={col.key} className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-left whitespace-nowrap">
                                        {col.label}
                                    </th>
                                ))}
                                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-right whitespace-nowrap sticky right-0 z-10 bg-slate-50/80 backdrop-blur-md border-l border-slate-50 shadow-sm">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length + 1} className="px-8 py-28 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-14 h-14 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                                            <p className="text-slate-400 font-black animate-pulse tracking-[0.2em] text-[10px] uppercase">Đang tải hồ sơ khách hàng...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length + 1} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-8 text-slate-400">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center">
                                                <Users className="w-12 h-12 text-slate-200" />
                                            </div>
                                            <p className="font-black tracking-tight text-xl text-slate-800">
                                                {searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : 'Chưa có dữ liệu khách hàng'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCustomers.map((c) => (
                                <tr key={c.id} className="group hover:bg-blue-50/20 transition-all duration-300">
                                    <td className="px-8 py-7 whitespace-nowrap">
                                        <span className="font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 uppercase tracking-widest text-[11px] group-hover:bg-white group-hover:shadow-sm transition-all">
                                            {c.code}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                                        {c.name}
                                    </td>
                                    <td className="px-8 py-7 font-black text-slate-900 whitespace-nowrap">
                                        {c.phone ? (
                                            <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group-hover:bg-white transition-all">{c.phone}</span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-8 py-7 min-w-[250px] text-sm font-bold text-slate-900 leading-relaxed">
                                        {c.address || '-'}
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap text-slate-900 font-bold">
                                        {c.legal_rep || '-'}
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap text-slate-900 font-black text-xs uppercase tracking-tight">
                                        {c.managed_by || '-'}
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 group-hover:bg-white transition-all">
                                            {getLabel(CUSTOMER_CATEGORIES, c.category)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap text-center font-black text-cyan-600 text-lg">
                                        {c.current_cylinders || 0}
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap text-center font-black text-indigo-600 text-lg">
                                        {c.current_machines || 0}
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap text-center font-black text-rose-500 text-lg">
                                        {c.borrowed_cylinders || 0}
                                    </td>
                                    <td className="px-8 py-7 min-w-[180px] text-slate-900 font-bold text-sm">
                                        {c.machines_in_use || '-'}
                                    </td>
                                    <td className="px-8 py-7 whitespace-nowrap text-slate-900 font-black text-xs">
                                        {c.care_by || '-'}
                                    </td>
                                    <td className="px-8 py-7 text-right whitespace-nowrap sticky right-0 z-10 bg-white/80 backdrop-blur-md border-l border-slate-50 group-hover:bg-blue-50/40 transition-all">
                                        <button
                                            onClick={() => handleEditCustomer(c)}
                                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100 outline-none"
                                            title="Chỉnh sửa"
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
                <div className="p-8 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Đang hiển thị <span className="text-blue-600 mx-2 text-lg">{filteredCustomers.length}</span> hồ sơ khách hàng
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
