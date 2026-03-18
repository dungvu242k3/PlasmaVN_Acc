import React, { useState, useEffect } from 'react';
import { Download, Filter, Package } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { exportOrdersMonthlyReport } from '../utils/exportExcel';

const OrdersMonthlyReport = () => {
  const { fetchOrdersMonthly, fetchFilterOptions, loading } = useReports();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: '',
    warehouse: '',
    customer_category: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    years: [new Date().getFullYear()],
    warehouses: [],
    customerTypes: []
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadData(); loadFilterOptions(); }, []);

  const loadData = async () => {
    const result = await fetchOrdersMonthly(filters);
    setData(result || []);
  };

  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({
      years: options.years.length ? options.years : [new Date().getFullYear()],
      warehouses: options.warehouses,
      customerTypes: options.customerTypes
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setTimeout(() => loadData(), 100);
  };

  const handleExport = () => exportOrdersMonthlyReport(data);
  const filteredData = data.filter(item => item.ma_don?.toLowerCase().includes(searchTerm.toLowerCase()) || item.ten_khach_hang?.toLowerCase().includes(searchTerm.toLowerCase()));
  const formatCurrency = (value) => { if (!value) return '0'; return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value); };
  const totalRevenue = filteredData.reduce((sum, item) => sum + (item.thanh_tien || 0), 0);
  const totalQuantity = filteredData.reduce((sum, item) => sum + (item.so_luong || 0), 0);

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-lg sm:text-xl md:text-2xl font-bold">Báo cáo đơn xuất</h1><p className="text-xs sm:text-sm text-muted-foreground">Đơn ĐNXM đã phê duyệt</p></div>
        <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm w-full sm:w-auto">
          <Download className="w-4 h-4" /><span className="hidden sm:inline">Xuất Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-card rounded-xl p-2 sm:p-4 border border-border"><p className="text-xs text-muted-foreground">Tổng đơn</p><p className="text-lg sm:text-xl font-bold">{filteredData.length}</p></div>
        <div className="bg-card rounded-xl p-2 sm:p-4 border border-border"><p className="text-xs text-muted-foreground">Tổng SP</p><p className="text-lg sm:text-xl font-bold">{totalQuantity}</p></div>
        <div className="bg-card rounded-xl p-2 sm:p-4 border border-border col-span-2"><p className="text-xs text-muted-foreground">Doanh thu</p><p className="text-sm sm:text-xl font-bold text-green-600 truncate">{formatCurrency(totalRevenue)}</p></div>
      </div>

      <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3 mb-3">
          <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-sm font-medium">Bộ lọc:</span></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select value={filters.year} onChange={(e) => handleFilterChange('year', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm">
              <option value="">Năm</option>
              {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filters.month} onChange={(e) => handleFilterChange('month', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm">
              <option value="">Tháng</option>
              {[...Array(12)].map((_, i) => (<option key={i+1} value={i+1}>{i+1}</option>))}
            </select>
            <select value={filters.warehouse} onChange={(e) => handleFilterChange('warehouse', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm">
              <option value="">Kho</option>
              {filterOptions.warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
            <select value={filters.customer_category} onChange={(e) => handleFilterChange('customer_category', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm">
              <option value="">Loại KH</option>
              {filterOptions.customerTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <input type="text" placeholder="Tìm mã đơn, KH..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs sm:text-sm" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (<div className="flex items-center justify-center h-32 sm:h-48 md:h-64"><div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-primary"></div></div>) : (
          <div className="relative px-1">
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch pb-3 sm:pb-4">
              <table className="w-full min-w-[900px] sm:min-w-[700px]">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap">Mã đơn</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap hidden sm:table-cell">Loại</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap hidden md:table-cell">Kho</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap">Tên KH</th>
                  <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium whitespace-nowrap">SL</th>
                  <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium whitespace-nowrap hidden lg:table-cell">Thành tiền</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap hidden sm:table-cell">Trạng thái</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap hidden xl:table-cell">NVKD</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 text-xs sm:text-sm">
                    <td className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap">{item.ma_don}</td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden sm:table-cell">{item.loai_khach_hang}</td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden md:table-cell">{item.kho}</td>
                    <td className="px-2 sm:px-3 py-2 max-w-[100px] sm:max-w-[150px] truncate">{item.ten_khach_hang}</td>
                    <td className="px-2 sm:px-3 py-2 text-right whitespace-nowrap">{item.so_luong}</td>
                    <td className="px-2 sm:px-3 py-2 text-right font-medium whitespace-nowrap hidden lg:table-cell">{formatCurrency(item.thanh_tien)}</td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden sm:table-cell"><span className={`px-1.5 py-0.5 rounded text-xs ${item.trang_thai === 'HOAN_THANH' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{item.trang_thai === 'HOAN_THANH' ? 'Hoàn thành' : 'Đã duyệt'}</span></td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden xl:table-cell max-w-[80px] truncate">{item.nhan_vien_kinh_doanh || '-'}</td>
                  </tr>
                )) : (<tr><td colSpan={8} className="px-2 sm:px-3 py-8 text-center text-muted-foreground"><Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Không có đơn hàng</p></td></tr>)}
              </tbody>
            </table>
            </div>
            <div className="absolute right-0 top-0 bottom-3 sm:bottom-4 w-6 sm:w-8 bg-gradient-to-l from-card to-transparent pointer-events-none md:hidden"></div>
            <div className="absolute left-0 top-0 bottom-3 sm:bottom-4 w-4 sm:w-6 bg-gradient-to-r from-card to-transparent pointer-events-none md:hidden"></div>
          </div>
        )}
      </div>

      <div className="text-xs sm:text-sm text-muted-foreground px-2">Tổng: {filteredData.length} đơn hàng</div>
    </div>
  );
};

export default OrdersMonthlyReport;
