import React, { useState, useEffect } from 'react';
import { Download, Filter, TrendingUp, Building, User } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { exportMachineRevenueReport } from '../utils/exportExcel';

const MachineRevenueReport = () => {
  const { fetchMachineRevenue, fetchFilterOptions, loading } = useReports();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ khoa: '', nhan_vien_kinh_doanh: '', loai_khach_hang: '' });
  const [filterOptions, setFilterOptions] = useState({ customerTypes: [], salespersons: [] });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadData(); loadFilterOptions(); }, []);
  const loadData = async () => { const result = await fetchMachineRevenue(filters); setData(result || []); };
  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({ customerTypes: options.customerTypes, salespersons: options.salespersons });
  };
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setTimeout(() => loadData(), 100);
  };
  const handleExport = () => exportMachineRevenueReport(data);
  const filteredData = data.filter(item => item.khach_hang?.toLowerCase().includes(searchTerm.toLowerCase()));
  const formatCurrency = (value) => { if (!value) return '0'; return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value); };
  const totalRevenue = filteredData.reduce((sum, item) => sum + (item.tong_doanh_so || 0), 0);

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-lg sm:text-xl md:text-2xl font-bold">Báo cáo doanh số máy</h1><p className="text-xs sm:text-sm text-muted-foreground">DS theo khoa, NVKD, loại KH</p></div>
        <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm w-full sm:w-auto">
          <Download className="w-4 h-4" /><span className="hidden sm:inline">Xuất Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-card rounded-xl p-2 sm:p-4 border borderBorder col-span-2"><p className="text-xs text-muted-foreground">Tổng máy</p><p className="text-lg sm:text-xl font-bold">{filteredData.length}</p></div>
        <div className="bg-card rounded-xl p-2 sm:p-4 border borderBorder col-span-2"><p className="text-xs text-muted-foreground">Tổng doanh số</p><p className="text-sm sm:text-xl font-bold text-green-600 truncate">{formatCurrency(totalRevenue)}</p></div>
      </div>

      <div className="bg-card rounded-xl border borderBorder p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3 mb-3">
          <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-sm font-medium">Bộ lọc:</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input type="text" placeholder="Khoa..." value={filters.khoa} onChange={(e) => handleFilterChange('khoa', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm" />
            <select value={filters.nhan_vien_kinh_doanh} onChange={(e) => handleFilterChange('nhan_vien_kinh_doanh', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm"><option value="">NVKD</option>{filterOptions.salespersons.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <select value={filters.loai_khach_hang} onChange={(e) => handleFilterChange('loai_khach_hang', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm"><option value="">Loại KH</option>{filterOptions.customerTypes.map(t => <option key={t} value={t}>{t === 'công' ? 'BV công' : t === 'tư' ? 'BV tư' : t}</option>)}</select>
          </div>
        </div>
        <input type="text" placeholder="Tìm khách hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs sm:text-sm" />
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
                  <Building className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold text-sm truncate">{item.khach_hang || '-'}</span>
                </div>
                <span className="text-xs font-semibold text-green-600 shrink-0">{formatCurrency(item.tong_doanh_so)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.loai_khach_hang === 'công' ? 'BV công' : item.loai_khach_hang === 'tư' ? 'BV tư' : '-'}</span>
                <span>{item.so_don_hang || 0} đơn</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.khoa || '-'}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.nhan_vien_kinh_doanh || '-'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-xl border borderBorder p-8 text-center text-muted-foreground">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
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
                  <th className="px-3 py-2 text-left text-xs font-medium">Khách hàng</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Khoa</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Loại KH</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">NVKD</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Số đơn</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Doanh số</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 text-sm">
                    <td className="px-3 py-2 max-w-[150px] truncate">{item.khach_hang || '-'}</td>
                    <td className="px-3 py-2">{item.khoa || '-'}</td>
                    <td className="px-3 py-2">{item.loai_khach_hang === 'công' ? 'Công' : item.loai_khach_hang === 'tư' ? 'Tư' : '-'}</td>
                    <td className="px-3 py-2 max-w-[80px] truncate">{item.nhan_vien_kinh_doanh || '-'}</td>
                    <td className="px-3 py-2 text-right">{item.so_don_hang || 0}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.tong_doanh_so)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground"><TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Không có dữ liệu</p></td></tr>
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

export default MachineRevenueReport;
