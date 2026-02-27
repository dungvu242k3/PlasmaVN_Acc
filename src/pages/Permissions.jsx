import {
    ActivitySquare,
    CheckCircle2,
    Plus,
    Search,
    ShieldCheck,
    UserCircle,
    Users,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACTION_TYPES, MODULE_PERMISSIONS } from '../constants/permissionConstants';
import { supabase } from '../supabase/config';

const Permissions = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [roles, setRoles] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'users'

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('app_roles')
                .select('*')
                .eq('type', 'group')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRoles(data || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            if (activeTab === 'roles') setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // 1. Lấy danh sách Role là type 'user'
            const { data: userRoles, error: roleError } = await supabase
                .from('app_roles')
                .select('*')
                .eq('type', 'user')
                .order('created_at', { ascending: false });

            if (roleError) throw roleError;

            // 2. Lấy danh sách users để map tên
            const { data: users, error: userError } = await supabase
                .from('app_users')
                .select('name, username');

            if (userError) throw userError;

            // 3. Map thông tin user vào Role-User
            const customPermUsers = (userRoles || []).map(role => {
                const username = role.name.replace('@user:', '');
                const user = users.find(u => u.username === username);
                return {
                    id: role.id,
                    name: user ? user.name : username,
                    username: username,
                    permissions: role.permissions
                };
            });

            setUsersList(customPermUsers);
        } catch (error) {
            console.error('Error fetching users permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = usersList.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                        Quản lý Phân quyền
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Thiết lập luồng truy cập (Xem, Thêm, Sửa, Xóa) cho từng nhóm người dùng</p>
                </div>
                <button
                    onClick={() => navigate('/tao-phan-quyen')}
                    className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto justify-center shadow-blue-200 shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Thêm Quyền mới
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8 space-y-6">

                {/* Tabs */}
                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl w-max">
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'roles' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users className="w-4 h-4" />
                        Nhóm quyền ({roles.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <UserCircle className="w-4 h-4" />
                        Quyền cá nhân ({usersList.length})
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={activeTab === 'roles' ? "Tìm kiếm theo Tên nhóm quyền..." : "Tìm kiếm theo Tên nhân viên..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium transition-all"
                    />
                </div>
            </div>

            {/* List Section */}
            {loading ? (
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-center items-center h-64 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Đang tải biểu đồ quyền...</p>
                </div>
            ) : (activeTab === 'roles' && filteredRoles.length === 0) || (activeTab === 'users' && filteredUsers.length === 0) ? (
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <ShieldCheck className="w-10 h-10 text-blue-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có dữ liệu phân quyền nào</h3>
                    <p className="text-gray-500 max-w-sm">Hệ thống hiện chưa ghi nhận cấu hình ma trận quyền nào trong mục này.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {(activeTab === 'roles' ? filteredRoles : filteredUsers).map((item) => (
                        <div key={item.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                            <div className="bg-gradient-to-r from-gray-50 to-white px-6 md:px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                        {activeTab === 'roles' ? <ShieldCheck className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">{item.name}</h3>
                                        {activeTab === 'users' && <p className="text-sm font-bold text-gray-400">@{item.username}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeTab === 'users' && (
                                        <span className="text-xs font-bold bg-orange-50 text-orange-600 px-3 py-1 rounded-lg border border-orange-100">
                                            Quyền Ghi đè
                                        </span>
                                    )}
                                    <ActivitySquare className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Khung hiển thị tóm tắt quyền */}
                            <div className="px-6 md:px-8 py-6 w-full overflow-x-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {MODULE_PERMISSIONS.map(module => {
                                        const modulePerms = item.permissions ? item.permissions[module.id] : {};
                                        return (
                                            <div key={module.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <span className="font-bold text-gray-700 text-sm mb-3 sm:mb-0 w-1/3">{module.label}</span>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {ACTION_TYPES.map(action => (
                                                        <div
                                                            key={action.id}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                                                            ${modulePerms?.[action.id]
                                                                    ? `${action.colorClass} border-transparent shadow-sm`
                                                                    : 'text-gray-400 bg-white border-gray-200'
                                                                }`}
                                                        >
                                                            {modulePerms?.[action.id] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                            {action.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Footer */}
            {!loading && (
                <div className="mt-6 flex flex-wrap gap-4 items-center justify-between text-sm font-medium text-gray-500 px-4">
                    <p>
                        Đang rà soát <span className="font-black text-blue-600 mx-1">{activeTab === 'roles' ? filteredRoles.length : filteredUsers.length}</span> biểu đồ <span className="text-gray-400 mx-1">/</span> Tổng {activeTab === 'roles' ? roles.length : usersList.length} bản ghi
                    </p>
                </div>
            )}
        </div>
    );
};

export default Permissions;
