import {
    Briefcase,
    Phone,
    Search,
    ShieldCheck,
    UserCircle,
    Users as UsersIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_STATUSES } from '../constants/userConstants';
import { supabase } from '../supabase/config';

const Users = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('app_users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Lỗi khi tải danh sách người dùng!');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (statusName) => {
        return USER_STATUSES.find(s => s.id === statusName) || USER_STATUSES[0];
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 transition-transform hover:scale-105 duration-300">
                            <UsersIcon className="w-8 h-8" />
                        </div>
                        Nhân sự hệ thống
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Quản lý tài khoản, phân quyền và theo dõi truy cập</p>
                </div>
            </div>

            {/* Content Bar */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-50 mb-8">
                <div className="relative group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm nhân viên, username, SĐT hoặc bộ phận..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-bold text-slate-600 shadow-inner"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-28 space-y-6">
                        <div className="w-14 h-14 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black animate-pulse tracking-[0.2em] text-[10px] uppercase">Đang rà soát danh sách nhân sự...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8">
                            <UserCircle className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Không tìm thấy nhân sự</h3>
                        <p className="text-slate-400 font-bold max-w-sm text-sm">Hiện chưa có tài khoản nào khớp với bộ lọc của bạn.</p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse text-left min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50/30 border-b border-slate-50">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center w-24">STT</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Thông tin cá nhân</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Phương thức liên lạc</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Vai trò truy cập</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/50">
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-indigo-50/20 transition-all duration-300 group">
                                        <td className="px-8 py-7 whitespace-nowrap text-center">
                                            <span className="font-black text-slate-300 group-hover:text-indigo-500 transition-colors text-lg">{index + 1}</span>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm transition-all duration-300">
                                                    <UserCircle className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-black text-base group-hover:text-indigo-600 transition-colors">{user.name}</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5 font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all duration-300 w-max">
                                                <Phone className="w-4 h-4 text-slate-300" />
                                                {user.phone}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 whitespace-nowrap">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-indigo-600 font-black bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl w-max group-hover:bg-white transition-all text-[11px] uppercase tracking-widest">
                                                    {user.role === 'Admin' ? <ShieldCheck className="w-4 h-4 text-indigo-500" /> : <Briefcase className="w-4 h-4 text-indigo-400" />}
                                                    {user.role}
                                                </div>
                                                {user.permissions && Object.keys(user.permissions).length > 0 && (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-lg w-max uppercase tracking-widest">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        + Phân quyền tùy chỉnh
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 whitespace-nowrap text-sm">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent transition-all shadow-sm ${getStatusConfig(user.status).colorClass.replace('bg-', 'bg-').replace('text-', 'text-')} group-hover:bg-white`}>
                                                {user.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            {!loading && filteredUsers.length > 0 && (
                <div className="p-8 bg-slate-50/30 flex items-center justify-between border-t border-slate-50 mt-8 rounded-[2rem] border">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Tổng quy mô nhân sự: <span className="text-indigo-600 mx-2 text-lg">{filteredUsers.length}</span> tài khoản định danh
                    </p>
                </div>
            )}
        </div>
    );
};

export default Users;
