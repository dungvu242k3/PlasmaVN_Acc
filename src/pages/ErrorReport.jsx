import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend as ChartLegend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  ArcElement
} from 'chart.js';
import { Bar as BarChartJS, Pie as PieChartJS, Line as LineChartJS } from 'react-chartjs-2';
import {
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  Search,
  X,
  MapPin,
  TrendingDown,
  BarChart2,
  PieChart,
  List,
  ChevronDown,
  Activity,
  Laptop,
  Box,
  ChevronLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { useReports } from '../hooks/useReports';
import { exportErrorReport } from '../utils/exportExcel';
import FilterDropdown from '../components/ui/FilterDropdown';
import MobileFilterSheet from '../components/ui/MobileFilterSheet';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const ErrorReport = () => {
  const navigate = useNavigate();
  const { fetchErrorReport, fetchFilterOptions, loading } = useReports();
  const [activeTab, setActiveTab] = useState('summary');
  const [data, setData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    warehouses: [],
    years: [new Date().getFullYear()]
  });

  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterSearch, setFilterSearch] = useState('');

  // Mobile states
  const [activeView, setActiveView] = useState('stats');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [isClosingFilter, setIsClosingFilter] = useState(false);
  const [pendingYear, setPendingYear] = useState(selectedYear);
  const [pendingMonth, setPendingMonth] = useState(selectedMonth);
  const [pendingQuarter, setPendingQuarter] = useState(selectedQuarter);
  const [pendingCategory, setPendingCategory] = useState(selectedCategory);
  const [pendingWarehouses, setPendingWarehouses] = useState(selectedWarehouses);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth, selectedQuarter, selectedCategory, selectedWarehouses]);

  const loadData = async () => {
    const filters = {
      year: selectedYear,
      month: selectedMonth,
      quarter: selectedQuarter,
      category: selectedCategory,
      warehouse: selectedWarehouses.length > 0 ? selectedWarehouses[0] : null
    };
    const result = await fetchErrorReport(filters);
    setData(result || []);
  };

  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({
      warehouses: options.warehouses || [],
      years: options.years || [new Date().getFullYear()]
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num || 0);
  };

  const filteredData = data.filter(item =>
    item.serial_thiet_bi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ten_khach_hang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ten_loi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalErrors = filteredData.length;
  const machineErrors = filteredData.filter(i => i.error_category === 'Máy').length;
  const cylinderErrors = filteredData.filter(i => i.error_category === 'Bình').length;

  const typeStats = () => {
    const stats = {};
    filteredData.forEach(item => {
      const type = item.ten_loi || 'Chưa phân loại';
      stats[type] = (stats[type] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const timelineStats = () => {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const counts = new Array(12).fill(0);
    
    filteredData.forEach(item => {
      if (item.thang) {
        counts[item.thang - 1]++;
      }
    });

    return {
      labels: months,
      datasets: [{
        label: 'Số lượng lỗi',
        data: counts,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#EF4444'
      }]
    };
  };

  const handleExport = () => {
    exportErrorReport(filteredData, { year: selectedYear, month: selectedMonth, quarter: selectedQuarter });
  };

  const openMobileFilter = () => {
    setPendingYear(selectedYear);
    setPendingMonth(selectedMonth);
    setPendingQuarter(selectedQuarter);
    setPendingCategory(selectedCategory);
    setPendingWarehouses(selectedWarehouses);
    setShowMobileFilter(true);
  };

  const closeMobileFilter = () => {
    setIsClosingFilter(true);
    setTimeout(() => {
      setShowMobileFilter(false);
      setIsClosingFilter(false);
    }, 300);
  };

  const applyMobileFilters = () => {
    setSelectedYear(pendingYear);
    setSelectedMonth(pendingMonth);
    setSelectedQuarter(pendingQuarter);
    setSelectedCategory(pendingCategory);
    setSelectedWarehouses(pendingWarehouses);
    closeMobileFilter();
  };

  const hasActiveFilters = selectedMonth !== '' || selectedQuarter !== '' || selectedCategory !== '' || selectedWarehouses.length > 0;
  const totalActiveFilters = (selectedMonth !== '' ? 1 : 0) + (selectedQuarter !== '' ? 1 : 0) + (selectedCategory !== '' ? 1 : 0) + selectedWarehouses.length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex-1 flex flex-col p-2 md:p-4 bg-muted/20 pb-20 md:pb-4">
      {/* View Switcher (Mobile Only) */}
      <div className="flex md:hidden items-center p-1 bg-white border border-border rounded-xl mb-4 shadow-sm">
        <button
          onClick={() => setActiveView('stats')}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold transition-all",
            activeView === 'stats' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground"
          )}
        >
          <BarChart2 size={16} /> Biểu đồ
        </button>
        <button
          onClick={() => setActiveView('list')}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold transition-all",
            activeView === 'list' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground"
          )}
        >
          <List size={16} /> Chi tiết
        </button>
      </div>

      {/* ── MOBILE TOOLBAR ── */}
      <div className="md:hidden flex flex-col p-3 border-b border-border glass-header sticky top-0 z-30 mb-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-border bg-white text-muted-foreground shrink-0 active:scale-95 transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <input
              type="text"
              placeholder="Tìm thiết bị, lỗi, khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50/50 border border-border/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:scale-90 transition-transform">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={openMobileFilter}
            className={clsx(
              'relative p-2 rounded-xl border shrink-0 transition-all active:scale-95 shadow-sm',
              hasActiveFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground',
            )}
          >
            <Filter size={18} />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-white">
                {totalActiveFilters}
              </span>
            )}
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0 shadow-sm active:scale-95 transition-all"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* ── DESKTOP HEADER ── */}
      <div className="hidden md:flex flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Báo cáo Lỗi thiết bị</h1>
          <p className="text-muted-foreground text-sm">Phân tích tỷ lệ hỏng hóc và chất lượng máy/bình theo thời gian</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
        >
          <Download size={16} /> Xuất Excel
        </button>
      </div>

      {/* Desktop Filters Bar */}
      <div className="hidden md:block bg-white p-4 rounded-2xl border border-border shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[100px]">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 px-1">Năm</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all">
              {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="min-w-[100px]">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 px-1">Quý</label>
            <select value={selectedQuarter} onChange={(e) => { setSelectedQuarter(e.target.value); setSelectedMonth(''); }} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all">
              <option value="">Tất cả</option>
              {[1, 2, 3, 4].map(q => <option key={q} value={q}>Quý {q}</option>)}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 px-1">Tháng</label>
            <select value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setSelectedQuarter(''); }} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all">
              <option value="">Tất cả</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (<option key={m} value={m}>Tháng {m}</option>))}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 px-1">Thiết bị</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all">
              <option value="">Tất cả</option>
              <option value="Máy">Máy</option>
              <option value="Bình">Bình</option>
            </select>
          </div>
          <div className="relative min-w-[180px]">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 px-1">Kho</label>
            <button onClick={() => setActiveDropdown(activeDropdown === 'warehouse' ? null : 'warehouse')} className={clsx("w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-[13px] font-medium transition-all bg-muted/30", selectedWarehouses.length > 0 ? "border-primary/50 text-foreground" : "border-border text-muted-foreground")}>
              <div className="flex items-center gap-2 overflow-hidden truncate"><MapPin size={14} className="shrink-0" /><span>{selectedWarehouses.length > 0 ? selectedWarehouses[0] : 'Tất cả kho'}</span></div>
              <ChevronDown size={14} className={clsx("transition-transform shrink-0", activeDropdown === 'warehouse' && "rotate-180")} />
            </button>
            {activeDropdown === 'warehouse' && (<FilterDropdown options={filterOptions.warehouses.map(w => ({ id: w.name, label: w.name }))} selected={selectedWarehouses} setSelected={(vals) => { setSelectedWarehouses(vals); setActiveDropdown(null); }} filterSearch={filterSearch} setFilterSearch={setFilterSearch} singleSelect={true} />)}
          </div>
          <div className="flex-1 min-w-[200px] relative">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 px-1">Tìm kiếm</label>
            <Search className="absolute left-3 bottom-2.5 text-muted-foreground" size={16} />
            <input type="text" placeholder="Serial, khách hàng, lỗi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-8 py-2 bg-muted/30 border border-border rounded-xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 bottom-2.5 text-muted-foreground"><X size={14} /></button>}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={clsx("grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6", activeView === 'list' && "hidden md:grid")}>
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-rose-50 text-rose-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <AlertTriangle size={20} className="md:hidden" />
            <AlertTriangle size={28} className="hidden md:block" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5 md:mb-1">Tổng số lỗi</p>
            <p className="text-base md:text-2xl font-black text-foreground">{formatNumber(totalErrors)} <span className="text-[10px] md:text-sm font-bold opacity-70">lỗi</span></p>
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <Laptop size={20} className="md:hidden" />
            <Laptop size={28} className="hidden md:block" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5 md:mb-1">Lỗi Máy</p>
            <p className="text-base md:text-2xl font-black text-foreground">{formatNumber(machineErrors)} <span className="text-[10px] md:text-sm font-bold opacity-70">máy</span></p>
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center gap-3 md:gap-5 col-span-2 md:col-span-1">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-50 text-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <Box size={20} className="md:hidden" />
            <Box size={28} className="hidden md:block" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5 md:mb-1">Lỗi Bình</p>
            <p className="text-base md:text-2xl font-black text-foreground">{formatNumber(cylinderErrors)} <span className="text-[10px] md:text-sm font-bold opacity-70">bình</span></p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 min-h-0">
        {/* Left Side: Visualization (2/3) */}
        <div className={clsx(
          "md:col-span-2 flex flex-col gap-3 md:gap-6",
          activeView === 'list' && "hidden md:flex"
        )}>
          {/* Trend Chart */}
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-border shadow-sm min-h-[350px] flex flex-col">
            <h3 className="font-bold text-base md:text-lg flex items-center gap-2 mb-6">
              <Activity size={20} className="text-rose-500" /> Xu hướng báo lỗi trong năm
            </h3>
            <div className="flex-1 min-h-[250px]">
              <LineChartJS 
                data={timelineStats()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } },
                    x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
                  }
                }}
              />
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-border shadow-sm min-h-[350px] flex flex-col">
            <h3 className="font-bold text-base md:text-lg flex items-center gap-2 mb-6">
              <PieChart size={20} className="text-primary" /> Phân loại lỗi phổ biến nhất
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-[320px]">
                <PieChartJS 
                  data={{
                    labels: typeStats().map(i => i.name),
                    datasets: [{
                      data: typeStats().map(i => i.value),
                      backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'],
                      borderWidth: 2,
                      borderColor: '#fff'
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: 'bold', size: 11 } } } }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Table / List (1/3) */}
        <div className={clsx(
          "md:col-span-1 flex flex-col min-h-0 bg-white rounded-2xl border border-border shadow-sm overflow-hidden",
          activeView === 'stats' && "hidden md:flex"
        )}>
          <div className="p-3 md:p-4 border-b border-border flex items-center justify-between bg-muted/10">
            <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
              <List size={18} className="text-primary" /> Nhật ký báo lỗi
            </h3>
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold">{filteredData.length} Phiếu</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead className="bg-[#F8FAFC] sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 text-[11px] font-bold text-muted-foreground uppercase border-b border-border">Thiết bị</th>
                  <th className="px-3 py-3 text-[11px] font-bold text-muted-foreground uppercase border-b border-border">Lỗi / Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-[12px]">
                {loading ? (
                  <tr><td colSpan="2" className="px-4 py-12 text-center text-sm italic text-muted-foreground">Đang tải...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="2" className="px-4 py-12 text-center text-sm italic text-muted-foreground">Không có dữ liệu</td></tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold flex items-center gap-1 text-foreground">
                             {item.error_category === 'Máy' ? <Laptop size={12} className="text-blue-500" /> : <Box size={12} className="text-amber-500" />}
                             {item.serial_thiet_bi}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{item.ten_khach_hang}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-primary truncate max-w-[150px]">{item.ten_loi || 'Chưa phân loại'}</span>
                          <span className={clsx(
                            "inline-flex w-fit px-1.5 py-0.5 rounded text-[9px] font-bold border",
                            item.trang_thai_phieu === 'Hoàn thành' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            item.trang_thai_phieu === 'Mới' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                            {item.trang_thai_phieu}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border/50">
              {loading ? (
                <div className="px-4 py-12 text-center text-sm italic text-muted-foreground">Đang tải dữ liệu...</div>
              ) : filteredData.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm italic text-muted-foreground">Không có dữ liệu</div>
              ) : (
                filteredData.map((item, idx) => (
                  <div key={idx} className="p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                       <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold text-muted-foreground">#{item.stt}</span>
                            <span className={clsx(
                              "px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                              item.trang_thai_phieu === 'Hoàn thành' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                              item.trang_thai_phieu === 'Mới' ? "bg-blue-50 text-blue-600 border-blue-200" :
                              "bg-amber-50 text-amber-600 border-amber-200"
                            )}>
                              {item.trang_thai_phieu}
                            </span>
                         </div>
                         <h4 className="text-[14px] font-bold text-foreground flex items-center gap-2">
                           {item.error_category === 'Máy' ? <Laptop size={14} className="text-blue-500" /> : <Box size={14} className="text-amber-500" />}
                           {item.serial_thiet_bi}
                         </h4>
                         <p className="text-[12px] text-muted-foreground mt-0.5 font-medium">{item.ten_khach_hang}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[11px] font-bold text-muted-foreground border-b border-dashed border-muted-foreground/30 pb-0.5 mb-1 inline-block">
                             {new Date(item.ngay_bao_loi).toLocaleDateString('vi-VN')}
                          </p>
                       </div>
                    </div>
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex flex-col gap-1">
                       <p className="text-[13px] font-bold text-primary flex items-center gap-1.5">
                          <AlertTriangle size={12} /> {item.ten_loi || 'Chưa phân loại'}
                       </p>
                       <p className="text-[11px] text-muted-foreground line-clamp-2 italic">“{item.mo_ta_chi_tiet || 'Không có mô tả chi tiết'}”</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {showMobileFilter && (
        <MobileFilterSheet
          isOpen={showMobileFilter}
          isClosing={isClosingFilter}
          onClose={closeMobileFilter}
          onApply={applyMobileFilters}
          title="Bộ lọc lỗi thiết bị"
          sections={[
            {
              id: 'year',
              label: 'Năm báo cáo',
              icon: <Calendar size={18} />,
              singleSelect: true,
              options: filterOptions.years.map(y => ({ id: y, label: `Năm ${y}` })),
              selectedValues: [pendingYear],
              onSelectionChange: (vals) => setPendingYear(vals[0]),
              searchable: false
            },
            {
              id: 'quarter',
              label: 'Quý báo cáo',
              icon: <Calendar size={18} />,
              singleSelect: true,
              options: [
                { id: '', label: 'Tất cả quý' },
                { id: '1', label: 'Quý 1' },
                { id: '2', label: 'Quý 2' },
                { id: '3', label: 'Quý 3' },
                { id: '4', label: 'Quý 4' },
              ],
              selectedValues: [pendingQuarter],
              onSelectionChange: (vals) => { setPendingQuarter(vals[0]); setPendingMonth(''); },
              searchable: false
            },
            {
              id: 'month',
              label: 'Tháng báo cáo',
              icon: <Calendar size={18} />,
              singleSelect: true,
              options: [
                { id: '', label: 'Tất cả tháng' },
                ...Array.from({ length: 12 }, (_, i) => ({ id: (i + 1).toString(), label: `Tháng ${i + 1}` }))
              ],
              selectedValues: [pendingMonth],
              onSelectionChange: (vals) => { setPendingMonth(vals[0]); setPendingQuarter(''); },
              searchable: false
            },
            {
              id: 'category',
              label: 'Loại thiết bị',
              icon: <Laptop size={18} />,
              singleSelect: true,
              options: [
                { id: '', label: 'Tất cả' },
                { id: 'Máy', label: 'Máy' },
                { id: 'Bình', label: 'Bình' },
              ],
              selectedValues: [pendingCategory],
              onSelectionChange: (vals) => setPendingCategory(vals[0]),
              searchable: false
            },
            {
              id: 'warehouse',
              label: 'Kho hàng',
              icon: <MapPin size={18} />,
              singleSelect: true,
              options: filterOptions.warehouses.map(w => ({ id: w.name, label: w.name })),
              selectedValues: pendingWarehouses,
              onSelectionChange: setPendingWarehouses
            }
          ]}
        />
      )}
    </div>
  );
};

export default ErrorReport;
