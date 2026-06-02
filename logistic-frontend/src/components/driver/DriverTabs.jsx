import React from 'react';

export default function DriverTabs({ activeTab, setActiveTab, counts }) {
    return (
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border mb-6 max-w-md">
            <button 
                onClick={() => setActiveTab('online')} 
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${activeTab === 'online' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-600 hover:bg-slate-50'}`}
            >
                📡 Đơn trực tuyến ({counts.online})
            </button>
            <button 
                onClick={() => setActiveTab('active')} 
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${activeTab === 'active' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-slate-50'}`}
            >
                📦 Đang chạy ({counts.active})
            </button>
            <button 
                onClick={() => setActiveTab('history')} 
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${activeTab === 'history' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-slate-50'}`}
            >
                📊 Lịch sử
            </button>
        </div>
    );
}