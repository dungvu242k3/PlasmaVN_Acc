import { Briefcase, CheckCircle2, Phone, ShieldCheck, UserCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { USER_ROLES, USER_STATUSES } from '../../constants/userConstants';
import { supabase } from '../../supabase/config';

export default function UserFormModal({ user, onClose, onSuccess }) {
    const isEdit = !!user;
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const defaultState = {
        name: '',
        username: '',
        role: USER_ROLES[0].id,
        phone: '',
        status: 'Hoạt động',
    };

    const [formData, setFormData] = useState(defaultState);

    useEffect(() => {
        if (isEdit) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                role: user.role || USER_ROLES[0].id,
                phone: user.phone || '',
                status: user.status || 'Hoạt động',
            });
        }
    }, [user, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, phone: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.name.trim() || !formData.username.trim() || !formData.phone.trim()) {
            setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
            return;
        }

        setIsLoading(true);

        try {
            // Check if username already exists if it's new or changed
            if (!isEdit || formData.username.trim() !== user.username) {
                const { data: existingUser } = await supabase
                    .from('app_users')
                    .select('id')
                    .eq('username', formData.username.trim())
                    .single();

                if (existingUser) {
                    setErrorMsg(`Tên tài khoản "${formData.username}" đã tồn tại.`);
                    setIsLoading(false);
                    return;
                }
            }

            const payload = {
                name: formData.name.trim(),
                username: formData.username.trim(),
                role: formData.role,
                phone: formData.phone.trim(),
                status: formData.status,
                updated_at: new Date().toISOString()
            };

            if (isEdit) {
                const { error } = await supabase
                    .from('app_users')
                    .update(payload)
                    .eq('id', user.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('app_users')
                    .insert([payload]);
                if (error) throw error;
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving user:', error);
            setErrorMsg(error.message || 'Có lỗi xảy ra khi lưu nhân sự.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-indigo-100 flex items-center justify-between shrink-0 bg-indigo-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">
                                {isEdit ? 'Cập nhật Chức danh' : 'Thêm Nhân sự mới'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                                {isEdit ? `Tài khoản: @${user.username}` : 'Khởi tạo tài khoản truy cập hệ thống'}
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
                <div className="p-8 overflow-y-auto">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-bold text-rose-600 flex items-center gap-2">
                            <X className="w-5 h-5 shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    <form id="userForm" onSubmit={handleSubmit} className="space-y-8">

                        {/* Thông tin định danh */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <UserCircle className="w-3.5 h-3.5" />
                                    Họ và tên nhân viên *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="VD: Nguyễn Văn A"
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold text-lg shadow-sm transition-all text-slate-900"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Tên tài khoản (đăng nhập) *
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="VD: nguyenva"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-black text-lg shadow-sm transition-all text-indigo-600 lowercase"
                                    required
                                />
                            </div>
                        </div>

                        {/* Chức vụ và liên hệ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    Vai trò hệ thống *
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold text-base shadow-sm transition-all text-slate-900 appearance-none cursor-pointer"
                                >
                                    {USER_ROLES.map(role => (
                                        <option key={role.id} value={role.id}>{role.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" />
                                    Số điện thoại *
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="09xxxxxxxx..."
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold text-base shadow-sm transition-all text-slate-900"
                                    required
                                />
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                Trạng thái hoạt động *
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {USER_STATUSES.map(status => (
                                    <button
                                        key={status.id}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, status: status.label }))}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm border transition-all ${formData.status === status.label
                                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-100'
                                                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                                            }`}
                                    >
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-slate-100 shrink-0 flex items-center justify-end gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                        disabled={isLoading}
                    >
                        Đóng lại
                    </button>
                    <button
                        type="submit"
                        form="userForm"
                        disabled={isLoading}
                        className="px-12 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-xl shadow-xl shadow-indigo-200 transition-all flex items-center gap-3 border border-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <CheckCircle2 className="w-5 h-5" />
                        )}
                        {isEdit ? 'Lưu cập nhật' : 'Xác nhận Thêm nhân sự'}
                    </button>
                </div>

            </div>
        </div>
    );
}
