import { clsx } from 'clsx';
import {
    ArrowRightLeft,
    ChevronLeft,
    RefreshCw,
    Save,
    Warehouse,
    Package,
    ClipboardList,
    ArrowRight,
    ArrowDown,
    Hash,
    Info
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../supabase/config';
import { notificationService } from '../utils/notificationService';
import { SearchableSelect } from '../components/ui/SearchableSelect';

const InventoryTransfer = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [inventory, setInventory] = useState([]);

    const [formData, setFormData] = useState({
        from_warehouse_id: '',
        to_warehouse_id: '',
        item_type: 'MAY',
        item_name: '',
        quantity: 1,
        note: ''
    });

    const [availableItems, setAvailableItems] = useState([]);
    const [maxQuantity, setMaxQuantity] = useState(0);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    useEffect(() => {
        if (formData.from_warehouse_id) {
            fetchInventory(formData.from_warehouse_id);
        } else {
            setAvailableItems([]);
        }
    }, [formData.from_warehouse_id]);

    useEffect(() => {
        if (formData.item_type && inventory.length > 0) {
            const items = inventory.filter(i => i.item_type === formData.item_type);
            setAvailableItems(items);

            const selected = items.find(i => i.item_name === formData.item_name);
            if (selected) {
                setMaxQuantity(selected.quantity);
            } else {
                setFormData(prev => ({ ...prev, item_name: items[0]?.item_name || '', quantity: 1 }));
                setMaxQuantity(items[0]?.quantity || 0);
            }
        }
    }, [formData.item_type, inventory]);

    useEffect(() => {
        const selected = availableItems.find(i => i.item_name === formData.item_name);
        if (selected) {
            setMaxQuantity(selected.quantity);
        } else {
            setMaxQuantity(0);
        }
    }, [formData.item_name]);

    const fetchWarehouses = async () => {
        const { data } = await supabase.from('warehouses').select('id, name').eq('status', 'Đang hoạt động');
        if (data) setWarehouses(data);
    };

    const fetchInventory = async (warehouseId) => {
        const { data } = await supabase
            .from('inventory')
            .select('*')
            .eq('warehouse_id', warehouseId)
            .gt('quantity', 0);
        if (data) setInventory(data);
    };

    const warehouseOptions = useMemo(() =>
        warehouses.map(w => ({ value: w.id, label: w.name })),
        [warehouses]
    );

    const itemOptions = useMemo(() =>
        availableItems.map(item => ({
            value: item.item_name,
            label: `${item.item_name} (Tồn: ${item.quantity})`
        })),
        [availableItems]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.from_warehouse_id || !formData.to_warehouse_id || !formData.item_name || formData.quantity <= 0) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (formData.from_warehouse_id === formData.to_warehouse_id) {
            toast.error('Kho đi và kho đến không được trùng nhau');
            return;
        }

        if (formData.quantity > maxQuantity) {
            toast.error(`Số lượng chuyển (${formData.quantity}) vượt quá tồn kho (${maxQuantity})`);
            return;
        }

        setLoading(true);
        try {
            const sourceItem = inventory.find(i => i.item_name === formData.item_name && i.item_type === formData.item_type);

            const { error: decError } = await supabase
                .from('inventory')
                .update({ quantity: sourceItem.quantity - formData.quantity })
                .eq('id', sourceItem.id);
            if (decError) throw decError;

            const { data: destItemData, error: destQueryError } = await supabase
                .from('inventory')
                .select('id, quantity')
                .eq('warehouse_id', formData.to_warehouse_id)
                .eq('item_type', formData.item_type)
                .eq('item_name', formData.item_name)
                .maybeSingle();
            if (destQueryError) throw destQueryError;

            let destInventoryId;
            if (destItemData) {
                const { data: updatedDest, error: incError } = await supabase
                    .from('inventory')
                    .update({ quantity: destItemData.quantity + formData.quantity })
                    .eq('id', destItemData.id)
                    .select().single();
                if (incError) throw incError;
                destInventoryId = updatedDest.id;
            } else {
                const { data: newDest, error: insError } = await supabase
                    .from('inventory')
                    .insert([{
                        warehouse_id: formData.to_warehouse_id,
                        item_type: formData.item_type,
                        item_name: formData.item_name,
                        quantity: formData.quantity
                    }])
                    .select().single();
                if (insError) throw insError;
                destInventoryId = newDest.id;
            }

            const transferCode = `TRF${Date.now().toString().slice(-6)}`;
            const { error: txError } = await supabase
                .from('inventory_transactions')
                .insert([
                    {
                        inventory_id: sourceItem.id,
                        transaction_type: 'OUT',
                        reference_code: transferCode,
                        quantity_changed: formData.quantity,
                        note: `Điều chuyển tới ${warehouses.find(w => w.id === formData.to_warehouse_id)?.name}. ${formData.note}`
                    },
                    {
                        inventory_id: destInventoryId,
                        transaction_type: 'IN',
                        reference_code: transferCode,
                        quantity_changed: formData.quantity,
                        note: `Nhận điều chuyển từ ${warehouses.find(w => w.id === formData.from_warehouse_id)?.name}. ${formData.note}`
                    }
                ]);
            if (txError) throw txError;

            await notificationService.add({
                title: 'Điều chuyển kho',
                description: `Đã chuyển ${formData.quantity} ${formData.item_name} từ ${warehouses.find(w => w.id === formData.from_warehouse_id)?.name} tới ${warehouses.find(w => w.id === formData.to_warehouse_id)?.name}`,
                type: 'success',
                link: '/bao-cao/kho'
            });

            toast.success('Điều chuyển kho thành công!');
            navigate('/bao-cao/kho');
        } catch (error) {
            console.error('Transfer error:', error);
            toast.error('Lỗi khi điều chuyển: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed md:static inset-0 z-[100] md:z-auto w-full md:flex-1 flex flex-col px-4 pt-16 pb-4 sm:p-6 bg-slate-50 overflow-y-auto md:overflow-visible custom-scrollbar md:min-h-screen">
            {/* Optimized Page Header */}
            <div className="hidden md:flex max-w-4xl mx-auto w-full mb-8 flex-col md:flex-row md:items-center justify-center relative gap-4 md:gap-6">
                <button
                    onClick={() => navigate(-1)}
                    className="md:absolute md:left-0 self-start md:self-auto !h-9 !px-3 md:!h-10 md:!px-4 flex items-center justify-center gap-1.5 md:gap-2 bg-white border border-slate-200 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all text-slate-800 shadow-sm"
                >
                    <ChevronLeft size={16} md:size={18} strokeWidth={2.5} />
                    <span className="font-bold text-[13px] md:text-[14px]">Quay lại</span>
                </button>
                <div className="hidden md:flex flex-col text-center">
                    <h1 className="text-[22px] md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Điều chuyển kho nội bộ</h1>
                    <p className="text-[12px] md:text-[13px] text-slate-500 font-medium">Quản lý luân chuyển hàng hóa giữa các kho</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 pb-32 md:pb-0">
                    {/* Warehouse Info Section */}
                    <div className="rounded-3xl border border-primary/20 bg-white p-5 sm:p-6 space-y-5 shadow-sm">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-primary/10">
                            <Warehouse className="w-4 h-4 text-primary" />
                            <h4 className="text-[18px] !font-extrabold !text-primary">Thông tin kho hàng</h4>
                        </div>

                        <div className="relative">
                            <div className="flex flex-col md:grid md:grid-cols-2 gap-5 md:gap-14 relative transition-all duration-300">
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                                        <Warehouse className="w-4 h-4 text-primary/70" /> Kho xuất (Nguồn) <span className="text-red-500">*</span>
                                    </label>
                                    <SearchableSelect
                                        options={warehouseOptions}
                                        value={formData.from_warehouse_id}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, from_warehouse_id: val }))}
                                        placeholder="Chọn kho xuất..."
                                        searchPlaceholder="Tìm kho..."
                                    />
                                </div>

                                {/* Arrow Down Indicator for Mobile */}
                                <div className="flex md:hidden items-center justify-center -my-2.5 text-primary/30 pointer-events-none">
                                    <ArrowDown size={22} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                                        <Warehouse className="w-4 h-4 text-emerald-600" /> Kho nhận (Đích) <span className="text-red-500">*</span>
                                    </label>
                                    <SearchableSelect
                                        options={warehouseOptions}
                                        value={formData.to_warehouse_id}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, to_warehouse_id: val }))}
                                        placeholder="Chọn kho nhận..."
                                        searchPlaceholder="Tìm kho..."
                                    />
                                </div>
                            </div>

                            {/* Arrow Right indicator on Desktop */}
                            <div className="hidden md:flex absolute left-1/2 top-[52px] -translate-x-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center text-primary/40 z-10 pointer-events-none">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Item Info Section */}
                    <div className="rounded-3xl border border-primary/20 bg-white p-5 sm:p-6 space-y-5 shadow-sm">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-primary/10">
                            <Package className="w-4 h-4 text-primary" />
                            <h4 className="text-[18px] !font-extrabold !text-primary">Chi tiết vật tư điều chuyển</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                                    <Info className="w-4 h-4 text-primary/70" /> Loại hàng hóa <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                    {['MAY', 'BINH', 'VAT_TU'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, item_type: type }))}
                                            className={clsx(
                                                "flex-1 !h-9 md:!h-10 py-1 px-2 rounded-xl text-[12px] md:text-[13px] font-bold transition-all shadow-sm",
                                                formData.item_type === type
                                                    ? "bg-white text-primary border-transparent"
                                                    : "bg-transparent text-slate-500 hover:text-slate-800"
                                            )}
                                        >
                                            {type === 'MAY' ? 'Máy' : type === 'BINH' ? 'Bình' : 'Vật tư'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                                    <Package className="w-4 h-4 text-primary/70" /> Tên hàng hóa <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    options={itemOptions}
                                    value={formData.item_name}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, item_name: val }))}
                                    disabled={!formData.from_warehouse_id || availableItems.length === 0}
                                    placeholder="Chọn hàng hóa..."
                                    searchPlaceholder="Tìm hàng hóa..."
                                />
                                {!formData.from_warehouse_id && (
                                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg w-fit">
                                        <Info size={12} /> Vui lòng chọn kho xuất trước
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                                    <Hash className="w-4 h-4 text-primary/70" /> Số lượng <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full h-11 md:h-12 pl-4 pr-24 bg-slate-50 border border-slate-200 rounded-2xl text-[14.5px] font-black text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all shadow-inner"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                                        min="1"
                                        max={maxQuantity}
                                        required
                                    />
                                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-primary text-white text-[10px] md:text-[11px] font-bold px-2 py-1.5 rounded-xl shadow-lg shadow-primary/20">
                                        Tồn: {maxQuantity}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                                    <ClipboardList className="w-4 h-4 text-primary/70" /> Ghi chú (Tùy chọn)
                                </label>
                                <input
                                    type="text"
                                    className="w-full h-11 md:h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14.5px] font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all shadow-inner"
                                    placeholder="Lý do điều chuyển..."
                                    value={formData.note}
                                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="fixed md:static z-40 bottom-0 left-0 right-0 border-t md:border-none border-slate-200 p-4 md:p-0 bg-white md:bg-transparent flex flex-col-reverse sm:flex-row gap-3 md:gap-4 pt-4 items-center justify-end shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] md:shadow-none pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-16 mt-6 md:mt-0">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-6 py-3 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-[14px]"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={clsx(
                                "w-full sm:w-auto px-6 py-3 font-bold text-[15px] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 border disabled:opacity-50",
                                "bg-primary text-white border-primary/40 hover:bg-primary/90 shadow-primary/20",
                                loading && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Xác nhận điều chuyển
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryTransfer;
