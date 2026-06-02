export default function DriverHistory({ historyOrders }) {
    const totalEarnings = historyOrders.reduce((sum, order) => sum + (order.price || 0), 0);

    if (historyOrders.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 font-medium">
                📊 Hôm nay bạn chưa hoàn thành cuốc xe nào. Hãy tích cực nhận đơn nhé!
            </div>
        );
    }

    // Hàm nhỏ để format hiển thị thời gian LocalDateTime từ Java gửi về
    const formatTime = (isoString) => {
        if (!isoString) return "Vừa xong";
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + " - " + date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-4">
            {/* Thống kê doanh thu nhanh */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-2xl text-white shadow-md flex justify-between items-center">
                <div>
                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Tổng thu nhập hệ thống</p>
                    <p className="text-3xl font-black mt-1 tracking-tight">{(totalEarnings).toLocaleString()} VNĐ</p>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                    🚀 Đã giao: {historyOrders.length} cuốc
                </div>
            </div>

            {/* Danh sách cuốc xe cũ */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-slate-50 text-xs text-gray-500 uppercase font-black border-b tracking-wider">
                            <tr>
                                <th className="p-4">Mã đơn hàng</th>
                                <th className="p-4">Lộ trình giao nhận</th>
                                <th className="p-4 text-center">Thời gian</th>
                                <th className="p-4 text-right">Cước phí</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                            {historyOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/60 transition duration-150">
                                    <td className="p-4 font-mono text-xs text-gray-400 font-bold">
                                        #{order.id.substring(0, 8).toUpperCase()}...
                                    </td>
                                    <td className="p-4 space-y-1 max-w-xs">
                                        <p className="text-xs text-gray-800 font-semibold truncate">📍 {order.pickupAddress}</p>
                                        <p className="text-xs text-gray-500 truncate">🏁 {order.deliveryAddress}</p>
                                    </td>
                                    <td className="p-4 text-center text-xs text-gray-500 font-semibold">
                                        {/* Sử dụng trường updatedAt khớp 100% với Backend thật */}
                                        {formatTime(order.updatedAt)} 
                                    </td>
                                    <td className="p-4 text-right font-black text-emerald-600 text-base">
                                        +{order.price.toLocaleString()}đ
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}