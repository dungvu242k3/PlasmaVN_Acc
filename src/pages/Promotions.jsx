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
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Gift className="w-8 h-8 text-blue-600" />
                        Danh sách Khuyến mãi
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Quản lý mã khuyến mãi, khấu trừ bình cho khách hàng và đại lý</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8 space-y-4">
                {/* Status Filter Tabs */}
                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl w-max">
                    {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'active', label: 'Đang hoạt động' },
                        { id: 'expired', label: 'Hết hạn / Vô hiệu' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${filterStatus === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Mã KM hoặc Loại khách hàng..."
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
                        <p className="text-gray-500 font-medium animate-pulse">Đang tải danh sách khuyến mãi...</p>
                    </div>
                ) : filteredPromotions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <Gift className="w-10 h-10 text-blue-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có mã Khuyến mãi nào</h3>
                        <p className="text-gray-500 max-w-sm">Hệ thống hiện chưa ghi nhận chương trình khuyến mãi nào.</p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse min-w-[900px] text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center w-16">#</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Mã KM</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Số bình KM</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Hạn sử dụng</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Loại KH</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Trạng thái</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Kích hoạt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPromotions.map((promo, index) => {
                                    const status = getPromoStatus(promo);
                                    return (
                                        <tr key={promo.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                                <span className="font-bold text-gray-400 group-hover:text-blue-500 transition-colors">{index + 1}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-blue-500" />
                                                    <span className="font-black text-gray-900 text-base">{promo.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl text-lg border border-blue-100">
                                                    {promo.free_cylinders}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                    <CalendarDays className="w-4 h-4 text-gray-400" />
                                                    {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                                    {promo.customer_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center shadow-sm ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={promo.is_active}
                                                        onChange={() => handleToggleActive(promo.id, promo.is_active)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                        Đang rà soát <span className="font-black text-blue-600 mx-1">{filteredPromotions.length}</span> mã khuyến mãi <span className="text-gray-400 mx-1">/</span> Tổng {promotions.length} mã
                    </p>
                </div>
            )}
        </div>
    );
};

export default Promotions;
