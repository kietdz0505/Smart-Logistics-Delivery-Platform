import { Package, Wallet, UserRound, LogOut } from 'lucide-react';

export default function CustomerHeader({
    user,
    walletBalance,
    logout
}) {
    return (
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-slate-200">

            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                    <Package className="w-6 h-6 text-indigo-600" />
                </div>

                <div>
                    <h1 className="text-xl font-black text-indigo-600 tracking-wide">
                        SMART LOGISTIC
                    </h1>

                    <p className="text-xs text-slate-500 font-medium">
                        Customer Dashboard
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6">

                <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white">
                        <Wallet className="w-4 h-4 text-indigo-600" />
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                            Ví tài khoản
                        </p>

                        <p className="text-sm font-black text-indigo-700">
                            {(walletBalance || 0).toLocaleString('vi-VN')} ₫
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 border-l pl-6 border-slate-200">

                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <UserRound className="w-5 h-5 text-emerald-600" />
                    </div>

                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">
                            {user?.fullName || 'Khách hàng thành viên'}
                        </p>

                        <p className="text-xs text-emerald-600 font-semibold">
                            Khách hàng thành viên
                        </p>
                    </div>

                    <button
                        onClick={logout}
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