import OrderCard from './OrderCard';

export default function OrdersList({
    myOrders,
    listLoading,
    fetchMyOrders,
    handleCancelOrder
}) {
    return (
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex-1 overflow-y-auto max-h-[40vh]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-black text-gray-800 flex items-center gap-2">
                    📊 Trạng thái đơn hàng của bạn
                </h2>

                <button
                    onClick={() => fetchMyOrders(false)}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                >
                    🔄 Làm mới
                </button>
            </div>

            {listLoading ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                    Đang tải trạng thái đơn...
                </div>
            ) : myOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                    Bạn chưa tạo yêu cầu giao hàng nào!
                </div>
            ) : (
                <div className="space-y-3">
                    {myOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            handleCancelOrder={handleCancelOrder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}