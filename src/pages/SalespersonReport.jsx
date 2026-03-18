import React, { useState, useEffect } from 'react';
import { Download, Filter, Users, User, Phone, Package } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { exportSalespersonReport } from '../utils/exportExcel';

const SalespersonReport = () => {
  const { fetchSalespersonStats, fetchFilterOptions, loading } = useReports();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ warehouse_id: '' });
  const [filterOptions, setFilterOptions] = useState({ warehouses: [] });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadData(); loadFilterOptions(); }, []);
  const loadData = async () => { const result = await fetchSalespersonStats(filters); setData(result || []); };
  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({ warehouses: options.warehouses });
  };
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setTimeout(() => loadData(), 100);
  };
  const handleExport = () => exportSalespersonReport(data);
  const filteredData = data.filter(item => item.ten_nhan_vien?.toLowerCase().includes(searchTerm.toLowerCase()) || item.so_dien_thoai?.includes(searchTerm));

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-lg sm:text-xl md:text-2xl font-bold">Báo cáo nhân viên KD</h1><p className="text-xs sm:text-sm text-muted-foreground">Thống kê theo NVKD</p></div>
        <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm w-full sm:w-auto">
          <Download className="w-4 h-4" /><span className="hidden sm:inline">Xuất Excel</span>
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3 mb-3">
          <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-sm font-medium">Bộ lọc:</span></div>
          <div className="flex flex-wrap gap-2">
            <select value={filters.warehouse_id} onChange={(e) => handleFilterChange('warehouse_id', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm flex-1 sm:flex-none sm:min-w-[120px]">
              <option value="">Tất cả kho</option>
              {filterOptions.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>
        <input type="text" placeholder="Tìm nhân viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs sm:text-sm" />
      </div>

      {/* Mobile: Cards Layout */}
      <div className="block sm:hidden space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div key={index} className="bg-card rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{item.ten_nhan_vien}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3 shrink-0" />
                    <span>{item.so_dien_thoai || '-'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex gap-3 text-xs">
                  <span className="text-muted-foreground">KH: <span className="font-semibold text-foreground">{item.tong_khach_hang || 0}</span></span>
                  <span className="text-muted-foreground">Bán: <span className="font-semibold text-green-600">{item.binh_ban || 0}</span></span>
                  <span className="text-muted-foreground">Demo: <span className="font-semibold text-blue-600">{item.binh_demo || 0}</span></span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
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
                  <th className="px-3 py-2 text-left text-xs font-medium">Tên NV</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">SĐT</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Tổng KH</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Đơn bán</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Bình bán</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Demo</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Thu hồi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 text-sm">
                    <td className="px-3 py-2 font-medium">{item.ten_nhan_vien}</td>
                    <td className="px-3 py-2">{item.so_dien_thoai}</td>
                    <td className="px-3 py-2 text-right">{item.tong_khach_hang || 0}</td>
                    <td className="px-3 py-2 text-right">{item.don_xuat_ban || 0}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.binh_ban || 0}</td>
                    <td className="px-3 py-2 text-right">{item.binh_demo || 0}</td>
                    <td className="px-3 py-2 text-right">{item.binh_thu_hoi || 0}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Không có dữ liệu</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground px-2">Tổng: {filteredData.length} nhân viên</div>
    </div>
  );
};

export default SalespersonReport;
