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
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Tạm ngưng':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Ngừng hợp tác':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Đang hoạt động':
                return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
            case 'Tạm ngưng':
                return <ActivitySquare className="w-4 h-4 mr-1.5" />;
            case 'Ngừng hợp tác':
                return <XCircle className="w-4 h-4 mr-1.5" />;
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
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Truck className="w-8 h-8 text-blue-600" />
                        Danh sách ĐVVC
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Quản lý các đơn vị vận chuyển nội bộ và thuê ngoài</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Tên ĐVVC, Quản lý, SĐT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full md:w-56 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-gray-700 transition-all cursor-pointer appearance-none"
                >
                    <option value="all">Tất cả Trạng thái</option>
                    <option value="Đang hoạt động">Đang hoạt động</option>
                    <option value="Tạm ngưng">Tạm ngưng</option>
                    <option value="Ngừng hợp tác">Ngừng hợp tác</option>
                </select>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium animate-pulse">Đang tải danh sách ĐVVC...</p>
                    </div>
                ) : filteredShippers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <Package className="w-10 h-10 text-blue-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn vị vận chuyển nào</h3>
                        <p className="text-gray-500 max-w-sm">Hãy bấm "Thêm ĐVVC" để tạo một hồ sơ nhà xe mới trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse min-w-[1000px] text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center w-20">#</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Tên ĐVVC / Công ty</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Người quản lý</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Số điện thoại</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Địa chỉ</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredShippers.map((shipper, index) => (
                                    <tr key={shipper.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                            <span className="font-bold text-gray-400 group-hover:text-blue-500 transition-colors">{index + 1}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-gray-900">{shipper.name}</div>
                                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">ID: {shipper.id.substring(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="font-semibold text-gray-700">{shipper.manager_name}</span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                                {shipper.phone}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-600">
                                            {shipper.address}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`px-4 py-2 rounded-xl text-sm font-bold border inline-flex items-center shadow-sm ${getStatusStyle(shipper.status)}`}>
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
                <div className="mt-6 flex flex-wrap gap-4 items-center justify-between text-sm font-medium text-gray-500 px-4">
                    <p>
                        Đang rà soát <span className="font-black text-blue-600 mx-1">{filteredShippers.length}</span> ĐVVC <span className="text-gray-400 mx-1">/</span> Tổng {shippers.length} nhà xe
                    </p>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span> Đang hoạt động
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-200"></span> Đã khóa
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shippers;
