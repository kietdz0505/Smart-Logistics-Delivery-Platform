import { useNavigate } from 'react-router-dom';

export default function OrderCard({
    order,
    handleCancelOrder
}) {
    const navigate = useNavigate();

    const statusText = {
        PENDING: 'Chờ tài xế',
        ACCEPTED: 'Đã nhận đơn',
        DELIVERING: 'Đang giao',
        COMPLETED: 'Hoàn thành',
        CANCELLED: 'Đã hủy'
    };

    const statusColor = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        ACCEPTED: 'bg-blue-100 text-blue-700',
        DELIVERING: 'bg-purple-100 text-purple-700',
        COMPLETED: 'bg-green-100 text-green-700',
        CANCELLED: 'bg-red-100 text-red-700'
    };

    return (
        <div className="p-4 rounded-xl border border-gray-100 bg-slate-50 hover:border-indigo-200 transition">
            <div className="flex justify-between items-start gap-3">
                
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${statusColor[order.status] || 'bg-gray-100 text-gray-700'}`}>
                            {statusText[order.status] || order.status}
                        </span>

                        <span className="font-mono text-[10px] text-gray-400">
                            #{order.id?.substring(0, 8)}
                        </span>
                    </div>

                    <p className="text-xs text-gray-700 line-clamp-1">
                        📍 <b>Từ:</b> {order.pickupAddress}
                    </p>

                    <p className="text-xs text-gray-600 line-clamp-1">
                        🏁 <b>Đến:</b> {order.deliveryAddress}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs">
                        <span>📏 <b>{order.distanceKm || 0} km</b></span>
                        <span>💰 <b>{(order.price || 0).toLocaleString()}đ</b></span>
                    </div>

                    <p className="text-xs text-slate-500">
                        👤 <b>Tài xế:</b>{' '}
                        <span className="font-semibold text-slate-700">
                            {order.driver?.fullName || order.driverName || 'Đang tìm tài xế...'}
                        </span>
                    </p>

                    {(order.driver?.phone || order.driverPhone) && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            📞 <b>Số điện thoại:</b>{' '}
                            <span className="font-mono font-semibold text-slate-700">
                                {order.driver?.phone || order.driverPhone}
                            </span>
                        </p>
                    )}
                    
                    {order.createdAt && (
                        <p className="text-xs text-slate-400">
                            🕒 {new Date(order.updatedAt || order.createdAt).toLocaleString('vi-VN')}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1 mt-2 text-[10px] font-semibold">
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700">Tạo đơn</span>
                        <span>→</span>
                        <span className={`px-2 py-1 rounded ${['ACCEPTED', 'DELIVERING', 'COMPLETED'].includes(order.status) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            Nhận đơn
                        </span>
                        <span>→</span>
                        <span className={`px-2 py-1 rounded ${['DELIVERING', 'COMPLETED'].includes(order.status) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            Lấy hàng
                        </span>
                        <span>→</span>
                        <span className={`px-2 py-1 rounded ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            Hoàn tất
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 justify-between h-full min-h-[100px]">
                    <span className="text-lg font-black text-indigo-700">
                        {(order.price || 0).toLocaleString()}đ
                    </span>

                    {order.status === 'PENDING' && (
                        <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-xs font-bold text-red-500 bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition active:scale-95"
                        >
                            Hủy đơn
                        </button>
                    )}

                    {order.status === 'ACCEPTED' && (
                        <span className="text-[11px] px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            🛵 Tài xế đang đến
                        </span>
                    )}

                    {order.status === 'DELIVERING' && (
                        <span className="text-[11px] px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            📦 Đang vận chuyển
                        </span>
                    )}

                    {order.status === 'COMPLETED' && (
                        <span className="text-[11px] px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200">
                            ✅ Giao thành công
                        </span>
                    )}

                    <button
                        onClick={() => navigate(`/customer/track/${order.id}`)}
                        className="text-[11px] font-black text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-xl transition shadow-sm active:scale-95 flex items-center gap-1 mt-auto"
                    >
                        Theo dõi đơn hàng
                    </button>
                </div>

            </div>
        </div>
    );
}