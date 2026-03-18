import React, { useState, useEffect } from 'react';
import { Download, Filter, AlertTriangle, Hash, Calendar } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { exportCylinderErrorReport } from '../utils/exportExcel';

const CylinderErrorReport = () => {
  const { fetchCylinderErrors, fetchFilterOptions, loading } = useReports();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ warehouse_id: '', start_date: '', end_date: '' });
  const [filterOptions, setFilterOptions] = useState({ warehouses: [] });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadData(); loadFilterOptions(); }, []);
  const loadData = async () => { const result = await fetchCylinderErrors(filters); setData(result || []); };
  const loadFilterOptions = async () => {
    const options = await fetchFilterOptions();
    setFilterOptions({ warehouses: options.warehouses });
  };
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setTimeout(() => loadData(), 100);
  };
  const handleExport = () => exportCylinderErrorReport(data);
  const filteredData = data.filter(item => item.ma_binh?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-lg sm:text-xl md:text-2xl font-bold">Báo cáo bình lỗi</h1><p className="text-xs sm:text-sm text-muted-foreground">Bình lỗi và thời gian xử lý</p></div>
        <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm w-full sm:w-auto">
          <Download className="w-4 h-4" /><span className="hidden sm:inline">Xuất Excel</span>
        </button>
      </div>

      <div className="bg-card rounded-xl border borderBorder p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3 mb-3">
          <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-sm font-medium">Bộ lọc:</span></div>
          <div className="grid grid-cols-3 gap-2">
            <select value={filters.warehouse_id} onChange={(e) => handleFilterChange('warehouse_id', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm"><option value="">Kho</option>{filterOptions.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
            <input type="date" value={filters.start_date} onChange={(e) => handleFilterChange('start_date', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm" />
            <input type="date" value={filters.end_date} onChange={(e) => handleFilterChange('end_date', e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs sm:text-sm" />
          </div>
        </div>
        <input type="text" placeholder="Tìm mã bình..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs sm:text-sm" />
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
                  <Hash className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="font-semibold text-sm">{item.ma_binh}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.ngay_sua_xong ? 'bg-green-100 text-green-700' : item.so_ngay_chua_sua > 7 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {item.so_ngay_chua_sua} ngày
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">Lý do: {item.ly_do_loi || '-'}</div>
              <div className="text-xs text-muted-foreground truncate">KH: {item.khach_hang || '-'}</div>
              <div className="flex items-center justify-between pt-2 border-t borderBorder text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.ngay_phat_hien_loi}</span>
                <span className={item.ngay_sua_xong ? 'text-green-600' : ''}>{item.ngay_sua_xong ? 'Đã sửa' : 'Chưa sửa'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-xl border borderBorder p-8 text-center text-muted-foreground">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không có bình lỗi</p>
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
                  <th className="px-3 py-2 text-left text-xs font-medium">Mã bình</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Lý do lỗi</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Khách hàng</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Ngày phát hiện</th>
                  <th className="px-3 py-2 text-right text-xs font-medium">Ngày chưa sửa</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 text-sm">
                    <td className="px-3 py-2 font-medium">{item.ma_binh}</td>
                    <td className="px-3 py-2 max-w-[120px] truncate">{item.ly_do_loi || '-'}</td>
                    <td className="px-3 py-2 max-w-[100px] truncate">{item.khach_hang || '-'}</td>
                    <td className="px-3 py-2">{item.ngay_phat_hien_loi}</td>
                    <td className="px-3 py-2 text-right"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${item.ngay_sua_xong ? 'bg-green-100 text-green-700' : item.so_ngay_chua_sua > 7 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.so_ngay_chua_sua} ngày</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground"><AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Không có bình lỗi</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground px-2">Tổng: {filteredData.length} bình lỗi</div>
    </div>
  );
};

export default CylinderErrorReport;
