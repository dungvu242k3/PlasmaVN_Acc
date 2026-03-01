import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    DollarSign,
    FileText,
    History,
    MapPin,
    Package,
    Phone,
    Truck,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';

export default function ShipperDetailsModal({ shipper, onClose }) {
    const [activeTab, setActiveTab] = useState('overview'); // overview, orders, transactions
    const [loading, setLoading] = useState(true);

    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // States for Payment Form
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('CHUYEN_KHOAN');
    const [paymentNote, setPaymentNote] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const [stats, setStats] = useState({
        totalShippingFee: 0,
        totalPaid: 0,
        currentDebt: 0
    });

    useEffect(() => {
        if (!shipper) return;
        fetchShipperData();
    }, [shipper]);

    const fetchShipperData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Orders assigned to this shipper
            const { data: ordersData, error: err1 } = await supabase
                .from('orders')
                .select('*')
                .eq('shipper_id', shipper.id)
                .order('created_at', { ascending: false });

            if (err1) throw err1;

            // 2. Fetch Transactions (CHI/THU)
            const { data: txData, error: err2 } = await supabase
                .from('shipper_transactions')
                .select('*')
                .eq('shipper_id', shipper.id)
                .order('created_at', { ascending: false });

            if (err2) throw err2;

            setOrders(ordersData || []);
            setTransactions(txData || []);

            // 3. Calculate Debt
            // Consider order as debt if it's not canceled
            const validOrders = (ordersData || []).filter(o =>
                !['HUY_DON'].includes(o.status)
            );
            const totalFee = validOrders.reduce((sum, o) => sum + (Number(o.shipping_fee) || 0), 0);

            let totalPaid = 0; // Công ty đã trả cho Shipper (CHI)
            let totalRefund = 0; // Shipper thối lại tiền do đối soát sai (THU)

            (txData || []).forEach(tx => {
                const amt = Number(tx.amount) || 0;
                if (tx.transaction_type === 'CHI') totalPaid += amt; // Cty trả cước -> CHI
                else if (tx.transaction_type === 'THU') totalRefund += amt; // Shipper thối trả -> THU
            });

            // Công nợ = (Tổng tiền cước các cuốc xe) - (Tổng tiền Công ty đã trả - Shipper thối lại)
            // Nếu > 0: Công ty đang NỢ Shipper.
            const debt = totalFee - (totalPaid - totalRefund);

            setStats({
                totalShippingFee: totalFee,
                totalPaid: totalPaid,
                currentDebt: debt > 0 ? debt : 0
            });

        } catch (error) {
            console.error('Error fetching shipper details:', error);
            alert('Lỗi tải dữ liệu chi tiết Đơn vị vận chuyển!');
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
            // Generate next PC code (Phiếu Chi)
            const { data: latestTx } = await supabase
                .from('shipper_transactions')
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
                shipper_id: shipper.id,
                shipper_name: shipper.name,
                amount: amountNum,
                transaction_type: 'CHI', // Chi trả tiền cước
                transaction_date: paymentDate,
                payment_method: paymentMethod,
                note: paymentNote,
                created_by: 'Kế toán'
            };

            const { error } = await supabase.from('shipper_transactions').insert([payload]);
            if (error) throw error;

            alert('✅ Đã lập Phiếu Chi thanh toán cước thành công!');
            setShowPaymentForm(false);
            setPaymentAmount('');
            setPaymentNote('');
            fetchShipperData(); // refresh data
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
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none"></div>

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-200">
                                <Truck className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{shipper.name}</h2>
                                <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                                    <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> {shipper.phone || '—'}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> <span className="max-w-[300px] truncate" title={shipper.address}>{shipper.address || '—'}</span></span>
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
                            className={`pb-4 px-2 text-sm font-black uppercase tracking-wider transition-all duration-300 border-b-2 ${activeTab === 'overview' ? 'text-cyan-600 border-cyan-600' : 'text-slate-400 border-transparent hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Tổng quan</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`pb-4 px-2 text-sm font-black uppercase tracking-wider transition-all duration-300 border-b-2 ${activeTab === 'orders' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" /> Cuốc Xe
                                <span className="bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-[10px] ml-1">{orders.length}</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`pb-4 px-2 text-sm font-black uppercase tracking-wider transition-all duration-300 border-b-2 ${activeTab === 'transactions' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4" /> Thu/Chi Cước
                                <span className="bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-[10px] ml-1">{transactions.length}</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Body Details */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-4">
                            <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-slate-400 animate-pulse">Đang tải dữ liệu Shipper...</p>
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
                                            <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest relative z-10">Công Nợ Cước (Chưa Trả)</p>
                                            <h3 className="text-3xl font-black text-rose-700 mt-1 relative z-10">{formatCurrency(stats.currentDebt)}</h3>
                                        </div>

                                        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                            <div className="absolute -right-4 -bottom-4 bg-slate-100 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                                                    <ArrowUpRight className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest relative z-10">Tổng Cước Cần Thanh Toán</p>
                                            <h3 className="text-3xl font-black text-slate-800 mt-1 relative z-10">{formatCurrency(stats.totalShippingFee)}</h3>
                                        </div>

                                        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                            <div className="absolute -right-4 -bottom-4 bg-slate-100 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                    <ArrowDownRight className="w-6 h-6" />
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
                                                <CreditCard className="w-4 h-4" /> Thanh toán Nợ cước (Chi Tiền)
                                            </button>
                                        ) : (
                                            <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-cyan-600" /> TẠO PHIẾU CHI TIỀN</h3>
                                                    <button onClick={() => setShowPaymentForm(false)} className="text-slate-400 hover:text-rose-500 font-bold text-sm">Hủy bỏ</button>
                                                </div>
                                                <form onSubmit={handlePaymentSubmit} className="space-y-5">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <div className="space-y-2">
                                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Số tiền chi trả (VNĐ) *</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={paymentAmount ? Number(paymentAmount.replace(/\./g, '')).toLocaleString('vi-VN') : ''}
                                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                                placeholder="Nhập số tiền..."
                                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl font-black text-cyan-700 text-lg outline-none focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all placeholder:font-medium placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Hình thức *</label>
                                                            <select
                                                                value={paymentMethod}
                                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all"
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
                                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Nội dung nộp tiền</label>
                                                            <input
                                                                type="text"
                                                                value={paymentNote}
                                                                onChange={(e) => setPaymentNote(e.target.value)}
                                                                placeholder="Thanh toán nợ cước vận chuyển..."
                                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all placeholder:font-medium placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end pt-2">
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmittingPayment}
                                                            className="px-8 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-black text-sm shadow-xl shadow-cyan-200 transition-all disabled:opacity-50 flex items-center gap-2"
                                                        >
                                                            {isSubmittingPayment ? 'Đang lưu Phiếu chi...' : 'Xác nhận Đã Trả Nợ'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB: ORDERS / CUỐC XE */}
                            {activeTab === 'orders' && (
                                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                    {orders.length === 0 ? (
                                        <div className="p-16 text-center flex flex-col items-center">
                                            <Truck className="w-16 h-16 text-slate-200 mb-4" />
                                            <p className="text-slate-400 font-bold text-lg">ĐVVC chưa giao đơn hàng nào</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã đơn</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày xuất</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Giao Đến</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Phí Cước</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Tình trạng</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {orders.map(o => (
                                                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-black text-sm text-slate-700">{o.order_code}</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{formatDate(o.created_at)}</td>
                                                        <td className="px-6 py-4 text-sm font-black text-slate-700 max-w-[200px] truncate" title={o.recipient_address}>{o.recipient_name}</td>
                                                        <td className="px-6 py-4 text-sm font-black text-blue-600 text-right">{formatCurrency(o.shipping_fee)}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg border ${o.status === 'DA_DUYET' || o.status === 'HOAN_THANH' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                                                }`}>
                                                                {o.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {/* TAB: TRANSACTIONS / THU CHI */}
                            {activeTab === 'transactions' && (
                                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                    {transactions.length === 0 ? (
                                        <div className="p-16 text-center flex flex-col items-center">
                                            <FileText className="w-16 h-16 text-slate-200 mb-4" />
                                            <p className="text-slate-400 font-bold text-lg mb-6">Chưa có giao dịch chi tiền cước nào</p>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('overview');
                                                    setShowPaymentForm(true);
                                                }}
                                                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-black text-sm shadow-xl shadow-cyan-200 transition-all flex items-center gap-2"
                                            >
                                                <CreditCard className="w-4 h-4" /> Bắt đầu tạo Phiếu Chi đầu tiên
                                            </button>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã GD</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày GD</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Loại</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hình thức</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Số tiền</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Người lập</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {transactions.map(tx => (
                                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-black text-sm text-slate-700">{tx.transaction_code}</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{formatDate(tx.transaction_date)}</td>
                                                        <td className="px-6 py-4 text-sm font-black">
                                                            {tx.transaction_type === 'CHI' ? (
                                                                <span className="text-emerald-600 flex items-center gap-1"><ArrowDownRight className="w-3.5 h-3.5" /> CHI CƯỚC</span>
                                                            ) : (
                                                                <span className="text-amber-600 flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> THU HỒI CƯỚC</span>
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
