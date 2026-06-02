import OrderCard from './OrderCard';

export default function OrderList({ orders, loading, activeTab, onAccept, onComplete, onCancel }) {
    if (loading && activeTab === 'online') {
        return <div className="text-center py-12 text-gray-500 font-medium">Đang quét tìm cuốc xe mới xung quanh...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 font-medium">
                {activeTab === 'online' 
                    ? '📭 Hiện tại chưa có cuốc xe nào mới phát sinh trong khu vực.' 
                    : '🚚 Bạn hiện không có cuốc xe nào đang chạy. Hãy nhận đơn ở tab Đơn trực tuyến!'}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
                <OrderCard 
                    key={order.id} 
                    order={order} 
                    activeTab={activeTab} 
                    onAccept={onAccept} 
                    onComplete={onComplete} 
                    onCancel={onCancel} 
                />
            ))}
        </div>
    );
}