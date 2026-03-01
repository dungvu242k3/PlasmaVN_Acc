import {
    ChevronDown,
    Edit,
    Filter,
    MoreHorizontal,
    Package,
    Printer,
    Search,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ColumnToggle from '../components/ColumnToggle';
import OrderPrintTemplate from '../components/OrderPrintTemplate';
import OrderFormModal from '../components/Orders/OrderFormModal';
import OrderStatusUpdater from '../components/Orders/OrderStatusUpdater';
import {
    CUSTOMER_CATEGORIES,
    ORDER_STATUSES,
    ORDER_TYPES,
    PRODUCT_TYPES,
    TABLE_COLUMNS
} from '../constants/orderConstants';
import useColumnVisibility from '../hooks/useColumnVisibility';
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
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [orderToEdit, setOrderToEdit] = useState(null);
    const [serialsModalOrder, setSerialsModalOrder] = useState(null);
    const { visibleColumns, toggleColumn, isColumnVisible, resetColumns, visibleCount, totalCount } = useColumnVisibility('columns_orders', TABLE_COLUMNS);
    const visibleTableColumns = TABLE_COLUMNS.filter(col => isColumnVisible(col.key));

    const formatNumber = (num) => {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
        return matchesSearch && matchesStatus;
    });

    const getStatusConfig = (statusId) => {
        return ORDER_STATUSES.find(s => s.id === statusId) || ORDER_STATUSES[0];
    };

    const getLabel = (list, id) => {
        return list.find(item => item.id === id)?.label || id;
    };

    const handlePrint = (order) => {
        setOrdersToPrint(order);
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

    const handleDeleteOrder = async (id, orderCode) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${orderCode} không?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('❌ Có lỗi xảy ra khi xóa đơn hàng: ' + error.message);
        }
    };

    const handleEditOrder = (order) => {
        setOrderToEdit(order);
        setIsFormModalOpen(true);
    };

    const handleFormSubmitSuccess = () => {
        fetchOrders();
        setIsFormModalOpen(false);
    };

    const getRowStyle = (category, isSelected) => {
        let baseStyle = "group hover-lift transition-all duration-300 border-l-4 ";
        if (isSelected) baseStyle += "bg-blue-50/40 border-l-blue-600 ";
        else {
            switch (category) {
                case 'KH_SI': baseStyle += "border-l-indigo-500 hover:bg-indigo-50/10 "; break;
                case 'KH_LE': baseStyle += "border-l-emerald-500 hover:bg-emerald-50/10 "; break;
                default: baseStyle += "border-l-transparent hover:bg-blue-50/5 ";
            }
        }
        return baseStyle;
    };

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen noise-bg">
            {/* Decorative Background Blobs */}
            <div className="blob blob-blue w-[500px] h-[500px] -top-20 -left-20 opacity-20"></div>
            <div className="blob blob-indigo w-[400px] h-[400px] top-1/2 -right-20 opacity-10"></div>
            <div className="blob blob-emerald w-[300px] h-[300px] bottom-10 left-1/3 opacity-10"></div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-10">
                <div className="hover-lift">
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 transition-transform hover:rotate-3 duration-300">
                            <Package className="w-8 h-8" />
                        </div>
                        Danh mục đơn hàng
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBulkPrint}
                        className={`flex items-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-widest rounded-2xl transition-all border shadow-lg ${selectedIds.length > 0
                            ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-blue-200 hover-lift'
                            : 'bg-white text-slate-300 border-slate-100 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <Printer className="w-4 h-4" />
                        In ({selectedIds.length})
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 glass">

                {/* Filters Top Bar */}
                <div className="p-8 flex flex-col lg:flex-row gap-6 items-center border-b border-slate-50 relative z-20 rounded-t-[2.5rem]">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã ĐH, khách hàng, số điện thoại..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-bold text-slate-600 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                className="w-full lg:w-72 pl-14 pr-10 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 appearance-none transition-all cursor-pointer shadow-soft group-hover:shadow-card"
                                value={activeTab}
                                onChange={(e) => setActiveTab(e.target.value)}
                            >
                                {ORDER_STATUSES.map(status => (
                                    <option key={status.id} value={status.id}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <ColumnToggle columns={TABLE_COLUMNS} visibleColumns={visibleColumns} onToggle={toggleColumn} onReset={resetColumns} visibleCount={visibleCount} totalCount={totalCount} />
                </div>

                {/* Table Section */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse min-w-[1200px] md:min-w-full">
                        <thead className="glass-header">
                            <tr>
                                <th className="px-8 py-5 w-10">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                            checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </div>
                                </th>
                                {visibleTableColumns.map(col => (
                                    <th key={col.key} className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-left">
                                        {col.label}
                                    </th>
                                ))}
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={visibleTableColumns.length + 2} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-slate-400 font-black animate-pulse tracking-widest text-xs uppercase">Đang tải dữ liệu đơn hàng...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleTableColumns.length + 2} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-6 text-slate-300">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                                                <Package className="w-10 h-10 opacity-30" />
                                            </div>
                                            <p className="font-black tracking-widest text-xs uppercase text-slate-400">Không tìm thấy đơn hàng nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order) => {
                                const status = getStatusConfig(order.status);
                                return (
                                    <tr key={order.id} className={getRowStyle(order.customer_category, selectedIds.includes(order.id))}>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                                    checked={selectedIds.includes(order.id)}
                                                    onChange={() => toggleSelect(order.id)}
                                                />
                                            </div>
                                        </td>
                                        {isColumnVisible('code') && <td className="px-8 py-6 whitespace-nowrap">
                                            <span className="text-sm font-black text-blue-700 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/50 group-hover:bg-white transition-all duration-300">
                                                {order.order_code}
                                            </span>
                                        </td>}
                                        {isColumnVisible('category') && <td className="px-8 py-6 text-sm font-bold text-slate-500">{getLabel(CUSTOMER_CATEGORIES, order.customer_category)}</td>}
                                        {isColumnVisible('customer') && <td className="px-8 py-6">
                                            <span className="text-sm font-black text-slate-800 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{order.customer_name}</span>
                                        </td>}
                                        {isColumnVisible('recipient') && <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-slate-600">{order.recipient_name}</span>
                                        </td>}
                                        {isColumnVisible('type') && <td className="px-8 py-6 text-sm font-bold text-slate-500">{getLabel(ORDER_TYPES, order.order_type)}</td>}
                                        {isColumnVisible('product') && <td className="px-8 py-6 text-sm font-bold text-slate-500">{getLabel(PRODUCT_TYPES, order.product_type)}</td>}
                                        {isColumnVisible('quantity') && <td className="px-8 py-6">
                                            <span className="text-sm font-black text-slate-900 bg-slate-100/50 px-3 py-1 rounded-lg">{formatNumber(order.quantity)}</span>
                                        </td>}
                                        {isColumnVisible('department') && <td className="px-8 py-6 text-sm font-bold text-slate-500">{order.department || '—'}</td>}
                                        {isColumnVisible('cylinders') && <td className="px-8 py-6 text-sm">
                                            {order.assigned_cylinders && order.assigned_cylinders.length > 0 ? (
                                                <button
                                                    onClick={() => setSerialsModalOrder(order)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all text-[11px] font-black tracking-widest uppercase border border-blue-100 shadow-sm"
                                                    title={order.assigned_cylinders.join('\n')}
                                                >
                                                    <Package className="w-3.5 h-3.5" />
                                                    {order.assigned_cylinders.length} Serial
                                                </button>
                                            ) : (
                                                <span className="text-slate-300 font-bold">—</span>
                                            )}
                                        </td>}
                                        {isColumnVisible('status') && <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm transition-all duration-300 ${status.color === 'blue' ? 'bg-blue-600 text-white border-blue-700 glow-blue' :
                                                status.color === 'yellow' ? 'bg-amber-500 text-white border-amber-600 glow-amber' :
                                                    status.color === 'orange' ? 'bg-orange-500 text-white border-orange-600 glow-amber' :
                                                        'bg-slate-500 text-white border-slate-600'
                                                }`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                                {status.label}
                                            </span>
                                        </td>}
                                        {isColumnVisible('date') && <td className="px-8 py-6 text-sm font-black text-slate-400">
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : '---'}
                                        </td>}
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => handlePrint(order)}
                                                    className="text-slate-400 hover:text-slate-900 transition-all outline-none"
                                                    title="In đơn hàng"
                                                >
                                                    <Printer className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditOrder(order)}
                                                    className="text-slate-400 hover:text-slate-900 transition-all outline-none"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id, order.order_code)}
                                                    className="text-slate-400 hover:text-slate-900 transition-all outline-none"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(order)}
                                                    className="text-slate-400 hover:text-slate-900 transition-all outline-none"
                                                    title="Cập nhật trạng thái"
                                                >
                                                    <MoreHorizontal className="w-4.5 h-4.5" />
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
                <div className="p-8 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                        Tổng quy mô: <span className="text-slate-900 text-lg ml-2">{filteredOrders.length}</span> đơn hàng định danh
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

            {/* SERIALS VIEW MODAL */}
            {serialsModalOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Mã Serial Vỏ Bình</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Đơn {serialsModalOrder.order_code}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                <Package className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                {serialsModalOrder.assigned_cylinders.map((serial, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2 text-center text-sm font-bold text-slate-700 font-mono">
                                        {serial}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto shrink-0">
                            <button
                                onClick={() => setSerialsModalOrder(null)}
                                className="w-full py-3 text-slate-600 font-bold text-sm bg-white hover:bg-slate-100 transition-colors rounded-xl border border-slate-200 shadow-sm"
                            >
                                Đóng lại
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Print Template */}
            <div className="print-only-content">
                <OrderPrintTemplate orders={ordersToPrint} />
            </div>

            {/* Form Modal */}
            {isFormModalOpen && (
                <OrderFormModal
                    order={orderToEdit}
                    onClose={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSubmitSuccess}
                />
            )}
        </div>
    );
};

export default Orders;
