import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Sửa lỗi icon mặc định của Leaflet bị mất hình trên React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function CustomerDashboard() {
    const { user, logout } = useContext(AuthContext);

    // Trạng thái các trường nhập liệu
    const [senderName, setSenderName] = useState(user?.fullName || '');
    const [senderPhone, setSenderPhone] = useState(user?.phone || '');
    const [receiverName, setReceiverName] = useState('');
    const [receiverPhone, setReceiverPhone] = useState('');

    const [pickupAddress, setPickupAddress] = useState('Nhà hát Lớn Hà Nội');
    const [pickupLat, setPickupLat] = useState(21.0245);
    const [pickupLng, setPickupLng] = useState(105.8566);

    const [deliveryAddress, setDeliveryAddress] = useState('Hồ Hoàn Kiếm, Hà Nội');
    const [deliveryLat, setDeliveryLat] = useState(21.0285);
    const [deliveryLng, setDeliveryLng] = useState(105.8525);

    const [mode, setMode] = useState('pickup'); // 'pickup' hoặc 'delivery' để biết đang chọn điểm nào trên bản đồ
    const [loading, setLoading] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [error, setError] = useState('');

    // Hàm xử lý tương tác click chuột trên bản đồ để lấy tọa độ GPS tự động
    function MapClickHandler() {
        useMapEvents({
            click(e) {
                if (mode === 'pickup') {
                    setPickupLat(e.latlng.lat);
                    setPickupLng(e.latlng.lng);
                } else {
                    setDeliveryLat(e.latlng.lat);
                    setDeliveryLng(e.latlng.lng);
                }
            },
        });
        return null;
    }

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setCreatedOrder(null);

        // Payload gọn gàng, không cần gửi distance và price nữa, Backend tự tính bảo mật hơn
        const orderPayload = {
            phone: user?.phone,
            senderName,
            senderPhone,
            receiverName,
            receiverPhone,
            pickupAddress,
            pickupLongitude: pickupLng,
            pickupLatitude: pickupLat,
            deliveryAddress,
            deliveryLongitude: deliveryLng,
            deliveryLatitude: deliveryLat
        };

        try {
            const response = await axiosClient.post('/orders/create', orderPayload);
            setCreatedOrder(response.data);
        } catch (err) {
            console.error("Chi tiết lỗi tạo đơn:", err.response?.data);
            
            // Ép kiểu chống sập giao diện nếu Backend ném về Object lỗi thay vì String
            if (err.response?.data && typeof err.response.data === 'object') {
                const apiError = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
                setError(`Lỗi hệ thống: ${apiError}`);
            } else {
                setError(err.response?.data || 'Không thể tạo đơn hàng, vui lòng kiểm tra số dư ví!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Thanh điều hướng Header */}
            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">📦</span>
                    <h1 className="text-xl font-black text-indigo-600 tracking-wide">SMART LOGISTIC DASHBOARD</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{user?.fullName}</p>
                        <p className="text-xs text-green-600 font-semibold">Khách hàng thành viên</p>
                    </div>
                    <button onClick={logout} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition">
                        Đăng xuất
                    </button>
                </div>
            </header>

            {/* Khu vực nội dung chính phân bổ 2 bên */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">

                {/* BÊN TRÁI: FORM ĐĂNG KÝ TẠO ĐƠN HÀNG */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
                    <form onSubmit={handleCreateOrder} className="space-y-4">
                        <h3 className="text-lg font-extrabold text-gray-800 border-b pb-2 flex items-center gap-2">
                            <span>✍️</span> Tạo yêu cầu giao vận mới
                        </h3>

                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">⚠️ {error}</div>}

                        {/* Người gửi & Người nhận */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Người gửi</label>
                                <input type="text" required value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">SĐT Gửi</label>
                                <input type="text" required value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Người nhận</label>
                                <input type="text" required placeholder="Tên người nhận" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">SĐT Nhận</label>
                                <input type="text" required placeholder="09xxxxxxxx" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>

                        {/* Cơ chế chọn chế độ click bản đồ */}
                        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl">
                            <button type="button" onClick={() => setMode('pickup')} className={`py-2 px-3 rounded-lg text-xs font-bold transition duration-200 ${mode === 'pickup' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>
                                📍 Điểm lấy hàng {mode === 'pickup' && '•'}
                            </button>
                            <button type="button" onClick={() => setMode('delivery')} className={`py-2 px-3 rounded-lg text-xs font-bold transition duration-200 ${mode === 'delivery' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}>
                                🏁 Điểm giao hàng {mode === 'delivery' && '•'}
                            </button>
                        </div>

                        {/* Thông tin tọa độ lấy hàng */}
                        <div className="space-y-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Địa chỉ lấy hàng</label>
                                <input type="text" required value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-indigo-50 p-2 rounded-lg font-mono">
                                <p>Kinh độ: <b>{pickupLng.toFixed(5)}</b></p>
                                <p>Vĩ độ: <b>{pickupLat.toFixed(5)}</b></p>
                            </div>
                        </div>

                        {/* Thông tin tọa độ giao hàng */}
                        <div className="space-y-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Địa chỉ nhận hàng</label>
                                <input type="text" required value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-orange-50 p-2 rounded-lg font-mono">
                                <p>Kinh độ: <b>{deliveryLng.toFixed(5)}</b></p>
                                <p>Vĩ độ: <b>{deliveryLat.toFixed(5)}</b></p>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition disabled:bg-gray-400 transform active:scale-95">
                            {loading ? '⏳ Hệ thống đang tính toán cước phí...' : '🚀 Gửi Yêu Cầu Giao Hàng'}
                        </button>
                    </form>

                    {/* HIỂN THỊ HÓA ĐƠN ĐÃ TỰ ĐỘNG TÍNH TOÁN KHI THÀNH CÔNG */}
                    {createdOrder && (
                        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-xl space-y-2 text-sm animate-fade-in">
                            <p className="text-green-800 font-bold flex items-center gap-1">✅ Đã khởi tạo đơn hàng thành công!</p>
                            <div className="text-xs text-gray-600 space-y-1.5">
                                <p><b>Mã đơn hệ thống:</b> <span className="font-mono bg-white px-1.5 py-0.5 border rounded text-gray-700">{createdOrder.id}</span></p>
                                <p><b>Khoảng cách (Tự động):</b> <span className="font-bold text-gray-800">{createdOrder.distanceKm} km</span></p>
                                <p><b>Cước phí chuyến đi:</b> <span className="text-indigo-600 font-black text-sm">{(createdOrder.price).toLocaleString()} VNĐ</span></p>
                                <p><b>Trạng thái:</b> <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-bold uppercase text-[10px] tracking-wider">{createdOrder.status}</span></p>
                            </div>
                        </div>
                    )}
                </div>

                {/* BÊN PHẢI: BẢN ĐỒ LEAFLET MAP */}
                <div className="lg:col-span-7 bg-gray-200 rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[60vh] lg:h-auto min-h-[500px]">
                    <MapContainer center={[21.0285, 105.8542]} zoom={14} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Lắng nghe hành vi click chuột trên bản đồ */}
                        <MapClickHandler />

                        {/* Điểm lấy hàng ghim màu xanh mặc định */}
                        <Marker position={[pickupLat, pickupLng]}>
                            <Popup>📍 <b>Điểm lấy hàng:</b><br /> {pickupAddress}</Popup>
                        </Marker>

                        {/* Điểm giao hàng ghim */}
                        <Marker position={[deliveryLat, deliveryLng]}>
                            <Popup>🏁 <b>Điểm giao hàng:</b><br /> {deliveryAddress}</Popup>
                        </Marker>
                    </MapContainer>
                </div>

            </div>
        </div>
    );
}