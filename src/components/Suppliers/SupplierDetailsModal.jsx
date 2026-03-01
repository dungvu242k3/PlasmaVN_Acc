import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Building2,
    CreditCard,
    DollarSign,
    FileText,
    History,
    MapPin,
    Package,
    Phone,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';

export default function SupplierDetailsModal({ supplier, onClose }) {
    const [activeTab, setActiveTab] = useState('overview'); // overview, receipts, transactions
    const [loading, setLoading] = useState(true);

    const [receipts, setReceipts] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // Thêm các state cho form Payment
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('CHUYEN_KHOAN');
    const [paymentNote, setPaymentNote] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const [stats, setStats] = useState({
        totalImportValue: 0,
        totalPaid: 0,
        currentDebt: 0
    });

    useEffect(() => {
        if (!supplier) return;
        fetchSupplierData();
    }, [supplier]);

    const fetchSupplierData = async () => {
        setLoading(true);
        try {
            // 1. Lấy Lịch sử nhập hàng (Chỉ tính DA_NHAP hoặc HOAN_THANH)
            const { data: receiptsData, error: err1 } = await supabase
                .from('goods_receipts')
                .select('*')
                .eq('supplier_name', supplier.name)
                .order('created_at', { ascending: false });

            if (err1) throw err1;

            // 2. Lấy Lịch sử Giao dịch (Thu/Chi)
            const { data: txData, error: err2 } = await supabase
                .from('supplier_transactions')
                .select('*')
                .eq('supplier_name', supplier.name)
                .order('created_at', { ascending: false });

            if (err2) throw err2;

            setReceipts(receiptsData || []);
            setTransactions(txData || []);

            // 3. Tính toán công nợ
            const validReceipts = (receiptsData || []).filter(r => r.status === 'DA_NHAP' || r.status === 'HOAN_THANH');
            const totalImport = validReceipts.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);

            let totalPaid = 0;
            let totalRefund = 0; // Tương lai nếu NCC hoàn tiền

            (txData || []).forEach(tx => {
                const amt = Number(tx.amount) || 0;
                if (tx.transaction_type === 'CHI') totalPaid += amt;
                else if (tx.transaction_type === 'THU') totalRefund += amt;
            });

            // Công nợ = Tổng đã nhập - (Tổng đã trả - TổngNCC hoàn lại)
            const debt = totalImport - (totalPaid - totalRefund);

            setStats({
                totalImportValue: totalImport,
                totalPaid: totalPaid,
                currentDebt: debt > 0 ? debt : 0
            });

        } catch (error) {
            console.error('Error fetching supplier details:', error);
            alert('Lỗi tải dữ liệu chi tiết Nhà cung cấp!');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        const amountNum = parseFloat(paymentAmount.replace(/\./g, ''));
        if (!amountNum || amountNum <= 0) {
            alert('Vui lòng nhập số tiền hợp lệ!');
            return;
        }

        setIsSubmittingPayment(true);
        try {
            // Generate next PC code
            const { data: latestTx } = await supabase
                .from('supplier_transactions')
                .select('transaction_code')
                .order('created_at', { ascending: false })
                .limit(1);

            let nextCode = 'PC00001';
            if (latestTx && latestTx.length > 0 && latestTx[0].transaction_code?.startsWith('PC')) {
                const numStr = latestTx[0].transaction_code.replace(/[^0-9]/g, '');
                const nextNum = numStr ? parseInt(numStr, 10) + 1 : 1;
                nextCode = `PC${nextNum.toString().padStart(5, '0')}`;
            }

            const payload = {
                transaction_code: nextCode,
                supplier_name: supplier.name,
                amount: amountNum,
                transaction_type: 'CHI',
                transaction_date: paymentDate,
                payment_method: paymentMethod,
                note: paymentNote,
                created_by: 'Kế toán'
            };

            const { error } = await supabase.from('supplier_transactions').insert([payload]);
            if (error) throw error;

            alert('✅ Đã tạo phiếu chi trả nợ thành công!');
            setShowPaymentForm(false);
            setPaymentAmount('');
            setPaymentNote('');
            fetchSupplierData(); // refresh data
        } catch (error) {
            console.error('Lỗi khi lập phiếu chi:', error);
            alert('❌ Có lỗi lập phiếu chi: ' + error.message);
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' ₫';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-slate-50 rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[80vh] mt-12">

                {/* Header Profile */}
                <div className="bg-white px-8 py-6 border-b border-slate-200 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none"></div>

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{supplier.name}</h2>
                                <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                                    <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> {supplier.phone}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> <span className="max-w-[300px] truncate" title={supplier.address}>{supplier.address}</span></span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2.5 bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-6 mt-8 border-b border-slate-200 relative z-10">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-4 px-2 text-sm font-black uppercase tracking-wider transition-all duration-300 border-b-2 ${activeTab === 'overview' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Tổng quan</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('receipts')}
                            className={`pb-4 px-2 text-sm font-black uppercase tracking-wider transition-all duration-300 border-b-2 ${activeTab === 'receipts' ? 'text-emerald-600 border-emerald-600' : 'text-slate-400 border-transparent hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" /> Phiếu Nhập
                                <span className="bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-[10px] ml-1">{receipts.length}</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`pb-4 px-2 text-sm font-black uppercase tracking-wider transition-all duration-300 border-b-2 ${activeTab === 'transactions' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4" /> Thu / Chi
                                <span className="bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-[10px] ml-1">{transactions.length}</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Body Details */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-4">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-slate-400 animate-pulse">Đang tải dữ liệu NCC...</p>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">

                            {/* TAB: OVERVIEW */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Card CÔNG NỢ */}
                                        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                            <div className="absolute -right-4 -bottom-4 bg-rose-200/50 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                                                    <DollarSign className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest relative z-10">Công Nợ Hiện Tại</p>
                                            <h3 className="text-3xl font-black text-rose-700 mt-1 relative z-10">{formatCurrency(stats.currentDebt)}</h3>
                                        </div>

                                        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                            <div className="absolute -right-4 -bottom-4 bg-slate-100 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                                    <ArrowDownRight className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest relative z-10">Tổng Tiền Đã Nhập</p>
                                            <h3 className="text-3xl font-black text-slate-800 mt-1 relative z-10">{formatCurrency(stats.totalImportValue)}</h3>
                                        </div>

                                        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                            <div className="absolute -right-4 -bottom-4 bg-slate-100 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                    <ArrowUpRight className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest relative z-10">Tổng Tiền Đã Trả</p>
                                            <h3 className="text-3xl font-black text-slate-800 mt-1 relative z-10">{formatCurrency(stats.totalPaid)}</h3>
                                        </div>
                                    </div>

                                    {/* Action Shortcuts */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                        {!showPaymentForm ? (
                                            <button
                                                onClick={() => setShowPaymentForm(true)}
                                                className="px-6 py-3.5 bg-slate-900 text-white rounded-xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
                                            >
                                                <CreditCard className="w-4 h-4" /> Trả nợ NCC (Tạo phiếu Chi)
                                            </button>
                                        ) : (
                                            <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-600" /> TẠO PHIẾU CHI TRẢ NỢ</h3>
                                                    <button onClick={() => setShowPaymentForm(false)} className="text-slate-400 hover:text-rose-500 font-bold text-sm">Hủy bỏ</button>
                                                </div>
                                                <form onSubmit={handlePaymentSubmit} className="space-y-5">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <div className="space-y-2">
                                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Số tiền thanh toán (VNĐ) *</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={paymentAmount ? Number(paymentAmount.replace(/\./g, '')).toLocaleString('vi-VN') : ''}
                                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                                placeholder="Nhập số tiền..."
                                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl font-black text-indigo-700 text-lg outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all placeholder:font-medium placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Hình thức *</label>
                                                            <select
                                                                value={paymentMethod}
                                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                                            >
                                                                <option value="CHUYEN_KHOAN">💳 Chuyển khoản (Ngân hàng)</option>
                                                                <option value="TIEN_MAT">💵 Tiền mặt</option>
                                                                <option value="KHAC">🔄 Phương thức khác</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <div className="space-y-2">
                                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Ngày lập phiếu *</label>
                                                            <input
                                                                type="date"
                                                                required
                                                                value={paymentDate}
                                                                onChange={(e) => setPaymentDate(e.target.value)}
                                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Nội dung chuyển khoản</label>
                                                            <input
                                                                type="text"
                                                                value={paymentNote}
                                                                onChange={(e) => setPaymentNote(e.target.value)}
                                                                placeholder="Thanh toán tiền hàng cho NCC..."
                                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all placeholder:font-medium placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end pt-2">
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmittingPayment}
                                                            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 flex items-center gap-2"
                                                        >
                                                            {isSubmittingPayment ? 'Đang lưu Phiếu chi...' : 'Xác nhận Đã Chuyển Tiền'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB: RECEIPTS */}
                            {activeTab === 'receipts' && (
                                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                    {receipts.length === 0 ? (
                                        <div className="p-16 text-center flex flex-col items-center">
                                            <Package className="w-16 h-16 text-slate-200 mb-4" />
                                            <p className="text-slate-400 font-bold text-lg">Chưa có phiếu nhập nào từ NCC này</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã phiếu</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày nhập</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Số lượng</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Tổng giá trị</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {receipts.map(r => (
                                                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-black text-sm text-slate-700">{r.receipt_code}</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{formatDate(r.receipt_date)}</td>
                                                        <td className="px-6 py-4 text-sm font-black text-slate-700 text-center">{r.total_items} hàng</td>
                                                        <td className="px-6 py-4 text-sm font-black text-emerald-600 text-right">{formatCurrency(r.total_amount)}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg border ${r.status === 'DA_NHAP' || r.status === 'HOAN_THANH' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                                                }`}>
                                                                {r.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {/* TAB: TRANSACTIONS */}
                            {activeTab === 'transactions' && (
                                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                    {transactions.length === 0 ? (
                                        <div className="p-16 text-center flex flex-col items-center">
                                            <FileText className="w-16 h-16 text-slate-200 mb-4" />
                                            <p className="text-slate-400 font-bold text-lg">Chưa có giao dịch thanh toán nào</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã GD</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày TT</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Loại</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phương thức</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Số tiền</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Người tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {transactions.map(tx => (
                                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-black text-sm text-slate-700">{tx.transaction_code}</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{formatDate(tx.transaction_date)}</td>
                                                        <td className="px-6 py-4 text-sm font-black">
                                                            {tx.transaction_type === 'CHI' ? (
                                                                <span className="text-indigo-600 flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> TRẢ NỢ</span>
                                                            ) : (
                                                                <span className="text-emerald-600 flex items-center gap-1"><ArrowDownRight className="w-3.5 h-3.5" /> HOÀN TIỀN</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{tx.payment_method}</td>
                                                        <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">{formatCurrency(tx.amount)}</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{tx.created_by || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
