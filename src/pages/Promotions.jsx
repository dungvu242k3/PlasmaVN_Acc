import {
    CalendarDays,
    Gift,
    Search,
    Tag
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';

const Promotions = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'expired'

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('app_promotions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPromotions(data || []);
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    const getPromoStatus = (promo) => {
        if (!promo.is_active) return { label: 'Vô hiệu', color: 'text-gray-500 bg-gray-100 border-gray-200' };
        if (promo.end_date < today) return { label: 'Hết hạn', color: 'text-red-600 bg-red-50 border-red-100' };
        if (promo.start_date > today) return { label: 'Chờ kích hoạt', color: 'text-amber-600 bg-amber-50 border-amber-100' };
        return { label: 'Đang hoạt động', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '---';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const filteredPromotions = promotions.filter(promo => {
        const matchSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.customer_type.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'all') return matchSearch;
        if (filterStatus === 'active') return matchSearch && promo.is_active && promo.end_date >= today && promo.start_date <= today;
        if (filterStatus === 'expired') return matchSearch && (promo.end_date < today || !promo.is_active);
        return matchSearch;
    });

    const handleToggleActive = async (id, currentActive) => {
        try {
            const { error } = await supabase
                .from('app_promotions')
                .update({ is_active: !currentActive })
                .eq('id', id);
            if (error) throw error;
            fetchPromotions();
        } catch (error) {
            console.error('Error toggling promotion:', error);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                        <div className="w-14 h-14 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-100 transition-transform hover:scale-105 duration-300">
                            <Gift className="w-8 h-8" />
                        </div>
                        Chương trình Khuyến mãi
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Quản lý mã KM, khấu trừ bình khí và ưu đãi khách hàng</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-50 mb-8 space-y-6">
                {/* Status Filter Tabs */}
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl w-max shadow-inner">
                    {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'active', label: 'Đang hoạt động' },
                        { id: 'expired', label: 'Hết hạn / Vô hiệu' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${filterStatus === tab.id ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Mã KM hoặc Loại khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm font-bold text-slate-600 shadow-inner"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-28 space-y-6">
                        <div className="w-14 h-14 border-4 border-rose-50 border-t-rose-500 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black animate-pulse tracking-[0.2em] text-[10px] uppercase">Đang rà soát danh sách khuyến mãi...</p>
                    </div>
                ) : filteredPromotions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8">
                            <Gift className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Chưa ghi nhận mã Khuyến mãi</h3>
                        <p className="text-slate-400 font-bold max-w-sm text-sm">Hệ thống hiện tại chưa có chương trình ưu đãi nào được thiết lập.</p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse min-w-[1000px] text-left">
                            <thead>
                                <tr className="bg-slate-50/30 border-b border-slate-50">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center w-24">STT</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Mã Khuyến mãi</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">Nội dung ưu đãi</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Thời hạn áp dụng</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Đối tượng</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">Tình trạng</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">Kích hoạt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/50">
                                {filteredPromotions.map((promo, index) => {
                                    const status = getPromoStatus(promo);
                                    return (
                                        <tr key={promo.id} className="hover:bg-rose-50/20 transition-all duration-300 group">
                                            <td className="px-8 py-7 whitespace-nowrap text-center">
                                                <span className="font-black text-slate-300 group-hover:text-rose-500 transition-colors text-lg">{index + 1}</span>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-rose-50 rounded-xl text-rose-500 group-hover:bg-white transition-all transform group-hover:rotate-12">
                                                        <Tag className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-black text-black text-base group-hover:text-rose-600 transition-colors">{promo.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7 text-center">
                                                <span className="font-black text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 group-hover:bg-white group-hover:shadow-sm transition-all text-sm">
                                                    + {promo.free_cylinders} bình khí
                                                </span>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                                                    <CalendarDays className="w-4 h-4 text-slate-300" />
                                                    <span className="whitespace-nowrap">{formatDate(promo.start_date)} — {formatDate(promo.end_date)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <span className="font-black text-[10px] uppercase tracking-widest text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group-hover:bg-white transition-all">
                                                    {promo.customer_type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-7 text-center">
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${status.color.replace('bg-', 'bg-').replace('text-', 'text-')} group-hover:bg-white`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-7 text-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={promo.is_active}
                                                        onChange={() => handleToggleActive(promo.id, promo.is_active)}
                                                    />
                                                    <div className="w-12 h-6.5 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
                                                </label>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Stats Footer */}
            {!loading && filteredPromotions.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4 items-center justify-between text-sm font-medium text-gray-500 px-4">
                    <p>
                        Đang rà soát <span className="font-black text-rose-600 mx-1">{filteredPromotions.length}</span> mã khuyến mãi <span className="text-slate-300 mx-1">/</span> Tổng {promotions.length} mã
                    </p>
                </div>
            )}
        </div>
    );
};

export default Promotions;
