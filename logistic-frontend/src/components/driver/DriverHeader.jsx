import React from 'react';

import {
    Truck,
    Wallet,
    UserRound,
    LogOut,
    Wifi
} from 'lucide-react';

export default function DriverHeader({
    user,
    walletBalance,
    onLogout
}) {
    return (
        <header className="sticky top-0 z-[9999] bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-slate-200">

            <div className="flex items-center gap-3">

                <div className="p-2 rounded-xl bg-orange-50 border border-orange-100">
                    <Truck className="w-6 h-6 text-orange-600" />
                </div>

                <div>
                    <h1 className="text-xl font-black text-orange-600 tracking-wide">
                        SMART LOGISTIC
                    </h1>

                    <p className="text-xs text-slate-500 font-medium">
                        Driver Dashboard
                    </p>
                </div>

            </div>

            <div className="flex items-center gap-6">

                <div className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl flex items-center gap-3">

                    <div className="p-2 rounded-lg bg-white">
                        <Wallet className="w-4 h-4 text-orange-600" />
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                            Ví tài xế
                        </p>

                        <p className="text-sm font-black text-orange-700">
                            {(walletBalance || 0).toLocaleString('vi-VN')} ₫
                        </p>
                    </div>

                </div>

                <div className="flex items-center gap-4 border-l border-slate-200 pl-6">

                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <UserRound className="w-5 h-5 text-orange-600" />
                    </div>

                    <div className="text-right">

                        <p className="text-sm font-bold text-slate-800">
                            {user?.fullName || 'Tài xế'}
                        </p>

                        <div className="flex items-center justify-end gap-1 text-xs font-semibold text-emerald-600">

                            <Wifi className="w-3.5 h-3.5" />

                            <span>
                                Đang trực tuyến
                            </span>

                        </div>

                    </div>

                    <button
                        onClick={onLogout}
                        className="
                            flex items-center gap-2
                            px-4 py-2
                            bg-red-50
                            text-red-600
                            border border-red-200
                            rounded-xl
                            text-sm font-semibold
                            hover:bg-red-100
                            transition
                            active:scale-95
                        "
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>

                </div>

            </div>

        </header>
    );
}