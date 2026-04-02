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
  ArrowUpRight,
  Package,
  Monitor,
  Hash,
  AlertCircle
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bar as BarChartJS, Pie as PieChartJS } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useReports } from '../hooks/useReports';
import { exportMachineStatsReport } from '../utils/exportExcel';
import FilterDropdown from '../components/ui/FilterDropdown';
import MobileFilterSheet from '../components/ui/MobileFilterSheet';
import ColumnPicker from '../components/ui/ColumnPicker';
import MobilePageHeader from '../components/layout/MobilePageHeader';
import MobilePagination from '../components/layout/MobilePagination';
import PageViewSwitcher from '../components/layout/PageViewSwitcher';

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
  serial_may: { label: 'Serial' },
  loai_may: { label: 'Loại Máy' },
  trang_thai: { label: 'Trạng Thái' },
  khach_hang: { label: 'Khách Hàng' },
  kho: { label: 'Kho' }
};

const defaultColOrder = Object.keys(COLUMN_DEFS);

const MachineStatsReport = () => {
  const navigate = useNavigate();
  const { fetchMachineStats, fetchFilterOptions, loading } = useReports();
  const [activeView, setActiveView] = useState('list');
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Filters
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [selectedMachineTypes, setSelectedMachineTypes] = useState([]);

  const [filterOptions, setFilterOptions] = useState({
    warehouses: [],
    machineTypes: []
  });

  // Column visibility & Order
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('columns_machine_stats_report') || 'null');
      if (Array.isArray(saved) && saved.length > 0) return saved.filter(k => defaultColOrder.includes(k));
    } catch { }
    return defaultColOrder;
  });
  const [columnOrder, setColumnOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('columns_machine_stats_report_order') || 'null');
      if (Array.isArray(saved) && saved.length > 0) return saved.filter(k => defaultColOrder.includes(k));
    } catch { }
    return defaultColOrder;
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const columnPickerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('columns_machine_stats_report', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem('columns_machine_stats_report_order', JSON.stringify(columnOrder));
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
  const [pendingMachineTypes, setPendingMachineTypes] = useState([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedWarehouses, selectedMachineTypes]);

  const loadData = async () => {
    const filters = {
      warehouse: selectedWarehouses.length > 0 ? selectedWarehouses[0] : '',
      machine_type: selectedMachineTypes.length > 0 ? selectedMachineTypes[0] : ''
    };
    const result = await fetchMachineStats(filters);
    setData(result || []);
  };

  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({
      warehouses: options.warehouses || [],
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
    item.khach_hang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.loai_may?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getStatusBadgeClass = (status) => {
    const lowerStatus = status?.toLowerCase() || '';
    return clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border',
      (lowerStatus.includes('bán') || lowerStatus.includes('thuộc khách hàng')) && 'bg-emerald-50 text-emerald-700 border-emerald-200',
      (lowerStatus.includes('tồn kho') || lowerStatus.includes('sẵn sàng')) && 'bg-blue-50 text-blue-700 border-blue-200',
      (lowerStatus.includes('bảo trì')) && 'bg-amber-50 text-amber-700 border-amber-200',
      (lowerStatus.includes('đang sửa') || lowerStatus.includes('sửa chữa')) && 'bg-red-50 text-red-700 border-red-200',
      (lowerStatus.includes('kiểm tra')) && 'bg-violet-50 text-violet-700 border-violet-200',
      (!lowerStatus || lowerStatus === '-') && 'bg-muted text-muted-foreground border-border'
    );
  };

  const getFilterButtonClass = (filterKey, isActive) => {
    if (!isActive) return 'border-border bg-white text-muted-foreground hover:text-foreground';
    return filterKey === 'warehouses' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  };

  const getFilterIconClass = (filterKey, isActive) => {
    return filterKey === 'warehouses' ? (isActive ? 'text-blue-700' : 'text-blue-500') : (isActive ? 'text-emerald-700' : 'text-emerald-500');
  };

  const getFilterCountBadgeClass = (filterKey) => filterKey === 'warehouses' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white';

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
  const openMobileFilter = () => { setPendingWarehouses(selectedWarehouses); setPendingMachineTypes(selectedMachineTypes); setShowMobileFilter(true); };
  const applyMobileFilter = () => { setSelectedWarehouses(pendingWarehouses); setSelectedMachineTypes(pendingMachineTypes); closeMobileFilter(); };
  const closeMobileFilter = () => { setMobileFilterClosing(true); setTimeout(() => { setShowMobileFilter(false); setMobileFilterClosing(false); }, 280); };

  // Stats calculations
  const stats_summary = {
    total: filteredData.length,
    sold: filteredData.filter(d => d.is_ban).length,
    inStock: filteredData.filter(d => d.is_ton_kho).length,
    maintenance: filteredData.filter(d => d.is_bao_tri || d.is_sua_chua).length,
  };

  const getStatusStats = () => {
    const stats = {};
    filteredData.forEach(item => {
      const status = item.trang_thai || 'Khác';
      stats[status] = (stats[status] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  };

  const getTypeStats = () => {
    const stats = {};
    filteredData.forEach(item => {
      const type = item.loai_may || 'Chưa phân loại';
      stats[type] = (stats[type] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  };

  const getWarehouseStats = () => {
    const stats = {};
    filteredData.forEach(item => {
      const warehouse = item.kho || 'Không xác định';
      stats[warehouse] = (stats[warehouse] || 0) + 1;
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
  const machineTypeOptions = useMemo(() => filterOptions.machineTypes.map(t => ({ id: t, label: t, count: data.filter(d => d.loai_may === t).length })), [filterOptions.machineTypes, data]);
  
  const hasActiveFilters = selectedWarehouses.length > 0 || selectedMachineTypes.length > 0;
  const totalActiveFilters = selectedWarehouses.length + selectedMachineTypes.length;

  const filterSections = useMemo(() => [
    { id: 'warehouses', label: 'Kho quản lý', icon: <MapPin size={16} />, options: warehouseOptions, selectedValues: pendingWarehouses, onSelectionChange: setPendingWarehouses },
    { id: 'machineTypes', label: 'Loại máy', icon: <Monitor size={16} />, options: machineTypeOptions, selectedValues: pendingMachineTypes, onSelectionChange: setPendingMachineTypes }
  ], [warehouseOptions, machineTypeOptions, pendingWarehouses, pendingMachineTypes]);

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
          {/* MOBILE TOOLBAR */}
          <MobilePageHeader
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchPlaceholder="Tìm kiếm . . ."
              onFilterClick={openMobileFilter}
              hasActiveFilters={hasActiveFilters}
              totalActiveFilters={totalActiveFilters}
              actions={
                  <button onClick={handleExport} className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-md shadow-emerald-600/20 active:scale-95 transition-all">
                      <Download size={20} />
                  </button>
              }
              selectionBar={
                  selectedIds.length > 0 ? (
                      <div className="flex items-center justify-between px-1 mt-3 pt-3 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                          <span className="text-[13px] font-bold text-slate-600">
                              Đã chọn <span className="text-primary">{selectedIds.length}</span> máy
                          </span>
                          <div className="flex items-center gap-2">
                              <button onClick={toggleSelectAll} className="text-[12px] font-bold text-primary hover:underline px-2 py-1">
                                  Bỏ chọn
                              </button>
                          </div>
                      </div>
                  ) : null
              }
          />

          {/* DESKTOP TOOLBAR */}
          <div className="hidden md:block p-3 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"><ChevronLeft size={16} /> Quay lại</button>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="text" placeholder="Tìm kiếm theo serial, loại máy, khách hàng . . ." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-8 py-1.5 bg-muted/20 border border-border/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium" />
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
                <button onClick={handleExport} className="flex items-center gap-2 px-6 py-1.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"><Download size={16} /> Xuất Excel</button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2" ref={listDropdownRef}>
              <div className="relative">
                <button onClick={() => { setActiveDropdown(activeDropdown === 'warehouses' ? null : 'warehouses'); setFilterSearch(''); }} className={clsx("flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all", getFilterButtonClass('warehouses', selectedWarehouses.length > 0))}>
                  <MapPin size={14} className={getFilterIconClass('warehouses', selectedWarehouses.length > 0)} /> Kho {selectedWarehouses.length > 0 && <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('warehouses'))}>{selectedWarehouses.length}</span>} <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'warehouses' ? "rotate-180" : "")} />
                </button>
                {activeDropdown === 'warehouses' && <FilterDropdown options={warehouseOptions} selected={selectedWarehouses} setSelected={setSelectedWarehouses} filterSearch={filterSearch} setFilterSearch={setFilterSearch} />}
              </div>
              <div className="relative">
                <button onClick={() => { setActiveDropdown(activeDropdown === 'machineTypes' ? null : 'machineTypes'); setFilterSearch(''); }} className={clsx("flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all", getFilterButtonClass('machineTypes', selectedMachineTypes.length > 0))}>
                  <Monitor size={14} className={getFilterIconClass('machineTypes', selectedMachineTypes.length > 0)} /> Loại máy {selectedMachineTypes.length > 0 && <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('machineTypes'))}>{selectedMachineTypes.length}</span>} <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'machineTypes' ? "rotate-180" : "")} />
                </button>
                {activeDropdown === 'machineTypes' && <FilterDropdown options={machineTypeOptions} selected={selectedMachineTypes} setSelected={setSelectedMachineTypes} filterSearch={filterSearch} setFilterSearch={setFilterSearch} />}
              </div>
              {hasActiveFilters && <button onClick={() => { setSelectedWarehouses([]); setSelectedMachineTypes([]); }} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-red-300 text-red-500 text-[12px] font-bold hover:bg-red-50 transition-all"><X size={14} /> Xóa bộ lọc</button>}
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
                {loading ? (<tr><td colSpan={visibleColumns.length + 1} className="px-4 py-16 text-center text-muted-foreground italic">Đang tải dữ liệu...</td></tr>) : paginatedData.length === 0 ? (<tr><td colSpan={visibleColumns.length + 1} className="px-4 py-16 text-center text-muted-foreground italic">Không tìm thấy dữ liệu</td></tr>) : (
                  paginatedData.map((item, index) => {
                    const globalIndex = (currentPage - 1) * pageSize + index;
                    return (
                    <tr key={globalIndex} className={clsx("group transition-all hover:bg-blue-50/40", selectedIds.includes(globalIndex) && "bg-blue-50/60")}>
                      <td className="px-4 py-4 sticky left-0 bg-white group-hover:bg-blue-50/40 z-10"><div className="flex items-center justify-center"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" checked={selectedIds.includes(globalIndex)} onChange={() => toggleSelect(globalIndex)} /></div></td>
                      {columnOrder.filter(isColumnVisible).map(colKey => {
                        if (colKey === 'serial_may') return <td key={colKey} className="px-4 py-4"><span className="text-[13px] font-bold text-primary">{item.serial_may}</span></td>;
                        if (colKey === 'loai_may') return <td key={colKey} className="px-4 py-4"><span className="text-[13px] font-medium text-foreground">{item.loai_may}</span></td>;
                        if (colKey === 'trang_thai') return (
                          <td key={colKey} className="px-4 py-4">
                            <span className={getStatusBadgeClass(item.trang_thai)}>
                              {item.trang_thai || '-'}
                            </span>
                          </td>
                        );
                        if (colKey === 'khach_hang') return <td key={colKey} className="px-4 py-4"><span className="text-[13px] text-foreground font-medium">{item.khach_hang || '-'}</span></td>;
                        if (colKey === 'kho') return <td key={colKey} className="px-4 py-4"><span className="text-[13px] text-muted-foreground font-medium">{item.kho || '-'}</span></td>;
                        return null;
                      })}
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST */}
          <div className="md:hidden flex-1 overflow-y-auto p-3 pb-4 flex flex-col gap-3">
            {loading ? (<div className="py-16 text-center text-[13px] text-muted-foreground italic">Đang tải...</div>) : paginatedData.length === 0 ? (<div className="py-16 text-center text-[13px] text-muted-foreground italic">Không tìm thấy dữ liệu</div>) : (
              paginatedData.map((item, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index;
                return (
                  <div key={globalIndex} className={clsx(
                      "rounded-2xl border shadow-sm p-4 transition-all duration-200",
                      selectedIds.includes(globalIndex)
                          ? "border-primary bg-primary/[0.05] ring-1 ring-primary/20"
                          : "border-primary/15 bg-white"
                  )}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex gap-3">
                          <div className="pt-1">
                              <input 
                                  type="checkbox" 
                                  className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary/20 transition-all cursor-pointer" 
                                  checked={selectedIds.includes(globalIndex)} 
                                  onChange={() => toggleSelect(globalIndex)} 
                              />
                          </div>
                          <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">#{globalIndex + 1}</p>
                              <h3 className="text-[14px] font-bold text-foreground leading-tight mt-0.5 font-mono">{item.serial_may}</h3>
                          </div>
                      </div>
                      <span className={getStatusBadgeClass(item.trang_thai)}>
                        {item.trang_thai || '-'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-0 rounded-xl bg-muted/10 border border-border/60 p-2.5">
                      <div className="col-span-2">
                          <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                      <Monitor size={14} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Loại máy</p>
                                      <p className="text-[12px] text-foreground font-bold truncate">
                                          {item.loai_may}
                                      </p>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                      <Package size={14} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Khách hàng</p>
                                      <p className="text-[12px] text-foreground font-bold truncate">
                                          {item.khach_hang || 'Chưa bàn giao'}
                                      </p>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                      <MapPin size={14} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Kho</p>
                                      <p className="text-[12px] text-foreground font-bold truncate">
                                          {item.kho || '-'}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Mobile Pagination */}
          {!loading && (
              <MobilePagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  totalRecords={filteredData.length}
              />
          )}

          {/* FOOTER Desktop*/}
          <div className="hidden md:flex px-4 py-4 border-t border-border items-center justify-between bg-muted/5">
            <div className="flex items-center gap-3 text-[12px] text-muted-foreground font-medium">
              <span>{filteredData.length > 0 ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredData.length)}` : '0'} / Tổng {filteredData.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(1)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled={currentPage === 1} title="Trang đầu">
                <ChevronLeft size={16} />
                <ChevronLeft size={16} className="-ml-2.5" />
              </button>
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled={currentPage === 1} title="Trang trước">
                <ChevronLeft size={16} />
              </button>
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-[12px] font-bold shadow-md shadow-primary/25">
                {currentPage}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredData.length / pageSize), prev + 1))} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled={currentPage >= Math.ceil(filteredData.length / pageSize)} title="Trang sau">
                <ChevronRight size={16} />
              </button>
              <button onClick={() => setCurrentPage(Math.ceil(filteredData.length / pageSize))} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20" disabled={currentPage >= Math.ceil(filteredData.length / pageSize)} title="Trang cuối">
                <ChevronRight size={16} />
                <ChevronRight size={16} className="-ml-2.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'stats' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col w-full">
          {/* Header Parity with List View */}
          <div className="space-y-0 text-left">
            {/* Mobile Header */}
            <div className="md:hidden flex flex-col p-3 border-b border-border glass-header sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-border bg-white text-muted-foreground shrink-0 active:scale-95 transition-all shadow-sm"><ChevronLeft size={18} /></button>
                <h2 className="text-base font-bold text-foreground flex-1 text-center">Thống kê báo cáo máy</h2>
                <button onClick={openMobileFilter} className={clsx('relative p-2 rounded-xl border shrink-0 transition-all active:scale-95 shadow-sm', hasActiveFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground')}><Filter size={18} />{hasActiveFilters && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-white">{totalActiveFilters}</span>}</button>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block p-4 border-b border-border" ref={statsDropdownRef}>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[12px] font-bold transition-all bg-white shadow-sm shrink-0"><ChevronLeft size={16} /> Quay lại</button>
                <div className="relative">
                  <button onClick={() => { setActiveDropdown(activeDropdown === 'warehouses_stats' ? null : 'warehouses_stats'); setFilterSearch(''); }} className={clsx("flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all", getFilterButtonClass('warehouses', selectedWarehouses.length > 0))}>
                    <MapPin size={14} className={getFilterIconClass('warehouses', selectedWarehouses.length > 0)} /> Kho {selectedWarehouses.length > 0 && <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('warehouses'))}>{selectedWarehouses.length}</span>} <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'warehouses_stats' ? "rotate-180" : "")} />
                  </button>
                  {activeDropdown === 'warehouses_stats' && <FilterDropdown options={warehouseOptions} selected={selectedWarehouses} setSelected={setSelectedWarehouses} filterSearch={filterSearch} setFilterSearch={setFilterSearch} />}
                </div>
                <div className="relative">
                  <button onClick={() => { setActiveDropdown(activeDropdown === 'machineTypes_stats' ? null : 'machineTypes_stats'); setFilterSearch(''); }} className={clsx("flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all", getFilterButtonClass('machineTypes', selectedMachineTypes.length > 0))}>
                    <Monitor size={14} className={getFilterIconClass('machineTypes', selectedMachineTypes.length > 0)} /> Loại máy {selectedMachineTypes.length > 0 && <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-bold', getFilterCountBadgeClass('machineTypes'))}>{selectedMachineTypes.length}</span>} <ChevronDown size={14} className={clsx("transition-transform", activeDropdown === 'machineTypes_stats' ? "rotate-180" : "")} />
                  </button>
                  {activeDropdown === 'machineTypes_stats' && <FilterDropdown options={machineTypeOptions} selected={selectedMachineTypes} setSelected={setSelectedMachineTypes} filterSearch={filterSearch} setFilterSearch={setFilterSearch} />}
                </div>
                {hasActiveFilters && <button onClick={() => { setSelectedWarehouses([]); setSelectedMachineTypes([]); }} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-red-300 text-red-500 text-[12px] font-bold hover:bg-red-50 transition-all"><X size={14} /> Xóa bộ lọc</button>}
              </div>
            </div>
          </div>

          <div className="w-full p-4 md:p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start text-center md:text-left gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-blue-200/70">
                    <Monitor className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Tổng Máy</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mt-0.5 md:mt-1 leading-none">{formatNumber(stats_summary.total)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start text-center md:text-left gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-emerald-200/70">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Đã Bán</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mt-0.5 md:mt-1 leading-none">{formatNumber(stats_summary.sold)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start text-center md:text-left gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-amber-200/70">
                    <Package className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Tồn Kho</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mt-0.5 md:mt-1 leading-none">{formatNumber(stats_summary.inStock)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start text-center md:text-left gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100/80 rounded-full flex items-center justify-center shrink-0 ring-1 ring-orange-200/70">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[11px] font-semibold text-orange-600 uppercase tracking-wider">Bảo Trì / Sửa Chữa</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mt-0.5 md:mt-1 leading-none">{formatNumber(stats_summary.maintenance)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">Trạng thái máy</h3>
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
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">Loại máy</h3>
                <div style={{ height: '300px' }}>
                  <PieChartJS
                    data={{
                      labels: getTypeStats().map(item => item.name),
                      datasets: [{
                        data: getTypeStats().map(item => item.value),
                        backgroundColor: chartColors.slice(0, getTypeStats().length).reverse(),
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

              <div className="bg-white border border-border rounded-xl p-6 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-foreground mb-4">Phân bổ máy theo Kho</h3>
                <div style={{ height: '350px' }}>
                  <BarChartJS
                    data={{
                      labels: getWarehouseStats().map(item => item.name),
                      datasets: [{
                        label: 'Số lượng máy',
                        data: getWarehouseStats().map(item => item.value),
                        backgroundColor: 'rgba(37, 99, 235, 0.8)',
                        borderRadius: 8,
                        barThickness: 25
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

      <MobileFilterSheet isOpen={showMobileFilter} isClosing={mobileFilterClosing} onClose={closeMobileFilter} onApply={applyMobileFilter} title="Lọc báo cáo máy" sections={filterSections} hasActiveFilters={hasActiveFilters} totalActiveFilters={totalActiveFilters} />
    </div>
  );
};

export default MachineStatsReport;
