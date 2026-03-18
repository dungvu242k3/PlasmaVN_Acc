import React, { useState, useEffect } from 'react';
import { Download, Filter, Monitor, Hash } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { exportMachineStatsReport } from '../utils/exportExcel';

const MachineStatsReport = () => {
  const { fetchMachineStats, fetchFilterOptions, loading } = useReports();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ warehouse: '', machine_type: '' });
  const [filterOptions, setFilterOptions] = useState({ warehouses: [], machineTypes: [] });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadData(); loadFilterOptions(); }, []);
  const loadData = async () => { const result = await fetchMachineStats(filters); setData(result || []); };
  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({ warehouses: options.warehouses, machineTypes: options.machineTypes || [] });
  };
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setTimeout(() => loadData(), 100);
  };
  const handleExport = () => exportMachineStatsReport(data);
  const filteredData = data.filter(item => item.serial_may?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-lg sm:text-xl md:text-2xl font-bold">Báo cáo máy</h1><p className="text-xs sm:text-sm text-muted-foreground">Thống kê máy</p></div>
        <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm w-full sm:w-auto">
          <Download className="w-4 h-4" /><span className="hidden sm:inline">Xuất Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-card rounded-xl p-2 sm:p-4 border borderBorder"><p className="text-xs text-muted-foreground">Tổng máy</p><p className="text-lg sm:text-xl font-bold">{data.length}</p></div>
        <div className="bg-card rounded-xl p-2 sm:p-4 border borderBorder"><p className="text-xs text-muted-foreground">Đã bán</p><p className="text-lg sm:text-xl font-bold text-green-600">{data.filter(d => d.is_ban).length}</p></div>
        <div className="bg-card rounded-xl p-2 sm:p-4 border borderBorder"><p className="text-xs text-muted-foreground">Tồn kho</p><p className="text-lg sm:text-xl font-bold text-blue-600">{data.filter(d => d.is_ton_kho).length}</p></div>
        <div className="bg-card rounded-xl p-2 sm:p-4 border borderBorder"><p className="text-xs text-muted-foreground">Bảo trì</p><p className="text-lg sm:text-xl font-bold text-yellow-600">{data.filter(d => d.is_bao_tri || d.is_sua_chua).length}</p></div>
      </div>

      <div className="bg-card rounded-xl border borderBorder p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3 mb-3">
          <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-sm font-medium">Bộ lọc:</span></div>
          <div className="grid grid-cols-2 gap-2">
            <select value={filters.warehouse} onChange={(e) => handleFilterChange('warehouse', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm"><option value="">Kho</option>{filterOptions.warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}</select>
            <select value={filters.machine_type} onChange={(e) => handleFilterChange('machine_type', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm"><option value="">Loại máy</option>{filterOptions.machineTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
          </div>
        </div>
        <input type="text" placeholder="Tìm serial máy..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs sm:text-sm" />
      </div>

      {/* Mobile: Cards Layout */}
      <div className="block sm:hidden space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div key={index} className="bg-card rounded-xl border borderBorder p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-semibold text-sm">{item.serial_may}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.is_ban ? 'bg-green-100 text-green-700' : item.is_bao_tri ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                  {item.trang_thai}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.loai_may}</span>
                <span className="truncate">{item.khach_hang || 'Tồn kho'}</span>
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
                  <th className="px-3 py-2 text-left text-xs font-medium">Serial</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Loại</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Trạng thái</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Khách hàng</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Kho</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 text-sm">
                    <td className="px-3 py-2 font-medium">{item.serial_may}</td>
                    <td className="px-3 py-2">{item.loai_may}</td>
                    <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-xs ${item.is_ban ? 'bg-green-100 text-green-700' : item.is_bao_tri ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{item.trang_thai}</span></td>
                    <td className="px-3 py-2 max-w-[100px] truncate">{item.khach_hang || '-'}</td>
                    <td className="px-3 py-2">{item.kho || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground"><Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Không có dữ liệu</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground px-2">Tổng: {filteredData.length} máy</div>
    </div>
  );
};

export default MachineStatsReport;
