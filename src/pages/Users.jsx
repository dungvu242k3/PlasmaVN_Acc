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
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <UsersIcon className="w-8 h-8 text-blue-600" />
                        Danh sách Người dùng
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Quản lý tài khoản, phân quyền tự động và theo dõi lịch sử truy cập</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Tên, Username, SĐT hoặc Vai trò..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium transition-all"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium animate-pulse">Đang tải danh sách người dùng...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <UserCircle className="w-10 h-10 text-blue-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy người dùng nào</h3>
                        <p className="text-gray-500 max-w-sm">Danh sách tài khoản nhân sự hiện đang trống hoặc không có kết quả phù hợp với từ khóa.</p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center w-20">#</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Tài khoản & Cá nhân</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Liên hệ</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Vai trò</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                            <span className="font-bold text-gray-400 group-hover:text-blue-500 transition-colors">{index + 1}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                    <UserCircle className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-base">{user.name}</div>
                                                    <div className="text-sm font-medium text-gray-500">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {user.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-blue-700 font-semibold bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg w-max">
                                                    {user.role === 'Admin' ? <ShieldCheck className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                                    {user.role}
                                                </div>
                                                {user.permissions && Object.keys(user.permissions).length > 0 && (
                                                    <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-md w-max">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        + Quyền cá nhân (Ghi đè)
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`px-4 py-1.5 rounded-xl text-sm font-bold border inline-flex items-center shadow-sm ${getStatusConfig(user.status).colorClass}`}>
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
                <div className="mt-6 flex flex-wrap gap-4 items-center justify-between text-sm font-medium text-gray-500 px-4">
                    <p>
                        Đang rà soát <span className="font-black text-blue-600 mx-1">{filteredUsers.length}</span> kết quả <span className="text-gray-400 mx-1">/</span> Tổng {users.length} người dùng
                    </p>
                </div>
            )}
        </div>
    );
};

export default Users;
