import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Package, DollarSign, Warehouse, AlertTriangle, TrendingUp, Monitor, Calendar, FileText } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { SummaryCard } from '../components/ui/SummaryCard';
import { ModuleCard } from '../components/ui/ModuleCard';
import useBookmarkedPaths from '../hooks/useBookmarkedPaths';

const StatisticsDashboard = () => {
  const { fetchDashboardSummary, loading } = useReports();
  const [summary, setSummary] = useState(null);
  const { isBookmarked, toggleBookmark } = useBookmarkedPaths();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await fetchDashboardSummary();
    setSummary(data);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'T';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-10">
      <div>
        <h1 className="text-xl lg:text-3xl font-bold flex items-center gap-3 text-foreground mb-1">
          <BarChart3 className="w-8 h-8 text-primary" />
          Trung tâm Thống kê
        </h1>
        <p className="text-muted-foreground text-sm pl-11">Báo cáo số liệu và phân tích hoạt động hệ thống PlasmaVN</p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Tổng quan hệ thống</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard title="Tổng KH" value={summary?.tong_khach_hang || 0} icon={Users} colorScheme="blue" path="/bao-cao/khach-hang" />
            <SummaryCard title="Tổng đơn" value={summary?.tong_don_hang || 0} icon={Package} colorScheme="green" path="/bao-cao/don-xuat" />
            <SummaryCard title="Doanh thu" value={formatNumber(summary?.tong_doanh_thu || 0)} icon={DollarSign} colorScheme="purple" path="/bao-cao/doanh-so-may" />
            <SummaryCard title="Tồn kho" value={summary?.binh_ton_kho || 0} icon={Warehouse} colorScheme="orange" path="/bao-cao/may-banh" />

            <SummaryCard title="Bình lỗi" value={summary?.binh_loi || 0} icon={AlertTriangle} colorScheme="red" path="/bao-cao/binh-loi" />
            <SummaryCard title="Máy tồn" value={summary?.may_ton_kho || 0} icon={Monitor} colorScheme="slate" path="/bao-cao/may-banh" />
            <SummaryCard title="Máy đã bán" value={summary?.may_da_ban || 0} icon={TrendingUp} colorScheme="teal" path="/bao-cao/may-banh" />
            <SummaryCard title="KH quá hạn" value={summary?.khach_hang_qua_han || 0} icon={Calendar} colorScheme="yellow" path="/bao-cao/khach-qua-han" />
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Báo cáo nhanh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <ModuleCard title="Báo cáo khách hàng" description="Theo nhân viên, loại" icon={Users} path="/bao-cao/khach-hang" colorScheme="blue" isBookmarked={isBookmarked("/bao-cao/khach-hang")} onToggleBookmark={toggleBookmark} />
          <ModuleCard title="Báo cáo NVKD" description="Báo cáo doanh số" icon={TrendingUp} path="/bao-cao/nhan-vien" colorScheme="green" isBookmarked={isBookmarked("/bao-cao/nhan-vien")} onToggleBookmark={toggleBookmark} />
          <ModuleCard title="Đơn hàng" description="Theo tháng, năm" icon={Package} path="/bao-cao/don-xuat" colorScheme="purple" isBookmarked={isBookmarked("/bao-cao/don-xuat")} onToggleBookmark={toggleBookmark} />
          <ModuleCard title="Quản lý máy" description="Bán/Cho thuê/Demo" icon={Monitor} path="/bao-cao/may-banh" colorScheme="teal" isBookmarked={isBookmarked("/bao-cao/may-banh")} onToggleBookmark={toggleBookmark} />
          <ModuleCard title="Báo cáo quý" description="Chi tiết bảo trì" icon={Calendar} path="/bao-cao/bao-cao-quy" colorScheme="orange" isBookmarked={isBookmarked("/bao-cao/bao-cao-quy")} onToggleBookmark={toggleBookmark} />
          <ModuleCard title="Báo cáo doanh số" description="Thống kê theo máy" icon={DollarSign} path="/bao-cao/doanh-so-may" colorScheme="yellow" isBookmarked={isBookmarked("/bao-cao/doanh-so-may")} onToggleBookmark={toggleBookmark} />
        </div>
      </div>

      <div className="pt-2">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-red-500">
          <AlertTriangle className="w-4 h-4" />
          Cảnh báo rủi ro
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SummaryCard title="Bình quá hạn" value={summary?.binh_qua_han || 0} icon={AlertTriangle} colorScheme="red" path="/bao-cao/binh-loi" />
          <SummaryCard title="Khách hàng quá hạn" value={summary?.khach_hang_qua_han || 0} icon={Calendar} colorScheme="yellow" path="/bao-cao/khach-qua-han" />
          <SummaryCard title="Bình lỗi chưa sửa" value={summary?.binh_loi || 0} icon={AlertTriangle} colorScheme="orange" path="/bao-cao/binh-loi" />
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
