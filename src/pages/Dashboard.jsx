import React, { useState, useEffect } from 'react';
import { ActionCard } from '../components/ui/ActionCard';
import { Search, BarChart3, Users, Package, DollarSign, Warehouse, AlertTriangle, TrendingUp, Monitor, Calendar, FileText, Box } from 'lucide-react';
import { clsx } from 'clsx';
import { actionModuleGroups, allActionSections } from '../constants/actionModuleData';
import { ModuleCard } from '../components/ui/ModuleCard';
import useBookmarkedPaths from '../hooks/useBookmarkedPaths';
import { useReports } from '../hooks/useReports';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('chuc-nang');
  const [searchQuery, setSearchQuery] = useState('');
  const { bookmarkedPaths, isBookmarked, toggleBookmark } = useBookmarkedPaths();
  const { fetchDashboardSummary, fetchCylinderAgingStats, fetchCylinderAgingDetails, loading } = useReports();
  const [summary, setSummary] = useState(null);
  const [agingStats, setAgingStats] = useState(null);
  const [agingDetails, setAgingDetails] = useState([]);

  useEffect(() => {
    if (activeTab === 'thong-ke') {
      loadStats();
    }
  }, [activeTab]);

  const loadStats = async () => {
    const [summaryData, agingData, detailsData] = await Promise.all([
      fetchDashboardSummary(),
      fetchCylinderAgingStats(),
      fetchCylinderAgingDetails({ limit: 10 })
    ]);
    
    setSummary(summaryData);
    setAgingDetails(detailsData || []);

    
    if (agingData && agingData.length > 0) {
      const totalAging = agingData.reduce((acc, curr) => ({
        qua_han_30_60: acc.qua_han_30_60 + (Number(curr.qua_han_30_60) || 0),
        qua_han_60_90: acc.qua_han_60_90 + (Number(curr.qua_han_60_90) || 0),
        qua_han_tren_90: acc.qua_han_tren_90 + (Number(curr.qua_han_tren_90) || 0),
      }), { qua_han_30_60: 0, qua_han_60_90: 0, qua_han_tren_90: 0 });
      setAgingStats(totalAging);
    } else {
      setAgingStats({ qua_han_30_60: 0, qua_han_60_90: 0, qua_han_tren_90: 0 });
    }
  };

  const allSections = allActionSections;
  const moduleCards = actionModuleGroups.map((group) => ({
    icon: group.icon,
    title: group.title,
    description: group.description,
    href: group.path,
    colorScheme: group.colorScheme,
  }));

  const allBookmarkedItems = allSections
    .flatMap((section) => section.items)
    .filter((item) => bookmarkedPaths.includes(item.path));

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'T';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <Link to={link} className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-all hover:border-primary/30 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-xl font-bold mt-1 group-hover:text-primary transition-colors">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );

  const QuickLinkCard = ({ title, description, icon: Icon, link, color }) => (
    <Link to={link} className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-all hover:border-primary/30 flex items-center gap-3 group">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-medium text-sm group-hover:text-primary transition-colors">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 lg:mb-5">
        <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2 text-foreground">
          Chào buổi sáng, <span className="text-primary">Lê Minh Công</span> 👋
        </h1>
      </div>

      <div className={clsx(
        "bg-card rounded-xl shadow-sm border border-border p-1.5 sm:p-1 flex items-center gap-1.5 sm:gap-2 mb-4 lg:mb-5 transition-all duration-300 overflow-hidden",
        activeTab === 'tat-ca' ? "w-full" : "max-w-fit"
      )}>
        <div className="flex bg-muted/20 rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => setActiveTab('chuc-nang')}
            className={clsx(
              "!h-8 sm:!h-auto !px-2 sm:!px-3.5 !py-0 sm:!py-1 rounded-md text-[12px] sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap",
              activeTab === 'chuc-nang' 
                ? "bg-card text-primary shadow-sm ring-1 ring-black/5" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Chức năng
          </button>
          <button
            onClick={() => setActiveTab('thong-ke')}
            className={clsx(
              "!h-8 sm:!h-auto !px-2 sm:!px-3.5 !py-0 sm:!py-1 rounded-md text-[12px] sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap",
              activeTab === 'thong-ke' 
                ? "bg-card text-primary shadow-sm ring-1 ring-black/5" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Thống kê
          </button>
          <button
            onClick={() => setActiveTab('danh-dau')}
            className={clsx(
              "!h-8 sm:!h-auto !px-2 sm:!px-3.5 !py-0 sm:!py-1 rounded-md text-[12px] sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap",
              activeTab === 'danh-dau' 
                ? "bg-card text-primary shadow-sm ring-1 ring-black/5" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Đánh dấu
          </button>
          <button
            onClick={() => setActiveTab('tat-ca')}
            className={clsx(
              "!h-8 sm:!h-auto !px-2 sm:!px-3.5 !py-0 sm:!py-1 rounded-md text-[12px] sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap",
              activeTab === 'tat-ca' 
                ? "bg-card text-primary shadow-sm ring-1 ring-primary/10" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tất cả
          </button>
        </div>

        {activeTab === 'tat-ca' && (
          <div className="flex-1 min-w-0 flex items-center bg-muted/20 rounded-lg px-2 py-1.5 animate-in slide-in-from-left-2 duration-300">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Tìm module..."
              className="bg-transparent border-none outline-none text-[12px] sm:text-[13px] text-foreground w-full ml-1.5 min-w-0 placeholder:text-muted-foreground/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Tab: Thống kê */}
      {activeTab === 'thong-ke' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Tổng quan hệ thống</h2>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard title="Tổng KH" value={summary?.tong_khach_hang || 0} icon={Users} color="bg-blue-100 text-blue-600" link="/bao-cao/khach-hang" />
                  <StatCard title="Tổng đơn" value={summary?.tong_don_hang || 0} icon={Package} color="bg-green-100 text-green-600" link="/bao-cao/don-xuat" />
                  <StatCard title="Doanh thu" value={formatNumber(summary?.tong_doanh_thu || 0)} icon={DollarSign} color="bg-purple-100 text-purple-600" link="/bao-cao/doanh-so-may" />
                  <StatCard title="Tồn kho" value={summary?.binh_ton_kho || 0} icon={Warehouse} color="bg-orange-100 text-orange-600" link="/bao-cao/may-banh" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <StatCard title="Bình lỗi" value={summary?.binh_loi || 0} icon={AlertTriangle} color="bg-red-100 text-red-600" link="/bao-cao/binh-loi" />
                  <StatCard title="Máy tồn" value={summary?.may_ton_kho || 0} icon={Monitor} color="bg-gray-100 text-gray-600" link="/bao-cao/may-banh" />
                  <StatCard title="Máy đã bán" value={summary?.may_da_ban || 0} icon={TrendingUp} color="bg-teal-100 text-teal-600" link="/bao-cao/may-banh" />
                  <StatCard title="KH quá hạn" value={summary?.khach_hang_qua_han || 0} icon={Calendar} color="bg-yellow-100 text-yellow-600" link="/bao-cao/khach-qua-han" />
                </div>
              </>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Truy cập nhanh
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <QuickLinkCard title="Báo cáo KH" description="Theo NV, loại" icon={Users} link="/bao-cao/khach-hang" color="bg-blue-100 text-blue-600" />
              <QuickLinkCard title="Báo cáo NVKD" description="Doanh số" icon={TrendingUp} link="/bao-cao/nhan-vien" color="bg-green-100 text-green-600" />
              <QuickLinkCard title="Đơn xuất" description="Tháng/Năm" icon={Package} link="/bao-cao/don-xuat" color="bg-purple-100 text-purple-600" />
              <QuickLinkCard title="Máy" description="Bán/Thuê/Demo" icon={Monitor} link="/bao-cao/may-banh" color="bg-teal-100 text-teal-600" />
              <QuickLinkCard title="Báo cáo quý" description="Bảo trì" icon={Calendar} link="/bao-cao/bao-cao-quy" color="bg-orange-100 text-orange-600" />
              <QuickLinkCard title="Doanh số" description="Theo máy" icon={DollarSign} link="/bao-cao/doanh-so-may" color="bg-yellow-100 text-yellow-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Cảnh báo
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm">Bình quá hạn</span>
                  <span className="font-bold text-red-600">{summary?.binh_qua_han || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm">Khách hàng quá hạn</span>
                  <span className="font-bold text-yellow-600">{summary?.khach_hang_qua_han || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm">Bình lỗi chưa sửa</span>
                  <span className="font-bold text-orange-600">{summary?.binh_loi || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Thống kê ngày tồn bình (Khách giữ)
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">{'> 30 ngày'} (Tới 60 ngày)</span>
                  <span className="font-bold text-yellow-600">{agingStats?.qua_han_30_60 || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium">{'> 60 ngày'} (Tới 90 ngày)</span>
                  <span className="font-bold text-orange-600">{agingStats?.qua_han_60_90 || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">{'> 90 ngày'} (Đặc biệt chú ý)</span>
                  <span className="font-bold text-red-600">{agingStats?.qua_han_tren_90 || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
              <h3 className="font-semibold flex items-center gap-2">
                <Box className="w-4 h-4 text-primary" />
                Danh sách bình bị khách giữ lâu nhất (Top 10)
              </h3>
            </div>
            <div className="overflow-x-auto">
              {agingDetails && agingDetails.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 text-xs text-muted-foreground">
                      <th className="py-3 px-4 font-medium border-b border-border">Mã bình</th>
                      <th className="py-3 px-4 font-medium border-b border-border">Khách hàng</th>
                      <th className="py-3 px-4 font-medium border-b border-border">Ngày giao</th>
                      <th className="py-3 px-4 font-medium border-b border-border text-right">Số ngày giữ</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {agingDetails.map((item, idx) => (
                      <tr key={item.id || idx} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-foreground">{item.ma_binh}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{item.khach_hang}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">
                          {new Date(item.ngay_giao).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={clsx(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold",
                            item.so_ngay_ton > 90 ? "bg-red-100 text-red-700" :
                            item.so_ngay_ton > 60 ? "bg-orange-100 text-orange-700" :
                            "bg-yellow-100 text-yellow-700"
                          )}>
                            {item.so_ngay_ton} ngày
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Chưa có bình nào bị giữ quá hạn {'>'} 30 ngày. 
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Chức năng */}
      {activeTab === 'chuc-nang' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 lg:gap-4 animate-in fade-in duration-500">
          {moduleCards.map((module, index) => (
            <ActionCard key={`${module.href}-${index}`} {...module} />
          ))}
        </div>
      )}

      {/* Tab: Đánh dấu */}
      {activeTab === 'danh-dau' && (
        allBookmarkedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 animate-in fade-in duration-500">
            {allBookmarkedItems.map((item) => (
              <ModuleCard
                key={item.path}
                {...item}
                isBookmarked={isBookmarked(item.path)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border border-dashed">
            Chưa có module nào được đánh dấu.
          </div>
        )
      )}

      {/* Tab: Tất cả */}
      {activeTab === 'tat-ca' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-6">
            {allSections.map((section, idx) => {
              const filteredItems = section.items.filter(item => 
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredItems.length === 0) return null;

              return (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                  <h2 className="text-[14px] font-bold text-primary mb-2.5 flex items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-1 h-4 bg-primary rounded-full"></span>
                      <span>{section.section}</span>
                    </div>
                    <div className="h-px flex-1 bg-border/60"></div>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                    {filteredItems.map((item, itemIdx) => (
                      <ModuleCard
                        key={item.path || itemIdx}
                        {...item}
                        isBookmarked={isBookmarked(item.path)}
                        onToggleBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
