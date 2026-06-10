import {
    Wallet,
    Truck,
    MapPin,
    Flag,
    Clock3,
    ReceiptText,
    CircleCheckBig
} from 'lucide-react';

export default function DriverHistory({ historyOrders }) {
    const totalEarnings = historyOrders.reduce((sum, order) => sum + (order.price || 0), 0);

    if (historyOrders.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-12">
                <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Truck className="w-12 h-12 text-slate-300" />

                    <p className="font-semibold">
                        Hôm nay bạn chưa hoàn thành cuốc xe nào
                    </p>

                    <span className="text-sm">
                        Hãy tích cực nhận đơn để tăng thu nhập.
                    </span>
                </div>
            </div>
        );
    }

    const formatTime = (isoString) => {
        if (!isoString) return "Vừa xong";
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + " - " + date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-2xl text-white shadow-md flex justify-between items-center">

                <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Wallet className="w-7 h-7" />
                    </div>

                    <div>
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest">
                            Tổng thu nhập hệ thống
                        </p>

                        <p className="text-3xl font-black mt-1 tracking-tight">
                            {totalEarnings.toLocaleString()} ₫
                        </p>
                    </div>

                </div>

                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm flex items-center gap-2">

                    <CircleCheckBig className="w-4 h-4" />

                    <span className="text-xs font-black uppercase tracking-wider">
                        Đã giao {historyOrders.length} cuốc
                    </span>

                </div>

            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                    <ReceiptText className="w-5 h-5 text-orange-600" />

                    <h3 className="font-bold text-slate-800">
                        Lịch sử giao hàng
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-slate-50 text-xs text-gray-500 uppercase font-black border-b tracking-wider">
                            <tr>
                                <th className="p-4">
                                    Mã đơn
                                </th>
                                <th className="p-4">Lộ trình giao nhận</th>
                                <th className="p-4 text-center">Thời gian</th>
                                <th className="p-4 text-right">Cước phí</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                            {historyOrders.map((order) => (
                                <tr key={order.id} className="
                                    hover:bg-orange-50/40
                                    transition-all
                                    duration-200
                                ">
                                    <td className="p-4">
                                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                            #{order.id.substring(0, 8).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 space-y-1 max-w-xs">
                                        <p className="text-xs text-slate-800 font-semibold truncate flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                            {order.pickupAddress}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate flex items-center gap-2">
                                            <Flag className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                            {order.deliveryAddress}
                                        </p>                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 font-semibold">
                                            <Clock3 className="w-3.5 h-3.5" />
                                            {formatTime(order.updatedAt)}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="font-black text-emerald-600 text-base">
                                            +{order.price.toLocaleString()} ₫
                                        </span>
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