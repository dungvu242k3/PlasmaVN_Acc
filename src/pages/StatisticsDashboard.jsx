import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Package, DollarSign, AlertTriangle, TrendingUp, Warehouse, PackageX } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, link }) => (
  <Link to={link} className="bg-card rounded-xl p-2 sm:p-3 md:p-4 border border-border hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">{title}</p>
        <p className="text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1">{value}</p>
      </div>
      <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg ${color} shrink-0`}>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      </div>
    </div>
  </Link>
);

const StatisticsDashboard = () => {
  const { fetchDashboardSummary, loading } = useReports();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Thống kê tổng quan</h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Tổng quan hệ thống PlasmaVN</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard title="Tổng KH" value={summary?.tong_khach_hang || 0} icon={Users} color="bg-blue-100 text-blue-600" link="/bao-cao/khach-hang" />
        <StatCard title="Tổng đơn" value={summary?.tong_don_hang || 0} icon={Package} color="bg-green-100 text-green-600" link="/bao-cao/don-xuat" />
        <StatCard title="Doanh thu" value={formatNumber(summary?.tong_doanh_thu || 0)} icon={DollarSign} color="bg-purple-100 text-purple-600" link="/bao-cao/doanh-so-may" />
        <StatCard title="Tồn kho" value={summary?.binh_ton_kho || 0} icon={Warehouse} color="bg-orange-100 text-orange-600" link="/bao-cao/may-banh" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard title="Bình lỗi" value={summary?.binh_loi || 0} icon={AlertTriangle} color="bg-red-100 text-red-600" link="/bao-cao/binh-loi" />
        <StatCard title="Máy tồn" value={summary?.may_ton_kho || 0} icon={PackageX} color="bg-gray-100 text-gray-600" link="/bao-cao/may-banh" />
        <StatCard title="Máy đã bán" value={summary?.may_da_ban || 0} icon={TrendingUp} color="bg-teal-100 text-teal-600" link="/bao-cao/may-banh" />
        <StatCard title="KH quá hạn" value={summary?.khach_hang_qua_han || 0} icon={AlertTriangle} color="bg-yellow-100 text-yellow-600" link="/bao-cao/khach-qua-han" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-card rounded-xl p-3 sm:p-4 md:p-5 border border-border">
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Cảnh báo</h3>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg">
              <span className="text-xs sm:text-sm">Bình quá hạn</span>
              <span className="font-bold text-red-600 text-sm sm:text-base">{summary?.binh_qua_han || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-yellow-50 rounded-lg">
              <span className="text-xs sm:text-sm">KH quá hạn</span>
              <span className="font-bold text-yellow-600 text-sm sm:text-base">{summary?.khach_hang_qua_han || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-orange-50 rounded-lg">
              <span className="text-xs sm:text-sm">Bình lỗi</span>
              <span className="font-bold text-orange-600 text-sm sm:text-base">{summary?.binh_loi || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-3 sm:p-4 md:p-5 border border-border">
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Truy cập nhanh</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Link to="/bao-cao/khach-hang" className="p-2 sm:p-3 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-blue-600 mb-1" />
              <span className="text-xs sm:text-sm font-medium block">KH theo NV</span>
            </Link>
            <Link to="/bao-cao/nhan-vien" className="p-2 sm:p-3 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-green-600 mb-1" />
              <span className="text-xs sm:text-sm font-medium block">NVKD</span>
            </Link>
            <Link to="/bao-cao/binh-qua-han" className="p-2 sm:p-3 bg-red-50 rounded-lg text-center hover:bg-red-100 transition-colors">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-red-600 mb-1" />
              <span className="text-xs sm:text-sm font-medium block">Bình quá hạn</span>
            </Link>
            <Link to="/bao-cao/don-xuat" className="p-2 sm:p-3 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-purple-600 mb-1" />
              <span className="text-xs sm:text-sm font-medium block">Đơn tháng</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
