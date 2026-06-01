export default function OrderCard({ order, activeTab, onAccept, onComplete }) {
    return (
        <div className={`bg-white p-5 rounded-2xl shadow-sm border flex flex-col justify-between transition duration-200 ${activeTab === 'online' ? 'hover:border-orange-400' : 'border-indigo-200 bg-indigo-50/10'}`}>
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {order.status}
                    </span>
                    <span className={`text-lg font-black ${activeTab === 'online' ? 'text-orange-600' : 'text-indigo-600'}`}>
                        {(order.price || 25000).toLocaleString()} VNĐ
                    </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                    <p><b>Mã đơn:</b> <span className="font-mono text-gray-700 font-semibold">{order.id}</span></p>
                    <p><b>Khách hàng:</b> {order.senderName}</p>
                    <p><b>Khoảng cách:</b> {order.distanceKm || 1.2} km</p>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-0.5">📍</span>
                        <p className="text-gray-700 text-xs"><b className="text-indigo-600">Điểm lấy:</b> {order.pickupAddress}</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">🏁</span>
                        <p className="text-gray-700 text-xs"><b className="text-orange-600">Điểm giao:</b> {order.deliveryAddress}</p>
                    </div>
                </div>
            </div>

            {/* NÚT BẤM DỰA TRÊN TRẠNG THÁI */}
            {order.status === 'PENDING' ? (
                <button 
                    onClick={() => onAccept(order.id)} 
                    className="mt-5 w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-95"
                >
                    🚖 Nhận Đơn Hàng Này
                </button>
            ) : (
                <button 
                    onClick={() => onComplete(order.id)} 
                    className="mt-5 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-95 animate-pulse"
                >
                    🏁 Hoàn Thành Giao Hàng
                </button>
            )}
        </div>
    );
}