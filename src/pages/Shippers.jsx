import {
    ActivitySquare,
    CheckCircle2,
    Package,
    Search,
    Truck,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';

const Shippers = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [shippers, setShippers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShippers();
    }, [statusFilter]);

    const fetchShippers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('shippers')
                .select('*')
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setShippers(data || []);
        } catch (error) {
            console.error('Error fetching shippers:', error);
            alert('Lỗi khi tải dữ liệu đơn vị vận chuyển!');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Đang hoạt động':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-white';
            case 'Tạm ngưng':
                return 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-white';
            case 'Ngừng hợp tác':
                return 'bg-rose-50 text-rose-500 border-rose-100 group-hover:bg-white';
            default:
                return 'bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-white';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Đang hoạt động':
                return <CheckCircle2 className="w-3.5 h-3.5 mr-2" />;
            case 'Tạm ngưng':
                return <ActivitySquare className="w-3.5 h-3.5 mr-2" />;
            case 'Ngừng hợp tác':
                return <XCircle className="w-3.5 h-3.5 mr-2" />;
            default:
                return null;
        }
    };

    const filteredShippers = shippers.filter(shipper =>
        shipper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipper.manager_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipper.phone.includes(searchTerm)
    );

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 transition-transform hover:scale-105 duration-300">
                            <Truck className="w-8 h-8" />
                        </div>
                        Đơn vị vận chuyển
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Quản lý đối tác vận tải nội bộ và thuê ngoài</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-50 mb-8 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 relative group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Tên ĐVVC, Quản lý, SĐT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-bold text-slate-600 shadow-inner"
                    />
                </div>
                <div className="relative w-full md:w-64">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-6 pr-12 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-black text-slate-600 text-sm transition-all cursor-pointer appearance-none shadow-inner"
                    >
                        <option value="all">Tất cả Trạng thái</option>
                        <option value="Đang hoạt động">Đang hoạt động</option>
                        <option value="Tạm ngưng">Tạm ngưng</option>
                        <option value="Ngừng hợp tác">Ngừng hợp tác</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Search className="w-4 h-4 rotate-90" />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-28 space-y-6">
                        <div className="w-14 h-14 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black animate-pulse tracking-[0.2em] text-[10px] uppercase">Đang rà soát danh sách vận chuyển...</p>
                    </div>
                ) : filteredShippers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8">
                            <Package className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Chưa có đơn vị vận chuyển nào</h3>
                        <p className="text-slate-400 font-bold max-w-sm text-sm">Hãy bổ sung hồ sơ nhà xe mới trong hệ thống quản lý.</p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse min-w-[1000px] text-left">
                            <thead>
                                <tr className="bg-slate-50/30 border-b border-slate-50">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center w-24">STT</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Đơn vị vận chuyển</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Người quản lý</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Số điện thoại</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Địa chỉ</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/50">
                                {filteredShippers.map((shipper, index) => (
                                    <tr key={shipper.id} className="hover:bg-blue-50/20 transition-all duration-300 group">
                                        <td className="px-8 py-7 whitespace-nowrap text-center">
                                            <span className="font-black text-slate-300 group-hover:text-blue-500 transition-colors text-lg">{index + 1}</span>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="font-black text-black text-base group-hover:text-blue-600 transition-colors">{shipper.name}</div>
                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 opacity-50">ID: {shipper.id.substring(0, 8)}</div>
                                        </td>
                                        <td className="px-8 py-7 whitespace-nowrap font-bold text-slate-900">
                                            {shipper.manager_name}
                                        </td>
                                        <td className="px-8 py-7 whitespace-nowrap">
                                            <span className="font-black text-black bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 group-hover:bg-white transition-all text-sm">
                                                {shipper.phone}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7 text-slate-900 font-bold text-sm leading-relaxed max-w-[250px] truncate" title={shipper.address}>
                                            {shipper.address}
                                        </td>
                                        <td className="px-8 py-7 whitespace-nowrap">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border inline-flex items-center transition-all ${getStatusStyle(shipper.status)}`}>
                                                {getStatusIcon(shipper.status)}
                                                {shipper.status}
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
            {!loading && filteredShippers.length > 0 && (
                <div className="p-8 bg-slate-50/30 flex items-center justify-between border-t border-slate-50 mt-8 rounded-[2rem] border">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        Đang hiển thị <span className="text-indigo-600 mx-1">{filteredShippers.length}</span> / {shippers.length} đơn vị vận chuyển
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            Hoạt động: {shippers.filter(s => s.status === 'Đang hoạt động').length}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                            Tạm dừng: {shippers.filter(s => s.status === 'Tạm ngưng').length}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shippers;
