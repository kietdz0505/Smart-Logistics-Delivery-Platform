import { useState, useRef, useEffect } from 'react';
import {
    Package,
    Wallet,
    UserRound,
    LogOut,
    History,
    User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomerHeader({
    user,
    walletBalance,
    logout
}) {

    const navigate = useNavigate();

    const [openMenu, setOpenMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpenMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
    }, []);

    return (
        <header className="relative z-[9999] sticky
        top-0 bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-slate-200">
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

                <div
                    ref={menuRef}
                    className="relative border-l pl-6 border-slate-200"
                >
                    <button
                        onClick={() => setOpenMenu(!openMenu)}
                        className="
                                flex items-center gap-4
                                hover:bg-slate-50
                                rounded-xl
                                px-3 py-2
                                transition
                            "
                    >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                <UserRound className="w-5 h-5 text-emerald-600" />
                            )}
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">
                                {user?.fullName || 'Khách hàng thành viên'}
                            </p>

                            <p className="text-xs text-emerald-600 font-semibold">
                                Khách hàng thành viên
                            </p>
                        </div>
                    </button>

                    {openMenu && (
                        <div
                            className="
                                    absolute
                                    right-0
                                    top-full
                                    mt-2
                                    w-64
                                    bg-white
                                    border
                                    border-slate-200
                                    rounded-2xl
                                    shadow-xl
                                    overflow-hidden
                                    z-[10000]
                                "
                        >
                            <div className="px-4 py-3 border-b bg-slate-50">
                                <p className="font-bold text-slate-800">
                                    {user?.fullName}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {user?.phone}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setOpenMenu(false);
                                    navigate('/customer/profile');
                                }}
                                className="
                                        w-full
                                        flex items-center gap-3
                                        px-4 py-3
                                        text-sm
                                        hover:bg-slate-50
                                        transition
                                    "
                            >
                                <User className="w-4 h-4 text-slate-500" />
                                Thông tin cá nhân
                            </button>

                            <button
                                onClick={() => {
                                    setOpenMenu(false);
                                    navigate('/customer/history');
                                }}
                                className="
                                            w-full
                                            flex items-center gap-3
                                            px-4 py-3
                                            text-sm
                                            hover:bg-slate-50
                                            transition
                                        "
                            >
                                <History className="w-4 h-4 text-slate-500" />
                                Lịch sử đơn hàng
                            </button>

                            <div className="border-t" />

                            <button
                                onClick={() => {
                                    setOpenMenu(false);
                                    logout();
                                }}
                                className="
                                            w-full
                                            flex items-center gap-3
                                            px-4 py-3
                                            text-sm
                                            text-red-600
                                            hover:bg-red-50
                                            transition
                                        "
                            >
                                <LogOut className="w-4 h-4" />
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}