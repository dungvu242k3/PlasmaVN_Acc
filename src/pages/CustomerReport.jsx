import React, { useState, useEffect } from 'react';
import { Download, Filter, Users, Building, Package, User } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { exportCustomerReport } from '../utils/exportExcel';

const CustomerReport = () => {
  const { fetchCustomerStats, fetchFilterOptions, loading } = useReports();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    warehouse_id: '',
    customer_type: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    warehouses: [],
    customerTypes: []
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadData(); loadFilterOptions(); }, []);

  const loadData = async () => {
    const result = await fetchCustomerStats(filters);
    setData(result || []);
  };

  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({
      warehouses: options.warehouses,
      customerTypes: options.customerTypes
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setTimeout(() => loadData(), 100);
  };

  const handleExport = () => exportCustomerReport(data);
  
  const filteredData = data.filter(item =>
    item.ten_khach_hang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ma_khach_hang?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Báo cáo khách hàng</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Thống kê theo khách hàng</p>
        </div>
        <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm w-full sm:w-auto">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Xuất Excel</span>
        </button>
      </div>

      {/* Filters - Auto apply */}
      <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium">Bộ lọc:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select value={filters.warehouse_id} onChange={(e) => handleFilterChange('warehouse_id', e.target.value)} className="px-2 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm">
              <option value="">Tất cả kho</option>
              {filterOptions.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select value={filters.customer_type} onChange={(e) => handleFilterChange('customer_type', e.target.value)} className="px-2 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm">
              <option value="">Tất cả loại KH</option>
              {filterOptions.customerTypes.map(t => <option key={t} value={t}>{t === 'công' ? 'BV công' : t === 'tư' ? 'BV tư' : t}</option>)}
            </select>
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
            <div key={index} className="bg-card rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold text-sm">{item.ten_khach_hang || '-'}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.loai_khach_hang === 'công' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {item.loai_khach_hang === 'công' ? 'Công' : 'Tư'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">{item.ma_khach_hang} • {item.kho || 'Chưa có kho'}</div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex gap-4 text-xs">
                  <span className="text-muted-foreground">Bán: <span className="font-semibold text-foreground">{item.binh_ban || 0}</span></span>
                  <span className="text-muted-foreground">Demo: <span className="font-semibold text-foreground">{item.binh_demo || 0}</span></span>
                  <span className="text-muted-foreground">Máy: <span className="font-semibold text-foreground">{item.may_dang_su_dung || 0}</span></span>
                </div>
              </div>
              {item.nhan_vien_kinh_doanh && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{item.nhan_vien_kinh_doanh}</span>
                </div>
              )}
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
                  <th className="px-3 py-2 text-left text-xs font-medium">Mã KH</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Tên KH</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Loại</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Kho</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Máy</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Bán</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Demo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">NVKD</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 text-sm">
                    <td className="px-3 py-2 font-medium">{item.ma_khach_hang}</td>
                    <td className="px-3 py-2 font-medium max-w-[150px] truncate">{item.ten_khach_hang}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${item.loai_khach_hang === 'công' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{item.loai_khach_hang === 'công' ? 'Công' : 'Tư'}</span>
                    </td>
                    <td className="px-3 py-2">{item.kho || '-'}</td>
                    <td className="px-3 py-2 text-right">{item.may_dang_su_dung || 0}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.binh_ban || 0}</td>
                    <td className="px-3 py-2 text-right">{item.binh_demo || 0}</td>
                    <td className="px-3 py-2 max-w-[100px] truncate">{item.nhan_vien_kinh_doanh || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Không có dữ liệu</p></td></tr>
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

export default CustomerReport;
