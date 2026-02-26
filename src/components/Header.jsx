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
            <div className="mx-auto px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 font-bold">
                            L
                        </div>
                        <span className="text-white text-xl font-bold">
                            PlasmaVN
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/trang-chu"
                            className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                            Trang chủ
                        </Link>

                        {isAuthenticated && (
                            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-blue-500">
                                <span className="text-white px-3 py-2 text-sm font-medium">
                                    👤 {username}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-white hover:bg-red-600 bg-red-500 px-3 py-2 rounded-md text-sm font-medium transition"
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
