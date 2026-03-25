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
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Edit,
    Filter,
    List,
    Package,
    User,
    PackageMinus,
    Plus,
    Search,
    Trash2,
    X,
    BarChart,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    LayoutGrid,
    Settings2,
    SlidersHorizontal
} from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Bar as BarChartJS, Pie as PieChartJS } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { ISSUE_STATUSES, ISSUE_TABLE_COLUMNS, ISSUE_TYPES } from '../constants/goodsIssueConstants';
import { supabase } from '../supabase/config';
import ColumnPicker from '../components/ui/ColumnPicker';
import FilterDropdown from '../components/ui/FilterDropdown';
import MobileFilterSheet from '../components/ui/MobileFilterSheet';
import GoodsIssueFormModal from '../components/GoodsIssues/GoodsIssueFormModal';

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

const normalizeText = (text) => {
    if (!text) return '';
    return String(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'));
};

const FilterDropdownGroup = ({
    label, icon, options, selected, setSelected,
    dropdownId, activeDropdown, setActiveDropdown,
    filterSearch, setFilterSearch, activeColor = 'blue'
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                if (activeDropdown === dropdownId) setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown, dropdownId, setActiveDropdown]);

    const activeStyles = {
        blue: "bg-blue-50 border-blue-200 text-blue-700 shadow-blue-500/10",
        rose: "bg-blue-50 border-blue-200 text-blue-700 shadow-rose-500/10",
        amber: "bg-amber-50 border-amber-200 text-amber-700 shadow-amber-500/10",
        indigo: "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-indigo-500/10",
    };

    const badgeStyles = {
        blue: "bg-blue-100 text-blue-700",
        rose: "bg-rose-100 text-blue-700",
        amber: "bg-amber-100 text-amber-700",
        indigo: "bg-indigo-100 text-indigo-700",
    };

    return (
        <div className={clsx("relative", activeDropdown === dropdownId ? "z-[50]" : "z-auto")} ref={containerRef}>
            <button
                onClick={() => {
                    if (activeDropdown !== dropdownId) setFilterSearch('');
                    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
                }}
                className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[13px] font-bold transition-all whitespace-nowrap",
                    selected.length > 0
                        ? `${activeStyles[activeColor]} shadow-sm`
                        : "bg-white border-border text-foreground hover:border-primary/30"
                )}
            >
                {icon}
                {label}
                {selected.length > 0 && (
                    <span className={clsx("ml-1 px-1.5 py-0.5 rounded-md text-[10px]", badgeStyles[activeColor])}>
                        {selected.length}
                    </span>
                )}
                <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === dropdownId ? "rotate-180" : "")} />
            </button>
            {activeDropdown === dropdownId && (
                <FilterDropdown
                    options={options}
                    selected={selected}
                    setSelected={setSelected}
                    filterSearch={filterSearch}
                    setFilterSearch={setFilterSearch}
                />
            )}
        </div>
    );
};

