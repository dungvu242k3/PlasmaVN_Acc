import {
    ChevronDown,
    Filter,
    MoreHorizontal,
    Package,
    Printer,
    Search
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderPrintTemplate from '../components/OrderPrintTemplate';
import {
    CUSTOMER_CATEGORIES,
    ORDER_STATUSES,
    ORDER_TYPES,
    PRODUCT_TYPES,
    TABLE_COLUMNS
} from '../constants/orderConstants';
import usePermissions from '../hooks/usePermissions';
import { supabase } from '../supabase/config';

const Orders = () => {
    const { role } = usePermissions();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [ordersToPrint, setOrdersToPrint] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    const formatNumber = (num) => {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleQuantityChange = (e) => {
        // Removed as it was for the modal form
    };

    const handleCustomerChange = (e) => {
        // Removed as it was for the modal form
    };

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            alert('❌ Không thể tải danh sách đơn hàng: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = (
            (order.order_code?.toLowerCase().includes(search)) ||
            (order.customer_name?.toLowerCase().includes(search)) ||
            (order.recipient_name?.toLowerCase().includes(search)) ||
            (order.recipient_phone?.toLowerCase().includes(search))
        );

        const matchesStatus = activeTab === 'ALL' || order.status === activeTab;

        // Scope logic: Admins and Thu Kho can see all orders
        // Sales and Customers can only see their own created orders
        let matchesScope = true;

        // Note: For full production use, user.name or a firm UUID should be stored and checked 
        // against order.ordered_by or order.sales_person. For now we use the mocked user.name
        if (role !== 'admin' && role !== 'thu_kho' && role !== 'shipper') {
            // Example simplified check:
            // matchesScope = order.ordered_by === user?.name;
            // In this mockup we allow it to pass, but the logic is here.
        }

        return matchesSearch && matchesStatus && matchesScope;
    });

    const handleCreateOrder = async () => {
        // Removed as it moved to CreateOrder.jsx
    };

    const getStatusConfig = (statusId) => {
        return ORDER_STATUSES.find(s => s.id === statusId) || ORDER_STATUSES[0];
    };

    const getLabel = (list, id) => {
        return list.find(item => item.id === id)?.label || id;
    };

    const handlePrint = (order) => {
        setOrdersToPrint(order); // OrderPrintTemplate now handles single and multi
        setTimeout(() => {
            window.print();
        }, 150);
    };

    const handleBulkPrint = () => {
        if (selectedIds.length === 0) {
            alert('⚠️ Vui lòng chọn ít nhất một đơn hàng để in!');
            return;
        }

        const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
        setOrdersToPrint(selectedOrders);

        setTimeout(() => {
            window.print();
        }, 150);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredOrders.length && filteredOrders.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredOrders.map(o => o.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAction = (order) => {
        setSelectedOrder(order);
        setIsActionModalOpen(true);
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                            <Package className="w-7 h-7" />
                        </div>
                        Danh sách đơn hàng
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBulkPrint}
                        className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all border shadow-sm ${selectedIds.length > 0
                            ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-blue-200'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            }`}
                    >
                        <Printer className="w-4 h-4" />
                        In hàng loạt ({selectedIds.length})
                    </button>
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
                            placeholder="Tìm kiếm theo mã ĐH, khách hàng, số điện thoại..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[1rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                                className="w-full lg:w-60 pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-[1rem] text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none transition-all cursor-pointer shadow-sm shadow-gray-100"
                                value={activeTab}
                                onChange={(e) => setActiveTab(e.target.value)}
                            >
                                {ORDER_STATUSES.map(status => (
                                    <option key={status.id} value={status.id}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 w-10">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                            checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </div>
                                </th>
                                {TABLE_COLUMNS.map(col => (
                                    <th key={col.key} className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-left">
                                        {col.label}
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-transparent">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length + 2} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-500 font-bold animate-pulse tracking-widest text-xs uppercase">Đang tải dữ liệu đơn hàng...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length + 2} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <Package className="w-16 h-16 opacity-20" />
                                            <p className="font-bold tracking-widest text-xs uppercase">Không tìm thấy đơn hàng nào khớp với " {searchTerm} "</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order) => {
                                const status = getStatusConfig(order.status);
                                return (
                                    <tr key={order.id} className={`group hover:bg-blue-50/40 transition-all ${selectedIds.includes(order.id) ? 'bg-blue-50/60' : ''}`}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                                    checked={selectedIds.includes(order.id)}
                                                    onChange={() => toggleSelect(order.id)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 group-hover:bg-white transition-colors">
                                                {order.order_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-gray-600">{getLabel(CUSTOMER_CATEGORIES, order.customer_category)}</td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{order.customer_name}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{order.recipient_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-gray-600">{getLabel(ORDER_TYPES, order.order_type)}</td>
                                        <td className="px-6 py-5 text-sm font-medium text-gray-600">{getLabel(PRODUCT_TYPES, order.product_type)}</td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black text-gray-900">{formatNumber(order.quantity)}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${status.color === 'blue' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                    status.color === 'orange' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${status.color === 'blue' ? 'bg-blue-600' :
                                                    status.color === 'yellow' ? 'bg-yellow-600' :
                                                        status.color === 'orange' ? 'bg-orange-600' :
                                                            'bg-gray-600'
                                                    }`}></div>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-gray-500">
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : '---'}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handlePrint(order)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm"
                                                    title="In đơn hàng"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(order)}
                                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all shadow-sm"
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Total Count Footbar */}
                <div className="p-6 bg-gray-50/30 flex items-center justify-between border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                        Tổng số: <span className="text-gray-900 font-bold">{filteredOrders.length}</span> đơn hàng
                    </p>
                </div>
            </div>

            {/* ACTION MODAL */}
            {isActionModalOpen && (
                <OrderStatusUpdater
                    order={selectedOrder}
                    userRole={role}
                    onClose={() => setIsActionModalOpen(false)}
                    onUpdateSuccess={() => {
                        fetchOrders();
                        setIsActionModalOpen(false);
                    }}
                />
            )}

            {/* Hidden Print Template */}
            <div className="print-only-content">
                <OrderPrintTemplate orders={ordersToPrint} />
            </div>
        </div>
    );
};

export default Orders;
