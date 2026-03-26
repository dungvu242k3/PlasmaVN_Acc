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
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  List,
  MapPin,
  Monitor,
  Search,
  SlidersHorizontal,
  Wrench,
  X,
  Hash,
  ArrowUpRight,
  TrendingUp,
  Box
} from 'lucide-react';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Bar as BarChartJS, Pie as PieChartJS } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useReports } from '../hooks/useReports';
import { exportMachineStatsReport } from '../utils/exportExcel';
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
  serial_may: { label: 'Serial máy' },
  loai_may: { label: 'Loại máy' },
  trang_thai: { label: 'Trạng thái' },
  khach_hang: { label: 'Khách hàng' },
  khoa_phu_trach: { label: 'Khoa/Phòng' },
  kho: { label: 'Kho' },
  ngay_bao_tri_gan_nhat: { label: 'Ngày bảo trì' },
  loai_bao_tri: { label: 'Loại bảo trì' },
  ngay_bao_tri_tiep: { label: 'Hẹn bảo trì' },
  nhan_vien_kinh_doanh: { label: 'NVKD' }
};

const defaultColOrder = ['serial_may', 'loai_may', 'trang_thai', 'khach_hang', 'kho', 'ngay_bao_tri_gan_nhat'];

const QuarterlyReport = () => {
  const navigate = useNavigate();
  const { fetchMachineStats, fetchFilterOptions, loading } = useReports();
  const [activeView, setActiveView] = useState('list');
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    quarter: Math.ceil((new Date().getMonth() + 1) / 3).toString(),
    year: new Date().getFullYear().toString(),
    warehouse: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    warehouses: [],
    years: [new Date().getFullYear()],
    machineTypes: []
  });

  // Column visibility & Order
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('columns_quarterly_report') || 'null');
      if (Array.isArray(saved) && saved.length > 0) return saved.filter(k => COLUMN_DEFS[k]);
    } catch { }
    return defaultColOrder;
  });
  const [columnOrder, setColumnOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('columns_quarterly_report_order') || 'null');
      if (Array.isArray(saved) && saved.length > 0) return saved.filter(k => COLUMN_DEFS[k]);
    } catch { }
    return Object.keys(COLUMN_DEFS);
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const columnPickerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('columns_quarterly_report', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem('columns_quarterly_report_order', JSON.stringify(columnOrder));
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

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterSearch, setFilterSearch] = useState('');
  const listDropdownRef = useRef(null);
  const statsDropdownRef = useRef(null);

  // Mobile filter sheet state
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [mobileFilterClosing, setMobileFilterClosing] = useState(false);
  const [pendingWarehouse, setPendingWarehouse] = useState('');

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    const result = await fetchMachineStats(filters);
    setData(result || []);
  };

  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({
      warehouses: options.warehouses || [],
      years: options.years || [new Date().getFullYear()],
      machineTypes: options.machineTypes || []
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

  const handleExport = () => exportMachineStatsReport(data);

  const filteredData = data.filter(item =>
    item.serial_may?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.loai_may?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.khach_hang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kho?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  const openMobileFilter = () => { setPendingWarehouse(filters.warehouse); setShowMobileFilter(true); };
  const applyMobileFilter = () => { setFilters(prev => ({ ...prev, warehouse: pendingWarehouse })); closeMobileFilter(); };
  const closeMobileFilter = () => { setMobileFilterClosing(true); setTimeout(() => { setShowMobileFilter(false); setMobileFilterClosing(false); }, 280); };

  const getQuarterDateRange = (quarter, year) => {
    const ranges = {
      '1': { start: `01/01/${year}`, end: `31/03/${year}` },
      '2': { start: `01/04/${year}`, end: `30/06/${year}` },
      '3': { start: `01/07/${year}`, end: `30/09/${year}` },
      '4': { start: `01/10/${year}`, end: `31/12/${year}` }
    };
    return ranges[quarter] || {};
  };
  const dateRange = getQuarterDateRange(filters.quarter, filters.year);

  // Stats calculations
  const maintenanceData = data.filter(item => item.ngay_bao_tri_gan_nhat);
  const upcomingMaintenance = data.filter(item => item.ngay_bao_tri_tiep);
  const activeMachines = data.filter(d => d.is_ban || d.is_ton_kho);

  const stats_summary = {
    total: data.length,
    maintained: maintenanceData.length,
    upcoming: upcomingMaintenance.length,
    active: activeMachines.length
  };

  const getChartStats = (key) => {
    const stats = {};
    filteredData.forEach(item => {
      const val = item[key] || 'Không xác định';
      stats[val] = (stats[val] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const chartColors = [
    '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
  ];

  const warehouseOptions = useMemo(() => filterOptions.warehouses.map(w => ({ id: w.name, label: w.name, count: data.filter(d => d.kho === w.name).length })), [filterOptions.warehouses, data]);

  const filterSections = useMemo(() => [
    {
      id: 'quarter',
      label: 'Chọn Quý',
      icon: <Calendar size={16} />,
      options: [
        { id: '1', label: 'Quý 1' },
        { id: '2', label: 'Quý 2' },
        { id: '3', label: 'Quý 3' },
        { id: '4', label: 'Quý 4' }
      ],
      selectedValues: [filters.quarter],
      onSelectionChange: (val) => setFilters(prev => ({ ...prev, quarter: val[0] }))
    },
    {
      id: 'year',
      label: 'Chọn Năm',
      icon: <Calendar size={16} />,
      options: filterOptions.years.map(y => ({ id: y.toString(), label: y.toString() })),
      selectedValues: [filters.year],
      onSelectionChange: (val) => setFilters(prev => ({ ...prev, year: val[0] }))
    },
    {
      id: 'warehouses',
      label: 'Kho quản lý',
      icon: <MapPin size={16} />,
      options: warehouseOptions,
      selectedValues: pendingWarehouse ? [pendingWarehouse] : [],
      onSelectionChange: (val) => setPendingWarehouse(val[0] || '')
    }
  ], [filters, filterOptions.years, warehouseOptions, pendingWarehouse]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex-1 flex flex-col mt-1 min-h-0 px-1 md:px-1.5">
      {/* Top Tabs */}
      <div className="flex items-center gap-1 mb-3 mt-1">
        <button onClick={() => setActiveView('list')} className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all", activeView === 'list' ? "bg-white text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground")}>
          <List size={14} /> Danh sách
        </button>
        <button onClick={() => setActiveView('stats')} className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all", activeView === 'stats' ? "bg-white text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground")}>
          <BarChart2 size={14} /> Thống kê
        </button>
      </div>

      {activeView === 'list' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col flex-1 min-h-0 w-full">
          {/* MOBILE TOOLBAR */}
          <div className="md:hidden flex items-center gap-2 p-3 border-b border-border">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-border bg-white text-muted-foreground shrink-0"><ChevronLeft size={18} /></button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <input type="text" placeholder="Tìm máy/khách hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-8 py-2 bg-muted/20 border border-border/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium" />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={14} /></button>}
            </div>
            <button onClick={openMobileFilter} className={clsx('relative p-2 rounded-xl border shrink-0 transition-all', filters.warehouse ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground')}><Filter size={18} />{filters.warehouse && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">1</span>}</button>
            <button onClick={handleExport} className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-md shadow-emerald-600/20"><Download size={18} /></button>
          </div>

          {/* DESKTOP TOOLBAR */}
          <div className="hidden md:block p-3 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"><ChevronLeft size={16} /> Quay lại</button>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="text" placeholder="Tìm máy/khách hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-8 py-1.5 bg-muted/20 border border-border/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium" />
                  {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={14} /></button>}
                </div>
              </div>
              <div className="flex items-center gap-2" ref={columnPickerRef}>
                <div className="relative">
                  <button
                    onClick={() => setShowColumnPicker(!showColumnPicker)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[13px] font-light transition-all",
                      showColumnPicker ? "bg-primary/5 border-primary text-primary" : "bg-white border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <SlidersHorizontal size={14} />
                    <span>Cột ({visibleColumns.length}/{Object.keys(COLUMN_DEFS).length})</span>
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
                <button onClick={handleExport} className="flex items-center gap-2 px-6 py-1.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"><Download size={16} /> Xuất Excel</button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2" ref={listDropdownRef}>
              {/* Quarter Select */}
              <div className="relative">
                <select 
                  value={filters.quarter} 
                  onChange={(e) => setFilters(prev => ({ ...prev, quarter: e.target.value }))}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border bg-white text-[13px] font-bold hover:border-primary/50 outline-none transition-all"
                >
                  <option value="1">Quý 1</option>
                  <option value="2">Quý 2</option>
                  <option value="3">Quý 3</option>
                  <option value="4">Quý 4</option>
                </select>
              </div>
              {/* Year Select */}
              <div className="relative">
                <select 
                  value={filters.year} 
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border bg-white text-[13px] font-bold hover:border-primary/50 outline-none transition-all"
                >
                  {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {/* Warehouse Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setActiveDropdown(activeDropdown === 'warehouses' ? null : 'warehouses'); setFilterSearch(''); }} 
                  className={clsx("flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all", filters.warehouse ? "border-blue-200 bg-blue-50 text-blue-700" : "border-border bg-white text-muted-foreground hover:text-foreground")}
                >
                  <MapPin size={14} className={filters.warehouse ? 'text-blue-700' : 'text-blue-500'} /> Kho {filters.warehouse && <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">1</span>} <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'warehouses' ? "rotate-180" : "")} />
                </button>
                {activeDropdown === 'warehouses' && (
                  <FilterDropdown 
                    options={warehouseOptions} 
                    selected={filters.warehouse ? [filters.warehouse] : []} 
                    setSelected={(val) => setFilters(prev => ({ ...prev, warehouse: val[0] || '' }))} 
                    filterSearch={filterSearch} 
                    setFilterSearch={setFilterSearch} 
                    singleSelect={true}
                  />
                )}
              </div>
              {/* Date range display */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/10 rounded-xl border border-border/60 ml-auto">
                <Calendar size={14} className="text-primary" />
                <span className="text-[12px] font-medium text-muted-foreground">{dateRange.start} - {dateRange.end}</span>
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block flex-1 overflow-x-auto bg-white">
            <table className="w-full border-collapse">
              <thead className="bg-[#F1F5FF]">
                <tr>
                  <th className="px-4 py-3.5 w-10 sticky left-0 bg-[#F1F5FF] z-10"><div className="flex items-center justify-center"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" checked={selectedIds.length === filteredData.length && filteredData.length > 0} onChange={toggleSelectAll} /></div></th>
                  {visibleTableColumns.map(col => (
                    <th key={col.key} className="px-4 py-3.5 text-[12px] font-bold text-muted-foreground uppercase tracking-wide text-left">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {loading ? (<tr><td colSpan={visibleColumns.length + 1} className="px-4 py-16 text-center text-muted-foreground italic">Đang tải dữ liệu...</td></tr>) : filteredData.length === 0 ? (<tr><td colSpan={visibleColumns.length + 1} className="px-4 py-16 text-center text-muted-foreground italic">Không tìm thấy dữ liệu</td></tr>) : (
                  filteredData.map((item, index) => (
                    <tr key={index} className={clsx("group transition-all hover:bg-blue-50/40", selectedIds.includes(index) && "bg-blue-50/60")}>
                      <td className="px-4 py-4 sticky left-0 bg-white group-hover:bg-blue-50/40 z-10"><div className="flex items-center justify-center"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" checked={selectedIds.includes(index)} onChange={() => toggleSelect(index)} /></div></td>
                      {columnOrder.filter(isColumnVisible).map(colKey => {
                        const val = item[colKey] || '-';
                        if (colKey === 'serial_may') return <td key={colKey} className="px-4 py-4"><span className="text-[13px] font-bold text-primary">{val}</span></td>;
                        if (colKey === 'trang_thai') return (
                          <td key={colKey} className="px-4 py-4">
                            <span className={clsx(
                              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium",
                              val.includes('Hoạt động') ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                            )}>
                              {val}
                            </span>
                          </td>
                        );
                        return <td key={colKey} className="px-4 py-4"><span className="text-[13px] text-foreground font-medium">{val}</span></td>;
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST */}
          <div className="md:hidden flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-muted/5">
            {loading ? (<div className="py-16 text-center italic text-muted-foreground">Đang tải...</div>) : filteredData.length === 0 ? (<div className="py-16 text-center italic text-muted-foreground">Không tìm thấy dữ liệu</div>) : (
              filteredData.map((item, index) => (
                <div key={index} className="bg-white border border-primary/10 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-[13px] font-bold text-primary">{item.serial_may}</span>
                    </div>
                    <span className={clsx(
                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium transition-all shadow-sm",
                      item.trang_thai?.includes('Hoạt động') ? "bg-emerald-100/50 text-emerald-700" : "bg-blue-100/50 text-blue-700"
                    )}>
                      {item.trang_thai}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-bold text-foreground mb-1">{item.loai_may}</h3>
                  <p className="text-[12px] text-muted-foreground mb-3">{item.khach_hang || 'Tồn kho'}</p>
                  
                  <div className="grid grid-cols-2 gap-2 bg-muted/10 rounded-xl p-2.5 border border-border/60">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">Kho</p>
                      <p className="text-[12px] font-bold text-foreground truncate">{item.kho || '-'}</p>
                    </div>
                    <div className="border-l border-border/60 pl-2">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">Bảo trì</p>
                      <p className="text-[12px] font-bold text-foreground">{item.ngay_bao_tri_gan_nhat || '-'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/5">
            <span className="text-[12px] text-muted-foreground font-medium">Tổng {filteredData.length} máy</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-muted-foreground opacity-20" disabled><ChevronLeft size={16} /></button>
              <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center text-[11px] font-bold shadow-md shadow-primary/20">1</div>
              <button className="p-1.5 rounded-lg text-muted-foreground opacity-20" disabled><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'stats' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col w-full">
          {/* Header */}
          <div className="md:hidden flex items-center gap-2 p-3 border-b border-border">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-border bg-white text-muted-foreground shrink-0"><ChevronLeft size={18} /></button>
            <h2 className="text-base font-bold text-foreground flex-1 text-center">Thống kê quý {filters.quarter}</h2>
          </div>

          <div className="hidden md:block p-4 border-b border-border" ref={statsDropdownRef}>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"><ChevronLeft size={16} /> Quay lại</button>
              <div className="text-[14px] font-bold">Thống kê Quý {filters.quarter} năm {filters.year}</div>
              <div className="text-[12px] text-muted-foreground">({dateRange.start} - {dateRange.end})</div>
            </div>
          </div>

          <div className="w-full p-4 md:p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 text-center md:text-left">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 ring-1 ring-blue-200/50">
                    <Monitor className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Tổng Máy</p>
                    <p className="text-2xl font-bold text-foreground leading-none mt-1">{stats_summary.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 text-center md:text-left">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 ring-1 ring-emerald-200/50">
                    <Wrench className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Đã bảo trì</p>
                    <p className="text-2xl font-bold text-foreground leading-none mt-1">{stats_summary.maintained}</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 text-center md:text-left">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0 ring-1 ring-orange-200/50">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider">Sắp bảo trì</p>
                    <p className="text-2xl font-bold text-foreground leading-none mt-1">{stats_summary.upcoming}</p>
                  </div>
                </div>
              </div>
              <div className="bg-violet-50/70 border border-violet-100 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 text-center md:text-left">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center shrink-0 ring-1 ring-violet-200/50">
                    <Box className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider">Vận hành</p>
                    <p className="text-2xl font-bold text-foreground leading-none mt-1">{stats_summary.active}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <h3 className="text-[15px] font-bold text-foreground mb-4">Loại máy</h3>
                <div style={{ height: '280px' }}>
                  <PieChartJS
                    data={{
                      labels: getChartStats('loai_may').map(item => item.name),
                      datasets: [{
                        data: getChartStats('loai_may').map(item => item.value),
                        backgroundColor: chartColors,
                        borderWidth: 2,
                        borderColor: '#fff'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
                    }}
                  />
                </div>
              </div>
              <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <h3 className="text-[15px] font-bold text-foreground mb-4">Trạng thái vận hành</h3>
                <div style={{ height: '280px' }}>
                  <PieChartJS
                    data={{
                      labels: getChartStats('trang_thai').map(item => item.name),
                      datasets: [{
                        data: getChartStats('trang_thai').map(item => item.value),
                        backgroundColor: chartColors.slice().reverse(),
                        borderWidth: 2,
                        borderColor: '#fff'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl p-5 shadow-sm lg:col-span-2">
                <h3 className="text-[15px] font-bold text-foreground mb-4">Loại hình bảo trì</h3>
                <div style={{ height: '320px' }}>
                  <BarChartJS
                    data={{
                      labels: getChartStats('loai_bao_tri').map(item => item.name),
                      datasets: [{
                        label: 'Số lượng',
                        data: getChartStats('loai_bao_tri').map(item => item.value),
                        backgroundColor: 'rgba(37, 99, 235, 0.7)',
                        borderRadius: 6,
                        barThickness: 30
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
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

      <MobileFilterSheet 
        isOpen={showMobileFilter} 
        isClosing={mobileFilterClosing} 
        onClose={closeMobileFilter} 
        onApply={applyMobileFilter} 
        title="Bộ lọc Báo cáo Quý" 
        sections={filterSections} 
        hasActiveFilters={!!filters.warehouse} 
        totalActiveFilters={filters.warehouse ? 1 : 0} 
      />
    </div>
  );
};

export default QuarterlyReport;
