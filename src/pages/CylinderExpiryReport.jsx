import React, { useState, useEffect } from 'react';
import { Download, Filter, AlertTriangle } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { exportCylinderExpiryReport } from '../utils/exportExcel';

const CylinderExpiryReport = () => {
  const { fetchCylinderExpiry, fetchFilterOptions, loading } = useReports();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ kho: '', min_days: '' });
  const [filterOptions, setFilterOptions] = useState({ warehouses: [] });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadData(); loadFilterOptions(); }, []);
  const loadData = async () => { const result = await fetchCylinderExpiry(filters); setData(result || []); };
  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({ warehouses: options.warehouses });
  };
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setTimeout(() => loadData(), 100);
  };
  const handleExport = () => exportCylinderExpiryReport(data);
  const filteredData = data.filter(item => item.ma_binh?.toLowerCase().includes(searchTerm.toLowerCase()) || item.khach_hang?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-lg sm:text-xl md:text-2xl font-bold">Báo cáo bình quá hạn</h1><p className="text-xs sm:text-sm text-muted-foreground">Danh sách bình hết hạn</p></div>
        <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm w-full sm:w-auto">
          <Download className="w-4 h-4" /><span className="hidden sm:inline">Xuất Excel</span>
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3 mb-3">
          <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-sm font-medium">Bộ lọc:</span></div>
          <div className="grid grid-cols-2 gap-2">
            <select value={filters.kho} onChange={(e) => handleFilterChange('kho', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm">
              <option value="">Tất cả kho</option>
              {filterOptions.warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
            <select value={filters.min_days} onChange={(e) => handleFilterChange('min_days', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm">
              <option value="">Ngày tồn</option><option value="30">Trên 30 ngày</option><option value="60">Trên 60 ngày</option><option value="90">Trên 90 ngày</option>
            </select>
          </div>
        </div>
        <input type="text" placeholder="Tìm mã bình, KH..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs sm:text-sm" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (<div className="flex items-center justify-center h-32 sm:h-48 md:h-64"><div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-primary"></div></div>) : (
          <div className="relative px-1">
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch pb-3 sm:pb-4">
              <table className="w-full min-w-[700px] sm:min-w-[500px]">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap">Mã bình</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap hidden sm:table-cell">Loại</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap">Khách hàng</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap hidden md:table-cell">Ngày hết hạn</th>
                  <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium whitespace-nowrap">Ngày tồn</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap hidden lg:table-cell">Kho</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 text-xs sm:text-sm">
                    <td className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap">{item.ma_binh}</td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden sm:table-cell">{item.loai_binh}</td>
                    <td className="px-2 sm:px-3 py-2 max-w-[80px] sm:max-w-[120px] truncate">{item.khach_hang || '-'}</td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden md:table-cell">{item.ngay_het_han}</td>
                    <td className="px-2 sm:px-3 py-2 text-right whitespace-nowrap"><span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">{item.so_ngay_ton} ngày</span></td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden lg:table-cell">{item.kho || '-'}</td>
                  </tr>
                )) : (<tr><td colSpan={6} className="px-2 sm:px-3 py-8 text-center text-muted-foreground"><AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Không có bình quá hạn</p></td></tr>)}
              </tbody>
            </table>
            </div>
            <div className="absolute right-0 top-0 bottom-3 sm:bottom-4 w-6 sm:w-8 bg-gradient-to-l from-card to-transparent pointer-events-none md:hidden"></div>
            <div className="absolute left-0 top-0 bottom-3 sm:bottom-4 w-4 sm:w-6 bg-gradient-to-r from-card to-transparent pointer-events-none md:hidden"></div>
          </div>
        )}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground px-2">Tổng: {filteredData.length} bình quá hạn</div>
    </div>
  );
};

export default CylinderExpiryReport;
