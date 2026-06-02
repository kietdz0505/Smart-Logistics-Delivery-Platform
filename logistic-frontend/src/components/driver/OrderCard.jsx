import MapRoute from './MapRoute'; 

export default function OrderCard({ order, activeTab, onAccept, onComplete, onCancel }) {
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

                {activeTab === 'active' && (
                    <div className="mt-3">
                        <MapRoute pickupAddress={order.pickupAddress} deliveryAddress={order.deliveryAddress} />
                    </div>
                )}
            </div>

            <div className="mt-5">
                {order.status === 'PENDING' ? (
                    <button 
                        onClick={() => onAccept(order.id)} 
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-95"
                    >
                        🚖 Nhận Đơn Hàng Này
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button 
                            type="button"
                            onClick={() => {
                                if (window.confirm("Bạn có chắc chắn muốn HỦY cuốc xe này không? Đơn hàng sẽ được chuyển lại về trạng thái chờ cho tài xế khác nhận.")) {
                                    if (onCancel) {
                                        onCancel(order.id);
                                    } else {
                                        alert("Lỗi: Không tìm thấy hàm xử lý hủy đơn từ hệ thống!");
                                    }
                                }
                            }}
                            className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl border border-red-200 transition transform active:scale-95 whitespace-nowrap"
                        >
                             Hủy cuốc
                        </button>

                        <button 
                            onClick={() => onComplete(order.id)} 
                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-95 animate-pulse"
                        >
                            Hoàn Thành Giao Hàng
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}