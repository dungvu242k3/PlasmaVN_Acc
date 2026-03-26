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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  List,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  TrendingUp,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  Calendar,
  Hash
} from 'lucide-react';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Bar as BarChartJS, Pie as PieChartJS } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useReports } from '../hooks/useReports';
import { exportCylinderErrorReport } from '../utils/exportExcel';
import FilterDropdown from '../components/ui/FilterDropdown';
import MobileFilterSheet from '../components/ui/MobileFilterSheet';
import ColumnPicker from '../components/ui/ColumnPicker';

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

const COLUMN_DEFS = {
  ma_binh: { label: 'Mã bình' },
  ly_do_loi: { label: 'Lý do lỗi' },
  khach_hang: { label: 'Khách hàng' },
  ngay_phat_hien_loi: { label: 'Ngày phát hiện' },
  so_ngay_chua_sua: { label: 'Ngày chưa sửa' },
  ngay_sua_xong: { label: 'Ngày sửa xong' }
};

const defaultColOrder = Object.keys(COLUMN_DEFS);

const CylinderErrorReport = () => {
  const navigate = useNavigate();
  const { fetchCylinderErrors, fetchFilterOptions, loading } = useReports();
  const [activeView, setActiveView] = useState('list');
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [dateRange, setDateRange] = useState({ start_date: '', end_date: '' });

  const [filterOptions, setFilterOptions] = useState({
    warehouses: []
  });

  // Column visibility & Order
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('columns_cylinder_error_report') || 'null');
      if (Array.isArray(saved) && saved.length > 0) return saved.filter(k => defaultColOrder.includes(k));
    } catch { }
    return defaultColOrder;
  });
  const [columnOrder, setColumnOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('columns_cylinder_error_report_order') || 'null');
      if (Array.isArray(saved) && saved.length > 0) return saved.filter(k => defaultColOrder.includes(k));
    } catch { }
    return defaultColOrder;
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const columnPickerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('columns_cylinder_error_report', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem('columns_cylinder_error_report_order', JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (columnPickerRef.current && !columnPickerRef.current.contains(event.target)) {
        setShowColumnPicker(false);
      }
    };
    if (showColumnPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnPicker]);

  const isColumnVisible = (key) => visibleColumns.includes(key);
  const visibleTableColumns = columnOrder
    .filter(key => visibleColumns.includes(key))
    .map(key => ({ key, ...COLUMN_DEFS[key] }));

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterSearch, setFilterSearch] = useState('');
  const listDropdownRef = useRef(null);
  const statsDropdownRef = useRef(null);

  // Mobile filter sheet state
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [mobileFilterClosing, setMobileFilterClosing] = useState(false);
  const [pendingWarehouses, setPendingWarehouses] = useState([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedWarehouses, dateRange]);

  const loadData = async () => {
    const filters = {
      warehouse_id: selectedWarehouses.length > 0 ? selectedWarehouses[0] : '',
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    };
    const result = await fetchCylinderErrors(filters);
    setData(result || []);
  };

  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({
      warehouses: options.warehouses || []
    });
  };

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

  const handleExport = () => exportCylinderErrorReport(data);

  const filteredData = data.filter(item =>
    item.ma_binh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.khach_hang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ly_do_loi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getStatusBadgeClass = (item) => {
    if (item.ngay_sua_xong) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (item.so_ngay_chua_sua > 7) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const getFilterButtonClass = (filterKey, isActive) => {
    if (!isActive) return 'border-border bg-white text-muted-foreground hover:text-foreground';
    return 'border-primary/20 bg-primary/5 text-primary';
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length && filteredData.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((_, index) => index));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Mobile filter handlers
  const openMobileFilter = () => { setPendingWarehouses(selectedWarehouses); setShowMobileFilter(true); };
  const applyMobileFilter = () => { setSelectedWarehouses(pendingWarehouses); closeMobileFilter(); };
  const closeMobileFilter = () => { setMobileFilterClosing(true); setTimeout(() => { setShowMobileFilter(false); setMobileFilterClosing(false); }, 280); };

  // Stats calculations
  const statsSummary = {
    total: filteredData.length,
    repaired: filteredData.filter(i => i.ngay_sua_xong).length,
    pending: filteredData.filter(i => !i.ngay_sua_xong).length,
    critical: filteredData.filter(i => !i.ngay_sua_xong && i.so_ngay_chua_sua > 7).length,
    averageAging: filteredData.length > 0 
      ? Math.round(filteredData.reduce((sum, i) => sum + (i.so_ngay_chua_sua || 0), 0) / filteredData.length)
      : 0
  };

  const getReasonStats = () => {
    const stats = {};
    filteredData.forEach(item => {
      const reason = item.ly_do_loi || 'Khác';
      stats[reason] = (stats[reason] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };

  const getAgingStats = () => {
    const groups = {
      'Dưới 3 ngày': 0,
      '3-7 ngày': 0,
      'Trên 7 ngày': 0
    };
    filteredData.filter(i => !i.ngay_sua_xong).forEach(item => {
      if (item.so_ngay_chua_sua <= 3) groups['Dưới 3 ngày']++;
      else if (item.so_ngay_chua_sua <= 7) groups['3-7 ngày']++;
      else groups['Trên 7 ngày']++;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  };

  const chartColors = [
    '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
  ];

  const warehouseOptions = useMemo(() => filterOptions.warehouses.map(w => ({ 
    id: w.id, 
    label: w.name, 
    count: data.filter(d => d.warehouse_id === w.id).length 
  })), [filterOptions.warehouses, data]);
  
  const hasActiveFilters = selectedWarehouses.length > 0 || dateRange.start_date || dateRange.end_date;
  const totalActiveFilters = selectedWarehouses.length + (dateRange.start_date ? 1 : 0) + (dateRange.end_date ? 1 : 0);

  const filterSections = useMemo(() => [
    { id: 'warehouses', label: 'Kho quản lý', icon: <MapPin size={16} />, options: warehouseOptions, selectedValues: pendingWarehouses, onSelectionChange: setPendingWarehouses }
  ], [warehouseOptions, pendingWarehouses]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex-1 flex flex-col mt-1 min-h-0 px-1 md:px-1.5 font-sans">
      {/* Top Tabs */}
      <div className="flex items-center gap-1 mb-3 mt-1">
        <button 
          onClick={() => setActiveView('list')} 
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all", 
            activeView === 'list' ? "bg-white text-primary shadow-sm ring-1 ring-primary/20" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <List size={14} /> Danh sách
        </button>
        <button 
          onClick={() => setActiveView('stats')} 
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all", 
            activeView === 'stats' ? "bg-white text-primary shadow-sm ring-1 ring-primary/20" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart2 size={14} /> Thống kê
        </button>
      </div>

      {activeView === 'list' && (
        <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col flex-1 min-h-0 w-full overflow-hidden">
          {/* MOBILE TOOLBAR */}
          <div className="md:hidden flex items-center gap-2 p-3 border-b border-border bg-white">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-border bg-white text-muted-foreground shrink-0"><ChevronLeft size={18} /></button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <input 
                type="text" 
                placeholder="Tìm mã bình, KH..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-9 pr-8 py-2 bg-muted/20 border border-border rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" 
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={14} /></button>}
            </div>
            <button onClick={openMobileFilter} className={clsx('relative p-2 rounded-lg border shrink-0 transition-all', hasActiveFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground')}><Filter size={18} />{hasActiveFilters && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">{totalActiveFilters}</span>}</button>
            <button onClick={handleExport} className="p-2 rounded-lg bg-emerald-600 text-white shrink-0"><Download size={18} /></button>
          </div>

          {/* DESKTOP TOOLBAR */}
          <div className="hidden md:block p-3 space-y-3 bg-white border-b border-border">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"><ChevronLeft size={16} /> Quay lại</button>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    type="text" 
                    placeholder="Tìm mã bình, khách hàng, lý do..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-10 pr-8 py-1.5 bg-muted/20 border border-border rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium" 
                  />
                  {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={14} /></button>}
                </div>
              </div>
              <div className="flex items-center gap-2" ref={columnPickerRef}>
                <div className="relative">
                  <button
                    onClick={() => setShowColumnPicker(!showColumnPicker)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[13px] font-bold transition-all",
                      showColumnPicker ? "bg-primary/5 border-primary text-primary" : "bg-white border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <SlidersHorizontal size={14} />
                    <span>Cột ({visibleColumns.length}/{defaultColOrder.length})</span>
                  </button>
                  {showColumnPicker && (
                    <ColumnPicker
                      columnOrder={columnOrder}
                      setColumnOrder={setColumnOrder}
                      visibleColumns={visibleColumns}
                      setVisibleColumns={setVisibleColumns}
                      defaultColOrder={defaultColOrder}
                      columnDefs={COLUMN_DEFS}
                    />
                  )}
                </div>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 transition-all"><Download size={16} /> Xuất Excel</button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3" ref={listDropdownRef}>
              <div className="relative">
                <button onClick={() => { setActiveDropdown(activeDropdown === 'warehouses' ? null : 'warehouses'); setFilterSearch(''); }} className={clsx("flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-[13px] font-bold transition-all", getFilterButtonClass('warehouses', selectedWarehouses.length > 0))}>
                  <MapPin size={14} className="text-primary" /> {selectedWarehouses.length > 0 ? `Kho (${selectedWarehouses.length})` : 'Tất cả kho'} <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'warehouses' ? "rotate-180" : "")} />
                </button>
                {activeDropdown === 'warehouses' && <FilterDropdown options={warehouseOptions} selected={selectedWarehouses} setSelected={setSelectedWarehouses} filterSearch={filterSearch} setFilterSearch={setFilterSearch} />}
              </div>
              <div className="flex items-center gap-2 bg-muted/20 border border-border rounded-lg px-2 py-1">
                <Calendar size={14} className="text-primary" />
                <input 
                  type="date" 
                  value={dateRange.start_date} 
                  onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))} 
                  className="bg-transparent text-[12px] focus:outline-none" 
                />
                <span className="text-muted-foreground">-</span>
                <input 
                  type="date" 
                  value={dateRange.end_date} 
                  onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))} 
                  className="bg-transparent text-[12px] focus:outline-none" 
                />
              </div>
              {hasActiveFilters && (
                <button 
                  onClick={() => { setSelectedWarehouses([]); setDateRange({ start_date: '', end_date: '' }); }} 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-red-500 text-[12px] font-bold hover:bg-red-50 transition-all"
                >
                  <X size={14} /> Xóa lọc
                </button>
              )}
              <div className="ml-auto text-xs text-muted-foreground font-medium">Tổng: <span className="text-foreground font-bold">{filteredData.length}</span> bình lỗi</div>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block flex-1 overflow-x-auto bg-white">
            <table className="w-full border-collapse">
              <thead className="bg-[#F1F5FF] border-b border-primary/10">
                <tr>
                  <th className="px-4 py-3.5 w-10 sticky left-0 bg-[#F1F5FF] z-10"><div className="flex items-center justify-center"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" checked={selectedIds.length === filteredData.length && filteredData.length > 0} onChange={toggleSelectAll} /></div></th>
                  {visibleTableColumns.map(col => (
                    <th key={col.key} className={clsx("px-4 py-3.5 text-[12px] font-extrabold text-muted-foreground uppercase tracking-wider text-left")}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={visibleTableColumns.length + 1} className="px-4 py-20"><div className="flex flex-col items-center justify-center text-muted-foreground animate-pulse font-medium"><Clock className="w-8 h-8 mb-2 animate-spin text-primary/40" /> Đang tải dữ liệu báo cáo...</div></td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan={visibleTableColumns.length + 1} className="px-4 py-20"><div className="flex flex-col items-center justify-center text-muted-foreground italic gap-2"><History size={40} className="opacity-20" /> Không tìm thấy bình lỗi nào</div></td></tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={index} className={clsx("group transition-colors hover:bg-slate-50", selectedIds.includes(index) && "bg-primary/5")}>
                      <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50 z-10"><div className="flex items-center justify-center"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" checked={selectedIds.includes(index)} onChange={() => toggleSelect(index)} /></div></td>
                      {columnOrder.filter(isColumnVisible).map(colKey => {
                        if (colKey === 'ma_binh') return <td key={colKey} className="px-4 py-3"><span className="text-[13px] font-bold text-primary">{item.ma_binh}</span></td>;
                        if (colKey === 'ly_do_loi') return <td key={colKey} className="px-4 py-3"><span className="text-[13px] text-foreground inline-block max-w-[200px] truncate">{item.ly_do_loi || '-'}</span></td>;
                        if (colKey === 'khach_hang') return <td key={colKey} className="px-4 py-3"><span className="text-[13px] text-muted-foreground font-medium">{item.khach_hang || '-'}</span></td>;
                        if (colKey === 'ngay_phat_hien_loi') return <td key={colKey} className="px-4 py-3"><span className="text-[13px] text-muted-foreground">{item.ngay_phat_hien_loi}</span></td>;
                        if (colKey === 'so_ngay_chua_sua') return (
                          <td key={colKey} className="px-4 py-3">
                            <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border", getStatusBadgeClass(item))}>
                              {item.so_ngay_chua_sua} ngày
                            </span>
                          </td>
                        );
                        if (colKey === 'ngay_sua_xong') return <td key={colKey} className="px-4 py-3"><span className={clsx("text-[13px] font-medium", item.ngay_sua_xong ? "text-emerald-600" : "text-muted-foreground/40")}>{item.ngay_sua_xong || 'Chưa sửa'}</span></td>;
                        return null;
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST */}
          <div className="md:hidden flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-muted/5">
            {loading ? (
              <div className="py-20 text-center italic text-muted-foreground animate-pulse">Đang tải dữ liệu...</div>
            ) : filteredData.length === 0 ? (
              <div className="py-20 text-center italic text-muted-foreground flex flex-col items-center gap-2">
                <AlertTriangle size={32} className="text-amber-500 opacity-50" />
                <span>Không có dữ liệu phù hợp</span>
              </div>
            ) : (
              filteredData.map((item, index) => (
                <div key={index} className="bg-white border border-border rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className={clsx("absolute top-0 left-0 w-1.5 h-full", item.ngay_sua_xong ? "bg-emerald-500" : item.so_ngay_chua_sua > 7 ? "bg-red-500" : "bg-amber-500")}></div>
                  <div className="flex justify-between items-start mb-2 ml-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" checked={selectedIds.includes(index)} onChange={() => toggleSelect(index)} />
                      <span className="text-[14px] font-bold text-primary flex items-center gap-1"><Hash size={14} />{item.ma_binh}</span>
                    </div>
                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border", getStatusBadgeClass(item))}>
                      {item.so_ngay_chua_sua} ngày
                    </span>
                  </div>
                  <div className="ml-2 space-y-2">
                    <p className="text-[13px] font-bold text-foreground line-clamp-2">{item.ly_do_loi || 'Không có lý do'}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[12px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium italic">{item.khach_hang || 'Vô danh'}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} />{item.ngay_phat_hien_loi}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/5">
            <span className="text-[12px] text-muted-foreground font-medium">Hiển thị {filteredData.length} kết quả</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-muted-foreground opacity-30 cursor-not-allowed" disabled><ChevronLeft size={16} /></button>
              <div className="px-2.5 py-1 rounded-lg bg-primary text-white text-[12px] font-bold shadow-sm">1</div>
              <button className="p-1.5 rounded-lg text-muted-foreground opacity-30 cursor-not-allowed" disabled><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'stats' && (
        <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col w-full overflow-hidden">
          {/* Stats Toolbar */}
          <div className="p-4 border-b border-border bg-white" ref={statsDropdownRef}>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"><ChevronLeft size={16} /> Quay lại</button>
              <div className="relative">
                <button onClick={() => { setActiveDropdown(activeDropdown === 'warehouses_stats' ? null : 'warehouses_stats'); setFilterSearch(''); }} className={clsx("flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-[13px] font-bold transition-all", getFilterButtonClass('warehouses', selectedWarehouses.length > 0))}>
                  <MapPin size={14} className="text-primary" /> {selectedWarehouses.length > 0 ? `Kho (${selectedWarehouses.length})` : 'Tất cả kho'} <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'warehouses_stats' ? "rotate-180" : "")} />
                </button>
                {activeDropdown === 'warehouses_stats' && <FilterDropdown options={warehouseOptions} selected={selectedWarehouses} setSelected={setSelectedWarehouses} filterSearch={filterSearch} setFilterSearch={setFilterSearch} />}
              </div>
              <div className="flex items-center gap-2 bg-muted/20 border border-border rounded-lg px-2 py-1">
                <Calendar size={14} className="text-primary" />
                <input type="date" value={dateRange.start_date} onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))} className="bg-transparent text-[12px] focus:outline-none" />
                <span className="text-muted-foreground">-</span>
                <input type="date" value={dateRange.end_date} onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))} className="bg-transparent text-[12px] focus:outline-none" />
              </div>
              {hasActiveFilters && <button onClick={() => { setSelectedWarehouses([]); setDateRange({ start_date: '', end_date: '' }); }} className="flex items-center gap-1.5 text-red-500 text-[12px] font-bold hover:bg-red-50 px-2 py-1 rounded-md"><X size={14} /> Xóa bộ lọc</button>}
            </div>
          </div>

          <div className="w-full p-4 md:p-6 space-y-6 overflow-y-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start text-center md:text-left gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-blue-200/70">
                    <Hash className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Tổng Bình Lỗi</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mt-0.5 md:mt-1 leading-none">{formatNumber(statsSummary.total)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start text-center md:text-left gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-emerald-200/70">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Đã Sửa Xong</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mt-0.5 md:mt-1 leading-none">{formatNumber(statsSummary.repaired)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start text-center md:text-left gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-red-200/70">
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[11px] font-semibold text-red-600 uppercase tracking-wider">Nghiêm Trọng</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mt-0.5 md:mt-1 leading-none">{formatNumber(statsSummary.critical)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start text-center md:text-left gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-orange-200/70">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[11px] font-semibold text-orange-600 uppercase tracking-wider">Aging TB</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mt-0.5 md:mt-1 leading-none">{statsSummary.averageAging} <span className="text-xs">ngày</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">Phân bổ theo Lý do lỗi</h3>
                <div style={{ height: '300px' }}>
                  <PieChartJS
                    data={{
                      labels: getReasonStats().slice(0, 5).map(item => item.name),
                      datasets: [{
                        data: getReasonStats().slice(0, 5).map(item => item.value),
                        backgroundColor: chartColors.slice(0, 5),
                        borderColor: '#fff',
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
                    }}
                  />
                </div>
              </div>
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">Tình trạng sửa chữa</h3>
                <div style={{ height: '300px' }}>
                  <PieChartJS
                    data={{
                      labels: getAgingStats().map(item => item.name),
                      datasets: [{
                        data: getAgingStats().map(item => item.value),
                        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                        borderColor: '#fff',
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl p-6 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-foreground mb-4">Thống kê lý do lỗi chi tiết</h3>
                <div style={{ height: '350px' }}>
                  <BarChartJS
                    data={{
                      labels: getReasonStats().slice(0, 10).map(item => item.name),
                      datasets: [{
                        label: 'Số lượng bình',
                        data: getReasonStats().slice(0, 10).map(item => item.value),
                        backgroundColor: 'rgba(37, 99, 235, 0.8)',
                        borderRadius: 8,
                        barThickness: 30
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { display: true, color: 'rgba(0,0,0,0.05)' }, border: { display: false } },
                        x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11, weight: 'bold' } } }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <MobileFilterSheet 
        isOpen={showMobileFilter} 
        isClosing={mobileFilterClosing} 
        onClose={closeMobileFilter} 
        onApply={applyMobileFilter} 
        title="Lọc báo cáo bình lỗi" 
        sections={filterSections} 
        hasActiveFilters={hasActiveFilters} 
        totalActiveFilters={totalActiveFilters} 
      />
    </div>
  );
};

export default CylinderErrorReport;
