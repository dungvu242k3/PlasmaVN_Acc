import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = true;
    const username = "Quản trị viên";

    const handleLogout = () => {
        // Logout disabled for UI Template
        navigate("/trang-chu");
    };

    // Don't show header on home page (which has its own sidebar/topbar)
    if (location.pathname === "/dang-nhap" || location.pathname === "/" || location.pathname === "/trang-chu") {
        return null;
    }

    return (
        <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
            <div className="mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16 gap-2">
                    <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 font-bold shrink-0">
                            L
                        </div>
                        <span className="text-white text-lg md:text-xl font-bold whitespace-nowrap hidden sm:inline-block">
                            PlasmaVN
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto custom-scrollbar no-scrollbar">
                        <Link
                            to="/trang-chu"
                            className="text-white hover:bg-blue-700 px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0"
                        >
                            Trang chủ
                        </Link>

                        {isAuthenticated && (
                            <div className="flex items-center space-x-2 md:space-x-3 ml-2 md:ml-4 pl-2 md:pl-4 border-l border-blue-500 shrink-0">
                                <span className="text-white px-2 md:px-3 py-2 text-xs sm:text-sm font-medium whitespace-nowrap shrink-0">
                                    <span className="hidden sm:inline">👤 {username}</span>
                                    <span className="sm:hidden" title={username}>👤 Quản trị</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-white hover:bg-red-600 bg-red-500 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0 shadow-sm"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
