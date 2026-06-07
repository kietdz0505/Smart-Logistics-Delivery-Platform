import { geocodeAddress } from '../../utils/geocoding';

export default function CreateOrderForm({
    senderName,
    setSenderName,
    senderPhone,
    setSenderPhone,

    receiverName,
    setReceiverName,
    receiverPhone,
    setReceiverPhone,

    pickupAddress,
    setPickupAddress,

    deliveryAddress,
    setDeliveryAddress,

    pickupLat,
    pickupLng,
    setPickupLat,
    setPickupLng,

    deliveryLat,
    deliveryLng,
    setDeliveryLat,
    setDeliveryLng,

    setMapCenter,

    mode,
    setMode,

    loading,
    error,
    actionMessage,
    routeInfo,
    handleCreateOrder
}) {

    const formatDuration = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return hours > 0
            ? `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ''}`
            : `${minutes} phút`;
    };

    const estimatedPrice = routeInfo
        ? Math.max(
            20000,
            Math.round(routeInfo.distanceKm * 15000)
        )
        : 0;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-y-auto max-h-[85vh] space-y-4">
            <form onSubmit={handleCreateOrder} className="space-y-4">
                <h3 className="text-lg font-extrabold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <span>✍️</span> Tạo yêu cầu giao vận mới
                </h3>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
                        ⚠️ {error}
                    </div>
                )}

                {actionMessage && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-xl text-xs font-bold border border-green-100">
                        ✅ {actionMessage}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                            Người gửi
                        </label>
                        <input
                            type="text"
                            required
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                            SĐT Gửi
                        </label>
                        <input
                            type="text"
                            required
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                            Người nhận
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Tên người nhận"
                            value={receiverName}
                            onChange={(e) => setReceiverName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                            SĐT Nhận
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="09xxxxxxxx"
                            value={receiverPhone}
                            onChange={(e) => setReceiverPhone(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setMode('pickup')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition duration-200 ${mode === 'pickup'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        📍 Điểm lấy hàng {mode === 'pickup' && '•'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('delivery')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition duration-200 ${mode === 'delivery'
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        🏁 Điểm giao hàng {mode === 'delivery' && '•'}
                    </button>
                </div>

                <div className="space-y-2">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                            Địa chỉ lấy hàng
                        </label>

                        <input
                            type="text"
                            required
                            value={pickupAddress}
                            onChange={(e) => setPickupAddress(e.target.value)}

                            onBlur={async () => {
                                const result =
                                    await geocodeAddress(pickupAddress);

                                if (result) {
                                    setPickupLat(result.lat);
                                    setPickupLng(result.lng);

                                    setMapCenter({
                                        lat: result.lat,
                                        lng: result.lng
                                    });

                                }
                            }}

                            className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-indigo-50 p-2 rounded-lg font-mono">
                        <p>
                            Kinh độ: <b>{pickupLng.toFixed(5)}</b>
                        </p>
                        <p>
                            Vĩ độ: <b>{pickupLat.toFixed(5)}</b>
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                            Địa chỉ nhận hàng
                        </label>

                        <input
                            type="text"
                            required
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}

                            onBlur={async () => {
                                const result =
                                    await geocodeAddress(deliveryAddress);

                                if (result) {
                                    setDeliveryLat(result.lat);
                                    setDeliveryLng(result.lng);

                                    setMapCenter({
                                        lat: result.lat,
                                        lng: result.lng
                                    });
                                }
                            }}

                            className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-orange-50 p-2 rounded-lg font-mono">
                        <p>
                            Kinh độ: <b>{deliveryLng.toFixed(5)}</b>
                        </p>
                        <p>
                            Vĩ độ: <b>{deliveryLat.toFixed(5)}</b>
                        </p>
                    </div>
                </div>

                {routeInfo && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-sm">
                        <div>
                            📏 Khoảng cách:
                            <b> {routeInfo.distanceKm.toFixed(2)} km</b>
                        </div>

                        <div>
                            ⏱️ Thời gian dự kiến:
                            <b> {formatDuration(routeInfo.durationMin)}</b>
                        </div>
                        <div className="text-lg font-black text-green-600 border-t pt-2 mt-2">
                            💰 Giá cước dự kiến:
                            {' '}
                            {estimatedPrice.toLocaleString()}đ
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition disabled:bg-gray-400 transform active:scale-95"
                >
                    {loading
                        ? '⏳ Hệ thống đang tính toán cước phí...'
                        : '🚀 Gửi Yêu Cầu Giao Hàng'}
                </button>
            </form>
        </div>
    );
}