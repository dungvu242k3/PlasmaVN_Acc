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
  Download, 
  Filter, 
  Package, 
  Hash, 
  Building,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
  List,
  BarChart2,
  Calendar,
  Warehouse,
  Users,
  CheckCircle,
  TrendingUp,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Bar as BarChartJS, Pie as PieChartJS } from 'react-chartjs-2';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { exportOrdersMonthlyReport } from '../utils/exportExcel';
import MobilePageHeader from '../components/layout/MobilePageHeader';
import MobilePagination from '../components/layout/MobilePagination';
import PageViewSwitcher from '../components/layout/PageViewSwitcher';
import FilterDropdown from '../components/ui/FilterDropdown';
import MobileFilterSheet from '../components/ui/MobileFilterSheet';
import ColumnPicker from '../components/ui/ColumnPicker';
import { CUSTOMER_CATEGORIES } from '../constants/orderConstants';

const REPORT_COLUMNS = [
  { key: 'ma_don', label: 'Mã đơn' },
  { key: 'loai_khach_hang', label: 'Loại khách' },
  { key: 'kho', label: 'Kho' },
  { key: 'ten_khach_hang', label: 'Khách hàng' },
  { key: 'so_luong', label: 'SL' },
  { key: 'thanh_tien', label: 'Doanh thu' },
  { key: 'trang_thai', label: 'Trạng thái' },
  { key: 'nhan_vien_kinh_doanh', label: 'NVKD' }
];

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

