import {
    Layers,
    PackageOpen,
    Search
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MATERIAL_CATEGORIES } from '../constants/materialConstants';
import { supabase } from '../supabase/config';

const Materials = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(MATERIAL_CATEGORIES[0].id); // Mặc định chọn loại đầu tiên
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaterials();
    }, [categoryFilter]);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .eq('category', categoryFilter)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMaterials(data || []);
        } catch (error) {
            console.error('Error fetching materials:', error);
            alert('Lỗi khi tải dữ liệu từ điển vật tư!');
        } finally {
            setLoading(false);
        }
    };

    // Helper functions for dynamic data display
    const currentCategoryDef = MATERIAL_CATEGORIES.find(c => c.id === categoryFilter) || MATERIAL_CATEGORIES[0];

    const filteredMaterials = materials.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.extra_text && material.extra_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (material.extra_number && material.extra_number.toString().includes(searchTerm))
    );

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Layers className="w-8 h-8 text-blue-600" />
                        Từ điển Nguồn Vật tư
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Lưu trữ các danh mục cấu kiện cơ bản phục vụ lắp ráp hệ thống (Bình khí, Máy Plasma)</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium transition-all"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full md:w-64 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-gray-700 transition-all cursor-pointer appearance-none"
                >
                    {MATERIAL_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                </select>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium animate-pulse">Đang tải danh sách {currentCategoryDef.label.toLowerCase()}...</p>
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <PackageOpen className="w-10 h-10 text-blue-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có {currentCategoryDef.label.toLowerCase()} nào</h3>
                        <p className="text-gray-500 max-w-sm">Hãy bấm "Thêm vật tư" để tạo hồ sơ từ điển mới cho danh mục này.</p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px] text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center w-20">#</th>
                                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">{currentCategoryDef.nameLabel || 'Tên vật tư'}</th>

                                    {/* Hiển thị cột phụ nếu category có cấu hình */}
                                    {currentCategoryDef.hasNumberField && (
                                        <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">{currentCategoryDef.numberFieldLabel}</th>
                                    )}
                                    {currentCategoryDef.hasTextField && (
                                        <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">{currentCategoryDef.textFieldLabel}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredMaterials.map((material, index) => (
                                    <tr key={material.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                            <span className="font-bold text-gray-400 group-hover:text-blue-500 transition-colors">{index + 1}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-gray-900">{material.name}</div>
                                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">ID: {material.id.substring(0, 8)}</div>
                                        </td>

                                        {currentCategoryDef.hasNumberField && (
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                                                    {material.extra_number}
                                                </span>
                                            </td>
                                        )}
                                        {currentCategoryDef.hasTextField && (
                                            <td className="px-6 py-5 text-sm text-gray-600">
                                                {material.extra_text || '-'}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            {!loading && filteredMaterials.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4 items-center justify-between text-sm font-medium text-gray-500 px-4">
                    <p>
                        Đang rà soát <span className="font-black text-blue-600 mx-1">{filteredMaterials.length}</span> kết quả <span className="text-gray-400 mx-1">/</span> Tổng {materials.length} {currentCategoryDef.label.toLowerCase()}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Materials;
