import {
    CheckCircle2,
    Save,
    ShieldPlus,
    Tag,
    UserCircle,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ACTION_TYPES, MODULE_PERMISSIONS } from '../constants/permissionConstants';
import { supabase } from '../supabase/config';

const CreatePermission = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const editRole = state?.role;
    const isUserRoleEdit = state?.isUserRole;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [permissionType, setPermissionType] = useState(editRole ? (isUserRoleEdit ? 'user' : 'role') : 'role');
    const [roleName, setRoleName] = useState(editRole && !isUserRoleEdit ? editRole.name : '');
    const [usersList, setUsersList] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');

    const [rolesList, setRolesList] = useState([]);

    const fetchRoles = async () => {
        try {
            const { data, error } = await supabase
                .from('app_roles')
                .select('name, permissions')
                .eq('type', 'group')
                .order('name');
            if (!error && data) setRolesList(data);
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from('app_users')
                    .select('id, name, username, role')
                    .order('name');
                if (!error && data) {
                    setUsersList(data);
                    if (isUserRoleEdit && editRole) {
                        const u = data.find(user => user.username === editRole.username);
                        if (u) setSelectedUserId(u.id);
                    } else if (data.length > 0) {
                        setSelectedUserId(data[0].id);
                    }
                }
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };
        fetchUsers();
        fetchRoles();
    }, []);

    // Khởi tạo ma trận phân quyền: mặc định tất cả là false
    const initialPermissions = MODULE_PERMISSIONS.reduce((acc, module) => {
        acc[module.id] = ACTION_TYPES.reduce((actions, action) => {
            actions[action.id] = false;
            return actions;
        }, {});
        return acc;
    }, {});

    const [permissions, setPermissions] = useState(editRole ? editRole.permissions : initialPermissions);

    // Fetch existing permissions when User or Role is selected
    useEffect(() => {
        const loadExisting = async () => {
            if (permissionType === 'user' && selectedUserId) {
                const user = usersList.find(u => u.id === selectedUserId);
                if (user && user.role) {
                    // Fetch permissions for this specific user role (@user:username)
                    // or their group role if they don't have a custom one yet?
                    // User said: "phân quyền người dùng ... lưu vào app_role"
                    // We check if @user:username exists first.
                    const userRoleName = `@user:${user.username}`;
                    const { data: roleData } = await supabase
                        .from('app_roles')
                        .select('permissions')
                        .eq('name', userRoleName)
                        .single();

                    if (roleData) {
                        setPermissions(roleData.permissions);
                    } else {
                        // If no custom user role, maybe load their current group role perms as starting point?
                        const { data: groupRoleData } = await supabase
                            .from('app_roles')
                            .select('permissions')
                            .eq('name', user.role)
                            .single();
                        setPermissions(groupRoleData?.permissions || initialPermissions);
                    }
                }
            } else if (permissionType === 'role' && roleName) {
                const existing = rolesList.find(r => r.name === roleName);
                if (existing) {
                    setPermissions(existing.permissions);
                } else {
                    setPermissions(initialPermissions);
                }
            }
        };
        // Tắt tính năng tự tải đè lên khi đang ở chế độ Edit ban đầu
        if (!editRole) {
            loadExisting();
        }
    }, [permissionType, selectedUserId, roleName, usersList, rolesList, editRole]);

    const handleCheckboxChange = (moduleId, actionId) => {
        setPermissions(prev => ({
            ...prev,
            [moduleId]: {
                ...prev[moduleId],
                [actionId]: !prev[moduleId][actionId]
            }
        }));
    };

    const handleSelectAllRow = (moduleId) => {
        const isAllRowChecked = ACTION_TYPES.every(action => permissions[moduleId][action.id]);

        setPermissions(prev => ({
            ...prev,
            [moduleId]: ACTION_TYPES.reduce((acc, action) => ({
                ...acc,
                [action.id]: !isAllRowChecked
            }), {})
        }));
    };

    const handleSelectAllColumn = (actionId) => {
        const isAllColumnChecked = MODULE_PERMISSIONS.every(module => permissions[module.id][actionId]);

        setPermissions(prev => {
            const newState = { ...prev };
            MODULE_PERMISSIONS.forEach(module => {
                newState[module.id] = {
                    ...newState[module.id],
                    [actionId]: !isAllColumnChecked
                };
            });
            return newState;
        });
    };

    const handleCreateRole = async () => {
        setIsSubmitting(true);
        try {
            if (permissionType === 'role') {
                if (!roleName.trim()) {
                    alert('Vui lòng nhập Tên quyền (Nhóm phân quyền) bắt buộc (*)');
                    setIsSubmitting(false);
                    return;
                }

                // Check trùng tên quyền
                const { data: existingRole } = await supabase
                    .from('app_roles')
                    .select('id')
                    .eq('name', roleName.trim())
                    .eq('type', 'group')
                    .single();

                if (existingRole) {
                    alert(`Tên quyền "${roleName}" đã tồn tại. Vui lòng chọn tên khác.`);
                    setIsSubmitting(false);
                    return;
                }

                const payload = {
                    name: roleName.trim(),
                    type: 'group',
                    permissions: permissions
                };

                if (editRole && !isUserRoleEdit) {
                    const { error } = await supabase
                        .from('app_roles')
                        .update(payload)
                        .eq('id', editRole.id);

                    if (error) throw error;
                    alert('🎉 Đã cập nhật Nhóm phân quyền thành công!');
                } else {
                    const { error } = await supabase
                        .from('app_roles')
                        .insert([payload]);

                    if (error) throw error;
                    alert('🎉 Đã thêm Nhóm phân quyền mới thành công!');
                }
                navigate('/phan-quyen');
            } else {
                if (!selectedUserId) {
                    alert('Vui lòng chọn một người dùng (*)');
                    setIsSubmitting(false);
                    return;
                }

                // Lấy thông tin username của user được chọn
                const user = usersList.find(u => u.id === selectedUserId);
                if (!user) throw new Error('Không tìm thấy thông tin người dùng.');

                const userRoleName = `@user:${user.username}`;

                // Upsert vào app_roles với type='user' (lưu trữ backup)
                const { error: roleError } = await supabase
                    .from('app_roles')
                    .upsert({
                        name: userRoleName,
                        type: 'user',
                        permissions: permissions
                    }, { onConflict: 'name' });

                if (roleError) throw roleError;

                // Cập nhật permissions tùy chỉnh trực tiếp trên app_users
                // KHÔNG ghi đè trường role — giữ nguyên vai trò gốc (Admin, Thủ kho...)
                const { error: userUpdateError } = await supabase
                    .from('app_users')
                    .update({ permissions: permissions })
                    .eq('id', selectedUserId);

                if (userUpdateError) throw userUpdateError;

                alert(`🎉 Đã cấp quyền riêng cho Người dùng "${user.name}" thành công!`);
                navigate('/phan-quyen');
            }

            // Refresh lists to reflect new roles
            fetchRoles();

        } catch (error) {
            console.error('Error creating permissions:', error);
            alert('❌ Có lỗi xảy ra: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setPermissionType('role');
        setRoleName('');
        if (usersList.length > 0) setSelectedUserId(usersList[0].id);
        setPermissions(initialPermissions);
    };

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto font-sans min-h-screen noise-bg">
            {/* Animated Blobs */}
            <div className="blob blob-indigo w-[400px] h-[400px] -top-20 -right-20 opacity-20"></div>
            <div className="blob blob-violet w-[350px] h-[350px] bottom-1/4 -left-20 opacity-15"></div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 md:mb-8 relative z-10">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <ShieldPlus className="w-8 h-8 text-indigo-600" />
                    {editRole ? 'Cập nhật quyền' : 'Thêm quyền / Nhóm người dùng'}
                </h1>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-white overflow-hidden relative z-10">
                <div className="p-6 md:p-10 space-y-10">

                    {/* Section 1: Đối tượng Phân quyền */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 md:pb-4">
                            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">1</span>
                            <h3 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight">Đối tượng Phân quyền</h3>
                        </div>

                        {/* Tabs Selection */}
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-max">
                            <button
                                onClick={() => setPermissionType('role')}
                                disabled={!!editRole}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${permissionType === 'role' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'} ${editRole ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <Users className="w-4 h-4" />
                                Theo Nhóm quyền (Role)
                            </button>
                            <button
                                onClick={() => setPermissionType('user')}
                                disabled={!!editRole}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${permissionType === 'user' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'} ${editRole ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <UserCircle className="w-4 h-4" />
                                Theo Người dùng (User)
                            </button>
                        </div>

                        <div className="max-w-2xl mt-4">
                            {permissionType === 'role' ? (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5" />
                                        Tên quyền (Nhóm phân quyền) *
                                    </label>
                                    <input
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        placeholder="Ví dụ: Thủ kho tổng, Quản lý kho nhánh..."
                                        className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-lg shadow-sm transition-all text-gray-900"
                                    />
                                    <p className="text-xs text-gray-400 ml-2 font-medium mt-1">Sẽ tạo ra 1 Nhóm mẫu mới để gán chung cho nhiều người.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                        <UserCircle className="w-3.5 h-3.5" />
                                        Chọn Tài khoản người dùng *
                                    </label>
                                    <select
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                        disabled={!!editRole}
                                        className={`w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-lg shadow-sm transition-all text-gray-900 appearance-none ${editRole ? 'opacity-70 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
                                    >
                                        {usersList.length === 0 && <option value="">Đang tải danh sách người dùng...</option>}
                                        {usersList.map(user => (
                                            <option key={user.id} value={user.id}>{user.name} ({user.username})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-400 ml-2 font-medium mt-1">Sẽ lưu đè quyền riêng biệt cho tài khoản này (mức độ ưu tiên cao nhất).</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Ma trận phân quyền */}
                    <div className="space-y-4 md:space-y-6 bg-gray-50/50 -mx-6 md:-mx-10 px-6 md:px-10 py-8 border-y border-gray-50">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3 md:pb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">2</span>
                                <h3 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight">Cấu hình tính năng</h3>
                            </div>
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">Ma trận phân quyền chi tiết</span>
                        </div>

                        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 font-black text-sm text-gray-700 w-1/3 border-r border-gray-200">Phân hệ (Module)</th>
                                        {ACTION_TYPES.map(action => (
                                            <th key={action.id} className="px-6 py-4 text-center border-r border-gray-200 last:border-r-0">
                                                <button
                                                    onClick={() => handleSelectAllColumn(action.id)}
                                                    className="group flex flex-col items-center justify-center gap-1 w-full mx-auto"
                                                >
                                                    <span className="font-bold text-gray-600 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-wider">{action.label}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium group-hover:text-blue-400 bg-gray-100 group-hover:bg-blue-50 px-2 py-0.5 rounded-md transition-all">Chọn cột</span>
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {MODULE_PERMISSIONS.map((module, index) => (
                                        <tr key={module.id} className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                            <td className="px-6 py-4 border-r border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-gray-800 text-sm">{module.label}</span>
                                                    <button
                                                        onClick={() => handleSelectAllRow(module.id)}
                                                        className="text-[10px] font-bold text-gray-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                                    >
                                                        Chọn dòng
                                                    </button>
                                                </div>
                                            </td>
                                            {ACTION_TYPES.map(action => (
                                                <td key={`${module.id}-${action.id}`} className="px-6 py-4 text-center border-r border-gray-100 last:border-r-0 align-middle">
                                                    <label className="relative flex items-center justify-center cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={permissions[module.id]?.[action.id] || false}
                                                            onChange={() => handleCheckboxChange(module.id, action.id)}
                                                        />
                                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${permissions[module.id]?.[action.id]
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                                            : 'bg-white border-gray-300 text-transparent group-hover:border-blue-400'
                                                            }`}>
                                                            <CheckCircle2 className={`w-4 h-4 transition-transform ${permissions[module.id]?.[action.id] ? 'scale-100' : 'scale-0'}`} />
                                                        </div>
                                                    </label>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 pb-20 md:p-10 bg-white border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="hidden md:block text-gray-400 text-sm font-medium italic">* Phân quyền có hiệu lực tự động cho tất cả người dùng thuộc nhóm này.</p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button
                            onClick={resetForm}
                            className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all shadow-sm text-center"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleCreateRole}
                            disabled={isSubmitting}
                            className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-white text-lg shadow-xl shadow-blue-200 transition-all flex justify-center items-center gap-3 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                        >
                            {isSubmitting ? 'Đang lưu...' : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {editRole ? 'Cập nhật quyền' : 'Lưu quyền'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePermission;
