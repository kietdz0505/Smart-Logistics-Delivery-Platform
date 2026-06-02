export default function OrderSummary({ createdOrder }) {
    if (!createdOrder) return null;

    return (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl space-y-2 text-sm">
            <div className="text-xs text-gray-600 space-y-1.5">
                <p>
                    <b>Mã đơn hệ thống:</b>{' '}
                    <span className="font-mono bg-white px-1.5 py-0.5 border rounded text-gray-700">
                        {createdOrder.id}
                    </span>
                </p>

                <p>
                    <b>Khoảng cách (Tự động):</b>{' '}
                    <span className="font-bold text-gray-800">
                        {createdOrder.distanceKm} km
                    </span>
                </p>

                <p>
                    <b>Cước phí chuyến đi:</b>{' '}
                    <span className="text-indigo-600 font-black text-sm">
                        {(createdOrder.price || 0).toLocaleString()} VNĐ
                    </span>
                </p>
            </div>
        </div>
    );
}