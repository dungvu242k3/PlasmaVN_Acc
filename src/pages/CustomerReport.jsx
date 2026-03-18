import React, { useState, useEffect } from 'react';
import { Download, Filter, Users } from 'lucide-react';
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

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32 sm:h-48 md:h-64"><div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-primary"></div></div>
        ) : (
          <div className="relative px-1">
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch pb-3 sm:pb-4">
              <table className="w-full min-w-[900px] sm:min-w-[700px]">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap">Mã KH</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap">Tên KH</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap hidden md:table-cell">Loại</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap hidden sm:table-cell">Kho</th>
                  <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium whitespace-nowrap hidden lg:table-cell">Máy</th>
                  <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium whitespace-nowrap">Bán</th>
                  <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium whitespace-nowrap hidden sm:table-cell">Demo</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium whitespace-nowrap hidden lg:table-cell">NVKD</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 text-xs sm:text-sm">
                    <td className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap">{item.ma_khach_hang}</td>
                    <td className="px-2 sm:px-3 py-2 font-medium whitespace-nowrap max-w-[120px] sm:max-w-[150px] truncate">{item.ten_khach_hang}</td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden md:table-cell">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${item.loai_khach_hang === 'công' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{item.loai_khach_hang === 'công' ? 'Công' : 'Tư'}</span>
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden sm:table-cell">{item.kho || '-'}</td>
                    <td className="px-2 sm:px-3 py-2 text-right whitespace-nowrap hidden lg:table-cell">{item.may_dang_su_dung || 0}</td>
                    <td className="px-2 sm:px-3 py-2 text-right whitespace-nowrap font-medium">{item.binh_ban || 0}</td>
                    <td className="px-2 sm:px-3 py-2 text-right whitespace-nowrap hidden sm:table-cell">{item.binh_demo || 0}</td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden lg:table-cell max-w-[100px] truncate">{item.nhan_vien_kinh_doanh || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="px-2 sm:px-3 py-8 text-center text-muted-foreground"><Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Không có dữ liệu</p></td></tr>
                )}
              </tbody>
            </table>
            </div>
            <div className="absolute right-0 top-0 bottom-3 sm:bottom-4 w-6 sm:w-8 bg-gradient-to-l from-card to-transparent pointer-events-none md:hidden"></div>
            <div className="absolute left-0 top-0 bottom-3 sm:bottom-4 w-4 sm:w-6 bg-gradient-to-r from-card to-transparent pointer-events-none md:hidden"></div>
          </div>
        )}
      </div>

      <div className="text-xs sm:text-sm text-muted-foreground px-2">Tổng: {filteredData.length} khách hàng</div>
    </div>
  );
};

export default CustomerReport;
