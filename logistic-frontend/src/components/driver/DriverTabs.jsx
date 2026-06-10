import React from 'react';

import {
    Radio,
    Truck,
    History
} from 'lucide-react';

export default function DriverTabs({
    activeTab,
    setActiveTab,
    counts
}) {

    const tabs = [
        {
            id: 'online',
            label: 'Đơn trực tuyến',
            count: counts.online,
            icon: Radio,
            activeClass:
                'bg-orange-600 text-white shadow-sm'
        },
        {
            id: 'active',
            label: 'Đang chạy',
            count: counts.active,
            icon: Truck,
            activeClass:
                'bg-indigo-600 text-white shadow-sm'
        },
        {
            id: 'history',
            label: 'Lịch sử',
            icon: History,
            activeClass:
                'bg-emerald-600 text-white shadow-sm'
        }
    ];

    return (
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 mb-6 w-full">

            <div className="grid grid-cols-3 gap-1">

                {tabs.map(tab => {
                    const Icon = tab.icon;

                    const active =
                        activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() =>
                                setActiveTab(tab.id)
                            }
                            className={`
                                flex items-center justify-center gap-2
                                py-2.5 px-3
                                text-xs font-bold
                                rounded-xl
                                transition-all duration-200
                                ${
                                    active
                                        ? tab.activeClass
                                        : 'text-slate-600 hover:bg-slate-50'
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />

                            <span>
                                {tab.label}
                            </span>

                            <span
                                className={`
                                    px-1.5 py-0.5
                                    rounded-full
                                    text-[10px]
                                    font-black
                                    ${
                                        active
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                    }
                                `}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}

            </div>

        </div>
    );
}