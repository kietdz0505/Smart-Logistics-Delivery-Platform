import { useState } from 'react';
import OrderCard from './OrderCard';

export default function OrdersList({
    myOrders = [],
    listLoading,
    fetchMyOrders,
    handleCancelOrder
}) {
    const [filterStatus, setFilterStatus] = useState('PENDING');

    const statusTabs = [
        { id: 'PENDING', label: '⌛ Chờ nhận', color: 'orange' },
        { id: 'ACCEPTED', label: '🚖 Đã nhận', color: 'blue' },
        { id: 'DELIVERING', label: '🚚 Đang giao', color: 'indigo' },
        { id: 'COMPLETED', label: '🏁 Hoàn thành', color: 'emerald' }
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
                <h2 className="text-base font-black text-gray-800 flex items-center gap-2">
                    📊 Trạng thái đơn hàng của bạn
                </h2>

                <button
                    onClick={() => fetchMyOrders(false)}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 transition active:scale-95"
                >
                    🔄 Làm mới dữ liệu
                </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-gray-100 scrollbar-none flex-shrink-0">
                {statusTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-3 py-1.5 text-xs font-bold border rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${getBadgeStyle(tab)}`}
                    >
                        {tab.label}
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {getCountByStatus(tab.id)}
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
                {listLoading ? (
                    <div className="text-center py-10 text-gray-400 text-sm animate-pulse">
                        ⏳ Đang tải trạng thái đơn mới nhất từ hệ thống...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                        📭 Không có đơn hàng nào ở trạng thái <b className="text-gray-700">"{statusTabs.find(t => t.id === filterStatus)?.label}"</b>
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