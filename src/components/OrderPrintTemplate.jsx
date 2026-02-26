import React from 'react';
import {
    CUSTOMER_CATEGORIES,
    ORDER_TYPES,
    PRODUCT_TYPES,
    WAREHOUSES
} from '../constants/orderConstants';

const OrderItem = ({ order }) => {
    if (!order) return null;

    const getLabel = (list, id) => {
        return list.find(item => item.id === id)?.label || id;
    };

    return (
        <div className="order-print-page p-10 bg-white text-black font-sans leading-relaxed min-h-screen">
            {/* Header / Brand */}
            <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-blue-600">PlasmaVN</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Hệ thống quản lý đơn hàng</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">PHIẾU ĐẶT HÀNG</h2>
                    <p className="text-sm font-medium text-gray-600">Mã đơn: <span className="text-black font-black uppercase">#{order.order_code}</span></p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at || Date.now()).toLocaleString('vi-VN')}</p>
                </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-10 mb-10">
                {/* Customer Section */}
                <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Thông tin khách hàng</h3>
                    <div className="space-y-2">
                        <p className="text-sm"><span className="font-bold text-gray-500">Đối tượng:</span> {getLabel(CUSTOMER_CATEGORIES, order.customer_category)}</p>
                        <p className="text-base font-bold">{order.customer_name}</p>
                        <p className="text-sm"><span className="font-bold text-gray-500">Kho xuất:</span> {getLabel(WAREHOUSES, order.warehouse)}</p>
                    </div>
                </div>

                {/* Recipient Section */}
                <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Thông tin nhận hàng</h3>
                    <div className="space-y-2">
                        <p className="text-base font-bold">{order.recipient_name}</p>
                        <p className="text-sm">{order.recipient_address}</p>
                        <p className="text-sm font-bold text-blue-700">{order.recipient_phone}</p>
                    </div>
                </div>
            </div>

            {/* Order Details Table */}
            <table className="w-full border-collapse mb-10">
                <thead>
                    <tr className="bg-gray-50 border-y-2 border-gray-900">
                        <th className="py-3 px-4 text-left text-xs font-black uppercase">STT</th>
                        <th className="py-3 px-4 text-left text-xs font-black uppercase">Hàng hóa</th>
                        <th className="py-3 px-4 text-left text-xs font-black uppercase">Loại đơn</th>
                        <th className="py-3 px-4 text-center text-xs font-black uppercase">Số lượng</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    <tr>
                        <td className="py-4 px-4 text-sm font-medium">01</td>
                        <td className="py-4 px-4">
                            <p className="text-sm font-bold">{getLabel(PRODUCT_TYPES, order.product_type)}</p>
                        </td>
                        <td className="py-4 px-4 text-sm">
                            {getLabel(ORDER_TYPES, order.order_type)}
                        </td>
                        <td className="py-4 px-4 text-center text-base font-black">
                            {order.quantity}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Note Section */}
            {order.note && (
                <div className="mb-10 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ghi chú:</h3>
                    <p className="text-sm italic text-gray-700">{order.note}</p>
                </div>
            )}

            {/* Footer / Signatures */}
            <div className="grid grid-cols-3 gap-4 text-center mt-20">
                <div>
                    <p className="text-xs font-black uppercase mb-16">Người lập đơn</p>
                    <div className="w-32 h-px bg-gray-300 mx-auto"></div>
                </div>
                <div>
                    <p className="text-xs font-black uppercase mb-16">Thủ kho</p>
                    <div className="w-32 h-px bg-gray-300 mx-auto"></div>
                </div>
                <div>
                    <p className="text-xs font-black uppercase mb-16">Người nhận hàng</p>
                    <div className="w-32 h-px bg-gray-300 mx-auto"></div>
                </div>
            </div>

            <div className="mt-20 pt-8 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Cảm ơn quý khách đã tin dùng sản phẩm của PlasmaVN</p>
            </div>
        </div>
    );
};

const OrderPrintTemplate = ({ orders }) => {
    if (!orders) return null;

    // Handle both single order and array of orders
    const orderList = Array.isArray(orders) ? orders : [orders];

    return (
        <div className="bulk-print-container">
            {orderList.map((order, index) => (
                <React.Fragment key={order.id || index}>
                    <OrderItem order={order} />
                    {index < orderList.length - 1 && <div className="page-break" />}
                </React.Fragment>
            ))}
        </div>
    );
};

export default OrderPrintTemplate;
