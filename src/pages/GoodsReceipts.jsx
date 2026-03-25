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
import {
    BarChart2,
    CheckCircle,
    CheckSquare,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Edit,
    Filter,
    List,
    Package,
    Plus,
    Printer,
    Search,
    SlidersHorizontal,
    Trash2,
    User,
    X
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Bar as BarChartJS, Pie as PieChartJS } from 'react-chartjs-2';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import GoodsReceiptPrintTemplate from '../components/GoodsReceiptPrintTemplate';
import ColumnPicker from '../components/ui/ColumnPicker';
import FilterDropdown from '../components/ui/FilterDropdown';
import MobileFilterSheet from '../components/ui/MobileFilterSheet';
import GoodsReceiptFormModal from '../components/GoodsReceipts/GoodsReceiptFormModal';
import { RECEIPT_STATUSES, TABLE_COLUMNS } from '../constants/goodsReceiptConstants';
import { supabase } from '../supabase/config';
import { toast } from 'react-toastify';

// Register Chart.js components
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

const GoodsReceipts = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('list'); // 'list' or 'stats'
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectedWarehouses, setSelectedWarehouses] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [printData, setPrintData] = useState(null);
    const [warehousesList, setWarehousesList] = useState([]);

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    // Column Picker State
    const defaultColOrder = TABLE_COLUMNS.map(col => col.key);
    const columnDefs = TABLE_COLUMNS.reduce((acc, col) => {
        acc[col.key] = { label: col.label };
        return acc;
    }, {});

    const [columnOrder, setColumnOrder] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('columns_goods_receipts_order') || 'null');
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
            const saved = JSON.parse(localStorage.getItem('columns_goods_receipts_visible') || 'null');
            if (Array.isArray(saved) && saved.length > 0) {
                return saved.filter(key => defaultColOrder.includes(key));
            }
        } catch { }
        return defaultColOrder;
    });

    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const columnPickerRef = useRef(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [filterSearch, setFilterSearch] = useState('');
    const listDropdownRef = useRef(null);
    const statsDropdownRef = useRef(null);

    const isColumnVisible = (key) => visibleColumns.includes(key);
    const visibleTableColumns = columnOrder
        .filter(key => visibleColumns.includes(key))
        .map(key => TABLE_COLUMNS.find(col => col.key === key))
        .filter(Boolean);
    const visibleCount = visibleColumns.length;
    const totalCount = defaultColOrder.length;

    useEffect(() => {
        fetchReceipts();
        fetchWarehouses();
    }, []);

    useEffect(() => {
        localStorage.setItem('columns_goods_receipts_visible', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    useEffect(() => {
        localStorage.setItem('columns_goods_receipts_order', JSON.stringify(columnOrder));
    }, [columnOrder]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (columnPickerRef.current && !columnPickerRef.current.contains(event.target)) {
                setShowColumnPicker(false);
            }
        };
        if (showColumnPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showColumnPicker]);

    // Dropdown handlers
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isClickInsideList = listDropdownRef.current && listDropdownRef.current.contains(event.target);
            const isClickInsideStats = statsDropdownRef.current && statsDropdownRef.current.contains(event.target);

            if (activeDropdown && !isClickInsideList && !isClickInsideStats) {
                setActiveDropdown(null);
                setFilterSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    const fetchReceipts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('goods_receipts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReceipts(data || []);
        } catch (error) {
            console.error('Error loading receipts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const { data } = await supabase.from('warehouses').select('id, name').eq('status', 'Đang hoạt động').order('name');
            if (data) {
                setWarehousesList(data);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    const handleDeleteReceipt = async (id, code) => {
        if (!window.confirm(`Bạn có chắc muốn xóa phiếu nhập "${code}" không? Hành động này sẽ không thể hoàn tác.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('goods_receipts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchReceipts();
        } catch (error) {
            console.error('Error deleting receipt:', error);
            alert('❌ Lỗi khi xóa phiếu nhập: ' + error.message);
        }
    };

    const handlePrintReceipt = async (receipt) => {
        try {
            const { data: items, error } = await supabase
                .from('goods_receipt_items')
                .select('*')
                .eq('receipt_id', receipt.id);

            if (error) throw error;

            setPrintData({ receipt, items: items || [] });
            setTimeout(() => {
                window.print();
            }, 300);
        } catch (error) {
            console.error('Error fetching items for print:', error);
            alert('❌ Lỗi khi tải dữ liệu in: ' + error.message);
        }
    };

    const handleApproveReceipt = async (receipt) => {
        if (!window.confirm(`Xác nhận duyệt phiếu nhập "${receipt.receipt_code}"?\nHàng hóa sẽ được cộng vào tồn kho và không thể hoàn tác.`)) {
            return;
        }

        try {
            // 1. Fetch receipt items
            const { data: items, error: itemsError } = await supabase
                .from('goods_receipt_items')
                .select('*')
                .eq('receipt_id', receipt.id);

            if (itemsError) throw itemsError;
            if (!items || items.length === 0) {
                alert('⚠️ Phiếu nhập không có hàng hóa, không thể duyệt!');
                return;
            }

            // --- CAPACITY CHECK ---
            const { data: warehouseData, error: warehouseError } = await supabase
                .from('warehouses')
                .select('name, capacity')
                .eq('id', receipt.warehouse_id)
                .single();

            if (warehouseError) throw warehouseError;

            if (warehouseData && warehouseData.capacity > 0) {
                const incomingTotal = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

                const { data: currentInvData, error: currentInvError } = await supabase
                    .from('inventory')
                    .select('quantity')
                    .eq('warehouse_id', receipt.warehouse_id);

                if (currentInvError) throw currentInvError;

                const currentTotal = (currentInvData || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
                const projectedTotal = currentTotal + incomingTotal;

                if (projectedTotal > warehouseData.capacity) {
                    alert(`❌ Không thể duyệt phiếu nhập do vượt quá sức chứa kho!\n\nKho: ${warehouseData.name}\nSức chứa tối đa: ${warehouseData.capacity}\n\nĐang tồn kho: ${currentTotal}\nChuẩn bị nhập thêm: ${incomingTotal}\nTổng sau lập phiếu: ${projectedTotal} (Vượt ${projectedTotal - warehouseData.capacity})`);
                    return;
                }
            }
            // --- END CAPACITY CHECK ---

            // 2. Loop through items to update inventory
            for (const item of items) {
                // Upsert inventory
                const { data: invData, error: invQueryError } = await supabase
                    .from('inventory')
                    .select('id, quantity')
                    .eq('warehouse_id', receipt.warehouse_id)
                    .eq('item_type', item.item_type)
                    .eq('item_name', item.item_name)
                    .maybeSingle();

                if (invQueryError) throw invQueryError;

                let inventoryId;
                if (invData) {
                    // Update
                    const { data: updatedInv, error: updateError } = await supabase
                        .from('inventory')
                        .update({ quantity: invData.quantity + item.quantity })
                        .eq('id', invData.id)
                        .select()
                        .single();
                    if (updateError) throw updateError;
                    inventoryId = updatedInv.id;
                } else {
                    // Insert
                    const { data: newInv, error: insertError } = await supabase
                        .from('inventory')
                        .insert([{
                            warehouse_id: receipt.warehouse_id,
                            item_type: item.item_type,
                            item_name: item.item_name,
                            quantity: item.quantity
                        }])
                        .select()
                        .single();
                    if (insertError) throw insertError;
                    inventoryId = newInv.id;
                }

                // Create transaction record
                const { error: txError } = await supabase
                    .from('inventory_transactions')
                    .insert([{
                        inventory_id: inventoryId,
                        transaction_type: 'IN',
                        reference_id: receipt.id,
                        reference_code: receipt.receipt_code,
                        quantity_changed: item.quantity,
                        note: `Duyệt phiếu nhập ${receipt.receipt_code}`
                    }]);
                if (txError) throw txError;
            }

            // 3. Update receipt status
            const { error: updateReceiptError } = await supabase
                .from('goods_receipts')
                .update({ status: 'DA_NHAP' })
                .eq('id', receipt.id);

            if (updateReceiptError) throw updateReceiptError;

            alert('✅ Đã duyệt phiếu nhập và cập nhật tồn kho thành công!');
            fetchReceipts();
        } catch (error) {
            console.error('Error approving receipt:', error);
            alert('❌ Lỗi khi duyệt phiếu: ' + error.message);
        }
    };

    const getStatusBadge = (statusId) => {
        const statusObj = RECEIPT_STATUSES.find(s => s.id === statusId);
        if (!statusObj) return <span className="text-gray-400">—</span>;

        return (
            <span className={clsx(
                'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold',
                statusObj.color === 'blue' && 'bg-blue-100 text-blue-700',
                statusObj.color === 'yellow' && 'bg-amber-100 text-amber-700',
                statusObj.color === 'blue' && 'bg-blue-100 text-blue-700',
                statusObj.color === 'red' && 'bg-red-100 text-red-700',
                statusObj.color === 'gray' && 'bg-muted text-muted-foreground'
            )}>
                {statusObj.label}
            </span>
        );
    };

    const getWarehouseLabel = (id) => {
        return warehousesList.find(w => w.id === id)?.name || id;
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredReceipts.length && filteredReceipts.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredReceipts.map(r => r.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredReceipts = receipts.filter(r => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            r.receipt_code?.toLowerCase().includes(search) ||
            r.supplier_name?.toLowerCase().includes(search);
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(r.status);
        const matchesWarehouse = selectedWarehouses.length === 0 || selectedWarehouses.includes(r.warehouse_id);
        return matchesSearch && matchesStatus && matchesWarehouse;
    });

    const hasActiveFilters = selectedStatuses.length > 0 || selectedWarehouses.length > 0;
    const totalActiveFilters = selectedStatuses.length + selectedWarehouses.length;

    // Filter options
    const statusOptions = RECEIPT_STATUSES.filter(s => s.id !== 'ALL').map(s => ({
        id: s.id,
        label: s.label,
        count: receipts.filter(r => r.status === s.id).length
    }));

    const warehouseOptions = warehousesList.map(w => ({
        id: w.id,
        label: w.name,
        count: receipts.filter(r => r.warehouse_id === w.id).length
    }));

    const getStatusStats = () => {
        const stats = {};
        filteredReceipts.forEach(r => {
            const statusLabel = RECEIPT_STATUSES.find(s => s.id === r.status)?.label || r.status;
            stats[statusLabel] = (stats[statusLabel] || 0) + 1;
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    };

    const getWarehouseStats = () => {
        const stats = {};
        filteredReceipts.forEach(r => {
            const name = getWarehouseLabel(r.warehouse_id);
            stats[name] = (stats[name] || 0) + 1;
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    };

    const chartColors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

    const formatNumber = (num) => {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const getFilterButtonClass = (filterKey, isActive) => {
        if (!isActive) return 'border-border bg-white text-muted-foreground hover:text-foreground';
        switch (filterKey) {
            case 'status': return 'border-blue-200 bg-blue-50 text-blue-700';
            case 'warehouse': return 'border-blue-200 bg-blue-50 text-blue-700';
            default: return 'border-primary bg-primary/5 text-primary';
        }
    };

    const getFilterCountBadgeClass = (filterKey) => {
        switch (filterKey) {
            case 'status': return 'bg-blue-600 text-white';
            case 'warehouse': return 'bg-blue-600 text-white';
            default: return 'bg-primary text-white';
        }
    };

    const getFilterIconClass = (filterKey, isActive) => {
        switch (filterKey) {
            case 'status': return isActive ? 'text-blue-700' : 'text-blue-500';
            case 'warehouse': return isActive ? 'text-blue-700' : 'text-blue-500';
            default: return isActive ? 'text-primary' : 'text-primary/80';
        }
    };

    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [mobileFilterClosing, setMobileFilterClosing] = useState(false);
    const [pendingStatuses, setPendingStatuses] = useState([]);
    const [pendingWarehouses, setPendingWarehouses] = useState([]);

    const openMobileFilter = () => {
        setPendingStatuses(selectedStatuses);
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
        setSelectedWarehouses(pendingWarehouses);
        closeMobileFilter();
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex-1 flex flex-col mt-1 min-h-0 px-1 md:px-1.5 font-sans">
            {/* Top View Tabs */}
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
                <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col flex-1 min-h-0 w-full overflow-hidden">
                    {/* MOBILE TOOLBAR */}
                    <div className="md:hidden flex items-center gap-2 p-3 border-b border-border bg-white">
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
                        <button
                            onClick={() => {
                                setSelectedReceipt(null);
                                setShowFormModal(true);
                            }}
                            className="p-2 rounded-xl bg-primary shadow-md shadow-primary/20 hover:bg-primary/90"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* DESKTOP TOOLBAR */}
                    <div className="hidden md:block p-3 space-y-3 bg-white">
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
                                        placeholder="Tìm mã phiếu, NCC..."
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
                                        Cột ({visibleCount}/{totalCount})
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
                                    onClick={() => {
                                        setSelectedReceipt(null);
                                        setShowFormModal(true);
                                    }}
                                    className="flex items-center gap-2 px-6 py-1.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
                                >
                                    <Plus size={18} />
                                    Tạo phiếu nhập mới
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
                                        if (activeDropdown !== 'warehouse') setFilterSearch('');
                                        setActiveDropdown(activeDropdown === 'warehouse' ? null : 'warehouse');
                                    }}
                                    className={clsx(
                                        "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all",
                                        getFilterButtonClass('warehouse', activeDropdown === 'warehouse' || selectedWarehouses.length > 0)
                                    )}
                                >
                                    <Package size={14} className={getFilterIconClass('warehouse', activeDropdown === 'warehouse' || selectedWarehouses.length > 0)} />
                                    Kho nhận
                                    {selectedWarehouses.length > 0 && (
                                        <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('warehouse'))}>
                                            {selectedWarehouses.length}
                                        </span>
                                    )}
                                    <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'warehouse' ? "rotate-180" : "")} />
                                </button>
                                {activeDropdown === 'warehouse' && (
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

                    {/* TABLE DATA AREA */}
                    <div className="flex-1 overflow-auto bg-[#f8fafc]/50">
                        {loading ? (
                            <div className="p-16 text-center">
                                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-muted-foreground font-bold text-sm italic">Đang tải dữ liệu...</p>
                            </div>
                        ) : filteredReceipts.length === 0 ? (
                            <div className="p-16 text-center">
                                <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold text-base mb-1">Chưa có phiếu nhập nào</p>
                                <p className="text-slate-300 text-xs italic">Nhấn "Tạo phiếu nhập mới" để bắt đầu</p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile View Cards */}
                                <div className="md:hidden divide-y divide-gray-100">
                                    {filteredReceipts.map((receipt) => (
                                        <div key={receipt.id} className="p-4 bg-white border-b border-gray-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                        checked={selectedIds.includes(receipt.id)}
                                                        onChange={() => toggleSelect(receipt.id)}
                                                    />
                                                    <span className="text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{receipt.receipt_code}</span>
                                                </div>
                                                {getStatusBadge(receipt.status)}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-0.5">Nhà cung cấp</span>
                                                    <p className="text-xs font-bold text-slate-800">{receipt.supplier_name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-0.5">Kho nhận</span>
                                                    <p className="text-xs font-bold text-slate-600">{getWarehouseLabel(receipt.warehouse_id)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-0.5">Ngày nhập</span>
                                                    <p className="text-xs font-medium text-slate-600">{receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString('vi-VN') : '—'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-0.5">Số mặt hàng</span>
                                                    <p className="text-xs font-black text-slate-900">{receipt.total_items}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-0.5">Tổng giá trị</span>
                                                    <p className="text-sm font-black text-rose-600">{formatNumber(receipt.total_amount || 0)} <small className="text-[10px]">₫</small></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-50">
                                                {receipt.status === 'CHO_DUYET' && (
                                                    <button onClick={() => handleApproveReceipt(receipt)} className="p-2 text-blue-600 bg-blue-50 rounded-lg" title="Duyệt"><CheckSquare className="w-5 h-5" /></button>
                                                )}
                                                <button onClick={() => handlePrintReceipt(receipt)} className="p-2 text-slate-400 bg-slate-50 rounded-lg" title="In"><Printer className="w-5 h-5" /></button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedReceipt(receipt);
                                                        setShowFormModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 bg-slate-50 rounded-lg"
                                                    title="Chi tiết"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteReceipt(receipt.id, receipt.receipt_code)} className="p-2 text-red-400 bg-red-50 rounded-lg" title="Xóa"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View Table */}
                                <div className="hidden md:block">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-[#F1F5FF] sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3.5 w-10">
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                            checked={selectedIds.length === filteredReceipts.length && filteredReceipts.length > 0}
                                                            onChange={toggleSelectAll}
                                                        />
                                                    </div>
                                                </th>
                                                {visibleTableColumns.map(col => (
                                                    <th key={col.key} className="px-4 py-3.5 text-[12px] font-bold text-slate-500 text-left uppercase tracking-wider">
                                                        {col.label}
                                                    </th>
                                                ))}
                                                <th className="sticky right-0 z-20 bg-[#F1F5FF] px-4 py-3.5 text-[12px] font-bold text-slate-500 text-center uppercase tracking-wider shadow-[-6px_0_10px_-8px_rgba(0,0,0,0.1)]">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {filteredReceipts.map((receipt) => (
                                                <tr key={receipt.id} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-center">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                                checked={selectedIds.includes(receipt.id)}
                                                                onChange={() => toggleSelect(receipt.id)}
                                                            />
                                                        </div>
                                                    </td>
                                                    {isColumnVisible('code') && (
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <span className="text-[13px] font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">{receipt.receipt_code}</span>
                                                        </td>
                                                    )}
                                                    {isColumnVisible('supplier') && (
                                                        <td className="px-4 py-4 text-[13px] font-bold text-slate-800">{receipt.supplier_name}</td>
                                                    )}
                                                    {isColumnVisible('warehouse') && (
                                                        <td className="px-4 py-4">
                                                            <span className="text-[13px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{getWarehouseLabel(receipt.warehouse_id)}</span>
                                                        </td>
                                                    )}
                                                    {isColumnVisible('date') && (
                                                        <td className="px-4 py-4 text-[13px] font-medium text-slate-500">
                                                            {receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString('vi-VN') : '—'}
                                                        </td>
                                                    )}
                                                    {isColumnVisible('items') && (
                                                        <td className="px-4 py-4 text-center text-[13px] font-black text-slate-700">{receipt.total_items}</td>
                                                    )}
                                                    {isColumnVisible('amount') && (
                                                        <td className="px-4 py-4 text-right">
                                                            <span className="text-[13px] font-black text-rose-600">{formatNumber(receipt.total_amount || 0)} ₫</span>
                                                        </td>
                                                    )}
                                                    {isColumnVisible('receiver') && (
                                                        <td className="px-4 py-4 text-[13px] font-medium text-slate-500">{receipt.received_by || '—'}</td>
                                                    )}
                                                    {isColumnVisible('status') && (
                                                        <td className="px-4 py-4">
                                                            {getStatusBadge(receipt.status)}
                                                        </td>
                                                    )}
                                                    <td className="sticky right-0 z-10 bg-white px-4 py-4 shadow-[-6px_0_10px_-8px_rgba(0,0,0,0.1)]">
                                                        <div className="flex items-center justify-center gap-3">
                                                            {receipt.status === 'CHO_DUYET' && (
                                                                <button onClick={() => handleApproveReceipt(receipt)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Duyệt phiếu"><CheckSquare size={16} /></button>
                                                            )}
                                                            <button onClick={() => handlePrintReceipt(receipt)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="In phiếu"><Printer size={16} /></button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedReceipt(receipt);
                                                                    setShowFormModal(true);
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button onClick={() => handleDeleteReceipt(receipt.id, receipt.receipt_code)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa phiếu"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50 sticky bottom-0 z-10">
                                            <tr>
                                                <td colSpan={visibleTableColumns.length + 2} className="px-4 py-3 text-[12px] font-bold text-slate-500">
                                                    Tổng số: {filteredReceipts.length} phiếu | Tổng giá trị: <span className="text-rose-600">{formatNumber(filteredReceipts.reduce((sum, r) => sum + (r.total_amount || 0), 0))} đ</span>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeView === 'stats' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col w-full md:flex-1 md:min-h-0 md:overflow-hidden">
                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center gap-2 p-3 border-b border-border">
                        <button
                            onClick={() => navigate(-1)}
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
                                onClick={() => navigate(-1)}
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
                                        if (activeDropdown !== 'warehouse') setFilterSearch('');
                                        setActiveDropdown(activeDropdown === 'warehouse' ? null : 'warehouse');
                                    }}
                                    className={clsx(
                                        "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all",
                                        getFilterButtonClass('warehouse', activeDropdown === 'warehouse' || selectedWarehouses.length > 0)
                                    )}
                                >
                                    <Package size={14} className={getFilterIconClass('warehouse', activeDropdown === 'warehouse' || selectedWarehouses.length > 0)} />
                                    Kho nhận
                                    {selectedWarehouses.length > 0 && (
                                        <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('warehouse'))}>
                                            {selectedWarehouses.length}
                                        </span>
                                    )}
                                    <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'warehouse' ? "rotate-180" : "")} />
                                </button>
                                {activeDropdown === 'warehouse' && (
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

                    <div className="w-full md:flex-1 md:overflow-auto px-3 md:px-4 pt-4 md:pt-5 pb-5 md:pb-6 space-y-5">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-blue-200/70">
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Tổng số phiếu</p>
                                        <p className="text-3xl font-bold text-foreground mt-1">{filteredReceipts.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-blue-200/70">
                                        <CheckCircle className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Tổng giá trị</p>
                                        <p className="text-3xl font-bold text-foreground mt-1">{formatNumber(filteredReceipts.reduce((sum, r) => sum + (r.total_amount || 0), 0))}đ</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-start gap-4">
                                    <div className="w-12 h-12 bg-amber-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-amber-200/70">
                                        <BarChart2 className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Giá trị trung bình</p>
                                        <p className="text-3xl font-bold text-foreground mt-1">
                                            {formatNumber(filteredReceipts.length > 0 ? Math.round(filteredReceipts.reduce((sum, r) => sum + (r.total_amount || 0), 0) / filteredReceipts.length) : 0)}đ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <h3 className="text-base font-bold text-foreground mb-4">Trạng thái phiếu nhập</h3>
                                <div style={{ height: '300px' }}>
                                    <PieChartJS
                                        data={{
                                            labels: getStatusStats().map(item => item.name),
                                            datasets: [{
                                                data: getStatusStats().map(item => item.value),
                                                backgroundColor: chartColors.slice(0, getStatusStats().length),
                                                borderColor: '#fff',
                                                borderWidth: 2
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'bottom' } }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <h3 className="text-base font-bold text-foreground mb-4">Phân bổ theo kho nhận</h3>
                                <div style={{ height: '300px' }}>
                                    <BarChartJS
                                        data={{
                                            labels: getWarehouseStats().map(item => item.name),
                                            datasets: [{
                                                label: 'Số lượng phiếu',
                                                data: getWarehouseStats().map(item => item.value),
                                                backgroundColor: chartColors[0],
                                                borderRadius: 8
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Filter Sheet */}
            {showMobileFilter && (
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
                            onSelectionChange: setPendingStatuses
                        },
                        {
                            id: 'warehouse',
                            label: 'Kho nhận',
                            icon: <Package size={16} className="text-blue-600" />,
                            options: warehouseOptions,
                            selectedValues: pendingWarehouses,
                            onSelectionChange: setPendingWarehouses
                        }
                    ]}
                />
            )}

            {/* Goods Receipt Form Modal */}
            {showFormModal && (
                <GoodsReceiptFormModal
                    receipt={selectedReceipt}
                    onClose={() => setShowFormModal(false)}
                    onSuccess={() => {
                        fetchReceipts();
                        toast.success(selectedReceipt ? 'Đã cập nhật phiếu nhập!' : 'Đã tạo phiếu nhập mới!');
                    }}
                />
            )}

            {/* Print Portal */}
            {printData && createPortal(
                <div className="print-only-content">
                    <GoodsReceiptPrintTemplate receipt={printData?.receipt} items={printData?.items} warehousesList={warehousesList} />
                </div>,
                document.body
            )}
        </div>
    );
};

export default GoodsReceipts;
