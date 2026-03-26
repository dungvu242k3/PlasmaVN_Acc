import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend as ChartLegend,
    Tooltip as ChartTooltip,
    LinearScale,
    Title
} from 'chart.js';
import {
    BarChart2,
    Building,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    List,
    Search,
    SlidersHorizontal,
    User,
    X,
    TrendingUp,
    PieChart
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Bar as BarChartJS, Pie as PieChartJS } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useReports } from '../hooks/useReports';
import { exportMachineRevenueReport } from '../utils/exportExcel';
import ColumnPicker from '../components/ui/ColumnPicker';
import FilterDropdown from '../components/ui/FilterDropdown';
import MobileFilterSheet from '../components/ui/MobileFilterSheet';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    ChartTooltip,
    ChartLegend
);

const TABLE_COLUMNS = [
    { key: 'khach_hang', label: 'Khách hàng', width: '25%' },
    { key: 'khoa', label: 'Khoa', width: '15%' },
    { key: 'loai_khach_hang', label: 'Loại khách hàng', width: '15%' },
    { key: 'nhan_vien_kinh_doanh', label: 'Nhân viên kinh doanh', width: '15%' },
    { key: 'so_don_hang', label: 'Số đơn hàng', width: '10%' },
    { key: 'tong_doanh_so', label: 'Tổng doanh số', width: '20%' },
];

