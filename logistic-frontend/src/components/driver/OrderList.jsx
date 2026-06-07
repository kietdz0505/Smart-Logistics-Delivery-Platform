import OrderCard from './OrderCard';

export default function OrderList({
    orders,
    loading,
    activeTab,
    stompClient, 
    onAccept,
    onStartDelivery,
    onComplete,
    onCancel
}) {
    if (loading) {
        return (
            <div className="text-center py-12 text-gray-500 font-medium animate-pulse">
                {activeTab === 'online' ? '📡 Đang quét tìm cuốc xe mới xung quanh...' : '🚚 Đang tải danh sách cuốc xe...'}
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 font-medium">
                {activeTab === 'online'
                    ? 'Hiện tại chưa có cuốc xe nào mới phát sinh trong khu vực.'
                    : 'Bạn hiện không có cuốc xe nào đang chạy. Hãy nhận đơn ở tab Đơn trực tuyến!'}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {orders.map((order) => (
                <OrderCard
                    key={order.id} 
                    order={order}
                    activeTab={activeTab}
                    stompClient={stompClient} 
                    onAccept={onAccept}
                    onStartDelivery={onStartDelivery}
                    onComplete={onComplete}
                    onCancel={onCancel}
                />
            ))}
        </div>
    );
}