const GoodsIssues = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('list'); // 'list' or 'stats'
    const [searchTerm, setSearchTerm] = useState('');
    const [issues, setIssues] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [warehousesList, setWarehousesList] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    // Filter states
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedWarehouses, setSelectedWarehouses] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);

    // Mobile filter sheet state
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [mobileFilterClosing, setMobileFilterClosing] = useState(false);
    const [pendingStatuses, setPendingStatuses] = useState([]);
    const [pendingTypes, setPendingTypes] = useState([]);
    const [pendingWarehouses, setPendingWarehouses] = useState([]);
    const [pendingSuppliers, setPendingSuppliers] = useState([]);

    // Form Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [initialForcedType, setInitialForcedType] = useState(null);

    // Column visibility logic
    const defaultColOrder = ISSUE_TABLE_COLUMNS.map(col => col.key);
    const [columnOrder, setColumnOrder] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('columns_goods_issues_order') || 'null');
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
            const saved = JSON.parse(localStorage.getItem('columns_goods_issues') || 'null');
            if (Array.isArray(saved) && saved.length > 0) {
                return saved.filter(key => defaultColOrder.includes(key));
            }
        } catch { }
        return defaultColOrder;
    });

    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [filterSearch, setFilterSearch] = useState('');
    const columnPickerRef = useRef(null);

    useEffect(() => {
        loadSuppliers();
        fetchIssues();
        fetchWarehouses();
    }, []);

    useEffect(() => {
        localStorage.setItem('columns_goods_issues', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    useEffect(() => {
        localStorage.setItem('columns_goods_issues_order', JSON.stringify(columnOrder));
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

    const loadSuppliers = async () => {
        try {
            const { data, error } = await supabase.from('suppliers').select('id, name');
            if (!error && data) setSuppliers(data);
        } catch (e) { }
    };

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('goods_issues')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setIssues(data || []);
        } catch (error) {
            console.error('Error loading issues:', error);
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

    const handleDeleteIssue = async (id, code) => {
        if (!window.confirm(`Bạn có chắc muốn xóa phiếu xuất "${code}" không? Hành động này sẽ không thể hoàn tác.`)) return;

        try {
            const { error } = await supabase.from('goods_issues').delete().eq('id', id);
            if (error) throw error;
            fetchIssues();
        } catch (error) {
            console.error('Error deleting issue:', error);
            alert('❌ Lỗi khi xóa phiếu: ' + error.message);
        }
    };

    const openFormModal = (issue = null, forcedType = null) => {
        setSelectedIssue(issue);
        setInitialForcedType(forcedType);
        setIsFormModalOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormModalOpen(false);
        fetchIssues();
    };

    const isColumnVisible = (key) => visibleColumns.includes(key);
    const visibleTableColumns = columnOrder
        .filter(key => visibleColumns.includes(key))
        .map(key => ISSUE_TABLE_COLUMNS.find(col => col.key === key))
        .filter(Boolean);

    const filteredIssues = useMemo(() => {
        return issues.filter(issue => {
            // 1. Filter by Status
            const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(issue.status);
            if (!matchesStatus) return false;

            // 2. Filter by Type
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(issue.issue_type);
            if (!matchesType) return false;

            // 3. Filter by Warehouse
            const matchesWarehouse = selectedWarehouses.length === 0 || selectedWarehouses.includes(issue.warehouse_id);
            if (!matchesWarehouse) return false;

            // 4. Filter by Supplier
            const matchesSupplier = selectedSuppliers.length === 0 || selectedSuppliers.includes(issue.supplier_id);
            if (!matchesSupplier) return false;

            // 5. Search filtering
            if (!searchTerm) return true;

            const searchNorm = normalizeText(searchTerm);

            const fieldsToSearch = [
                issue.issue_code,
                getSupplierName(issue.supplier_id),
                getWarehouseLabel(issue.warehouse_id),
                issue.notes,
                issue.created_by
            ];

            return fieldsToSearch.some(field => normalizeText(field).includes(searchNorm));
        });
    }, [issues, searchTerm, selectedStatuses, selectedTypes, selectedWarehouses, selectedSuppliers, suppliers, warehousesList]);

    const getStatusConfig = (statusId) => {
        return ISSUE_STATUSES.find(s => s.id === statusId) || ISSUE_STATUSES[0];
    };

    const getSupplierName = (id) => suppliers.find(s => s.id === id)?.name || id;
    const getWarehouseLabel = (id) => warehousesList.find(w => w.id === id)?.name || id;
    const getTypeLabel = (typeId) => ISSUE_TYPES.find(t => t.id === typeId)?.label || typeId;

    const getStatusBadgeClass = (statusColor) => clsx(
        'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold',
        statusColor === 'blue' && 'bg-blue-100 text-blue-700 font-bold border border-blue-200',
        statusColor === 'yellow' && 'bg-amber-100 text-amber-700 font-bold border border-amber-200',
        statusColor === 'green' && 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-200',
        statusColor === 'red' && 'bg-red-100 text-red-700 font-bold border border-red-200',
        statusColor === 'gray' && 'bg-muted text-muted-foreground font-bold border border-border'
    );

    const getTypeBadgeClass = (typeId) => clsx(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border',
        typeId === 'TRA_VO' && 'bg-blue-50 text-blue-700 border-blue-200',
        typeId === 'TRA_MAY' && 'bg-slate-50 text-slate-700 border-slate-200',
        typeId === 'TRA_BINH_LOI' && 'bg-amber-50 text-amber-700 border-amber-200',
        !typeId && 'bg-muted text-muted-foreground border-border'
    );

    const getFilterButtonClass = (filterKey, isActive) => {
        if (!isActive) return 'border-border bg-white text-muted-foreground hover:text-foreground shadow-sm';
        switch (filterKey) {
            case 'status': return 'border-blue-200 bg-blue-50 text-blue-700 shadow-blue-100/50';
            case 'type': return 'border-violet-200 bg-violet-50 text-violet-700 shadow-violet-100/50';
            case 'warehouse': return 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-indigo-100/50';
            case 'supplier': return 'border-amber-200 bg-amber-50 text-amber-700 shadow-amber-100/50';
            default: return 'border-primary bg-primary/5 text-primary shadow-primary/10';
        }
    };

    const getFilterCountBadgeClass = (filterKey) => {
        switch (filterKey) {
            case 'status': return 'bg-blue-600 text-white';
            case 'type': return 'bg-violet-600 text-white';
            case 'warehouse': return 'bg-indigo-600 text-white';
            case 'supplier': return 'bg-amber-600 text-white';
            default: return 'bg-primary text-white';
        }
    };

    const getFilterIconClass = (filterKey, isActive) => {
        switch (filterKey) {
            case 'status': return isActive ? 'text-blue-700' : 'text-blue-500';
            case 'type': return isActive ? 'text-violet-700' : 'text-violet-500';
            case 'warehouse': return isActive ? 'text-indigo-700' : 'text-indigo-500';
            case 'supplier': return isActive ? 'text-amber-700' : 'text-amber-500';
            default: return isActive ? 'text-primary' : 'text-primary/80';
        }
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const hasActiveFilters = selectedStatuses.length > 0 || selectedTypes.length > 0 ||
        selectedWarehouses.length > 0 || selectedSuppliers.length > 0;

    const totalActiveFilters = selectedStatuses.length + selectedTypes.length +
        selectedWarehouses.length + selectedSuppliers.length;

    // Mobile filter handlers
    const openMobileFilter = () => {
        setPendingStatuses(selectedStatuses);
        setPendingTypes(selectedTypes);
        setPendingWarehouses(selectedWarehouses);
        setPendingSuppliers(selectedSuppliers);
        setShowMobileFilter(true);
    };

    const closeMobileFilter = () => {
        setMobileFilterClosing(true);
        setTimeout(() => {
            setShowMobileFilter(false);
            setMobileFilterClosing(false);
        }, 280);
    };

    const applyMobileFilter = () => {
        setSelectedStatuses(pendingStatuses);
        setSelectedTypes(pendingTypes);
        setSelectedWarehouses(pendingWarehouses);
        setSelectedSuppliers(pendingSuppliers);
        closeMobileFilter();
    };

    const handleResetFilters = () => {
        setSelectedStatuses([]);
        setSelectedTypes([]);
        setSelectedWarehouses([]);
        setSelectedSuppliers([]);
        setSearchTerm('');
    };

    // Filter options
    const statusOptions = ISSUE_STATUSES.filter(s => s.id !== 'ALL').map(s => ({
        id: s.id,
        label: s.label,
        count: issues.filter(o => o.status === s.id).length
    }));

    const typeOptions = ISSUE_TYPES.map(t => ({
        id: t.id,
        label: t.label,
        count: issues.filter(o => o.issue_type === t.id).length
    }));

    const warehouseOptions = warehousesList.map(w => ({
        id: w.id,
        label: w.name,
        count: issues.filter(o => o.warehouse_id === w.id).length
    }));

    const supplierOptions = suppliers.map(s => ({
        id: s.id,
        label: s.name,
        count: issues.filter(o => o.supplier_id === s.id).length
    }));

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredIssues.length && filteredIssues.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredIssues.map(o => o.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Stats calculations
    const getStatusStats = () => {
        const stats = {};
        filteredIssues.forEach(issue => {
            const statusLabel = getStatusConfig(issue.status).label;
            stats[statusLabel] = (stats[statusLabel] || 0) + 1;
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    };

    const getTypeStats = () => {
        const stats = {};
        filteredIssues.forEach(issue => {
            const typeLabel = getTypeLabel(issue.issue_type);
            stats[typeLabel] = (stats[typeLabel] || 0) + 1;
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    };

    const getSupplierStats = () => {
        const stats = {};
        filteredIssues.forEach(issue => {
            const supplier = getSupplierName(issue.supplier_id) || '—';
            stats[supplier] = (stats[supplier] || 0) + 1;
        });
        return Object.entries(stats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    };

    const chartColors = [
        '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#2563EB', '#10B981', '#F59E0B', '#1D4ED8', '#8B5CF6',
        '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
    ];

    const getRowStyle = (type, isSelected) => {
        let baseStyle = "group border-l-4 ";
        if (isSelected) baseStyle += "bg-blue-50/40 border-l-blue-500 ";
        else {
            switch (type) {
                case 'TRA_VO': baseStyle += "border-l-blue-400 hover:bg-blue-50/60 "; break;
                case 'TRA_MAY': baseStyle += "border-l-slate-400 hover:bg-slate-50/60 "; break;
                case 'TRA_BINH_LOI': baseStyle += "border-l-amber-400 hover:bg-amber-50/60 "; break;
                default: baseStyle += "border-l-transparent hover:bg-blue-50/60 ";
            }
        }
        return baseStyle;
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex-1 flex flex-col mt-1 min-h-0 px-1 md:px-1.5">
            {/* Top Navigation Tabs */}
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
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-white text-muted-foreground shrink-0 text-[12px] font-bold active:scale-95 transition-all shadow-sm"
                        >
                            <ChevronLeft size={16} />
                            Quay lại
                        </button>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm phiếu xuất..."
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
                    </div>

                    {/* ── DESKTOP TOOLBAR ── */}
                    <div className="hidden md:flex flex-col p-4 border-b border-border bg-white/50 gap-4 relative">
                        {/* Row 1: Search and Actions */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-border bg-white text-muted-foreground hover:text-primary hover:border-primary/50 rounded-2xl transition-all shrink-0 text-[13px] font-bold shadow-sm active:scale-95"
                                >
                                    <ChevronLeft size={18} />
                                    Quay lại
                                </button>
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm mã phiếu, nhà cung cấp, ghi chú..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border/80 rounded-2xl text-[14px] focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                                <div className="relative" ref={columnPickerRef}>
                                    <button
                                        onClick={() => setShowColumnPicker(!showColumnPicker)}
                                        className={clsx(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-[13px] font-bold transition-all",
                                            showColumnPicker ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border bg-white text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Settings2 size={16} />
                                        Cột hiển thị
                                        <span className="ml-1 px-1.5 py-0.5 rounded-lg bg-muted text-[10px] font-black">{visibleColumns.length}/{ISSUE_TABLE_COLUMNS.length}</span>
                                    </button>
                                    {showColumnPicker && (
                                        <div className="absolute right-0 top-full mt-2 z-[100]">
                                            <ColumnPicker
                                                columns={ISSUE_TABLE_COLUMNS}
                                                visibleColumns={visibleColumns}
                                                setVisibleColumns={setVisibleColumns}
                                                columnOrder={columnOrder}
                                                setColumnOrder={setColumnOrder}
                                                onClose={() => setShowColumnPicker(false)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => openFormModal(null, 'TRA_VO')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-secondary text-white rounded-2xl text-[13px] font-black transition-all shadow-lg shadow-primary/20 active:scale-95"
                                >
                                    <Plus size={18} />
                                    Trả vỏ
                                </button>
                                <button
                                    onClick={() => openFormModal(null, 'TRA_MAY')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-[13px] font-black transition-all shadow-lg shadow-slate-200 active:scale-95"
                                >
                                    <Plus size={18} />
                                    Trả máy
                                </button>
                            </div>
                        </div>

                        {/* Row 2: Filters */}
                        <div className="relative z-[30] flex flex-wrap items-center gap-2.5 pb-1">
                            <div className="flex items-center gap-2.5">
                                <FilterDropdownGroup
                                    label="Trạng thái"
                                    icon={<Clock size={14} className="text-blue-500" />}
                                    options={statusOptions}
                                    selected={selectedStatuses}
                                    setSelected={setSelectedStatuses}
                                    dropdownId="status"
                                    activeDropdown={activeDropdown}
                                    setActiveDropdown={setActiveDropdown}
                                    filterSearch={filterSearch}
                                    setFilterSearch={setFilterSearch}
                                />

                                <FilterDropdownGroup
                                    label="Loại xuất"
                                    icon={<SlidersHorizontal size={14} className="text-blue-500" />}
                                    options={typeOptions}
                                    selected={selectedTypes}
                                    setSelected={setSelectedTypes}
                                    dropdownId="type"
                                    activeDropdown={activeDropdown}
                                    setActiveDropdown={setActiveDropdown}
                                    filterSearch={filterSearch}
                                    setFilterSearch={setFilterSearch}
                                />

                                <FilterDropdownGroup
                                    label="Kho"
                                    icon={<Package size={14} className="text-amber-500" />}
                                    options={warehouseOptions}
                                    selected={selectedWarehouses}
                                    setSelected={setSelectedWarehouses}
                                    dropdownId="warehouse"
                                    activeDropdown={activeDropdown}
                                    setActiveDropdown={setActiveDropdown}
                                    filterSearch={filterSearch}
                                    setFilterSearch={setFilterSearch}
                                />

                                <FilterDropdownGroup
                                    label="Nhà cung cấp"
                                    icon={<User size={14} className="text-primary" />}
                                    options={supplierOptions}
                                    selected={selectedSuppliers}
                                    setSelected={setSelectedSuppliers}
                                    dropdownId="supplier"
                                    activeDropdown={activeDropdown}
                                    setActiveDropdown={setActiveDropdown}
                                    filterSearch={filterSearch}
                                    setFilterSearch={setFilterSearch}
                                    activeColor="indigo"
                                />

                                {hasActiveFilters && (
                                    <button
                                        onClick={handleResetFilters}
                                        className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-dashed border-rose-300 text-rose-600 text-[12px] font-bold hover:bg-rose-50 transition-all ml-2 active:scale-95"
                                    >
                                        <X size={15} />
                                        Xóa tất cả bộ lọc
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── MOBILE CARD LIST ── */}
                    <div className="md:hidden flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                        {loading ? (
                            <div className="py-16 text-center text-[13px] text-muted-foreground italic">Đang tải dữ liệu...</div>
                        ) : filteredIssues.length === 0 ? (
                            <div className="py-16 text-center text-[13px] text-muted-foreground italic">Không tìm thấy kết quả phù hợp</div>
                        ) : (
                            filteredIssues.map((issue) => {
                                const status = getStatusConfig(issue.status);
                                return (
                                    <div key={issue.id} className="bg-white border border-primary/15 rounded-2xl p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                    checked={selectedIds.includes(issue.id)}
                                                    onChange={() => toggleSelect(issue.id)}
                                                />
                                                <span className="text-[13px] font-bold text-foreground">{issue.issue_code}</span>
                                            </div>
                                            <span className={clsx(getStatusBadgeClass(status.color), 'text-[10px] uppercase')}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <h3 className="text-[14px] font-bold text-foreground leading-snug">{getSupplierName(issue.supplier_id)}</h3>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                <span className={getTypeBadgeClass(issue.issue_type)}>{getTypeLabel(issue.issue_type)}</span>
                                                <span className="text-[11px] font-medium text-muted-foreground">{issue.issue_date ? new Date(issue.issue_date).toLocaleDateString('vi-VN') : '---'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-2 text-xs mb-3 bg-muted/10 rounded-xl p-2.5 border border-border/60">
                                            <div className="space-y-1">
                                                <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                                                    <Package className="w-3.5 h-3.5 text-blue-600" />
                                                    Kho xuất:
                                                </p>
                                                <p className="text-foreground font-bold ml-5">{getWarehouseLabel(issue.warehouse_id)}</p>
                                            </div>
                                            <div className="space-y-1 pl-2 border-l border-border">
                                                <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                                                    <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />
                                                    Số lượng:
                                                </p>
                                                <p className="text-foreground font-bold ml-5">{formatNumber(issue.total_items)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                            <button
                                                onClick={() => openFormModal(issue)}
                                                className="p-2 text-primary bg-primary/5 border border-primary/10 rounded-lg"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteIssue(issue.id, issue.issue_code)}
                                                className="p-2 text-red-700 bg-red-50 border border-red-100 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* ── DESKTOP TABLE ── */}
                    <div className="hidden md:block flex-1 overflow-auto">
                        <table className="w-full border-separate border-spacing-0">
                            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border">
                                <tr>
                                    <th className="pl-4 pr-3 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                            checked={selectedIds.length === filteredIssues.length && filteredIssues.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    {visibleTableColumns.map((col) => (
                                        <th
                                            key={col.key}
                                            className={clsx(
                                                "px-3 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-left border-b border-border",
                                                (col.key === 'total_items' || col.key === 'status') && "text-center"
                                            )}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right border-b border-border">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {loading ? (
                                    <tr>
                                        <td colSpan={visibleTableColumns.length + 2} className="py-20 text-center">
                                            <div className="inline-flex items-center gap-2 text-muted-foreground font-medium animate-pulse">
                                                <Clock className="w-5 h-5 animate-spin" />
                                                Đang tải dữ liệu...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredIssues.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleTableColumns.length + 2} className="py-20 text-center text-muted-foreground italic">
                                            Không có dữ liệu phiếu xuất phù hợp
                                        </td>
                                    </tr>
                                ) : (
                                    filteredIssues.map((issue) => {
                                        const isSelected = selectedIds.includes(issue.id);
                                        return (
                                            <tr
                                                key={issue.id}
                                                className={getRowStyle(issue.issue_type, isSelected)}
                                            >
                                                <td className="pl-4 pr-3 py-3">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelect(issue.id)}
                                                    />
                                                </td>
                                                {visibleTableColumns.map((col) => (
                                                    <td key={col.key} className="px-3 py-3.5">
                                                        {col.key === 'issue_code' && (
                                                            <div className="font-bold text-foreground">{issue.issue_code}</div>
                                                        )}
                                                        {col.key === 'issue_date' && (
                                                            <div className="text-[13px] font-medium text-slate-600">
                                                                {issue.issue_date ? new Date(issue.issue_date).toLocaleDateString('vi-VN') : '---'}
                                                            </div>
                                                        )}
                                                        {col.key === 'issue_type' && (
                                                            <span className={getTypeBadgeClass(issue.issue_type)}>{getTypeLabel(issue.issue_type)}</span>
                                                        )}
                                                        {col.key === 'supplier_id' && (
                                                            <div className="font-bold text-primary">{getSupplierName(issue.supplier_id)}</div>
                                                        )}
                                                        {col.key === 'warehouse_id' && (
                                                            <div className="text-[13px] font-medium text-slate-700">{getWarehouseLabel(issue.warehouse_id)}</div>
                                                        )}
                                                        {col.key === 'total_items' && (
                                                            <div className="text-center font-black text-foreground">{formatNumber(issue.total_items)}</div>
                                                        )}
                                                        {col.key === 'created_by' && (
                                                            <div className="text-[13px] text-muted-foreground">{issue.created_by || '---'}</div>
                                                        )}
                                                        {col.key === 'status' && (
                                                            <div className="flex justify-center">
                                                                <span className={getStatusBadgeClass(getStatusConfig(issue.status).color)}>
                                                                    {getStatusConfig(issue.status).label}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => openFormModal(issue)}
                                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                            title="Sửa phiếu"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteIssue(issue.id, issue.issue_code)}
                                                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Xóa phiếu"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Placeholder (Syncing with Orders style) */}
                    <div className="p-3 border-t border-border flex items-center justify-between">
                        <p className="text-[12px] text-muted-foreground font-medium">
                            Đang hiển thị <span className="text-foreground font-bold">{filteredIssues.length}</span> phiếu xuất
                        </p>
                        <div className="flex items-center gap-1">
                            <button disabled className="p-1.5 rounded-lg border border-border bg-white text-muted-foreground opacity-50"><ChevronLeft size={16} /></button>
                            <button className="px-3 py-1.5 rounded-lg border border-primary bg-primary/5 text-primary text-[11px] font-bold">1</button>
                            <button disabled className="p-1.5 rounded-lg border border-border bg-white text-muted-foreground opacity-50"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            )}
            {activeView === 'stats' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col w-full mb-3">
                    <div className="space-y-0">
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

                        {/* Desktop Toolbar */}
                        <div className="hidden md:block p-4 border-b border-border">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"
                                >
                                    <ChevronLeft size={16} />
                                    Quay lại
                                </button>

                                <FilterDropdownGroup
                                    label="Trạng thái"
                                    icon={<Clock size={14} className="text-blue-500" />}
                                    options={statusOptions}
                                    selected={selectedStatuses}
                                    setSelected={setSelectedStatuses}
                                    dropdownId="status"
                                    activeDropdown={activeDropdown}
                                    setActiveDropdown={setActiveDropdown}
                                    filterSearch={filterSearch}
                                    setFilterSearch={setFilterSearch}
                                />

                                <FilterDropdownGroup
                                    label="Loại hình"
                                    icon={<SlidersHorizontal size={14} className="text-blue-500" />}
                                    options={typeOptions}
                                    selected={selectedTypes}
                                    setSelected={setSelectedTypes}
                                    dropdownId="type"
                                    activeDropdown={activeDropdown}
                                    setActiveDropdown={setActiveDropdown}
                                    filterSearch={filterSearch}
                                    setFilterSearch={setFilterSearch}
                                />

                                <FilterDropdownGroup
                                    label="Kho hàng"
                                    icon={<Package size={14} className="text-amber-500" />}
                                    options={warehouseOptions}
                                    selected={selectedWarehouses}
                                    setSelected={setSelectedWarehouses}
                                    dropdownId="warehouse"
                                    activeDropdown={activeDropdown}
                                    setActiveDropdown={setActiveDropdown}
                                    filterSearch={filterSearch}
                                    setFilterSearch={setFilterSearch}
                                />

                                <FilterDropdownGroup
                                    label="Nhà cung cấp"
                                    icon={<User size={14} className="text-primary" />}
                                    options={supplierOptions}
                                    selected={selectedSuppliers}
                                    setSelected={setSelectedSuppliers}
                                    dropdownId="supplier"
                                    activeDropdown={activeDropdown}
                                    setActiveDropdown={setActiveDropdown}
                                    filterSearch={filterSearch}
                                    setFilterSearch={setFilterSearch}
                                    activeColor="indigo"
                                />

                                {hasActiveFilters && (
                                    <button
                                        onClick={handleResetFilters}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-red-300 text-red-500 text-[12px] font-bold hover:bg-red-50 transition-all font-inter"
                                    >
                                        <X size={14} />
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="w-full px-3 md:px-4 pt-4 md:pt-4 pb-6 md:pb-8 space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-left gap-4">
                                        <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-blue-200/70">
                                            <List size={22} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Tổng phiếu</p>
                                            <p className="text-2xl md:text-3xl font-bold text-foreground mt-1 leading-none">{issues.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50/70 border border-green-100 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-left gap-4">
                                        <div className="w-12 h-12 bg-green-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-green-200/70">
                                            <Plus size={22} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider">Hoàn thành</p>
                                            <p className="text-2xl md:text-3xl font-bold text-foreground mt-1 leading-none">
                                                {issues.filter(i => i.status === 'HOAN_THANH').length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-left gap-4">
                                        <div className="w-12 h-12 bg-indigo-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-indigo-200/70">
                                            <PackageMinus size={22} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Số lượng</p>
                                            <p className="text-2xl md:text-3xl font-bold text-foreground mt-1 leading-none">
                                                {issues.reduce((sum, i) => sum + (i.total_items || 0), 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-left gap-4">
                                        <div className="w-12 h-12 bg-amber-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-amber-200/70">
                                            <Clock size={22} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Chờ xử lý</p>
                                            <p className="text-2xl md:text-3xl font-bold text-foreground mt-1 leading-none">
                                                {issues.filter(i => i.status === 'CHO_DUYET').length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Area */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 md:p-8 rounded-[24px] border border-border shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-6">Phân bổ theo Trạng thái</h3>
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
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: {
                                                            padding: 20,
                                                            font: { size: 12, weight: 'bold' }
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-white p-6 md:p-8 rounded-[24px] border border-border shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-6">Phân loại hình thức xuất</h3>
                                    <div style={{ height: '300px' }}>
                                        <PieChartJS
                                            data={{
                                                labels: getTypeStats().map(item => item.name),
                                                datasets: [{
                                                    data: getTypeStats().map(item => item.value),
                                                    backgroundColor: chartColors.slice(0, getTypeStats().length),
                                                    borderColor: '#fff',
                                                    borderWidth: 2
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: {
                                                            padding: 20,
                                                            font: { size: 12, weight: 'bold' }
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-white p-6 md:p-8 rounded-[24px] border border-border shadow-sm lg:col-span-2">
                                    <h3 className="text-lg font-bold text-foreground mb-6">Top 10 Đối tác / Nhà cung cấp</h3>
                                    <div style={{ height: '350px' }}>
                                        <BarChartJS
                                            data={{
                                                labels: getSupplierStats().map(item => item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name),
                                                datasets: [{
                                                    label: 'Số phiếu',
                                                    data: getSupplierStats().map(item => item.value),
                                                    backgroundColor: chartColors[0],
                                                    borderColor: chartColors[0],
                                                    borderWidth: 1,
                                                    borderRadius: 8,
                                                    barThickness: 15
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                indexAxis: 'y',
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    x: {
                                                        beginAtZero: true,
                                                        grid: { display: false }
                                                    },
                                                    y: {
                                                        grid: { display: false },
                                                        ticks: {
                                                            font: { weight: 'bold' }
                                                        }
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

            {/* Mobile Filter Sheet */}
            <MobileFilterSheet
                isOpen={showMobileFilter}
                onClose={closeMobileFilter}
                isClosing={mobileFilterClosing}
                onApply={applyMobileFilter}
                sections={[
                    {
                        id: 'status',
                        label: 'Trạng thái',
                        icon: <Clock size={16} className="text-blue-600" />,
                        options: statusOptions,
                        selectedValues: pendingStatuses,
                        onSelectionChange: setPendingStatuses,
                    },
                    {
                        id: 'type',
                        label: 'Loại hình xuất',
                        icon: <SlidersHorizontal size={16} className="text-blue-600" />,
                        options: typeOptions,
                        selectedValues: pendingTypes,
                        onSelectionChange: setPendingTypes,
                    },
                    {
                        id: 'warehouse',
                        label: 'Kho hàng',
                        icon: <Package size={16} className="text-amber-600" />,
                        options: warehouseOptions,
                        selectedValues: pendingWarehouses,
                        onSelectionChange: setPendingWarehouses,
                    },
                    {
                        id: 'supplier',
                        label: 'Nhà cung cấp',
                        icon: <User size={16} className="text-primary" />,
                        options: supplierOptions,
                        selectedValues: pendingSuppliers,
                        onSelectionChange: setPendingSuppliers,
                    }
                ]}
            />

            {isFormModalOpen && (
                <GoodsIssueFormModal
                    issue={selectedIssue}
                    forcedType={initialForcedType}
                    onClose={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
};

export default GoodsIssues;

