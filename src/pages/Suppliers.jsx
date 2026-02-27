import {
    Building2,
    Search
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';

const Suppliers = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSuppliers(data || []);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            alert('Lỗi khi tải dữ liệu nhà cung cấp!');
        } finally {
            setLoading(false);
        }
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone.includes(searchTerm) ||
        supplier.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 transition-transform hover:scale-105 duration-300">
                            <Building2 className="w-8 h-8" />
                        </div>
                        Nhà cung cấp
                    </h1>
                    <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Quản lý các đối tác cung cấp vật tư</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-50 mb-10">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Tên, SĐT, Địa chỉ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold text-slate-600 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-80 space-y-6">
                        <div className="w-14 h-14 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black animate-pulse tracking-widest text-[10px] uppercase">Đang tải danh sách nhà cung cấp...</p>
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-28 px-4 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8">
                            <Building2 className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Chưa có nhà cung cấp nào</h3>
                        <p className="text-slate-400 font-medium max-w-sm">Hồ sơ đối tác của bạn sẽ xuất hiện tại đây sau khi được khởi tạo.</p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse min-w-[1000px] text-left">
                            <thead className="bg-slate-50/30 border-b border-slate-50">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center w-24">STT</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Thông tin đối tác</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Số điện thoại</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Địa chỉ liên hệ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/50">
                                {filteredSuppliers.map((supplier, index) => (
                                    <tr key={supplier.id} className="hover:bg-blue-50/20 transition-all duration-300 group">
                                        <td className="px-8 py-7 whitespace-nowrap text-center">
                                            <span className="font-black text-slate-200 group-hover:text-blue-500 transition-colors duration-300 text-lg">{index + 1}</span>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="font-black text-slate-800 text-base group-hover:text-blue-600 transition-colors">{supplier.name}</div>
                                            <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                ID: {supplier.id.substring(0, 8)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 whitespace-nowrap">
                                            <span className="font-black text-slate-800 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                {supplier.phone}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7 text-sm font-bold text-slate-500 leading-relaxed max-w-xs">
                                            {supplier.address}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            {!loading && filteredSuppliers.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-4 items-center justify-between text-[10px] font-black text-slate-400 px-6 uppercase tracking-[0.15em]">
                    <p>
                        Hiển thị <span className="text-blue-600 ml-1">{filteredSuppliers.length}</span> / {suppliers.length} đối tác hệ thống
                    </p>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
