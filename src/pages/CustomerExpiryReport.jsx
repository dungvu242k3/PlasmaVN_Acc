import React, { useState, useEffect } from 'react';
import { Download, Filter, AlertTriangle, Building, Calendar } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { exportCustomerExpiryReport } from '../utils/exportExcel';

const CustomerExpiryReport = () => {
  const { fetchCustomerExpiry, fetchFilterOptions, loading } = useReports();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ warehouse_id: '', min_days: '' });
  const [filterOptions, setFilterOptions] = useState({ warehouses: [] });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadData(); loadFilterOptions(); }, []);
  const loadData = async () => { const result = await fetchCustomerExpiry(filters); setData(result || []); };
  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({ warehouses: options.warehouses });
  };
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setTimeout(() => loadData(), 100);
  };
  const handleExport = () => exportCustomerExpiryReport(data);
  const filteredData = data.filter(item => item.ten_khach_hang?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-lg sm:text-xl md:text-2xl font-bold">Báo cáo KH quá hạn</h1><p className="text-xs sm:text-sm text-muted-foreground">KH chưa phát sinh đơn</p></div>
        <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm w-full sm:w-auto">
          <Download className="w-4 h-4" /><span className="hidden sm:inline">Xuất Excel</span>
        </button>
      </div>

      <div className="bg-card rounded-xl border borderBorder p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3 mb-3">
          <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-sm font-medium">Bộ lọc:</span></div>
          <div className="grid grid-cols-2 gap-2">
            <select value={filters.warehouse_id} onChange={(e) => handleFilterChange('warehouse_id', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm"><option value="">Kho</option>{filterOptions.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
            <select value={filters.min_days} onChange={(e) => handleFilterChange('min_days', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm"><option value="">Ngày</option><option value="30">Trên 30 ngày</option><option value="60">Trên 60 ngày</option></select>
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
                  <span className="font-semibold text-sm truncate">{item.ten_khach_hang}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${item.so_ngay_chua_phat_sinh > 60 ? 'bg-red-100 text-red-700' : item.so_ngay_chua_phat_sinh > 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {item.so_ngay_chua_phat_sinh} ngày
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t borderBorder text-xs text-muted-foreground">
                <span>{item.kho}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.ngay_dat_hang_gan_nhat || 'Chưa đặt'}</span>
              </div>
              <div className="text-xs text-muted-foreground">Đơn gần nhất: {item.ma_don_gan_nhat || '-'}</div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-xl border borderBorder p-8 text-center text-muted-foreground">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không có KH quá hạn</p>
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
                  <th className="px-3 py-2 text-left text-xs font-medium">Tên KH</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Kho</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Ngày đặt gần nhất</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Ngày chưa PS</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Mã đơn gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 text-sm">
                    <td className="px-3 py-2 font-medium max-w-[150px] truncate">{item.ten_khach_hang}</td>
                    <td className="px-3 py-2">{item.kho}</td>
                    <td className="px-3 py-2">{item.ngay_dat_hang_gan_nhat}</td>
                    <td className="px-3 py-2 text-right"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${item.so_ngay_chua_phat_sinh > 60 ? 'bg-red-100 text-red-700' : item.so_ngay_chua_phat_sinh > 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{item.so_ngay_chua_phat_sinh} ngày</span></td>
                    <td className="px-3 py-2">{item.ma_don_gan_nhat || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground"><AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Không có KH quá hạn</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground px-2">Tổng: {filteredData.length} khách hàng</div>
    </div>
  );
};

export default CustomerExpiryReport;
