import React, { useState, useEffect } from 'react';
import { ActionCard } from '../components/ui/ActionCard';
import { Search, BarChart3, Users, Package, DollarSign, Warehouse, AlertTriangle, TrendingUp, Monitor, Calendar, FileText, Box, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { actionModuleGroups, allActionSections } from '../constants/actionModuleData';
import { ModuleCard } from '../components/ui/ModuleCard';
import useBookmarkedPaths from '../hooks/useBookmarkedPaths';
import useReports from '../hooks/useReports';

const QuickLinkCard = ({ title, description, icon: Icon, link, color }) => (
  <Link
    to={link}
    className="group relative bg-white rounded-xl p-3 sm:p-3.5 border border-border transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5"
  >
    <div className="flex items-center gap-3">
      <div className={clsx("w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm", color)}>
        <Icon size={20} className="stroke-[2.5px]" />
      </div>
      <div className="min-w-0">
        <h4 className="text-[13px] font-bold text-foreground truncate group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-[11px] text-muted-foreground truncate">{description}</p>
      </div>
    </div>
  </Link>
);

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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
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
        <div className="space-y-6 animate-in fade-in duration-500">
          <div>
            <h3 className="font-bold text-sm mb-3.5 flex items-center gap-2 text-primary">
              <TrendingUp className="w-4 h-4 shrink-0" />
              Truy cập nhanh báo cáo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <QuickLinkCard title="Báo cáo KH" description="Theo NV, loại" icon={Users} link="/bao-cao/khach-hang" color="bg-blue-100 text-blue-600" />
              <QuickLinkCard title="Báo cáo NVKD" description="Doanh số" icon={TrendingUp} link="/bao-cao/nhan-vien" color="bg-emerald-100 text-emerald-600" />
              <QuickLinkCard title="Đơn xuất" description="Tháng/Năm" icon={Package} link="/bao-cao/don-xuat" color="bg-violet-100 text-violet-600" />
              <QuickLinkCard title="Máy" description="Bán/Thuê/Demo" icon={Monitor} link="/bao-cao/may-banh" color="bg-teal-100 text-teal-600" />
              <QuickLinkCard title="Bảo trì quý" description="Chi tiết quý" icon={Calendar} link="/bao-cao/bao-cao-quy" color="bg-orange-100 text-orange-600" />
              <QuickLinkCard title="Doanh số máy" description="Thống kê" icon={DollarSign} link="/bao-cao/doanh-so-may" color="bg-amber-100 text-amber-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-4 sm:p-5 border border-border shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                Cảnh báo vận hành
              </h3>
              <div className="space-y-2.5">
                <Link to="/he-thong/quan-ly-binh" className="flex items-center justify-between p-3.5 bg-red-50/50 hover:bg-red-50 rounded-xl border border-red-100 transition-colors group">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-red-900">Bình quá hạn</span>
                    <span className="text-[11px] text-red-600/70">Số lượng bình cần thu hồi gấp</span>
                  </div>
                  <span className="font-black text-xl text-red-600 group-hover:scale-110 transition-transform">{summary?.binh_qua_han || 0}</span>
                </Link>
                <Link to="/bao-cao/khach-hang" className="flex items-center justify-between p-3.5 bg-amber-50/50 hover:bg-amber-50 rounded-xl border border-amber-100 transition-colors group">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-amber-900">Khách hàng quá hạn</span>
                    <span className="text-[11px] text-amber-600/70">Khách chưa giao dịch trên 3 tháng</span>
                  </div>
                  <span className="font-black text-xl text-amber-600 group-hover:scale-110 transition-transform">{summary?.khach_hang_qua_han || 0}</span>
                </Link>
                <Link to="/he-thong/loi-binh" className="flex items-center justify-between p-3.5 bg-orange-50/50 hover:bg-orange-50 rounded-xl border border-orange-100 transition-colors group">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-orange-900">Bình lỗi chưa sửa</span>
                    <span className="text-[11px] text-orange-600/70">Cần xử lý kỹ thuật</span>
                  </div>
                  <span className="font-black text-xl text-orange-600 group-hover:scale-110 transition-transform">{summary?.binh_loi || 0}</span>
                </Link>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 sm:p-5 border border-border shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                <Calendar className="w-4 h-4" />
                Thống kê ngày tồn bình (Khách giữ)
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">30 - 60 ngày</span>
                    <span className="text-[11px] text-muted-foreground text-yellow-600 font-medium">Bắt đầu nhắc nhở</span>
                  </div>
                  <span className="font-bold text-lg text-foreground">{agingStats?.qua_han_30_60 || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">60 - 90 ngày</span>
                    <span className="text-[11px] text-muted-foreground text-orange-600 font-medium">Cần thu hồi</span>
                  </div>
                  <span className="font-bold text-lg text-foreground">{agingStats?.qua_han_60_90 || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{'> 90 ngày'}</span>
                    <span className="text-[11px] text-muted-foreground text-red-600 font-bold">Đặc biệt chú ý</span>
                  </div>
                  <span className="font-bold text-lg text-foreground">{agingStats?.qua_han_tren_90 || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-4 sm:px-5 border-b border-border flex items-center justify-between bg-muted/10">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Box className="w-4 h-4 text-primary" />
                Top 10 bình bị khách giữ lâu nhất
              </h3>
              <span className="text-[11px] text-muted-foreground italic font-medium">Cập nhật theo thời gian thực</span>
            </div>
            <div className="overflow-x-auto">
              {agingDetails && agingDetails.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground/80">
                      <th className="py-3 px-5 font-bold border-b border-border">Mã bình</th>
                      <th className="py-3 px-5 font-bold border-b border-border">Khách hàng</th>
                      <th className="py-3 px-5 font-bold border-b border-border">Ngày giao</th>
                      <th className="py-3 px-5 font-bold border-b border-border text-right">Số ngày giữ</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {agingDetails.map((item, idx) => (
                      <tr key={item.id || idx} className="border-b border-border/50 hover:bg-primary/[0.02] transition-colors group">
                        <td className="py-3 px-5 font-bold text-foreground group-hover:text-primary transition-colors">{item.ma_binh}</td>
                        <td className="py-3 px-5 text-muted-foreground">{item.khach_hang}</td>
                        <td className="py-3 px-5 text-muted-foreground">
                          {new Date(item.ngay_giao).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <span className={clsx(
                            "inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm",
                            item.so_ngay_ton > 90 ? "bg-red-50 text-red-700 ring-1 ring-red-200" :
                              item.so_ngay_ton > 60 ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200" :
                                "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
                          )}>
                            {item.so_ngay_ton} ngày
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Box className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">Chưa có dữ liệu bình giữ quá 30 ngày.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Chức năng */}
      {activeTab === 'chuc-nang' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 animate-in fade-in duration-500">
          {moduleCards.map((module, index) => (
            <ActionCard key={`${module.href}-${index}`} {...module} />
          ))}
        </div>
      )}

      {/* Tab: Đánh dấu */}
      {activeTab === 'danh-dau' && (
        allBookmarkedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-in fade-in duration-500">
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
          <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <Box className="w-8 h-8 opacity-20" />
              <p className="font-medium">Chưa có module nào được đánh dấu.</p>
            </div>
          </div>
        )
      )}

      {/* Tab: Tất cả */}
      {activeTab === 'tat-ca' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-8">
            {allSections.map((section, idx) => {
              const filteredItems = section.items.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredItems.length === 0) return null;

              return (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                  <h2 className="text-[14px] font-black text-primary mb-3.5 flex items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-1 h-4 bg-primary rounded-full"></span>
                      <span className="uppercase tracking-wider">{section.section}</span>
                    </div>
                    <div className="h-px flex-1 bg-border/60"></div>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
