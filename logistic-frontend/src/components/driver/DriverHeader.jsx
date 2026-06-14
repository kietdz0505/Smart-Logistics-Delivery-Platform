import { useState, useRef, useEffect } from 'react';
import {
    Truck,
    Wallet,
    UserRound,
    LogOut,
    User,
    Wifi
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DriverHeader({
    user,
    walletBalance,
    onLogout
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
        <header
            className="
                sticky top-0 z-[9999]
                bg-white shadow-sm
                px-6 py-4
                flex justify-between items-center
                border-b border-slate-200
            "
        >
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
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <UserRound className="w-5 h-5 text-orange-600" />
                            )}
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
                                    navigate('/driver/profile');
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

                            <div className="border-t" />

                            <button
                                onClick={() => {
                                    setOpenMenu(false);
                                    onLogout();
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