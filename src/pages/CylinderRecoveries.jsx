import {
    BarChart2,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Edit,
    Filter,
    List,
    MapPin,
    Package,
    PackageCheck,
    Phone,
    Plus,
    Printer,
    Search,
    SlidersHorizontal,
    Trash2,
    User,
    X
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import CylinderRecoveryPrintTemplate from '../components/CylinderRecovery/CylinderRecoveryPrintTemplate';
import CylinderRecoveryFormModal from '../components/CylinderRecovery/CylinderRecoveryFormModal';
import ColumnPicker from '../components/ui/ColumnPicker';
import FilterDropdown from '../components/ui/FilterDropdown';
import MobileFilterSheet from '../components/ui/MobileFilterSheet';
import { RECOVERY_STATUSES, RECOVERY_TABLE_COLUMNS } from '../constants/recoveryConstants';
import usePermissions from '../hooks/usePermissions';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend as ChartLegend,
    Tooltip as ChartTooltip,
    LinearScale,
    LineElement,
    PointElement,
    Title
} from 'chart.js';
import { Bar as BarChartJS, Pie as PieChartJS } from 'react-chartjs-2';
import { supabase } from '../supabase/config';
import { toast } from 'react-toastify';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    ChartTooltip,
    ChartLegend
);

const chartColors = [
    'rgba(37, 99, 235, 0.8)',   // blue-600
    'rgba(16, 185, 129, 0.8)',  // emerald-500
    'rgba(245, 158, 11, 0.8)',  // amber-500
    'rgba(139, 92, 246, 0.8)',  // violet-500
    'rgba(244, 63, 94, 0.8)',   // rose-500
    'rgba(6, 182, 212, 0.8)',   // cyan-500
    'rgba(234, 179, 8, 0.8)',   // yellow-500
    'rgba(75, 85, 99, 0.8)',    // gray-600
];

