export default function CustomerHeader({ user, walletBalance, logout }) {
    return (
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center space-x-3">
                <span className="text-2xl">📦</span>
                <h1 className="text-xl font-black text-indigo-600 tracking-wide">
                    SMART LOGISTIC DASHBOARD
                </h1>
            </div>

            <div className="flex items-center space-x-6">
                <div className="bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-xl text-right">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                        Ví tài khoản
                    </p>
                    <p className="text-sm font-black text-indigo-700">
                        {(walletBalance || 0).toLocaleString()} VNĐ
                    </p>
                </div>

                <div className="flex items-center space-x-4 border-l pl-6 border-gray-100">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">
                            {user?.fullName || 'Khách hàng thành viên'}
                        </p>
                        <p className="text-xs text-green-600 font-semibold">
                            Khách hàng thành viên
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        </header>
    );
}