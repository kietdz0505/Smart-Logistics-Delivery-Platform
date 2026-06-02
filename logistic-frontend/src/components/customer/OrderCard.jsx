export default function OrderCard({ order, handleCancelOrder }) {
    return (
        <div className="p-4 rounded-xl border border-gray-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:border-indigo-100 transition">
            <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            order.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : order.status === 'ACCEPTED'
                                ? 'bg-indigo-100 text-indigo-700'
                                : order.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {order.status}
                    </span>

                    <span className="font-mono text-[10px] text-gray-400">
                        #{order.id.substring(0, 8)}
                    </span>
                </div>

                <p className="text-xs text-gray-700 font-medium line-clamp-1">
                    📍 <b>Từ:</b> {order.pickupAddress}
                </p>

                <p className="text-xs text-gray-500 font-medium line-clamp-1">
                    🏁 <b>Đến:</b> {order.deliveryAddress}
                </p>

                <p className="text-xs text-slate-400">
                    👤 Tài xế nhận:{' '}
                    <span className="text-slate-700 font-bold">
                        {order.driverName ||
                            'Đang quét tìm tài xế gần nhất...'}
                    </span>
                </p>
            </div>

            <div className="text-right flex md:flex-col justify-between items-center md:items-end w-full md:w-auto border-t md:border-none pt-2 md:pt-0">
                <span className="text-sm font-black text-gray-800">
                    {(order.price || 0).toLocaleString()}đ
                </span>

                {order.status === 'PENDING' ? (
                    <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="mt-1 text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition"
                    >
                        ❌ Hủy đơn
                    </button>
                ) : order.status === 'ACCEPTED' ? (
                    <span className="mt-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded italic">
                        🛵 Xe đang đến, không thể tự hủy
                    </span>
                ) : null}
            </div>
        </div>
    );
}