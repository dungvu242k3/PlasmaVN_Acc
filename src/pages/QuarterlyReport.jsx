import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, Monitor, Wrench, Hash } from 'lucide-react';
import { useReports } from '../hooks/useReports';

const QuarterlyReport = () => {
  const { fetchMachineStats, fetchFilterOptions, loading } = useReports();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ quarter: Math.ceil((new Date().getMonth() + 1) / 3).toString(), year: new Date().getFullYear().toString(), warehouse: '' });
  const [filterOptions, setFilterOptions] = useState({ warehouses: [], years: [new Date().getFullYear()] });

  useEffect(() => { loadData(); loadFilterOptions(); }, []);
  const loadData = async () => { const result = await fetchMachineStats(filters); setData(result || []); };
  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({ warehouses: options.warehouses, years: options.years });
  };
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setTimeout(() => loadData(), 100);
  };

  const handleExport = () => {
    const formattedData = data.map(item => ({ 'Serial máy': item.serial_may, 'Loại máy': item.loai_may, 'Trạng thái': item.trang_thai, 'Khách hàng': item.khach_hang, 'Khoa': item.khoa_phu_trach, 'Kho': item.kho, 'Ngày bảo trì': item.ngay_bao_tri_gan_nhat, 'Loại bảo trì': item.loai_bao_tri }));
    const ws = window.XLSX.utils.json_to_sheet(formattedData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, 'BaoCao_Quy');
    window.XLSX.writeFile(wb, `BaoCao_Quy_${filters.quarter}_${filters.year}.xlsx`);
  };

  const maintenanceData = data.filter(item => item.ngay_bao_tri_gan_nhat);
  const upcomingMaintenance = data.filter(item => item.ngay_bao_tri_tiep);

  const getQuarterDateRange = (quarter, year) => {
    const ranges = { '1': { start: `01/01/${year}`, end: `31/03/${year}` }, '2': { start: `01/04/${year}`, end: `30/06/${year}` }, '3': { start: `01/07/${year}`, end: `30/09/${year}` }, '4': { start: `01/10/${year}`, end: `31/12/${year}` } };
    return ranges[quarter] || {};
  };
  const dateRange = getQuarterDateRange(filters.quarter, filters.year);

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-lg sm:text-xl md:text-2xl font-bold">Báo cáo quý</h1><p className="text-xs sm:text-sm text-muted-foreground">Lịch sử máy, bảo trì</p></div>
        <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm w-full sm:w-auto">
          <Download className="w-4 h-4" /><span className="hidden sm:inline">Xuất Excel</span>
        </button>
      </div>

      <div className="bg-card rounded-xl border borderBorder p-3 sm:p-4">
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary shrink-0" /><span className="font-medium text-sm">Quý {filters.quarter} năm {filters.year}</span><span className="text-xs text-muted-foreground">({dateRange.start} - {dateRange.end})</span></div>
          <div className="flex flex-wrap gap-2">
            <select value={filters.quarter} onChange={(e) => handleFilterChange('quarter', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm"><option value="1">Quý 1</option><option value="2">Quý 2</option><option value="3">Quý 3</option><option value="4">Quý 4</option></select>
            <select value={filters.year} onChange={(e) => handleFilterChange('year', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm">{filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}</select>
            <select value={filters.warehouse} onChange={(e) => handleFilterChange('warehouse', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm"><option value="">Kho</option>{filterOptions.warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}</select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-card rounded-xl p-2 sm:p-4 border borderBorder"><div className="flex items-center gap-2 mb-1"><Monitor className="w-4 h-4 text-blue-600" /><p className="text-xs text-muted-foreground">Tổng máy</p></div><p className="text-lg sm:text-xl font-bold">{data.length}</p></div>
        <div className="bg-card rounded-xl p-2 sm:p-4 border borderBorder"><div className="flex items-center gap-2 mb-1"><Wrench className="w-4 h-4 text-yellow-600" /><p className="text-xs text-muted-foreground">Đã bảo trì</p></div><p className="text-lg sm:text-xl font-bold">{maintenanceData.length}</p></div>
        <div className="bg-card rounded-xl p-2 sm:p-4 border borderBorder"><div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-orange-600" /><p className="text-xs text-muted-foreground">Sắp bảo trì</p></div><p className="text-lg sm:text-xl font-bold">{upcomingMaintenance.length}</p></div>
        <div className="bg-card rounded-xl p-2 sm:p-4 border borderBorder"><div className="flex items-center gap-2 mb-1"><Monitor className="w-4 h-4 text-green-600" /><p className="text-xs text-muted-foreground">Hoạt động</p></div><p className="text-lg sm:text-xl font-bold">{data.filter(d => d.is_ban || d.is_ton_kho).length}</p></div>
      </div>

      {/* Mobile: Cards Layout */}
      <div className="block sm:hidden space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="bg-card rounded-xl border borderBorder p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-semibold text-sm">{item.serial_may}</span>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">{item.trang_thai}</span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{item.loai_may} • {item.khach_hang || 'Tồn kho'}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.kho}</span>
                {item.ngay_bao_tri_gan_nhat && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.ngay_bao_tri_gan_nhat}</span>}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-xl border borderBorder p-8 text-center text-muted-foreground">
            <Monitor className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không có dữ liệu</p>
          </div>
        )}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden sm:block bg-card rounded-xl border borderBorder overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 md:h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium">Serial máy</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Loại</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Trạng thái</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Khách hàng</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Kho</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Ngày bảo trì</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? data.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 text-sm">
                    <td className="px-3 py-2 font-medium">{item.serial_may}</td>
                    <td className="px-3 py-2">{item.loai_may}</td>
                    <td className="px-3 py-2">{item.trang_thai}</td>
                    <td className="px-3 py-2 max-w-[100px] truncate">{item.khach_hang || '-'}</td>
                    <td className="px-3 py-2">{item.kho || '-'}</td>
                    <td className="px-3 py-2">{item.ngay_bao_tri_gan_nhat || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground"><Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Không có dữ liệu</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground px-2">Tổng: {data.length} máy</div>
    </div>
  );
};

export default QuarterlyReport;
