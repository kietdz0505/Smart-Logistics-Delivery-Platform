import React from 'react';

export default function DriverHeader({ user, walletBalance, onLogout }) {
    return (
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center space-x-3">
                <span className="text-2xl">🚗</span>
                <h1 className="text-xl font-black text-orange-600 tracking-wide">SMART LOGISTIC FOR DRIVER</h1>
            </div>
            <div className="flex items-center space-x-6">
                <div className="bg-orange-50 border border-orange-200 px-4 py-1.5 rounded-xl text-right">
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Ví tài xế</p>
                    <p className="text-sm font-black text-orange-700">{(walletBalance || 0).toLocaleString()} VNĐ</p>
                </div>
                <div className="flex items-center space-x-4 border-l pl-6">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{user?.fullName || 'Tài xế ẩn danh'}</p>
                        <p className="text-xs text-green-600 font-semibold">● Đang trực tuyến</p>
                    </div>
                    <button 
                        onClick={onLogout} 
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        </header>
    );
}