import bcrypt from 'bcryptjs';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../supabase/config';

export function ChangePasswordModal({ isOpen, onClose }) {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            toast.error('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('Mật khẩu mới không khớp!');
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        setLoading(true);

        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }

            const { data: user, error: fetchError } = await supabase
                .from('users')
                .select('password')
                .eq('id', userId)
                .single();

            if (fetchError) throw fetchError;

            const isMatch = bcrypt.compareSync(passwords.currentPassword, user.password);
            if (!isMatch) {
                toast.error('Mật khẩu hiện tại không đúng!');
                setLoading(false);
                return;
            }

            const hashedPassword = bcrypt.hashSync(passwords.newPassword, 10);

            const { error: updateError } = await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('id', userId);

            if (updateError) throw updateError;

            toast.success('Đổi mật khẩu thành công!');
            onClose();
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (error) {
            console.error('Change password error:', error);
            toast.error('Đổi mật khẩu thất bại: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
                    <h3 className="text-xl font-bold text-white">Đổi mật khẩu</h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu hiện tại
                            </label>
                            <input
                                type="password"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="•••••• (Min 6 ký tự)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Xác nhận mật khẩu mới
                            </label>
                            <input
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
