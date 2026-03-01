import {
    CheckCircle2,
    Edit,
    Search,
    ShieldCheck,
    Trash2,
    UserCircle,
    Users,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PermissionFormModal from '../components/Permissions/PermissionFormModal';
import { ACTION_TYPES, MODULE_PERMISSIONS } from '../constants/permissionConstants';
import { supabase } from '../supabase/config';

const Permissions = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [roles, setRoles] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'users'
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isUserRole, setIsUserRole] = useState(false);

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

    const handleDeleteRole = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa quyền của "${name}" này không?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('app_roles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            if (activeTab === 'roles') {
                fetchRoles();
            } else {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            alert('❌ Có lỗi xảy ra khi xóa quyền: ' + error.message);
        }
    };

    const handleEditRole = (role, isUser) => {
        setSelectedRole(role);
        setIsUserRole(isUser);
        setIsFormModalOpen(true);
    };

    const handleCreateNew = () => {
        setSelectedRole(null);
        setIsUserRole(false);
        setIsFormModalOpen(true);
    };

    const handleFormSubmitSuccess = () => {
        if (activeTab === 'roles') {
            fetchRoles();
        } else {
            fetchUsers();
        }
        setIsFormModalOpen(false);
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = usersList.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen noise-bg">
            {/* Decorative Background Blobs */}
            <div className="blob blob-indigo w-[500px] h-[500px] -top-20 -left-20 opacity-20"></div>
            <div className="blob blob-violet w-[400px] h-[400px] top-1/2 -right-20 opacity-10"></div>
            <div className="blob blob-blue w-[300px] h-[300px] bottom-10 left-1/4 opacity-10"></div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="hover-lift">
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 transition-transform hover:rotate-3 duration-300">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        Ma trận Phân quyền
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Thiết lập luồng truy cập (Xem, Thêm, Sửa, Xóa) cho từng nhóm tài khoản</p>
                </div>

            </div>

            {/* Filters Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-50 mb-8 space-y-8 glass">
                {/* Tabs */}
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl w-max shadow-inner">
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${activeTab === 'roles' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Users className="w-4 h-4" />
                        Phân cấp Nhóm ({roles.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <UserCircle className="w-4 h-4" />
                        Định danh Cá nhân ({usersList.length})
                    </button>
                </div>

                <div className="relative group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={activeTab === 'roles' ? "Truy tìm nhóm quyền..." : "Truy tìm hồ sơ nhân sự..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-bold text-slate-600 shadow-inner"
                    />
                </div>
            </div>

            {/* List Section */}
            {loading ? (
                <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden flex flex-col justify-center items-center py-32 space-y-6">
                    <div className="w-14 h-14 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-black animate-pulse tracking-[0.2em] text-[10px] uppercase">Đang đồng bộ ma trận quyền...</p>
                </div>
            ) : (activeTab === 'roles' && filteredRoles.length === 0) || (activeTab === 'users' && filteredUsers.length === 0) ? (
                <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 flex flex-col items-center justify-center py-32 px-4 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8">
                        <ShieldCheck className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Dữ liệu phân quyền trống</h3>
                    <p className="text-slate-400 font-bold max-w-sm text-sm">Hiện chưa có cấu hình ma trận quyền nào trong mục này.</p>
                </div>
            ) : (
                <div className="space-y-8 pb-10">
                    {(activeTab === 'roles' ? filteredRoles : filteredUsers).map((item) => (
                        <div key={item.id} className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50 glass">
                            <div className="bg-slate-50/30 px-8 py-6 border-b border-slate-50 flex items-center justify-between group-hover:bg-white transition-colors duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                        {activeTab === 'roles' ? <ShieldCheck className="w-6 h-6" /> : <UserCircle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-black group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</h3>
                                        {activeTab === 'users' && <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 ml-0.5 opacity-60">ID định danh: @{item.username}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {activeTab === 'users' && (
                                        <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 uppercase tracking-widest">
                                            Quyền Ưu tiên (Ghi đè)
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleEditRole(item, activeTab === 'users')}
                                        className="text-slate-400 hover:text-slate-900 transition-all outline-none"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRole(item.id, item.name)}
                                        className="text-slate-400 hover:text-slate-900 transition-all outline-none"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Khung hiển thị tóm tắt quyền */}
                            <div className="p-8 w-full overflow-x-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {MODULE_PERMISSIONS.map(module => {
                                        const modulePerms = item.permissions ? item.permissions[module.id] : {};
                                        return (
                                            <div key={module.id} className="flex flex-col p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm transition-all duration-300">
                                                <div className="flex items-center justify-between mb-5">
                                                    <span className="font-black text-slate-500 text-[10px] uppercase tracking-widest opacity-60">Phân hệ:</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                </div>
                                                <span className="font-black text-black text-lg mb-6 leading-tight group-hover:text-indigo-600 transition-colors">{module.label}</span>
                                                <div className="flex items-center gap-2 flex-wrap mt-auto pt-4 border-t border-slate-100/50">
                                                    {ACTION_TYPES.map(action => (
                                                        <div
                                                            key={action.id}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all
                                                            ${modulePerms?.[action.id]
                                                                    ? `${action.colorClass.replace('bg-', 'bg-').replace('text-', 'text-')} border-transparent shadow-sm translate-y-0 opacity-100`
                                                                    : 'bg-slate-100/30 text-slate-300 border-slate-100 opacity-40 line-through'}`}
                                                        >
                                                            {modulePerms?.[action.id] ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 grayscale" />}
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

            {/* Modal */}
            {isFormModalOpen && (
                <PermissionFormModal
                    role={selectedRole}
                    isUserRole={isUserRole}
                    onClose={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSubmitSuccess}
                />
            )}
        </div>
    );
};

export default Permissions;
