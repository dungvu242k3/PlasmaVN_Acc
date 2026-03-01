import {
    Edit,
    Layers,
    PackageOpen,
    Search,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialFormModal from '../components/Materials/MaterialFormModal';
import { MATERIAL_CATEGORIES } from '../constants/materialConstants';
import { supabase } from '../supabase/config';

const Materials = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(MATERIAL_CATEGORIES[0].id); // Mặc định chọn loại đầu tiên
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

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

    const handleDeleteMaterial = async (id, name) => {
        if (!window.confirm(`Bạn có chắc muốn xóa vật tư "${name}" không?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('materials')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchMaterials();
        } catch (error) {
            console.error('Error deleting material:', error);
            alert('Lỗi khi xóa vật tư: ' + error.message);
        }
    };

    const handleEditMaterial = (material) => {
        setSelectedMaterial(material);
        setIsFormModalOpen(true);
    };

    const handleCreateNew = () => {
        setSelectedMaterial(null);
        setIsFormModalOpen(true);
    };

    const handleFormSubmitSuccess = () => {
        fetchMaterials();
        setIsFormModalOpen(false);
    };

    // Helper functions for dynamic data display
    const currentCategoryDef = MATERIAL_CATEGORIES.find(c => c.id === categoryFilter) || MATERIAL_CATEGORIES[0];

    const filteredMaterials = materials.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.extra_text && material.extra_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (material.extra_number && material.extra_number.toString().includes(searchTerm))
    );

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen noise-bg">
            {/* Decorative Background Blobs */}
            <div className="blob blob-blue w-[500px] h-[500px] -top-20 -left-20 opacity-20"></div>
            <div className="blob blob-indigo w-[400px] h-[400px] top-1/2 -right-20 opacity-10"></div>
            <div className="blob blob-cyan w-[300px] h-[300px] bottom-10 left-1/4 opacity-10"></div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="hover-lift">
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 transition-transform hover:rotate-3 duration-300">
                            <Layers className="w-8 h-8" />
                        </div>
                        Nguồn vật tư
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Lưu trữ danh mục cấu kiện cơ bản phục vụ lắp ráp</p>
                </div>


            </div>

            {/* Filters Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-50 mb-8 flex flex-col md:flex-row gap-6 items-center glass">
                <div className="flex-1 relative group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-bold text-slate-600 shadow-inner"
                    />
                </div>
                <div className="relative w-full md:w-64">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-6 pr-12 py-4 bg-slate-50/50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-black text-slate-600 text-sm transition-all cursor-pointer appearance-none shadow-inner"
                    >
                        {MATERIAL_CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Search className="w-4 h-4 rotate-90" />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden glass">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-28 space-y-6">
                        <div className="w-14 h-14 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black animate-pulse tracking-[0.2em] text-[10px] uppercase">Đang tải danh sách {currentCategoryDef.label.toLowerCase()}...</p>
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8">
                            <PackageOpen className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Chưa có {currentCategoryDef.label.toLowerCase()} nào</h3>
                        <p className="text-slate-400 font-bold max-w-sm text-sm">Hãy bổ sung thêm vật tư để xây dựng kho cơ sở dữ liệu.</p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse min-w-[800px] text-left">
                            <thead className="glass-header">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center w-24">STT</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{currentCategoryDef.nameLabel || 'Tên vật tư'}</th>

                                    {/* Hiển thị cột phụ nếu category có cấu hình */}
                                    {currentCategoryDef.hasNumberField && (
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">{currentCategoryDef.numberFieldLabel}</th>
                                    )}
                                    {currentCategoryDef.hasTextField && (
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{currentCategoryDef.textFieldLabel}</th>
                                    )}
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-center sticky right-0 z-10 bg-slate-50/80 backdrop-blur-md border-l border-slate-50 shadow-sm">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/50">
                                {filteredMaterials.map((material, index) => (
                                    <tr key={material.id} className="hover:bg-blue-50/20 transition-all duration-300 group">
                                        <td className="px-8 py-7 whitespace-nowrap text-center">
                                            <span className="font-black text-slate-300 group-hover:text-blue-500 transition-colors text-lg">{index + 1}</span>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="font-black text-black text-base group-hover:text-blue-600 transition-colors">{material.name}</div>
                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 opacity-50">ID: {material.id.substring(0, 8)}</div>
                                        </td>

                                        {currentCategoryDef.hasNumberField && (
                                            <td className="px-8 py-7 whitespace-nowrap text-center">
                                                <span className="font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 group-hover:bg-white group-hover:shadow-sm transition-all text-sm">
                                                    {material.extra_number}
                                                </span>
                                            </td>
                                        )}
                                        {currentCategoryDef.hasTextField && (
                                            <td className="px-8 py-7 text-slate-900 font-bold text-sm leading-relaxed">
                                                {material.extra_text || <span className="text-slate-300 italic opacity-50">-</span>}
                                            </td>
                                        )}
                                        <td className="px-8 py-7 text-center whitespace-nowrap sticky right-0 z-10 bg-white/80 backdrop-blur-md border-l border-slate-50 group-hover:bg-blue-50/40 transition-all">
                                            <div className="flex items-center justify-center gap-5">
                                                <button
                                                    onClick={() => handleEditMaterial(material)}
                                                    className="text-slate-400 hover:text-slate-900 transition-all outline-none"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMaterial(material.id, material.name)}
                                                    className="text-slate-400 hover:text-slate-900 transition-all outline-none"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            {!loading && filteredMaterials.length > 0 && (
                <div className="p-8 bg-slate-50/30 flex items-center justify-between border-t border-slate-50 mt-8 rounded-[2rem] border">
                    <p className="text-[10px] font-black text-slate-500 px-6 uppercase tracking-[0.15em]">
                        Hiển thị <span className="text-indigo-600 mx-1">{filteredMaterials.length}</span> / {materials.length} vật tư
                    </p>
                </div>
            )}

            {/* Modal */}
            {isFormModalOpen && (
                <MaterialFormModal
                    material={selectedMaterial}
                    onClose={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSubmitSuccess}
                />
            )}
        </div>
    );
};

export default Materials;
