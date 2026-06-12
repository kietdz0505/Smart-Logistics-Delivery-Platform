import { useState } from 'react';
import OrderCard from './OrderCard';
import {
    RefreshCw,
    ClipboardList,
    Clock3,
    Car,
    Truck,
    Inbox,
    LoaderCircle
} from 'lucide-react';

export default function OrdersList({
    myOrders = [],
    listLoading,
    fetchMyOrders,
    handleCancelOrder
}) {
    const [filterStatus, setFilterStatus] = useState('PENDING');

    const statusTabs = [
        {
            id: 'PENDING',
            label: 'Chờ nhận',
            color: 'orange',
            icon: Clock3
        },
        {
            id: 'ACCEPTED',
            label: 'Đã nhận',
            color: 'blue',
            icon: Car
        },
        {
            id: 'DELIVERING',
            label: 'Đang giao',
            color: 'indigo',
            icon: Truck
        }
    ];

    const filteredOrders = myOrders.filter(order => order.status === filterStatus);

    const getBadgeStyle = (tab) => {
        const isActive = filterStatus === tab.id;
        if (!isActive) return 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-gray-200';

        switch (tab.color) {
            case 'orange': return 'bg-orange-600 text-white border-orange-600 shadow-sm';
            case 'blue': return 'bg-blue-600 text-white border-blue-600 shadow-sm';
            case 'indigo': return 'bg-indigo-600 text-white border-indigo-600 shadow-sm';
            case 'emerald': return 'bg-emerald-600 text-white border-emerald-600 shadow-sm';
            default: return 'bg-gray-800 text-white border-gray-800';
        }
    };

    const getCountByStatus = (status) => {
        return myOrders.filter(order => order.status === status).length;
    };

    return (
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex-1 overflow-y-auto max-h-[55vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                    Đơn hàng đang hoạt động
                </h2>

                <button
                    onClick={() => fetchMyOrders(false)}
                    className="
                                flex items-center gap-1.5
                                text-xs font-bold
                                text-indigo-600
                                hover:text-indigo-700
                                transition
                                active:scale-95
                            "
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Làm mới dữ liệu
                </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-gray-100 scrollbar-none flex-shrink-0">
                {statusTabs.map(tab => {
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`
                                    px-3 py-2
                                    text-xs font-bold
                                    border rounded-xl
                                    transition-all duration-200
                                    whitespace-nowrap
                                    flex items-center gap-2
                                    ${getBadgeStyle(tab)}
                                `}
                        >
                            <Icon className="w-3.5 h-3.5" />

                            <span>{tab.label}</span>

                            <span
                                className={`
                                text-[10px]
                                px-1.5 py-0.5
                                rounded-full
                                font-black
                                ${filterStatus === tab.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }
                                `}
                            >
                                {getCountByStatus(tab.id)}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
                {listLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
                        <LoaderCircle className="w-6 h-6 animate-spin text-indigo-600" />

                        <span className="text-sm font-medium">
                            Đang tải trạng thái đơn mới nhất...
                        </span>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div
                        className="
                        flex flex-col
                        items-center
                        justify-center
                        gap-3
                        py-12
                        text-slate-500
                        border-2 border-dashed
                        border-slate-200
                        rounded-xl
                        bg-slate-50
                    "
                    >
                        <Inbox className="w-10 h-10 text-slate-300" />

                        <p className="text-sm text-center">
                            Không có đơn hàng nào ở trạng thái
                            <br />
                            <span className="font-bold text-slate-700">
                                {statusTabs.find(
                                    t => t.id === filterStatus
                                )?.label}
                            </span>
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                handleCancelOrder={handleCancelOrder}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}