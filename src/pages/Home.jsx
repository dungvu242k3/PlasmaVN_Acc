import {
  ActivitySquare,
  ChevronLeft,
  ChevronRight,
  Layout,
  Menu,
  MonitorIcon,
  Package,
  Plus,
  Search,
  Settings,
  Truck,
  UserPlus,
  Users,
  Warehouse
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChangePasswordModal } from "../components/modals/ChangePasswordModal";
import { usePermissions } from "../hooks/usePermissions";

// Navigation and Feature Configuration
const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    label: "Bảng điều khiển",
    icon: Layout,
    path: "/trang-chu",
  },
  {
    id: "orders",
    label: "Danh sách đơn hàng",
    icon: Package,
    path: "/danh-sach-don-hang",
  },
  {
    id: "create-order",
    label: "Tạo đơn hàng",
    icon: Plus,
    path: "/tao-don-hang",
  },
  {
    id: "customers",
    label: "Danh sách khách hàng",
    icon: Users,
    path: "/khach-hang",
  },
  {
    id: "machines",
    label: "Danh sách máy",
    icon: MonitorIcon,
    path: "/danh-sach-may",
  },
  {
    id: "cylinders",
    label: "Danh sách bình",
    icon: ActivitySquare,
    path: "/danh-sach-binh",
  },
  {
    id: "warehouses",
    label: "Danh sách kho",
    icon: Warehouse,
    path: "/danh-sach-kho",
  },
  {
    id: "shippers",
    label: "Đơn vị vận chuyển",
    icon: Truck,
    path: "/danh-sach-dvvc",
  },
];

const DASHBOARD_FEATURES = [
  {
    id: "orders",
    title: "Danh sách đơn hàng",
    description: "Theo dõi, quản lý và xử lý các đơn hàng của hệ thống.",
    icon: Package,
    color: "blue",
    path: "/danh-sach-don-hang",
  },
  {
    id: "create-order",
    title: "Tạo đơn hàng",
    description: "Tạo mới đơn hàng nhanh chóng với các mẫu thông tin có sẵn.",
    icon: Plus,
    color: "green",
    path: "/tao-don-hang",
  },
  {
    id: "customers",
    title: "Danh sách khách hàng",
    description: "Quản lý dữ liệu người liên hệ và theo dõi tài sản, máy móc phân bổ.",
    icon: Users,
    color: "indigo",
    path: "/khach-hang",
  },
  {
    id: "add-customer",
    title: "Thêm khách hàng",
    description: "Tạo hồ sơ khách hàng, đối tác mới vào cơ sở dữ liệu.",
    icon: UserPlus,
    color: "pink",
    path: "/tao-khach-hang",
  },
  {
    id: "machines",
    title: "Danh sách máy",
    description: "Theo dõi trạng thái, vị trí và lịch sử cấp phát máy.",
    icon: MonitorIcon,
    color: "gray",
    path: "/danh-sach-may",
  },
  {
    id: "add-machine",
    title: "Thêm máy mới",
    description: "Khai báo serial, bluetooth và cấu hình máy mới vào kho.",
    icon: Plus,
    color: "purple",
    path: "/tao-may-moi",
  },
  {
    id: "cylinders",
    title: "Danh sách bình",
    description: "Quản lý RFID, thể tích và theo dõi vị trí vỏ bình.",
    icon: ActivitySquare,
    color: "teal",
    path: "/danh-sach-binh",
  },
  {
    id: "add-cylinder",
    title: "Thêm bình mới",
    description: "Nhập vỏ bình mới vào hệ thống thông qua mã quét RFID.",
    icon: Plus,
    color: "orange",
    path: "/tao-binh-moi",
  },
  {
    id: "warehouses",
    title: "Danh sách Kho",
    description: "Quản lý sức chứa, vị trí và thủ kho của từng điểm tập kết.",
    icon: Warehouse,
    color: "amber",
    path: "/danh-sach-kho",
  },
  {
    id: "add-warehouse",
    title: "Thêm kho mới",
    description: "Thêm địa điểm lưu trữ mới vào mạng lưới phân phối.",
    icon: Plus,
    color: "red",
    path: "/tao-kho-moi",
  },
  {
    id: "shippers",
    title: "Đơn vị vận chuyển",
    description: "Quản lý danh sách các nhà xe nội bộ và đơn vị thuê ngoài.",
    icon: Truck,
    color: "cyan",
    path: "/danh-sach-dvvc",
  },
  {
    id: "add-shipper",
    title: "Thêm ĐVVC mới",
    description: "Tạo hồ sơ công ty và người quản lý vận chuyển mới.",
    icon: Plus,
    color: "rose",
    path: "/tao-dvvc",
  },
];

function Home() {
  const location = useLocation();
  const { canView } = usePermissions();

  const [userRole, setUserRole] = useState("admin");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    setUserRole("admin");
  }, []);

  const menuItems = SIDEBAR_ITEMS.map(item => ({
    ...item,
    active: location.pathname === item.path || (item.path === "/trang-chu" && location.pathname === "/"),
    Icon: item.icon
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Desktop & Mobile Offcanvas */}
      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-gray-900/50 z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-50 fixed md:relative h-full ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } ${sidebarCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PlasmaVN
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Mobile close button inside sidebar */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${item.active
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                }`}
            >
              <span className={`${item.active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600 transition-colors"}`}>
                <item.Icon className="w-5 h-5" />
              </span>
              {!sidebarCollapsed && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors ${sidebarCollapsed ? "justify-center" : ""
              }`}
          >
            <Settings className="w-5 h-5 text-gray-400" />
            {!sidebarCollapsed && <span className="font-medium">Cài đặt</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 z-30 shadow-sm gap-4">
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            {/* Hamburger Menu Toggle (Mobile Only) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-gray-900 leading-tight">Quản trị viên</span>
              <span className="text-xs text-blue-600 font-medium tracking-wide uppercase">Admin Hub</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-6 md:py-10 mb-8 md:mb-12">
                <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-2 md:mb-4 tracking-tight px-2">
                  Chào mừng trở lại với PlasmaVN
                </h1>
                <p className="text-sm md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed px-4">
                  Hãy bắt đầu xây dựng dự án của bạn bằng cách truy cập các module bên dưới.
                </p>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {DASHBOARD_FEATURES.map((feature) => (
                  <Link
                    key={feature.id}
                    to={feature.path}
                    className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className={`w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-all duration-500 rotate-0 group-hover:rotate-6`}>
                      <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed mb-6 text-sm">
                      {feature.description}
                    </p>
                    <div className="inline-flex items-center text-blue-600 font-extrabold text-sm">
                      Truy cập ngay
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}

                {/* Placeholder empty state if no features */}
                {DASHBOARD_FEATURES.length === 0 && (
                  <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 italic text-gray-400">
                    Chưa có tính năng nào được cấu hình.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}

export default Home;