const MachineRevenueReport = () => {
    const navigate = useNavigate();
    const { fetchMachineRevenue, fetchFilterOptions, loading } = useReports();
    
    // View state
    const [activeView, setActiveView] = useState('list'); // 'list' or 'stats'
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([]);
    
    // Filter states
    const [filterOptions, setFilterOptions] = useState({ customerTypes: [], salespersons: [], departments: [] });
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedSalespersons, setSelectedSalespersons] = useState([]);
    const [selectedCustomerTypes, setSelectedCustomerTypes] = useState([]);
    
    // Column visibility and ordering
    const defaultColOrder = TABLE_COLUMNS.map(col => col.key);
    const columnDefs = TABLE_COLUMNS.reduce((acc, col) => {
        acc[col.key] = { label: col.label };
        return acc;
    }, {});
    
    const [columnOrder, setColumnOrder] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('columns_machine_revenue_order') || 'null');
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
            const saved = JSON.parse(localStorage.getItem('columns_machine_revenue') || 'null');
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
    
    // Mobile filter sheet state
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [mobileFilterClosing, setMobileFilterClosing] = useState(false);
    const [pendingDepartments, setPendingDepartments] = useState([]);
    const [pendingSalespersons, setPendingSalespersons] = useState([]);
    const [pendingCustomerTypes, setPendingCustomerTypes] = useState([]);

    useEffect(() => {
        const init = async () => {
            const revenueData = await fetchMachineRevenue();
            setData(revenueData || []);
            
            const options = await fetchFilterOptions();
            const depts = [...new Set((revenueData || []).map(item => item.khoa).filter(Boolean))].sort();
            
            setFilterOptions({
                customerTypes: options.customerTypes || [],
                salespersons: options.salespersons || [],
                departments: depts
            });
        };
        init();
    }, []);

    useEffect(() => {
        localStorage.setItem('columns_machine_revenue', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    useEffect(() => {
        localStorage.setItem('columns_machine_revenue_order', JSON.stringify(columnOrder));
    }, [columnOrder]);

    const loadData = async () => {
        const result = await fetchMachineRevenue();
        setData(result || []);
        // Update departments if new data might have new ones
        const depts = [...new Set((result || []).map(item => item.khoa).filter(Boolean))].sort();
        setFilterOptions(prev => ({ ...prev, departments: depts }));
    };

    const formatCurrency = (value) => {
        if (!value) return '0';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleExport = () => exportMachineRevenueReport(filteredData);

    const filteredData = data.filter(item => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = item.khach_hang?.toLowerCase().includes(search) || 
                             item.khoa?.toLowerCase().includes(search);
        
        const matchesDept = selectedDepartments.length === 0 || selectedDepartments.includes(item.khoa);
        const matchesSales = selectedSalespersons.length === 0 || selectedSalespersons.includes(item.nhan_vien_kinh_doanh);
        const matchesType = selectedCustomerTypes.length === 0 || selectedCustomerTypes.includes(item.loai_khach_hang);

        return matchesSearch && matchesDept && matchesSales && matchesType;
    });

    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.tong_doanh_so || 0), 0);
    const totalUnits = filteredData.length;

    // Mobile filter handlers
    const closeMobileFilter = () => {
        setMobileFilterClosing(true);
        setTimeout(() => {
            setShowMobileFilter(false);
            setMobileFilterClosing(false);
        }, 280);
    };

    const openMobileFilter = () => {
        setPendingDepartments(selectedDepartments);
        setPendingSalespersons(selectedSalespersons);
        setPendingCustomerTypes(selectedCustomerTypes);
        setShowMobileFilter(true);
    };

    const applyMobileFilter = () => {
        setSelectedDepartments(pendingDepartments);
        setSelectedSalespersons(pendingSalespersons);
        setSelectedCustomerTypes(pendingCustomerTypes);
        closeMobileFilter();
    };

    // Outside click handlers
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (columnPickerRef.current && !columnPickerRef.current.contains(event.target)) {
                setShowColumnPicker(false);
            }
            if (activeDropdown && 
                !(listDropdownRef.current?.contains(event.target)) && 
                !(statsDropdownRef.current?.contains(event.target))) {
                setActiveDropdown(null);
                setFilterSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showColumnPicker, activeDropdown]);

    const hasActiveFilters = selectedDepartments.length > 0 || selectedSalespersons.length > 0 || selectedCustomerTypes.length > 0;
    const totalActiveFilters = selectedDepartments.length + selectedSalespersons.length + selectedCustomerTypes.length;

    // Filter Options for Dropdown
    const deptOptions = filterOptions.departments.map(d => ({
        id: d, label: d, count: data.filter(i => i.khoa === d).length
    }));
    const salesOptions = filterOptions.salespersons.map(s => ({
        id: s, label: s, count: data.filter(i => i.nhan_vien_kinh_doanh === s).length
    }));
    const typeOptions = filterOptions.customerTypes.map(t => ({
        id: t, label: t === 'công' ? 'BV công' : t === 'tư' ? 'BV tư' : t, count: data.filter(i => i.loai_khach_hang === t).length
    }));

    // Stats View Data
    const revenueBySales = () => {
        const stats = {};
        filteredData.forEach(item => {
            const name = item.nhan_vien_kinh_doanh || 'Khác';
            stats[name] = (stats[name] || 0) + (item.tong_doanh_so || 0);
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 10);
    };

    const revenueByType = () => {
        const stats = {};
        filteredData.forEach(item => {
            const name = item.loai_khach_hang === 'công' ? 'BV công' : item.loai_khach_hang === 'tư' ? 'BV tư' : 'Khác';
            stats[name] = (stats[name] || 0) + (item.tong_doanh_so || 0);
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    };

    const chartColors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

    const visibleTableColumns = columnOrder
        .filter(key => visibleColumns.includes(key))
        .map(key => TABLE_COLUMNS.find(col => col.key === key))
        .filter(Boolean);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex-1 flex flex-col mt-1 min-h-0 px-1 md:px-1.5">

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between mb-3 mt-1">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setActiveView('list')}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all",
                            activeView === 'list'
                                ? "bg-white text-primary shadow-sm ring-1 ring-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
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
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        )}
                    >
                        <BarChart2 size={14} />
                        Thống kê
                    </button>
                </div>
            </div>

            {activeView === 'list' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col flex-1 min-h-0 w-full overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-3 md:p-3.5 border-b border-border bg-muted/5 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Desktop Back + Search Row */}
                            <div className="hidden md:flex items-center gap-2 flex-1">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"
                                >
                                    <ChevronLeft size={16} />
                                    Quay lại
                                </button>
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                                    <input
                                        type="text"
                                        placeholder="Tìm khách hàng hoặc khoa . . ."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2 bg-white border border-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Search/Filter Row */}
                            <div className="flex md:hidden items-center gap-2 w-full">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2.5 rounded-xl border border-border bg-white text-muted-foreground shrink-0 shadow-sm"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                                    <input
                                        type="text"
                                        placeholder="Tìm khách hàng . . ."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                    />
                                </div>
                                <button
                                    onClick={openMobileFilter}
                                    className={clsx(
                                        'relative p-2.5 rounded-xl border shrink-0 transition-all shadow-sm',
                                        hasActiveFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground'
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

                            {/* Desktop Desktop Actions */}
                            <div className="hidden md:flex items-center gap-2">
                                <div className="relative" ref={columnPickerRef}>
                                    <button
                                        onClick={() => setShowColumnPicker(!showColumnPicker)}
                                        className={clsx(
                                            'flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all bg-white shadow-sm',
                                            showColumnPicker ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'
                                        )}
                                    >
                                        <SlidersHorizontal size={15} />
                                        Cột ({visibleColumns.length}/{TABLE_COLUMNS.length})
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
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-[13px] font-bold shadow-md shadow-emerald-600/20 transition-all"
                                >
                                    <Download size={15} />
                                    Xuất Excel
                                </button>
                            </div>
                        </div>

                        {/* Desktop Filter Dropdowns Row 2 */}
                        <div className="hidden md:flex items-center gap-2.5" ref={listDropdownRef}>
                            <div className="relative">
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === 'khoa' ? null : 'khoa')}
                                    className={clsx(
                                        'flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all shadow-sm',
                                        selectedDepartments.length > 0 ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-border bg-white text-muted-foreground hover:bg-muted/10'
                                    )}
                                >
                                    <Building size={14} className={selectedDepartments.length > 0 ? 'text-violet-700' : 'text-violet-500'} />
                                    Khoa
                                    {selectedDepartments.length > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold">{selectedDepartments.length}</span>
                                    )}
                                    <ChevronDown size={14} className={clsx('transition-transform', activeDropdown === 'khoa' ? 'rotate-180' : '')} />
                                </button>
                                {activeDropdown === 'khoa' && (
                                    <FilterDropdown
                                        options={deptOptions}
                                        selected={selectedDepartments}
                                        setSelected={setSelectedDepartments}
                                        filterSearch={filterSearch}
                                        setFilterSearch={setFilterSearch}
                                    />
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === 'nvkd' ? null : 'nvkd')}
                                    className={clsx(
                                        'flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all shadow-sm',
                                        selectedSalespersons.length > 0 ? 'border-primary/20 bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground hover:bg-muted/10'
                                    )}
                                >
                                    <User size={14} className={selectedSalespersons.length > 0 ? 'text-primary' : 'text-primary/70'} />
                                    NVKD
                                    {selectedSalespersons.length > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">{selectedSalespersons.length}</span>
                                    )}
                                    <ChevronDown size={14} className={clsx('transition-transform', activeDropdown === 'nvkd' ? 'rotate-180' : '')} />
                                </button>
                                {activeDropdown === 'nvkd' && (
                                    <FilterDropdown
                                        options={salesOptions}
                                        selected={selectedSalespersons}
                                        setSelected={setSelectedSalespersons}
                                        filterSearch={filterSearch}
                                        setFilterSearch={setFilterSearch}
                                    />
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                                    className={clsx(
                                        'flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all shadow-sm',
                                        selectedCustomerTypes.length > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border bg-white text-muted-foreground hover:bg-muted/10'
                                    )}
                                >
                                    <TrendingUp size={14} className={selectedCustomerTypes.length > 0 ? 'text-emerald-700' : 'text-emerald-500'} />
                                    Loại KH
                                    {selectedCustomerTypes.length > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">{selectedCustomerTypes.length}</span>
                                    )}
                                    <ChevronDown size={14} className={clsx('transition-transform', activeDropdown === 'type' ? 'rotate-180' : '')} />
                                </button>
                                {activeDropdown === 'type' && (
                                    <FilterDropdown
                                        options={typeOptions}
                                        selected={selectedCustomerTypes}
                                        setSelected={setSelectedCustomerTypes}
                                        filterSearch={filterSearch}
                                        setFilterSearch={setFilterSearch}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block flex-1 overflow-auto bg-white">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-10 bg-[#F1F5FF] shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                                <tr>
                                    {visibleTableColumns.map((col) => (
                                        <th key={col.key} className="px-4 py-3.5 text-left text-[12px] font-bold text-muted-foreground uppercase tracking-wide border-b border-border">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={visibleTableColumns.length} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                <span className="text-sm font-medium text-muted-foreground">Đang tải dữ liệu báo cáo...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleTableColumns.length} className="py-20 text-center text-muted-foreground italic text-[13px]">
                                            Không tìm thấy kết quả phù hợp với bộ lọc
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-muted/30 transition-colors">
                                            {visibleTableColumns.map((col) => (
                                                <td key={col.key} className="px-4 py-3.5 text-[13px] font-medium text-foreground">
                                                    {col.key === 'tong_doanh_so' ? (
                                                        <span className="font-bold text-foreground tracking-tight">{formatCurrency(item[col.key])}</span>
                                                    ) : col.key === 'loai_khach_hang' ? (
                                                        <span className={clsx(
                                                            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight',
                                                            item[col.key] === 'công' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                                                        )}>
                                                            {item[col.key] === 'công' ? 'BV công' : 'BV tư'}
                                                        </span>
                                                    ) : (
                                                        item[col.key] || '---'
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                        {loading ? (
                            <div className="py-16 text-center text-[13px] text-muted-foreground italic">Đang tải dữ liệu...</div>
                        ) : filteredData.length === 0 ? (
                            <div className="py-16 text-center text-[13px] text-muted-foreground italic">Không tìm thấy kết quả</div>
                        ) : (
                            filteredData.map((item, idx) => (
                                <div key={idx} className="bg-white border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-[15px] font-bold text-foreground leading-tight">{item.khach_hang}</h3>
                                        <span className={clsx(
                                            'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase',
                                            item.loai_khach_hang === 'công' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                                        )}>
                                            {item.loai_khach_hang === 'công' ? 'BV công' : 'BV tư'}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 mb-3">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Building className="w-3.5 h-3.5" />
                                            <span className="text-[12px] font-medium">{item.khoa || 'Không xác định'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="w-3.5 h-3.5" />
                                            <span className="text-[12px] font-medium">{item.nhan_vien_kinh_doanh || 'Chưa giao'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Doanh số</span>
                                            <span className="text-[15px] font-bold text-emerald-600">{formatCurrency(item.tong_doanh_so)}</span>
                                        </div>
                                        <div className="bg-muted px-2.5 py-1 rounded-lg text-center">
                                            <span className="block text-[9px] font-bold text-muted-foreground leading-none">Số đơn</span>
                                            <span className="text-[13px] font-black text-foreground">{item.so_don_hang}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Table Footer */}
                    <div className="hidden md:flex px-4 py-3.5 border-t border-border items-center justify-between bg-muted/5">
                        <div className="flex items-center gap-3 text-[12px] text-muted-foreground font-medium">
                            <span className="tabular-nums font-bold text-foreground/80">{filteredData.length > 0 ? `1–${filteredData.length}` : '0'}/Tổng {filteredData.length}</span>
                            <div className="flex items-center gap-1 ml-2">
                                <span className="text-[11px] font-bold opacity-30">│</span>
                                <span className="text-primary font-bold">Tổng: {formatCurrency(filteredData.reduce((acc, curr) => acc + (curr.tong_doanh_so || 0), 0))}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled title="Trang đầu">
                                <ChevronLeft size={16} />
                                <ChevronLeft size={16} className="-ml-2.5" />
                            </button>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled title="Trang trước">
                                <ChevronLeft size={16} />
                            </button>
                            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-[12px] font-bold shadow-md shadow-primary/25">1</div>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled title="Trang sau">
                                <ChevronRight size={16} />
                            </button>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled title="Trang cuối">
                                <ChevronRight size={16} />
                                <ChevronRight size={16} className="-ml-2.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'stats' && (
                /* Statistics View */
                <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col flex-1 min-h-0 w-full overflow-hidden">
                    <div className="space-y-0 flex-1 flex flex-col min-h-0">
                        {/* Mobile Header for Stats */}
                        <div className="md:hidden flex items-center gap-2 p-3 border-b border-border bg-muted/5">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2.5 rounded-xl border border-border bg-white text-muted-foreground shrink-0 shadow-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <h2 className="text-[15px] font-extrabold text-foreground flex-1 text-center tracking-tight">Thống kê báo cáo</h2>
                            <button
                                onClick={openMobileFilter}
                                className={clsx(
                                    'relative p-2.5 rounded-xl border shrink-0 transition-all shadow-sm',
                                    hasActiveFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground'
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

                        {/* Desktop Header for Stats */}
                        <div className="hidden md:block p-3.5 border-b border-border bg-muted/5" ref={statsDropdownRef}>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"
                                >
                                    <ChevronLeft size={16} />
                                    Quay lại
                                </button>

                                <div className="flex items-center gap-2.5">
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === 'khoa' ? null : 'khoa')}
                                            className={clsx(
                                                'flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all shadow-sm',
                                                selectedDepartments.length > 0 ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-border bg-white text-muted-foreground hover:bg-muted/10'
                                            )}
                                        >
                                            <Building size={14} className={selectedDepartments.length > 0 ? 'text-violet-700' : 'text-violet-500'} />
                                            Khoa
                                            {selectedDepartments.length > 0 && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold">{selectedDepartments.length}</span>
                                            )}
                                            <ChevronDown size={14} className={clsx('transition-transform', activeDropdown === 'khoa' ? 'rotate-180' : '')} />
                                        </button>
                                        {activeDropdown === 'khoa' && (
                                            <FilterDropdown
                                                options={deptOptions}
                                                selected={selectedDepartments}
                                                setSelected={setSelectedDepartments}
                                                filterSearch={filterSearch}
                                                setFilterSearch={setFilterSearch}
                                            />
                                        )}
                                    </div>

                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === 'nvkd' ? null : 'nvkd')}
                                            className={clsx(
                                                'flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all shadow-sm',
                                                selectedSalespersons.length > 0 ? 'border-primary/20 bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground hover:bg-muted/10'
                                            )}
                                        >
                                            <User size={14} className={selectedSalespersons.length > 0 ? 'text-primary' : 'text-primary/70'} />
                                            NVKD
                                            {selectedSalespersons.length > 0 && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">{selectedSalespersons.length}</span>
                                            )}
                                            <ChevronDown size={14} className={clsx('transition-transform', activeDropdown === 'nvkd' ? 'rotate-180' : '')} />
                                        </button>
                                        {activeDropdown === 'nvkd' && (
                                            <FilterDropdown
                                                options={salesOptions}
                                                selected={selectedSalespersons}
                                                setSelected={setSelectedSalespersons}
                                                filterSearch={filterSearch}
                                                setFilterSearch={setFilterSearch}
                                            />
                                        )}
                                    </div>

                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                                            className={clsx(
                                                'flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all shadow-sm',
                                                selectedCustomerTypes.length > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border bg-white text-muted-foreground hover:bg-muted/10'
                                            )}
                                        >
                                            <TrendingUp size={14} className={selectedCustomerTypes.length > 0 ? 'text-emerald-700' : 'text-emerald-500'} />
                                            Loại KH
                                            {selectedCustomerTypes.length > 0 && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">{selectedCustomerTypes.length}</span>
                                            )}
                                            <ChevronDown size={14} className={clsx('transition-transform', activeDropdown === 'type' ? 'rotate-180' : '')} />
                                        </button>
                                        {activeDropdown === 'type' && (
                                            <FilterDropdown
                                                options={typeOptions}
                                                selected={selectedCustomerTypes}
                                                setSelected={setSelectedCustomerTypes}
                                                filterSearch={filterSearch}
                                                setFilterSearch={setFilterSearch}
                                            />
                                        )}
                                    </div>
                                    </div>
                                </div>

                                {hasActiveFilters && (
                                    <button
                                        onClick={() => {
                                            setSelectedDepartments([]);
                                            setSelectedSalespersons([]);
                                            setSelectedCustomerTypes([]);
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-red-300 text-red-500 text-[12px] font-bold hover:bg-red-50 transition-all ml-auto md:ml-0"
                                    >
                                        <X size={14} />
                                        Xóa bộ lọc
                                    </button>
                                    )}
                                </div>
                        
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center justify-start gap-4">
                                        <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-blue-200/70">
                                            <TrendingUp className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Tổng doanh số</p>
                                            <p className="text-2xl md:text-3xl font-black text-foreground mt-1 tabular-nums">{formatCurrency(totalRevenue)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center justify-start gap-4">
                                        <div className="w-12 h-12 bg-emerald-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-emerald-200/70">
                                            <BarChart2 className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Tổng số máy</p>
                                            <p className="text-2xl md:text-3xl font-black text-foreground mt-1 tabular-nums">{formatNumber(totalUnits)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center justify-start gap-4">
                                        <div className="w-12 h-12 bg-amber-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-amber-200/70">
                                            <TrendingUp className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Doanh số TB/Máy</p>
                                            <p className="text-2xl md:text-3xl font-black text-foreground mt-1 tabular-nums">
                                                {formatCurrency(totalUnits > 0 ? Math.round(totalRevenue / totalUnits) : 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                 {/* By Salesperson */}
                                 <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                        <BarChart2 size={20} className="text-primary" />
                                        Top 10 Nhân viên kinh doanh theo doanh số
                                    </h3>
                                    <div style={{ height: '300px' }}>
                                        <BarChartJS
                                            data={{
                                                labels: revenueBySales().map(d => d.name),
                                                datasets: [{
                                                    label: 'Doanh số (VND)',
                                                    data: revenueBySales().map(d => d.value),
                                                    backgroundColor: '#3B82F6',
                                                    borderRadius: 6,
                                                    barThickness: 24,
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { display: false } },
                                                indexAxis: 'y',
                                                scales: {
                                                    x: { 
                                                        grid: { display: false },
                                                        ticks: { 
                                                            font: { weight: 'bold', size: 10 },
                                                            callback: value => value >= 1000000 ? (value / 1000000).toFixed(0) + 'M' : value 
                                                        }
                                                    },
                                                    y: { 
                                                        grid: { display: false },
                                                        ticks: { font: { weight: 'bold', size: 11 } }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                 </div>

                                 {/* By Customer Type */}
                                 <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                        <PieChart size={20} className="text-emerald-500" />
                                        Phân bổ doanh số theo Loại khách hàng
                                    </h3>
                                    <div style={{ height: '300px' }}>
                                        <PieChartJS
                                            data={{
                                                labels: revenueByType().map(d => d.name),
                                                datasets: [{
                                                    data: revenueByType().map(d => d.value),
                                                    backgroundColor: ['#2563EB', '#EC4899', '#F59E0B'],
                                                    borderWidth: 2,
                                                    borderColor: '#fff',
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { 
                                                    legend: { 
                                                        position: 'bottom', 
                                                        labels: { 
                                                            usePointStyle: true, 
                                                            padding: 20, 
                                                            font: { weight: 'bold', size: 12 } 
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
                isClosing={mobileFilterClosing}
                onClose={closeMobileFilter}
                onApply={applyMobileFilter}
                sections={[
                    {
                        id: 'khoa',
                        label: 'Khoa',
                        icon: <Building size={18} />,
                        options: deptOptions,
                        selectedValues: pendingDepartments,
                        onSelectionChange: setPendingDepartments,
                    },
                    {
                        id: 'nvkd',
                        label: 'Nhân viên kinh doanh',
                        icon: <User size={18} />,
                        options: salesOptions,
                        selectedValues: pendingSalespersons,
                        onSelectionChange: setPendingSalespersons,
                    },
                    {
                        id: 'type',
                        label: 'Loại khách hàng',
                        icon: <TrendingUp size={18} />,
                        options: typeOptions,
                        selectedValues: pendingCustomerTypes,
                        onSelectionChange: setPendingCustomerTypes,
                    }
                ]}
                hasActiveFilters={hasActiveFilters}
                totalActiveFilters={totalActiveFilters}
            />
        </div>
    );
};

export default MachineRevenueReport;
