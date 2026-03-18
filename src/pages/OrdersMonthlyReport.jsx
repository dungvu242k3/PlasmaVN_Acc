import React, { useState, useEffect } from 'react';
import { Download, Filter, Package, Hash, Building } from 'lucide-react';
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

      {/* Mobile: Cards Layout */}
      <div className="block sm:hidden space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div key={index} className="bg-card rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold text-sm">{item.ma_don}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.trang_thai === 'HOAN_THANH' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {item.trang_thai === 'HOAN_THANH' ? 'Hoàn thành' : 'Đã duyệt'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building className="w-3 h-3 shrink-0" />
                <span className="truncate">{item.ten_khach_hang}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex gap-4 text-xs">
                  <span className="text-muted-foreground">SL: <span className="font-semibold text-foreground">{item.so_luong}</span></span>
                  <span className="text-muted-foreground">Loại: <span className="font-semibold text-foreground">{item.loai_khach_hang}</span></span>
                </div>
                <span className="text-xs font-semibold text-green-600">{formatCurrency(item.thanh_tien)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.kho}</span>
                <span>{item.nhan_vien_kinh_doanh || '-'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không có đơn hàng</p>
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
                  <th className="px-3 py-2 text-left text-xs font-medium">Mã đơn</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Loại</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Kho</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Tên KH</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">SL</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Thành tiền</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Trạng thái</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">NVKD</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 text-sm">
                    <td className="px-3 py-2 font-medium">{item.ma_don}</td>
                    <td className="px-3 py-2">{item.loai_khach_hang}</td>
                    <td className="px-3 py-2">{item.kho}</td>
                    <td className="px-3 py-2 max-w-[150px] truncate">{item.ten_khach_hang}</td>
                    <td className="px-3 py-2 text-right">{item.so_luong}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.thanh_tien)}</td>
                    <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-xs ${item.trang_thai === 'HOAN_THANH' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{item.trang_thai === 'HOAN_THANH' ? 'Hoàn thành' : 'Đã duyệt'}</span></td>
                    <td className="px-3 py-2 max-w-[80px] truncate">{item.nhan_vien_kinh_doanh || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground"><Package className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Không có đơn hàng</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-xs sm:text-sm text-muted-foreground px-2">Tổng: {filteredData.length} đơn hàng</div>
    </div>
  );
};

export default OrdersMonthlyReport;
