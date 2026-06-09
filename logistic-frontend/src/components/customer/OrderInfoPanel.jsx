import React from 'react';

export default function OrderInfoPanel({
    order,
    orderId,
    unreadCount,
    driverLocation,
    statusText,
    statusStyles,
    onOpenChat
}) {
    return (
        <div className="w-full h-[30%] md:h-full md:w-[340px] bg-slate-900 text-white p-5 overflow-y-auto flex flex-col justify-between border-t md:border-t-0 md:border-r border-slate-800 flex-shrink-0 z-10 shadow-2xl">
            <div className="space-y-4">

                <div className="border-b border-white/10 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                        Trạng thái hiện tại
                    </p>

                    <div className="flex">
                        <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border border-solid shadow-sm transition-all duration-300 ${
                                statusStyles[order.status] ||
                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    order.status === 'PENDING'
                                        ? 'bg-amber-500 animate-ping'
                                        : order.status === 'ACCEPTED'
                                        ? 'bg-blue-400'
                                        : order.status === 'DELIVERING'
                                        ? 'bg-indigo-400 animate-pulse'
                                        : order.status === 'COMPLETED'
                                        ? 'bg-emerald-400'
                                        : 'bg-rose-400'
                                }`}
                            ></span>

                            {statusText[order.status] ||
                                order.status}
                        </span>
                    </div>
                </div>

                {order.status === 'ACCEPTED' &&
                    order.pickupOtp && (
                        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3.5 text-center shadow-lg animate-pulse">
                            <p className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider mb-1">
                                Mã xác nhận lấy hàng
                            </p>

                            <p className="text-3xl font-mono font-black text-indigo-400 tracking-[0.25em] pl-[0.25em]">
                                {order.pickupOtp}
                            </p>

                            <p className="text-[10px] text-slate-400 mt-1">
                                Cung cấp mã này cho tài xế khi họ đến lấy hàng
                            </p>
                        </div>
                    )}

                <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Nhân sự phụ trách
                    </p>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-sm text-slate-100">
                                {order.driver?.fullName ||
                                    order.driverName ||
                                    'Hệ thống đang điều phối...'}
                            </p>

                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Tài xế giao vận
                            </p>
                        </div>

                        {(order.status ===
                            'ACCEPTED' ||
                            order.status ===
                                'DELIVERING') && (
                            <button
                                type="button"
                                onClick={onOpenChat}
                                className="p-2.5 bg-orange-600 text-white hover:bg-orange-700 rounded-xl transition shadow-md flex items-center justify-center gap-1 active:scale-95 relative"
                                title="Chat với tài xế"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>

                                <span className="text-xs font-black px-0.5">
                                    Chat
                                </span>

                                {unreadCount > 0 && (
                                    <span
                                        className="
                                            absolute
                                            -top-1
                                            -right-1
                                            min-w-[18px]
                                            h-[18px]
                                            px-1
                                            rounded-full
                                            bg-red-500
                                            text-white
                                            text-[10px]
                                            font-bold
                                            flex items-center justify-center
                                        "
                                    >
                                        {unreadCount > 99
                                            ? '99+'
                                            : unreadCount}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    {(order.driver?.phone ||
                        order.driverPhone) && (
                        <div className="flex justify-between items-center text-xs bg-white/5 px-3 py-2.5 rounded-xl border border-white/5">
                            <span className="text-slate-400">
                                Điện thoại:
                            </span>

                            <a
                                href={`tel:${
                                    order.driver?.phone ||
                                    order.driverPhone
                                }`}
                                className="font-mono font-bold text-emerald-400 hover:underline"
                            >
                                {order.driver?.phone ||
                                    order.driverPhone}
                            </a>
                        </div>
                    )}
                </div>

                <div className="space-y-2.5 pt-1">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Thông tin lộ trình
                    </p>

                    <div className="space-y-2 text-xs">
                        <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                            <p className="text-slate-400 font-medium text-[10px] uppercase">
                                Địa điểm lấy hàng
                            </p>

                            <p className="text-slate-200 mt-0.5 font-semibold leading-relaxed">
                                {order.pickupAddress}
                            </p>
                        </div>

                        <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                            <p className="text-slate-400 font-medium text-[10px] uppercase">
                                Địa điểm giao hàng
                            </p>

                            <p className="text-slate-200 mt-0.5 font-semibold leading-relaxed">
                                {order.deliveryAddress}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-3 border border-white/5 grid grid-cols-2 gap-2 text-center">
                    <div className="border-r border-white/10">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Quãng đường
                        </p>

                        <p className="text-xs font-black text-slate-100 mt-1">
                            {order.distanceKm || 0} km
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Tổng cước phí
                        </p>

                        <p className="text-xs font-black text-emerald-400 mt-1">
                            {(order.price || 0).toLocaleString()}đ
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-xs flex-shrink-0">
                <span className="text-slate-400">
                    Tín hiệu GPS Tài xế:
                </span>

                <span
                    className={`font-bold ${
                        driverLocation
                            ? 'text-emerald-400'
                            : 'text-amber-400 animate-pulse'
                    }`}
                >
                    {driverLocation
                        ? 'Đang truyền'
                        : 'Chờ kết nối...'}
                </span>
            </div>
        </div>
    );
}