const CylinderRecoveries = () => {
    const navigate = useNavigate();
    const { role } = usePermissions();
    const [activeView, setActiveView] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [recoveries, setRecoveries] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [warehousesList, setWarehousesList] = useState([]);

    // UI States
    const [selectedIds, setSelectedIds] = useState([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [recoveryToEdit, setRecoveryToEdit] = useState(null);
    const [recoveriesToPrint, setRecoveriesToPrint] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [filterSearch, setFilterSearch] = useState('');
    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [mobileFilterClosing, setMobileFilterClosing] = useState(false);
    const [pendingStatuses, setPendingStatuses] = useState([]);
    const [pendingCustomers, setPendingCustomers] = useState([]);
    const [pendingWarehouses, setPendingWarehouses] = useState([]);

    const openMobileFilter = () => {
        setPendingStatuses(selectedStatuses);
        setPendingCustomers(selectedCustomers);
        setPendingWarehouses(selectedWarehouses);
        setShowMobileFilter(true);
    };

    const closeMobileFilter = () => {
        setMobileFilterClosing(true);
        setTimeout(() => {
            setShowMobileFilter(false);
            setMobileFilterClosing(false);
        }, 300);
    };

    const applyMobileFilter = () => {
        setSelectedStatuses(pendingStatuses);
        setSelectedCustomers(pendingCustomers);
        setSelectedWarehouses(pendingWarehouses);
        closeMobileFilter();
    };

    // Filter State
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [selectedWarehouses, setSelectedWarehouses] = useState([]);

    const hasActiveFilters = selectedStatuses.length > 0 || selectedCustomers.length > 0 || selectedWarehouses.length > 0;
    const totalActiveFilters = selectedStatuses.length + selectedCustomers.length + selectedWarehouses.length;

    const getFilterButtonClass = (id, active) => {
        if (!active) return "border-border bg-white text-muted-foreground hover:bg-slate-50 hover:text-slate-600 shadow-sm";

        switch (id) {
            case 'status': return "border-blue-200 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50";
            case 'customers': return "border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-100/50";
            case 'warehouses': return "border-violet-200 bg-violet-50 text-violet-700 shadow-sm shadow-violet-100/50";
            default: return "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10";
        }
    };

    const getFilterIconClass = (id, active) => {
        if (!active) {
            switch (id) {
                case 'status': return "text-blue-500/70";
                case 'customers': return "text-cyan-500/70";
                case 'warehouses': return "text-violet-500/70";
                default: return "text-slate-400";
            }
        }

        switch (id) {
            case 'status': return "text-blue-700";
            case 'customers': return "text-cyan-700";
            case 'warehouses': return "text-violet-700";
            default: return "text-primary";
        }
    };

    const getFilterCountBadgeClass = (id) => {
        switch (id) {
            case 'status': return "bg-blue-600 text-white";
            case 'customers': return "bg-cyan-600 text-white";
            case 'warehouses': return "bg-violet-600 text-white";
            default: return "bg-primary text-white";
        }
    };

    // Refs
    const columnPickerRef = useRef(null);
    const dropdownRef = useRef(null);
    const listDropdownRef = useRef(null);
    const statsDropdownRef = useRef(null);

    // Column Management
    const defaultColOrder = RECOVERY_TABLE_COLUMNS.map(col => col.key);
    const columnDefs = RECOVERY_TABLE_COLUMNS.reduce((acc, col) => {
        acc[col.key] = { label: col.label };
        return acc;
    }, {});

    const [columnOrder, setColumnOrder] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('columns_recoveries_order') || 'null');
            if (Array.isArray(saved) && saved.length > 0) {
                const valid = saved.filter(key => defaultColOrder.includes(key));
                const missing = defaultColOrder.filter(key => !valid.includes(key));
                return [...valid, ...missing];
            }
        } catch { }
        return defaultColOrder;
    });

    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('columns_recoveries_visible') || 'null');
            if (Array.isArray(saved) && saved.length > 0) {
                return saved.filter(key => defaultColOrder.includes(key));
            }
        } catch { }
        return defaultColOrder;
    });

    useEffect(() => {
        localStorage.setItem('columns_recoveries_visible', JSON.stringify(visibleColumns));
        localStorage.setItem('columns_recoveries_order', JSON.stringify(columnOrder));
    }, [visibleColumns, columnOrder]);

    const visibleTableColumns = columnOrder
        .filter(key => visibleColumns.includes(key))
        .map(key => RECOVERY_TABLE_COLUMNS.find(col => col.key === key))
        .filter(Boolean);

    useEffect(() => {
        fetchRecoveries();
        fetchWarehouses();
        fetchCustomers();
        fetchOrders();
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data } = await supabase.from('customers').select('id, name').order('name');
            if (data) setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await supabase.from('orders').select('id, order_code');
            if (data) setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (columnPickerRef.current && !columnPickerRef.current.contains(event.target)) {
                setShowColumnPicker(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                listDropdownRef.current && !listDropdownRef.current.contains(event.target) &&
                statsDropdownRef.current && !statsDropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
                setFilterSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchRecoveries = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('cylinder_recoveries')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setRecoveries(data || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Không thể tải danh sách phiếu thu hồi');
        } finally {
            setLoading(false);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const { data } = await supabase.from('warehouses').select('id, name').eq('status', 'Đang hoạt động').order('name');
            if (data) setWarehousesList(data);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    const handleFormSuccess = () => {
        setIsFormModalOpen(false);
        setRecoveryToEdit(null);
        fetchRecoveries();
    };

    const handleEdit = (recovery) => {
        setRecoveryToEdit(recovery);
        setIsFormModalOpen(true);
    };

    const handlePrintSingle = (recovery) => {
        setRecoveriesToPrint([{
            ...recovery,
            customerName: getCustomerName(recovery.customer_id)
        }]);
    };

    const handleBatchPrint = () => {
        if (selectedIds.length === 0) return;
        const toPrint = recoveries
            .filter(r => selectedIds.includes(r.id))
            .map(r => ({
                ...r,
                customerName: getCustomerName(r.customer_id)
            }));
        setRecoveriesToPrint(toPrint);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredRecoveries.length && filteredRecoveries.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredRecoveries.map(r => r.id));
        }
    };

    const formatNumber = (num) => {
        if (num === null || num === undefined) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const getCustomerName = (id) => {
        return customers.find(c => c.id === id)?.name || id;
    };

    const getWarehouseLabel = (id) => {
        return warehousesList.find(w => w.id === id)?.name || id;
    };

    const getOrderCode = (id) => {
        if (!id) return '—';
        const order = orders.find(o => o.id === id);
        return order ? `ĐH ${order.order_code}` : '—';
    };

    const getStatusBadgeClass = (statusColor) => clsx(
        'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold',
        statusColor === 'blue' && 'bg-blue-100 text-blue-700',
        statusColor === 'yellow' && 'bg-amber-100 text-amber-700',
        statusColor === 'orange' && 'bg-orange-100 text-orange-700',
        statusColor === 'green' && 'bg-emerald-100 text-emerald-700',
        statusColor === 'red' && 'bg-red-100 text-red-700',
        statusColor === 'gray' && 'bg-muted text-muted-foreground',
        !statusColor && 'bg-muted text-muted-foreground'
    );

    const filteredRecoveries = recoveries.filter(recovery => {
        const searchMatch =
            (recovery.recovery_code?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (getCustomerName(recovery.customer_id).toLowerCase().includes(searchTerm.toLowerCase())) ||
            (recovery.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()));

        const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(recovery.status);
        const customerMatch = selectedCustomers.length === 0 || selectedCustomers.includes(recovery.customer_id);
        const warehouseMatch = selectedWarehouses.length === 0 || selectedWarehouses.includes(recovery.warehouse_id);

        return searchMatch && statusMatch && customerMatch && warehouseMatch;
    });

    const getStatusStats = () => {
        return RECOVERY_STATUSES.filter(s => s.id !== 'ALL').map(s => ({
            name: s.label,
            value: filteredRecoveries.filter(r => r.status === s.id).length
        }));
    };

    const getCustomerStats = () => {
        const counts = {};
        filteredRecoveries.forEach(r => {
            const name = getCustomerName(r.customer_id);
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    };

    const getWarehouseStats = () => {
        const counts = {};
        filteredRecoveries.forEach(r => {
            const name = getWarehouseLabel(r.warehouse_id);
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    };

    const getTrendData = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const counts = {};
        filteredRecoveries.forEach(r => {
            if (!r.created_at) return;
            const date = r.created_at.split('T')[0];
            counts[date] = (counts[date] || 0) + 1;
        });

        return {
            labels: last7Days.map(d => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })),
            values: last7Days.map(d => counts[d] || 0)
        };
    };

    const getRowStyle = (isSelected) => {
        return clsx(
            "group border-l-4 transition-colors",
            isSelected ? "bg-blue-50/40 border-l-blue-500" : "border-l-transparent hover:bg-blue-50/60"
        );
    };

    const statusOptions = RECOVERY_STATUSES.filter(s => s.id !== 'ALL').map(s => ({
        id: s.id,
        label: s.label,
        count: recoveries.filter(r => r.status === s.id).length
    }));

    const customerOptions = customers.map(c => ({
        id: c.id,
        label: c.name,
        count: recoveries.filter(r => r.customer_id === c.id).length
    }));

    const warehouseOptions = warehousesList.map(w => ({
        id: w.id,
        label: w.name,
        count: recoveries.filter(r => r.warehouse_id === w.id).length
    }));

    const isColumnVisible = (key) => visibleColumns.includes(key);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex-1 flex flex-col mt-1 min-h-0 px-1 md:px-1.5">
            {/* View Switching Tabs */}
            <div className="flex items-center gap-1 mb-3 mt-1">
                <button
                    onClick={() => setActiveView('list')}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all",
                        activeView === 'list'
                            ? "bg-white text-primary shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <List size={14} />
                    Danh sách
                </button>
                <button
                    onClick={() => setActiveView('stats')}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all",
                        activeView === 'stats'
                            ? "bg-white text-primary shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <BarChart2 size={14} />
                    Thống kê
                </button>
            </div>

            {activeView === 'list' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col flex-1 min-h-0 w-full">
                    {/* ── MOBILE TOOLBAR ── */}
                    <div className="md:hidden flex items-center gap-2 p-3 border-b border-border">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl border border-border bg-white text-muted-foreground shrink-0"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm . . ."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-muted/20 border border-border/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={openMobileFilter}
                            className={clsx(
                                'relative p-2 rounded-xl border shrink-0 transition-all',
                                hasActiveFilters ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10' : 'border-border bg-white text-muted-foreground',
                            )}
                        >
                            <Filter size={18} />
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                                    {totalActiveFilters}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { setRecoveryToEdit(null); setIsFormModalOpen(true); }}
                            className="p-2 rounded-xl bg-primary text-white shrink-0 shadow-md shadow-primary/20"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* ── MOBILE CARD LIST ── */}
                    <div className="md:hidden flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                        {loading ? (
                            <div className="py-16 text-center text-[13px] text-muted-foreground italic">Đang tải dữ liệu...</div>
                        ) : filteredRecoveries.length === 0 ? (
                            <div className="py-16 text-center text-[13px] text-muted-foreground italic">Không tìm thấy kết quả phù hợp</div>
                        ) : (
                            filteredRecoveries.map((recovery) => {
                                const status = RECOVERY_STATUSES.find(s => s.id === recovery.status) || RECOVERY_STATUSES[0];
                                return (
                                    <div key={recovery.id} className="bg-white border border-primary/15 rounded-2xl p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                    checked={selectedIds.includes(recovery.id)}
                                                    onChange={() => toggleSelect(recovery.id)}
                                                />
                                                <span className="text-[13px] font-bold text-foreground">{recovery.recovery_code}</span>
                                            </div>
                                            <span className={clsx(getStatusBadgeClass(status.color), 'text-[10px] uppercase')}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <h3 className="text-[14px] font-bold text-foreground leading-snug">{getCustomerName(recovery.customer_id)}</h3>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                {recovery.order_id && (
                                                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                        ĐH {getOrderCode(recovery.order_id)}
                                                    </span>
                                                )}
                                                <span className="text-[11px] font-medium text-muted-foreground">{recovery.recovery_date ? new Date(recovery.recovery_date).toLocaleDateString('vi-VN') : '---'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-2 text-xs mb-3 bg-muted/10 rounded-xl p-2.5 border border-border/60">
                                            <div className="space-y-1">
                                                <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                                                    <Package className="w-3.5 h-3.5 text-blue-600" />
                                                    <span className="text-foreground font-bold">SL Vỏ: {recovery.total_items || 0}</span>
                                                </p>
                                            </div>
                                            <div className="space-y-1 pl-2 border-l border-border">
                                                <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                                    Kho: {getWarehouseLabel(recovery.warehouse_id)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-border">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Tài xế</span>
                                                <span className="text-[12px] font-bold text-foreground">{recovery.driver_name || '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handlePrintSingle(recovery)}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(recovery)}
                                                    className="p-2 text-amber-700 bg-amber-50 border border-amber-100 rounded-lg"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* ── DESKTOP TOOLBAR ── */}
                    <div className="hidden md:block p-3 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 flex-1">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"
                                >
                                    <ChevronLeft size={16} />
                                    Quay lại
                                </button>
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm mã phiếu, khách hàng..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-8 py-1.5 bg-muted/20 border border-border/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedIds.length > 0 && (
                                    <button
                                        onClick={handleBatchPrint}
                                        className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-border bg-white text-muted-foreground text-[13px] font-bold hover:bg-muted/20 shadow-sm transition-all"
                                    >
                                        <Printer size={16} />
                                        In {selectedIds.length} phiếu
                                    </button>
                                )}
                                <div className="relative" ref={columnPickerRef}>
                                    <button
                                        onClick={() => setShowColumnPicker(prev => !prev)}
                                        className={clsx(
                                            'flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[13px] font-bold transition-all bg-white shadow-sm',
                                            showColumnPicker
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border text-muted-foreground hover:bg-muted/20'
                                        )}
                                    >
                                        <SlidersHorizontal size={16} />
                                        Cột ({visibleColumns.length}/{RECOVERY_TABLE_COLUMNS.length})
                                    </button>
                                    {showColumnPicker && (
                                        <ColumnPicker
                                            columnOrder={columnOrder}
                                            setColumnOrder={setColumnOrder}
                                            visibleColumns={visibleColumns}
                                            setVisibleColumns={setVisibleColumns}
                                            defaultColOrder={defaultColOrder}
                                            columnDefs={columnDefs}
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={() => { setRecoveryToEdit(null); setIsFormModalOpen(true); }}
                                    className="flex items-center gap-2 px-6 py-1.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
                                >
                                    <Plus size={18} />
                                    Tạo phiếu thu hồi
                                </button>
                            </div>
                        </div>

                        {/* Secondary Filters */}
                        <div className="flex flex-wrap items-center gap-2" ref={listDropdownRef}>
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        if (activeDropdown !== 'status') setFilterSearch('');
                                        setActiveDropdown(activeDropdown === 'status' ? null : 'status');
                                    }}
                                    className={clsx(
                                        "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all",
                                        getFilterButtonClass('status', activeDropdown === 'status' || selectedStatuses.length > 0)
                                    )}
                                >
                                    <Filter size={14} className={getFilterIconClass('status', activeDropdown === 'status' || selectedStatuses.length > 0)} />
                                    Trạng thái
                                    {selectedStatuses.length > 0 && (
                                        <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('status'))}>
                                            {selectedStatuses.length}
                                        </span>
                                    )}
                                    <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'status' ? "rotate-180" : "")} />
                                </button>
                                {activeDropdown === 'status' && (
                                    <FilterDropdown
                                        options={statusOptions}
                                        selected={selectedStatuses}
                                        setSelected={setSelectedStatuses}
                                        filterSearch={filterSearch}
                                        setFilterSearch={setFilterSearch}
                                    />
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => {
                                        if (activeDropdown !== 'customers') setFilterSearch('');
                                        setActiveDropdown(activeDropdown === 'customers' ? null : 'customers');
                                    }}
                                    className={clsx(
                                        "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all",
                                        getFilterButtonClass('customers', activeDropdown === 'customers' || selectedCustomers.length > 0)
                                    )}
                                >
                                    <User size={14} className={getFilterIconClass('customers', activeDropdown === 'customers' || selectedCustomers.length > 0)} />
                                    Khách hàng
                                    {selectedCustomers.length > 0 && (
                                        <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('customers'))}>
                                            {selectedCustomers.length}
                                        </span>
                                    )}
                                    <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'customers' ? "rotate-180" : "")} />
                                </button>
                                {activeDropdown === 'customers' && (
                                    <FilterDropdown
                                        options={customerOptions}
                                        selected={selectedCustomers}
                                        setSelected={setSelectedCustomers}
                                        filterSearch={filterSearch}
                                        setFilterSearch={setFilterSearch}
                                    />
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => {
                                        if (activeDropdown !== 'warehouses') setFilterSearch('');
                                        setActiveDropdown(activeDropdown === 'warehouses' ? null : 'warehouses');
                                    }}
                                    className={clsx(
                                        "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all",
                                        getFilterButtonClass('warehouses', activeDropdown === 'warehouses' || selectedWarehouses.length > 0)
                                    )}
                                >
                                    <MapPin size={14} className={getFilterIconClass('warehouses', activeDropdown === 'warehouses' || selectedWarehouses.length > 0)} />
                                    Kho nhận
                                    {selectedWarehouses.length > 0 && (
                                        <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('warehouses'))}>
                                            {selectedWarehouses.length}
                                        </span>
                                    )}
                                    <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'warehouses' ? "rotate-180" : "")} />
                                </button>
                                {activeDropdown === 'warehouses' && (
                                    <FilterDropdown
                                        options={warehouseOptions}
                                        selected={selectedWarehouses}
                                        setSelected={setSelectedWarehouses}
                                        filterSearch={filterSearch}
                                        setFilterSearch={setFilterSearch}
                                    />
                                )}
                            </div>

                            {hasActiveFilters && (
                                <button
                                    onClick={() => {
                                        setSelectedStatuses([]);
                                        setSelectedCustomers([]);
                                        setSelectedWarehouses([]);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-red-300 text-red-500 text-[12px] font-bold hover:bg-red-50 transition-all"
                                >
                                    <X size={14} />
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table Content Area */}
                    <div className="hidden md:block flex-1 overflow-x-auto bg-white">
                        <table className="w-full border-collapse">
                            <thead className="bg-[#F1F5FF]">
                                <tr>
                                    <th className="px-4 py-3.5 w-10">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                checked={selectedIds.length === filteredRecoveries.length && filteredRecoveries.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </div>
                                    </th>
                                    {visibleTableColumns.map(col => (
                                        <th
                                            key={col.key}
                                            className={clsx(
                                                "px-4 py-3.5 text-[12px] font-bold text-muted-foreground text-left uppercase tracking-wide",
                                                col.key === 'recovery_code' && 'border-l border-r border-primary/10'
                                            )}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="sticky right-0 z-30 bg-[#F1F5FF] px-4 py-3.5 text-[12px] font-bold text-muted-foreground text-center uppercase tracking-wide shadow-[-6px_0_10px_-8px_rgba(15,23,42,0.35)] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-slate-300">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan={visibleTableColumns.length + 2} className="px-4 py-16 text-center text-muted-foreground">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : filteredRecoveries.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleTableColumns.length + 2} className="px-4 py-16 text-center text-muted-foreground">
                                            Không tìm thấy phiếu nào
                                        </td>
                                    </tr>
                                ) : filteredRecoveries.map((recovery) => {
                                    const status = RECOVERY_STATUSES.find(s => s.id === recovery.status) || RECOVERY_STATUSES[0];
                                    return (
                                        <tr key={recovery.id} className={getRowStyle(selectedIds.includes(recovery.id))}>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                        checked={selectedIds.includes(recovery.id)}
                                                        onChange={() => toggleSelect(recovery.id)}
                                                    />
                                                </div>
                                            </td>
                                            {isColumnVisible('recovery_code') && (
                                                <td className="px-4 py-4 whitespace-nowrap border-l border-r border-primary/10">
                                                    <span className="text-[13px] font-medium text-foreground">
                                                        {recovery.recovery_code}
                                                    </span>
                                                </td>
                                            )}
                                            {isColumnVisible('recovery_date') && (
                                                <td className="px-4 py-4 text-[13px] text-muted-foreground font-normal">
                                                    {recovery.recovery_date ? new Date(recovery.recovery_date).toLocaleDateString('vi-VN') : '---'}
                                                </td>
                                            )}
                                            {isColumnVisible('customer_id') && (
                                                <td className="px-4 py-4">
                                                    <span className="text-[13px] font-medium text-foreground">{getCustomerName(recovery.customer_id)}</span>
                                                </td>
                                            )}
                                            {isColumnVisible('order_id') && (
                                                <td className="px-4 py-4">
                                                    <span className="text-[13px] font-bold text-blue-600">
                                                        {recovery.order_id ? `ĐH ${getOrderCode(recovery.order_id) || '—'}` : '—'}
                                                    </span>
                                                </td>
                                            )}
                                            {isColumnVisible('warehouse_id') && (
                                                <td className="px-4 py-4 text-[13px] text-muted-foreground font-normal">
                                                    {getWarehouseLabel(recovery.warehouse_id)}
                                                </td>
                                            )}
                                            {isColumnVisible('driver_name') && (
                                                <td className="px-4 py-4 text-[13px] text-muted-foreground font-normal">
                                                    {recovery.driver_name || '—'}
                                                </td>
                                            )}
                                            {isColumnVisible('total_items') && (
                                                <td className="px-4 py-4">
                                                    <span className="text-[13px] font-semibold text-foreground">{recovery.total_items || 0}</span>
                                                </td>
                                            )}
                                            {isColumnVisible('status') && (
                                                <td className="px-4 py-4">
                                                    <span className={clsx(getStatusBadgeClass(status.color), "uppercase text-[10px]")}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="sticky right-0 z-20 bg-white px-4 py-4 text-center shadow-[-6px_0_10px_-8px_rgba(15,23,42,0.25)] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-slate-300">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handlePrintSingle(recovery)}
                                                        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-primary/10"
                                                        title="In phiếu"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(recovery)}
                                                        className="text-amber-600/80 hover:text-amber-700 transition-colors p-1 rounded hover:bg-amber-50"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(recovery.id, recovery.recovery_code)}
                                                        className="text-red-600/80 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination matching Orders.jsx */}
                    <div className="hidden md:flex px-4 py-4 border-t border-border items-center justify-between bg-muted/5">
                        <div className="flex items-center gap-3 text-[12px] text-muted-foreground font-medium">
                            <span>{filteredRecoveries.length > 0 ? `1–${filteredRecoveries.length}` : '0'}/Tổng {filteredRecoveries.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled>
                                <ChevronLeft size={16} />
                                <ChevronLeft size={16} className="-ml-2.5" />
                            </button>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled>
                                <ChevronLeft size={16} />
                            </button>
                            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-[12px] font-bold shadow-md shadow-primary/25">1</div>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled>
                                <ChevronRight size={16} />
                            </button>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled>
                                <ChevronRight size={16} />
                                <ChevronRight size={16} className="-ml-2.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'stats' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-0 flex flex-col">
                        {/* Mobile Header */}
                        <div className="md:hidden flex items-center gap-2 p-3 border-b border-border">
                            <button
                                onClick={() => setActiveView('list')}
                                className="p-2 rounded-xl border border-border bg-white text-muted-foreground shrink-0"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <h2 className="text-base font-bold text-foreground flex-1 text-center">Thống kê</h2>
                            <button
                                onClick={openMobileFilter}
                                className={clsx(
                                    'relative p-2 rounded-xl border shrink-0 transition-all',
                                    hasActiveFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground',
                                )}
                            >
                                <Filter size={18} />
                                {hasActiveFilters && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                                        {totalActiveFilters}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Desktop Header */}
                        <div className="hidden md:block p-4 border-b border-border" ref={statsDropdownRef}>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setActiveView('list')}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"
                                >
                                    <ChevronLeft size={16} />
                                    Quay lại
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            if (activeDropdown !== 'status') setFilterSearch('');
                                            setActiveDropdown(activeDropdown === 'status' ? null : 'status');
                                        }}
                                        className={clsx(
                                            "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all",
                                            getFilterButtonClass('status', activeDropdown === 'status' || selectedStatuses.length > 0)
                                        )}
                                    >
                                        <Filter size={14} className={getFilterIconClass('status', activeDropdown === 'status' || selectedStatuses.length > 0)} />
                                        Trạng thái
                                        {selectedStatuses.length > 0 && (
                                            <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('status'))}>
                                                {selectedStatuses.length}
                                            </span>
                                        )}
                                        <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'status' ? "rotate-180" : "")} />
                                    </button>
                                    {activeDropdown === 'status' && (
                                        <FilterDropdown
                                            options={statusOptions}
                                            selected={selectedStatuses}
                                            setSelected={setSelectedStatuses}
                                            filterSearch={filterSearch}
                                            setFilterSearch={setFilterSearch}
                                        />
                                    )}
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            if (activeDropdown !== 'customers') setFilterSearch('');
                                            setActiveDropdown(activeDropdown === 'customers' ? null : 'customers');
                                        }}
                                        className={clsx(
                                            "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all",
                                            getFilterButtonClass('customers', activeDropdown === 'customers' || selectedCustomers.length > 0)
                                        )}
                                    >
                                        <User size={14} className={getFilterIconClass('customers', activeDropdown === 'customers' || selectedCustomers.length > 0)} />
                                        Khách hàng
                                        {selectedCustomers.length > 0 && (
                                            <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('customers'))}>
                                                {selectedCustomers.length}
                                            </span>
                                        )}
                                        <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'customers' ? "rotate-180" : "")} />
                                    </button>
                                    {activeDropdown === 'customers' && (
                                        <FilterDropdown
                                            options={customerOptions}
                                            selected={selectedCustomers}
                                            setSelected={setSelectedCustomers}
                                            filterSearch={filterSearch}
                                            setFilterSearch={setFilterSearch}
                                        />
                                    )}
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            if (activeDropdown !== 'warehouses') setFilterSearch('');
                                            setActiveDropdown(activeDropdown === 'warehouses' ? null : 'warehouses');
                                        }}
                                        className={clsx(
                                            "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all",
                                            getFilterButtonClass('warehouses', activeDropdown === 'warehouses' || selectedWarehouses.length > 0)
                                        )}
                                    >
                                        <MapPin size={14} className={getFilterIconClass('warehouses', activeDropdown === 'warehouses' || selectedWarehouses.length > 0)} />
                                        Kho nhận
                                        {selectedWarehouses.length > 0 && (
                                            <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('warehouses'))}>
                                                {selectedWarehouses.length}
                                            </span>
                                        )}
                                        <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'warehouses' ? "rotate-180" : "")} />
                                    </button>
                                    {activeDropdown === 'warehouses' && (
                                        <FilterDropdown
                                            options={warehouseOptions}
                                            selected={selectedWarehouses}
                                            setSelected={setSelectedWarehouses}
                                            filterSearch={filterSearch}
                                            setFilterSearch={setFilterSearch}
                                        />
                                    )}
                                </div>

                                {hasActiveFilters && (
                                    <button
                                        onClick={() => {
                                            setSelectedStatuses([]);
                                            setSelectedCustomers([]);
                                            setSelectedWarehouses([]);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-red-300 text-red-500 text-[12px] font-bold hover:bg-red-50 transition-all"
                                    >
                                        <X size={14} />
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="px-3 md:px-4 pt-4 md:pt-5 pb-8 space-y-5">
                            {/* Summary Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center justify-start gap-4">
                                        <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-blue-200/70">
                                            <PackageCheck className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Tổng phiếu thu hồi</p>
                                            <p className="text-3xl font-bold text-foreground mt-1">{formatNumber(filteredRecoveries.length)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center justify-start gap-4">
                                        <div className="w-12 h-12 bg-emerald-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-emerald-200/70">
                                            <Package className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Tổng số vỏ thu hồi</p>
                                            <p className="text-3xl font-bold text-foreground mt-1">
                                                {formatNumber(filteredRecoveries.reduce((sum, r) => sum + (r.total_items || 0), 0))}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-4">Thống kê theo trạng thái</h3>
                                    <div style={{ height: '300px' }}>
                                        <PieChartJS
                                            data={{
                                                labels: getStatusStats().map(s => s.name),
                                                datasets: [{
                                                    data: getStatusStats().map(s => s.value),
                                                    backgroundColor: chartColors.slice(0, getStatusStats().length),
                                                    borderColor: '#fff',
                                                    borderWidth: 2
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-4">Xu hướng thu hồi (7 ngày)</h3>
                                    <div style={{ height: '300px' }}>
                                        <BarChartJS
                                            data={{
                                                labels: getTrendData().labels,
                                                datasets: [{
                                                    label: 'Số phiếu',
                                                    data: getTrendData().values,
                                                    backgroundColor: chartColors[0],
                                                    borderColor: chartColors[0],
                                                    borderWidth: 1
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-4">Top 10 Khách hàng thu hồi</h3>
                                    <div style={{ height: '300px' }}>
                                        <BarChartJS
                                            data={{
                                                labels: getCustomerStats().map(c => c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name),
                                                datasets: [{
                                                    label: 'Số phiếu',
                                                    data: getCustomerStats().map(c => c.value),
                                                    backgroundColor: chartColors[2],
                                                    borderColor: chartColors[2],
                                                    borderWidth: 1
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                indexAxis: 'y',
                                                plugins: {
                                                    legend: {
                                                        display: false
                                                    }
                                                },
                                                scales: {
                                                    x: {
                                                        beginAtZero: true
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-4">Phân bổ theo Kho nhận</h3>
                                    <div style={{ height: '300px' }}>
                                        <BarChartJS
                                            data={{
                                                labels: getWarehouseStats().map(w => w.name),
                                                datasets: [{
                                                    label: 'Số phiếu',
                                                    data: getWarehouseStats().map(w => w.value),
                                                    backgroundColor: chartColors[1],
                                                    borderColor: chartColors[1],
                                                    borderWidth: 1
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal & Portal */}
            {isFormModalOpen && (
                <CylinderRecoveryFormModal
                    recovery={recoveryToEdit}
                    onClose={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSuccess}
                />
            )}

            {createPortal(
                <div className="print-only-container">
                    {recoveriesToPrint?.map((rec, idx) => (
                        <div key={rec.id}>
                            <CylinderRecoveryPrintTemplate
                                recovery={rec}
                                customerName={rec.customerName}
                                onPrinted={idx === recoveriesToPrint.length - 1 ? () => setRecoveriesToPrint(null) : null}
                            />
                            {idx < recoveriesToPrint.length - 1 && <div style={{ pageBreakAfter: 'always' }} />}
                        </div>
                    ))}
                </div>,
                document.body
            )}
            {/* ── MOBILE FILTER BOTTOM SHEET ── */}
            {showMobileFilter && createPortal(
                <MobileFilterSheet
                    isOpen={showMobileFilter}
                    isClosing={mobileFilterClosing}
                    onClose={closeMobileFilter}
                    onApply={applyMobileFilter}
                    sections={[
                        {
                            id: 'status',
                            label: 'Trạng thái',
                            icon: <Filter size={16} className="text-blue-600" />,
                            options: statusOptions,
                            selectedValues: pendingStatuses,
                            onSelectionChange: setPendingStatuses,
                        },
                        {
                            id: 'customers',
                            label: 'Khách hàng',
                            icon: <User size={16} className="text-cyan-600" />,
                            options: customerOptions,
                            selectedValues: pendingCustomers,
                            onSelectionChange: setPendingCustomers,
                        },
                        {
                            id: 'warehouses',
                            label: 'Kho nhận',
                            icon: <MapPin size={16} className="text-emerald-600" />,
                            options: warehouseOptions,
                            selectedValues: pendingWarehouses,
                            onSelectionChange: setPendingWarehouses,
                        },
                    ]}
                />,
                document.body
            )}
        </div>
    );
};

export default CylinderRecoveries;
