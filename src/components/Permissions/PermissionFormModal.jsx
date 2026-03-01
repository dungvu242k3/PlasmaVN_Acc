import { CheckCircle2, Save, ShieldCheck, UserCircle, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ACTION_TYPES, MODULE_PERMISSIONS } from '../../constants/permissionConstants';
import { supabase } from '../../supabase/config';

export default function PermissionFormModal({ role, isUserRole, onClose, onSuccess }) {
    const isEdit = !!role;
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [permissionType, setPermissionType] = useState(isEdit ? (isUserRole ? 'user' : 'role') : 'role');
    const [roleName, setRoleName] = useState(isEdit && !isUserRole ? role.name : '');
    const [usersList, setUsersList] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');

    const initialPermissions = MODULE_PERMISSIONS.reduce((acc, module) => {
        acc[module.id] = ACTION_TYPES.reduce((actions, action) => {
            actions[action.id] = false;
            return actions;
        }, {});
        return acc;
    }, {});

    const [permissions, setPermissions] = useState(isEdit ? role.permissions : initialPermissions);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('app_users')
                .select('id, name, username')
                .order('name');
            if (error) throw error;
            setUsersList(data || []);

            if (isEdit && isUserRole) {
                const u = data.find(user => user.username === role.username);
                if (u) setSelectedUserId(u.id);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (permissionType === 'role' && !roleName.trim()) {
            setErrorMsg('Vui lòng nhập Tên nhóm quyền.');
            return;
        }

        if (permissionType === 'user' && !selectedUserId) {
            setErrorMsg('Vui lòng chọn một người dùng.');
            return;
        }

        setIsLoading(true);

        try {
            if (permissionType === 'role') {
                const payload = {
                    name: roleName.trim(),
                    type: 'group',
                    permissions: permissions,
                    updated_at: new Date().toISOString()
                };

                if (isEdit && !isUserRole) {
                    const { error } = await supabase
                        .from('app_roles')
                        .update(payload)
                        .eq('id', role.id);
                    if (error) throw error;
                } else {
                    // Check duplicate for new role
                    const { data: existing } = await supabase
                        .from('app_roles')
                        .select('id')
                        .eq('name', roleName.trim())
                        .eq('type', 'group')
                        .single();
                    if (existing) {
                        setErrorMsg(`Nhóm quyền "${roleName}" đã tồn tại.`);
                        setIsLoading(false);
                        return;
                    }
                    const { error } = await supabase
                        .from('app_roles')
                        .insert([payload]);
                    if (error) throw error;
                }
            } else {
                const user = usersList.find(u => u.id === selectedUserId);
                if (!user) throw new Error('Không tìm thấy người dùng.');

                const userRoleName = `@user:${user.username}`;

                // Upsert to app_roles
                const { error: roleError } = await supabase
                    .from('app_roles')
                    .upsert({
                        name: userRoleName,
                        type: 'user',
                        permissions: permissions,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'name' });
                if (roleError) throw roleError;

                // Update app_users.permissions
                const { error: userError } = await supabase
                    .from('app_users')
                    .update({ permissions: permissions })
                    .eq('id', selectedUserId);
                if (userError) throw userError;
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving permissions:', error);
            setErrorMsg(error.message || 'Có lỗi xảy ra khi lưu phân quyền.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh]">

                {/* Header */}
                <div className="p-6 border-b border-indigo-100 flex items-center justify-between shrink-0 bg-indigo-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">
                                {isEdit ? 'Cấu hình Quyền' : 'Thiết lập Quyền mới'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                                {isEdit ? `Đối tượng: ${role.name}` : 'Tạo ma trận truy cập cho nhóm hoặc cá nhân'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-bold text-rose-600 flex items-center gap-2">
                            <X className="w-5 h-5 shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* Selector */}
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                                <button
                                    onClick={() => setPermissionType('role')}
                                    disabled={isEdit}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${permissionType === 'role' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'} ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Users className="w-4 h-4" />
                                    Nhóm quyền
                                </button>
                                <button
                                    onClick={() => setPermissionType('user')}
                                    disabled={isEdit}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${permissionType === 'user' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'} ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <UserCircle className="w-4 h-4" />
                                    Cá nhân
                                </button>
                            </div>

                            <div className="flex-1 w-full">
                                {permissionType === 'role' ? (
                                    <input
                                        type="text"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        placeholder="Tên nhóm quyền (Thủ kho, Kế toán...)"
                                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold text-base shadow-sm transition-all text-slate-900"
                                    />
                                ) : (
                                    <select
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                        disabled={isEdit}
                                        className={`w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold text-base shadow-sm transition-all text-slate-900 appearance-none ${isEdit ? 'bg-slate-50 opacity-70' : 'cursor-pointer'}`}
                                    >
                                        <option value="">Chọn nhân sự...</option>
                                        {usersList.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Matrix Table */}
                        <div className="w-full overflow-hidden border border-slate-100 rounded-[2rem] shadow-sm">
                            <table className="w-full border-collapse text-left min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-[0.2em] w-1/3 border-r border-slate-100">Phân hệ (Module)</th>
                                        {ACTION_TYPES.map(action => (
                                            <th key={action.id} className="px-4 py-4 text-center border-r border-slate-100 last:border-r-0">
                                                <button
                                                    onClick={() => handleSelectAllColumn(action.id)}
                                                    className="group flex flex-col items-center justify-center gap-1 w-full"
                                                >
                                                    <span className="font-bold text-slate-600 group-hover:text-indigo-600 transition-colors uppercase text-[10px] tracking-wider">{action.label}</span>
                                                    <span className="text-[8px] text-slate-400 font-black group-hover:text-indigo-400 bg-slate-100 group-hover:bg-indigo-50 px-1.5 py-0.5 rounded transition-all uppercase">Cột</span>
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {MODULE_PERMISSIONS.map((module) => (
                                        <tr key={module.id} className="hover:bg-indigo-50/20 transition-colors">
                                            <td className="px-6 py-4 border-r border-slate-50">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{module.label}</span>
                                                    <button
                                                        onClick={() => handleSelectAllRow(module.id)}
                                                        className="text-[9px] font-black text-slate-400 hover:text-indigo-600 hover:bg-white px-2 py-1 rounded-lg transition-all uppercase tracking-widest shadow-sm border border-transparent hover:border-slate-100"
                                                    >
                                                        Dòng
                                                    </button>
                                                </div>
                                            </td>
                                            {ACTION_TYPES.map(action => (
                                                <td key={`${module.id}-${action.id}`} className="px-4 py-4 text-center border-r border-slate-50 last:border-r-0 align-middle">
                                                    <label className="relative flex items-center justify-center cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={permissions[module.id]?.[action.id] || false}
                                                            onChange={() => handleCheckboxChange(module.id, action.id)}
                                                        />
                                                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${permissions[module.id]?.[action.id]
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                                            : 'bg-white border-slate-200 text-transparent group-hover:border-indigo-400'
                                                            }`}>
                                                            <CheckCircle2 className={`w-5 h-5 transition-transform ${permissions[module.id]?.[action.id] ? 'scale-100' : 'scale-0'}`} />
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

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-slate-100 shrink-0 flex items-center justify-end gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                        disabled={isLoading}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-12 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-xl shadow-xl shadow-indigo-200 transition-all flex items-center gap-3 border border-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isEdit ? 'Lưu cập nhật ma trận' : 'Xác nhận Lưu quyền'}
                    </button>
                </div>

            </div>
        </div>
    );
}