const OrdersMonthlyReport = () => {
  const navigate = useNavigate();
  const { fetchOrdersMonthly, fetchFilterOptions, loading } = useReports();
  const [data, setData] = useState([]);

  const getLabel = (list, id) => {
    const matched = list.find(item => item.id === id);
    return matched?.label || matched?.name || id;
  };

  const getCategoryBadgeClass = (categoryId) => clsx(
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border whitespace-nowrap',
    categoryId === 'BV' && 'bg-blue-50 text-blue-700 border-blue-200',
    categoryId === 'TM' && 'bg-pink-50 text-pink-700 border-pink-200',
    categoryId === 'PK' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
    categoryId === 'NG' && 'bg-violet-50 text-violet-700 border-violet-200',
    categoryId === 'SP' && 'bg-amber-50 text-amber-700 border-amber-200',
    !categoryId && 'bg-muted text-muted-foreground border-border'
  );

  const getRowStyle = (category) => {
    let baseStyle = "group border-l-4 transition-colors hover:bg-blue-50/40 ";
    switch (category) {
      case 'BV': baseStyle += "border-l-blue-400 "; break;
      case 'TM': baseStyle += "border-l-pink-400 "; break;
      case 'PK': baseStyle += "border-l-emerald-400 "; break;
      case 'NG': baseStyle += "border-l-violet-400 "; break;
      case 'SP': baseStyle += "border-l-amber-400 "; break;
      default: baseStyle += "border-l-transparent ";
    }
    return baseStyle;
  };

  const [activeView, setActiveView] = useState('list');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterSearch, setFilterSearch] = useState('');
  
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const columnPickerRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const defaultColOrder = REPORT_COLUMNS.map(col => col.key);
  const columnDefs = REPORT_COLUMNS.reduce((acc, col) => {
    acc[col.key] = { label: col.label };
    return acc;
  }, {});

  const [columnOrder, setColumnOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('columns_orders_monthly_report_order') || 'null');
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
      const saved = JSON.parse(localStorage.getItem('columns_orders_monthly_report_visible') || 'null');
      if (Array.isArray(saved) && saved.length > 0) return saved.filter(key => defaultColOrder.includes(key));
    } catch { }
    return defaultColOrder;
  });

  useEffect(() => {
    localStorage.setItem('columns_orders_monthly_report_order', JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    localStorage.setItem('columns_orders_monthly_report_visible', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const isColumnVisible = (key) => visibleColumns.includes(key);

  const [filters, setFilters] = useState({
    years: [new Date().getFullYear().toString()],
    months: [],
    warehouses: [],
    customer_categories: []
  });
  const [filterOptions, setFilterOptions] = useState({
    years: [new Date().getFullYear()],
    warehouses: [],
    customerTypes: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const listDropdownRef = useRef(null);
  const statsDropdownRef = useRef(null);

  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [mobileFilterClosing, setMobileFilterClosing] = useState(false);
  const [pendingYears, setPendingYears] = useState(filters.years);
  const [pendingMonths, setPendingMonths] = useState(filters.months);
  const [pendingWarehouses, setPendingWarehouses] = useState(filters.warehouses);
  const [pendingCustomerCategories, setPendingCustomerCategories] = useState(filters.customer_categories);

  const hasActiveFilters = filters.months.length > 0 || filters.warehouses.length > 0 || filters.customer_categories.length > 0;
  const totalActiveFilters = filters.months.length + filters.warehouses.length + filters.customer_categories.length;

  const renderFilters = (ref) => (
    <div className="flex flex-wrap items-center gap-2" ref={ref}>
      <div className="relative">
        <button
          onClick={() => {
            if (activeDropdown !== 'years') setFilterSearch('');
            setActiveDropdown(activeDropdown === 'years' ? null : 'years');
          }}
          className={getFilterButtonClass('years', activeDropdown === 'years' || filters.years.length > 0)}
        >
          <Calendar size={14} className={getFilterIconClass('years', activeDropdown === 'years' || filters.years.length > 0)} />
          Năm {filters.years[0]}
          <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'years' ? "rotate-180" : "")} />
        </button>
        {activeDropdown === 'years' && (
          <FilterDropdown
            options={filterOptions.years.map(y => ({ id: y.toString(), label: `Năm ${y}`, count: data.filter(d => d.nam === y).length }))}
            selected={filters.years}
            setSelected={(val) => handleFilterChange('years', val)}
            filterSearch={filterSearch}
            setFilterSearch={setFilterSearch}
          />
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => {
            if (activeDropdown !== 'months') setFilterSearch('');
            setActiveDropdown(activeDropdown === 'months' ? null : 'months');
          }}
          className={getFilterButtonClass('months', activeDropdown === 'months' || filters.months.length > 0)}
        >
          <Calendar size={14} className={getFilterIconClass('months', activeDropdown === 'months' || filters.months.length > 0)} />
          {filters.months.length > 0 ? `Tháng ${filters.months[0]}` : 'Tất cả tháng'}
          <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'months' ? "rotate-180" : "")} />
        </button>
        {activeDropdown === 'months' && (
          <FilterDropdown
            options={[...Array(12)].map((_, i) => ({ id: (i + 1).toString(), label: `Tháng ${i + 1}`, count: data.filter(d => d.thang === (i+1)).length }))}
            selected={filters.months}
            setSelected={(val) => handleFilterChange('months', val)}
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
          className={getFilterButtonClass('warehouses', activeDropdown === 'warehouses' || filters.warehouses.length > 0)}
        >
          <Warehouse size={14} className={getFilterIconClass('warehouses', activeDropdown === 'warehouses' || filters.warehouses.length > 0)} />
          {filters.warehouses.length > 0 ? filters.warehouses[0] : 'Tất cả kho'}
          <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'warehouses' ? "rotate-180" : "")} />
        </button>
        {activeDropdown === 'warehouses' && (
          <FilterDropdown
            options={filterOptions.warehouses.map(w => ({ id: w.name, label: w.name, count: data.filter(d => d.kho === w.name).length }))}
            selected={filters.warehouses}
            setSelected={(val) => handleFilterChange('warehouses', val)}
            filterSearch={filterSearch}
            setFilterSearch={setFilterSearch}
          />
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => {
            if (activeDropdown !== 'customer_categories') setFilterSearch('');
            setActiveDropdown(activeDropdown === 'customer_categories' ? null : 'customer_categories');
          }}
          className={getFilterButtonClass('customer_categories', activeDropdown === 'customer_categories' || filters.customer_categories.length > 0)}
        >
          <Users size={14} className={getFilterIconClass('customer_categories', activeDropdown === 'customer_categories' || filters.customer_categories.length > 0)} />
          {filters.customer_categories.length === 0 ? 'Loại khách' : 
           filters.customer_categories.length === 1 ? getLabel(CUSTOMER_CATEGORIES, filters.customer_categories[0]) : 
           `${filters.customer_categories.length} loại khách`}
          <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'customer_categories' ? "rotate-180" : "")} />
        </button>
        {activeDropdown === 'customer_categories' && (
          <FilterDropdown
            options={[...new Set([...filterOptions.customerTypes, ...data.map(d => d.loai_khach_hang).filter(Boolean)])].map(t => ({ 
              id: t, 
              label: getLabel(CUSTOMER_CATEGORIES, t), 
              count: data.filter(d => d.loai_khach_hang === t).length 
            }))}
            selected={filters.customer_categories}
            setSelected={(val) => handleFilterChange('customer_categories', val)}
            filterSearch={filterSearch}
            setFilterSearch={setFilterSearch}
          />
        )}
      </div>
    </div>
  );

  const openMobileFilter = () => {
    setPendingYears(filters.years);
    setPendingMonths(filters.months);
    setPendingWarehouses(filters.warehouses);
    setPendingCustomerCategories(filters.customer_categories);
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
    const newFilters = {
      years: pendingYears,
      months: pendingMonths,
      warehouses: pendingWarehouses,
      customer_categories: pendingCustomerCategories
    };
    setFilters(newFilters);
    setCurrentPage(1);
    closeMobileFilter();
    loadData(newFilters);
  };

  const mobileFilterSections = [
    {
      id: 'years',
      label: 'Năm',
      icon: <Calendar size={18} className="text-blue-500" />,
      options: filterOptions.years.map(y => ({ id: y.toString(), label: `Năm ${y}` })),
      selectedValues: pendingYears,
      onSelectionChange: setPendingYears,
      singleSelect: true
    },
    {
      id: 'months',
      label: 'Tháng',
      icon: <Calendar size={18} className="text-blue-500" />,
      options: Array.from({ length: 12 }, (_, i) => ({ id: (i + 1).toString(), label: `Tháng ${i + 1}` })),
      selectedValues: pendingMonths,
      onSelectionChange: setPendingMonths
    },
    {
      id: 'warehouses',
      label: 'Kho',
      icon: <Warehouse size={18} className="text-amber-500" />,
      options: filterOptions.warehouses.map(w => ({ id: w.name, label: w.name })),
      selectedValues: pendingWarehouses,
      onSelectionChange: setPendingWarehouses
    },
    {
      id: 'categories',
      label: 'Loại khách',
      icon: <Users size={18} className="text-emerald-500" />,
      options: [...new Set([...filterOptions.customerTypes, ...data.map(d => d.loai_khach_hang).filter(Boolean)])].map(t => ({ 
        id: t, 
        label: getLabel(CUSTOMER_CATEGORIES, t)
      })),
      selectedValues: pendingCustomerCategories,
      onSelectionChange: setPendingCustomerCategories
    }
  ];


  useEffect(() => { loadData(); loadFilterOptions(); }, []);

  const loadData = async (currentFilters = filters) => {
    // We only fetch by YEAR from the server to keep counts in other filter dropdowns accurate (like in Orders.jsx)
    // Other filters (Month, Warehouse, Category) will be applied client-side on the retrieved year data.
    const result = await fetchOrdersMonthly({
      year: currentFilters.years
    });
    setData(result || []);
  };

  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    if (!options) return;
    
    setFilterOptions({
      years: options.years?.length ? options.years : [new Date().getFullYear()],
      warehouses: options.warehouses || [],
      customerTypes: options.customerTypes?.length ? options.customerTypes : (options.categories || [])
    });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadData(newFilters);
  };

  const handleExport = () => exportOrdersMonthlyReport(filteredData);

  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm || 
      item.ma_don?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.ten_khach_hang?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesMonth = filters.months.length === 0 || filters.months.includes(item.thang?.toString());
    const matchesWarehouse = filters.warehouses.length === 0 || filters.warehouses.includes(item.kho);
    const matchesCategory = filters.customer_categories.length === 0 || filters.customer_categories.includes(item.loai_khach_hang);
    
    return matchesSearch && matchesMonth && matchesWarehouse && matchesCategory;
  });

  const formatCurrency = (value) => { 
    if (!value) return '0'; 
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const totalRevenue = filteredData.reduce((sum, item) => sum + (item.thanh_tien || 0), 0);
  const totalQuantity = filteredData.reduce((sum, item) => sum + (item.so_luong || 0), 0);
  const totalRecords = filteredData.length;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Statistics data
  const getStatusStats = () => {
    const stats = {};
    filteredData.forEach(item => {
      const label = item.trang_thai === 'HOAN_THANH' ? 'Hoàn thành' : 'Đã duyệt';
      stats[label] = (stats[label] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  };

  const getCategoryStats = () => {
    const stats = {};
    filteredData.forEach(item => {
      const label = getLabel(CUSTOMER_CATEGORIES, item.loai_khach_hang);
      stats[label] = (stats[label] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  };

  const getWarehouseStats = () => {
    const stats = {};
    filteredData.forEach(item => {
      const label = item.kho || 'Không xác định';
      stats[label] = (stats[label] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  };

  const getRevenueByWarehouse = () => {
    const stats = {};
    filteredData.forEach(item => {
      const label = item.kho || 'Không xác định';
      stats[label] = (stats[label] || 0) + (item.thanh_tien || 0);
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  };

  const chartColors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listDropdownRef.current && !listDropdownRef.current.contains(event.target) &&
          statsDropdownRef.current && !statsDropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (columnPickerRef.current && !columnPickerRef.current.contains(event.target)) {
        setShowColumnPicker(false);
      }
      if (showMoreActions) {
        const menu = document.getElementById('more-actions-menu-orders-report');
        const btn = document.getElementById('more-actions-button-orders-report');
        if (menu && !menu.contains(event.target) && btn && !btn.contains(event.target)) {
          setShowMoreActions(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown, showColumnPicker, showMoreActions]);

  const getFilterButtonClass = (key, isActive) => {
    if (!isActive) return "border-border bg-white text-muted-foreground hover:bg-muted/20 flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all shadow-sm";
    
    const base = "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all shadow-sm ";
    switch (key) {
      case 'years':
      case 'months': return base + "border-blue-200 bg-blue-50 text-blue-700";
      case 'warehouses': return base + "border-amber-200 bg-amber-50 text-amber-700";
      case 'customer_categories': return base + "border-emerald-200 bg-emerald-50 text-emerald-700";
      default: return base + "border-primary bg-primary/5 text-primary";
    }
  };

  const getFilterIconClass = (key, isActive) => {
    switch (key) {
      case 'years':
      case 'months': return isActive ? 'text-blue-700' : 'text-blue-500';
      case 'warehouses': return isActive ? 'text-amber-700' : 'text-amber-500';
      case 'customer_categories': return isActive ? 'text-emerald-700' : 'text-emerald-500';
      default: return isActive ? 'text-primary' : 'text-primary/80';
    }
  };

  const getFilterCountBadgeClass = (key) => {
    switch (key) {
      case 'years':
      case 'months': return 'bg-blue-600 text-white';
      case 'warehouses': return 'bg-amber-600 text-white';
      case 'customer_categories': return 'bg-emerald-600 text-white';
      default: return 'bg-primary text-white';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex-1 flex flex-col mt-1 min-h-0 px-1 md:px-1.5">
      <PageViewSwitcher
        activeView={activeView}
        setActiveView={setActiveView}
        views={[
          { id: 'list', label: 'Danh sách', icon: <List size={16} /> },
          { id: 'stats', label: 'Thống kê', icon: <BarChart2 size={16} /> },
        ]}
      />

      {activeView === 'list' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col flex-1 min-h-0 w-full">
          <MobilePageHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Tìm kiếm..."
            onFilterClick={openMobileFilter}
            hasActiveFilters={hasActiveFilters}
            totalActiveFilters={totalActiveFilters}
            actions={
              <div className="relative">
                <button
                  id="more-actions-button-orders-report"
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className={clsx(
                    "p-2 rounded-xl border shrink-0 transition-all active:scale-95 shadow-sm",
                    showMoreActions ? "bg-slate-100 border-slate-300" : "bg-white border-slate-200 text-slate-600"
                  )}
                >
                  <MoreVertical size={20} />
                </button>
                {showMoreActions && (
                  <div id="more-actions-menu-orders-report" className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                    <div
                      role="button"
                      onClick={() => { handleExport(); setShowMoreActions(false); }}
                      className="w-full flex items-center justify-start gap-4 px-4 py-2.5 text-[14px] font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <div className="w-5 flex justify-center flex-shrink-0">
                        <Download size={18} className="text-slate-400" />
                      </div>
                      Xuất Excel
                    </div>
                  </div>
                )}
              </div>
            }
          />

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
                  placeholder="Tìm theo mã đơn, khách hàng . . ."
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
            <div className="flex items-center gap-2 relative" ref={columnPickerRef}>
                <button
                  onClick={() => setShowColumnPicker(!showColumnPicker)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[13px] font-bold transition-all bg-white shadow-sm',
                    showColumnPicker
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted/20'
                  )}
                >
                  <SlidersHorizontal size={16} />
                  Cột ({visibleColumns.length}/{REPORT_COLUMNS.length})
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
                <button 
                  onClick={handleExport} 
                  className="flex items-center gap-2 px-6 py-1.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
                >
                  <Download size={18} />
                  Xuất Excel
                </button>
              </div>
            </div>

            {/* Filters */}
            {renderFilters(listDropdownRef)}
          </div>

          {/* ── MOBILE CARD LIST ── */}
          <div className="md:hidden flex-1 overflow-y-auto p-3 pb-4 flex flex-col gap-3">
            {loading ? (
              <div className="py-16 text-center text-[13px] text-muted-foreground italic">Đang tải dữ liệu...</div>
            ) : paginatedData.length === 0 ? (
              <div className="py-16 text-center text-[13px] text-muted-foreground italic">Không tìm thấy kết quả phù hợp</div>
            ) : (
              paginatedData.map((item, index) => (
                <div key={index} className="rounded-2xl border border-primary/15 bg-white shadow-sm p-4 transition-all duration-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex gap-3">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">#{index + 1}</p>
                        <h3 className="text-[14px] font-bold text-foreground leading-tight mt-0.5 font-mono">{item.ma_don}</h3>
                      </div>
                    </div>
                    <span className={clsx(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border',
                      item.trang_thai === 'HOAN_THANH' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-sky-50 text-sky-600 border-sky-100'
                    )}>
                      {item.trang_thai === 'HOAN_THANH' ? 'Hoàn thành' : 'Đã duyệt'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 rounded-xl bg-muted/10 border border-border/60 p-2.5">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Sản phẩm</p>
                      <p className="text-[12px] text-foreground font-medium">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-violet-50 text-violet-700 border-violet-200">
                          SL: {item.so_luong}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Doanh thu</p>
                      <p className="text-[12px] text-primary font-bold">
                        {formatCurrency(item.thanh_tien)} đ
                      </p>
                    </div>
                    <div className="col-span-2">
                      <div className="space-y-3 mt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <Users size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Khách hàng</p>
                            <p className="text-[12px] text-foreground font-bold truncate">
                              {item.ten_khach_hang}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                            <Warehouse size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Kho</p>
                            <p className="text-[12px] text-foreground font-bold truncate">
                              {item.kho}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/70">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={getCategoryBadgeClass(item.loai_khach_hang)}>{getLabel(CUSTOMER_CATEGORIES, item.loai_khach_hang)}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground italic font-medium">NVKD: {item.nhan_vien_kinh_doanh || '-'}</span>
                  </div>
                </div>
              ))
            )}
            {/* Sticky Mobile Pagination */}
            {!loading && (
              <MobilePagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                totalRecords={totalRecords}
              />
            )}
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block flex-1 overflow-x-auto bg-white">
            <table className="w-full border-collapse">
              <thead className="bg-[#F1F5FF]">
                <tr>
                  {columnOrder.filter(isColumnVisible).map(colId => (
                    <th 
                      key={colId}
                      className={clsx(
                        "px-4 py-3.5 text-[12px] font-bold text-muted-foreground uppercase tracking-wide",
                        (colId === 'so_luong' || colId === 'thanh_tien') ? "text-right" : 
                        (colId === 'trang_thai') ? "text-center" : "text-left"
                      )}
                    >
                      {columnDefs[colId].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {loading ? (
                  <tr><td colSpan={visibleColumns.length} className="px-4 py-16 text-center text-muted-foreground">Đang tải dữ liệu...</td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan={visibleColumns.length} className="px-4 py-16 text-center text-muted-foreground">Không có dữ liệu đơn hàng</td></tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr key={index} className={getRowStyle(item.loai_khach_hang)}>
                      {columnOrder.filter(isColumnVisible).map(colId => (
                        <td key={colId} className={clsx(
                          "px-4 py-4 text-[13px]",
                          (colId === 'so_luong' || colId === 'thanh_tien') ? "text-right font-bold" : 
                          (colId === 'trang_thai' || colId === 'loai_khach_hang') ? "text-center" : "text-left"
                        )}>
                          {colId === 'ma_don' && <span className="font-medium text-foreground">{item.ma_don}</span>}
                          {colId === 'loai_khach_hang' && <span className={getCategoryBadgeClass(item.loai_khach_hang)}>{getLabel(CUSTOMER_CATEGORIES, item.loai_khach_hang)}</span>}
                          {colId === 'kho' && <span className="text-muted-foreground">{item.kho}</span>}
                          {colId === 'ten_khach_hang' && <span className="font-medium text-foreground">{item.ten_khach_hang}</span>}
                          {colId === 'so_luong' && item.so_luong}
                          {colId === 'thanh_tien' && <span className="text-primary">{formatCurrency(item.thanh_tien)}</span>}
                          {colId === 'trang_thai' && (
                            <span className={clsx(
                              'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold',
                              item.trang_thai === 'HOAN_THANH' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                            )}>
                              {item.trang_thai === 'HOAN_THANH' ? 'Hoàn thành' : 'Đã duyệt'}
                            </span>
                          )}
                          {colId === 'nhan_vien_kinh_doanh' && <span className="text-muted-foreground">{item.nhan_vien_kinh_doanh || '-'}</span>}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Summary & Footer (Desktop only pagination layout) */}
          <div className="md:hidden flex flex-col px-4 py-3 border-t border-border bg-muted/5 gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground font-medium">
                Tổng <b>{totalRecords}</b> đơn hàng
              </span>
              <span className="text-[12px] text-primary font-bold">{formatCurrency(totalRevenue)} đ</span>
            </div>
          </div>
          
          <div className="hidden md:flex px-4 py-4 border-t border-border items-center justify-between bg-muted/5">
            <div className="flex items-center gap-3 text-[12px] text-muted-foreground font-medium">
              <span>{totalRecords > 0 ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, totalRecords)}` : '0'} / Tổng {totalRecords} đơn</span>
              <div className="flex items-center gap-1 ml-2">
                <span className="text-[11px] font-bold">│</span>
                <span className="text-primary font-bold">{formatCurrency(totalRevenue)} đ</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-violet-600 font-bold">{totalQuantity} SP</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(1)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" 
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} /><ChevronLeft size={16} className="-ml-2.5" />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" 
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-[12px] font-bold shadow-md shadow-primary/25">
                {currentPage}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalRecords / pageSize), prev + 1))}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" 
                disabled={currentPage >= Math.ceil(totalRecords / pageSize)}
              >
                <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(Math.ceil(totalRecords / pageSize))}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" 
                disabled={currentPage >= Math.ceil(totalRecords / pageSize)}
              >
                <ChevronRight size={16} /><ChevronRight size={16} className="-ml-2.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'stats' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col w-full">
          {/* Stats Header */}
          <div className="md:hidden flex items-center gap-2 p-3 border-b border-border">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl border border-border bg-white text-muted-foreground shrink-0 shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-foreground flex-1 text-center">Thống kê tháng</h2>
            <button
              onClick={openMobileFilter}
              className={clsx(
                'relative p-2 rounded-xl border shrink-0 transition-all shadow-sm',
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

          <div className="hidden md:block p-3 space-y-3 border-b border-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"
              >
                <ChevronLeft size={16} />
                Quay lại
              </button>
              {renderFilters(statsDropdownRef)}
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-start gap-4">
                  <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-blue-200/70">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Tổng đơn hàng</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{filteredData.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-emerald-200/70">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Doanh thu</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{formatCurrency(totalRevenue)}<small className="text-sm ml-0.5">đ</small></p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-start gap-4">
                  <div className="w-12 h-12 bg-amber-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-amber-200/70">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Tổng sản phẩm</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{totalQuantity}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-primary" />
                  Tỉ lệ Trạng thái đơn
                </h3>
                <div style={{ height: '300px' }} className="flex items-center justify-center">
                  <PieChartJS
                    data={{
                      labels: getStatusStats().map(i => i.name),
                      datasets: [{
                        data: getStatusStats().map(i => i.value),
                        backgroundColor: ['#10B981', '#2563EB'],
                        borderColor: '#fff',
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold' } } }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-600" />
                  Phân bổ theo Loại khách
                </h3>
                <div style={{ height: '300px' }} className="flex items-center justify-center">
                  <PieChartJS
                    data={{
                      labels: getCategoryStats().map(i => i.name),
                      datasets: [{
                        data: getCategoryStats().map(i => i.value),
                        backgroundColor: chartColors,
                        borderColor: '#fff',
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold' } } }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white border border-border rounded-2xl p-6 lg:col-span-2 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-amber-600" />
                  Doanh thu theo Kho
                </h3>
                <div style={{ height: '350px' }}>
                  <BarChartJS
                    data={{
                      labels: getRevenueByWarehouse().map(i => i.name),
                      datasets: [{
                        label: 'Doanh thu (VNĐ)',
                        data: getRevenueByWarehouse().map(i => i.value),
                        backgroundColor: 'rgba(37, 99, 235, 0.8)',
                        borderRadius: 8,
                        hoverBackgroundColor: '#2563EB'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: { beginAtZero: true, grid: { display: true, color: 'rgba(0,0,0,0.05)' } },
                        x: { grid: { display: false } }
                      }
                    }}
                  />
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
        sections={mobileFilterSections}
        hasActiveFilters={hasActiveFilters}
        totalActiveFilters={totalActiveFilters}
      />
    </div>
  );
};

export default OrdersMonthlyReport;
