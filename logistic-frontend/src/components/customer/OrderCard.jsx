import { useNavigate } from 'react-router-dom';

import {
    MapPin,
    Flag,
    Route,
    Wallet,
    UserRound,
    Phone,
    Clock3,
    Navigation,
    Truck,
    CircleCheck,
    XCircle,
    MapPinned
} from 'lucide-react';

export default function OrderCard({
    order,
    handleCancelOrder = () => { }
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
        PENDING:
            'bg-amber-50 text-amber-700 border border-amber-200',

        ACCEPTED:
            'bg-blue-50 text-blue-700 border border-blue-200',

        DELIVERING:
            'bg-indigo-50 text-indigo-700 border border-indigo-200',

        COMPLETED:
            'bg-emerald-50 text-emerald-700 border border-emerald-200',

        CANCELLED:
            'bg-red-50 text-red-700 border border-red-200'
    };

    return (
        <div className="
                        p-4
                        rounded-2xl
                        border border-slate-200
                        bg-white
                        hover:border-indigo-300
                        hover:shadow-md
                        transition-all
                    ">
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

                    <p className="text-xs text-slate-700 flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-emerald-600 flex-shrink-0" />
                        <span className="line-clamp-1">
                            <b>Từ:</b> {order.pickupAddress}
                        </span>
                    </p>

                    <p className="text-xs text-slate-700 flex items-start gap-2">
                        <Flag className="w-3.5 h-3.5 mt-0.5 text-red-500 flex-shrink-0" />
                        <span className="line-clamp-1">
                            <b>Đến:</b> {order.deliveryAddress}
                        </span>
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-700">

                        <span className="flex items-center gap-1">
                            <Route className="w-3.5 h-3.5 text-blue-600" />
                            <b>{order.distanceKm || 0} km</b>
                        </span>

                        <span className="flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5 text-green-600" />
                            <b>{(order.price || 0).toLocaleString()}đ</b>
                        </span>

                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                        <UserRound className="w-3.5 h-3.5" />

                        <span>
                            <b>Tài xế:</b>{' '}
                            <span className="font-semibold text-slate-700">
                                {order.driver?.fullName ||
                                    order.driverName ||
                                    'Đang tìm tài xế...'}
                            </span>
                        </span>
                    </p>

                    {(order.driver?.phone || order.driverPhone) && (
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" />

                            <span>
                                <b>Số điện thoại:</b>{' '}
                                <span className="font-mono font-semibold text-slate-700">
                                    {order.driver?.phone ||
                                        order.driverPhone}
                                </span>
                            </span>
                        </p>
                    )}

                    {order.createdAt && (
                        <p className="text-xs text-slate-400 flex items-center gap-2">
                            <Clock3 className="w-3 h-3" />

                            {new Date(
                                order.updatedAt ||
                                order.createdAt
                            ).toLocaleString('vi-VN')}
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
                    <span className="text-xl font-black text-indigo-700">
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
                        <span className="text-[11px] px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            Tài xế đang đến
                        </span>
                    )}

                    {order.status === 'DELIVERING' && (
                        <span className="text-[11px] px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Đang vận chuyển
                        </span>
                    )}

                    {order.status === 'COMPLETED' && (
                        <span className="text-[11px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CircleCheck className="w-3 h-3" />
                            Giao thành công
                        </span>
                    )}

                    {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
                        <button
                            onClick={() =>
                                navigate(`/customer/track/${order.id}`)
                            }
                            className="
            flex items-center gap-1.5
            text-[11px]
            font-black
            text-white
            bg-indigo-600
            hover:bg-indigo-700
            px-3 py-1.5
            rounded-xl
            transition
            shadow-sm
            active:scale-95
        "
                        >
                            <MapPinned className="w-3.5 h-3.5" />
                            Theo dõi
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}