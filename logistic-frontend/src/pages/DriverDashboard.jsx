import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import OrderList from '../components/OrderList';

export default function DriverDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('online');
    const [orders, setOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchPendingOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axiosClient.get('/orders/pending');
            setOrders(response.data);
        } catch (err) {
            console.error('Lỗi lấy đơn thật từ Backend:', err);
            setError('Không thể tải danh sách đơn thật. Đang hiển thị dữ liệu giả lập để test...');
            setOrders([{ id: '8cbf2aec-813f-4936-a980-8ea913e9062e', senderName: 'Nguyễn Văn Khách', pickupAddress: 'Nhà hát Lớn Hà Nội', deliveryAddress: 'Hồ Hoàn Kiếm, Hà Nội', distanceKm: 1.2, price: 25000, status: 'PENDING' }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'online') fetchPendingOrders();
    }, [activeTab]);

    const handleAcceptOrder = async (orderId) => {
        setMessage(''); setError('');
        try {
            let finalDriverId = user?.userId || user?.id || "9be585fb-4a6e-4648-a0ec-605881505214";
            await axiosClient.post(`/orders/accept`, { orderId, driverId: finalDriverId });

            setMessage(`🎉 Nhận đơn thành công! Hãy di chuyển tới điểm lấy hàng.`);
            const acceptedOrder = orders.find(o => o.id === orderId);
            if (acceptedOrder) {
                setActiveOrders(prev => [{ ...acceptedOrder, status: 'ACCEPTED' }, ...prev]);
            }
            setOrders(orders.filter(order => order.id !== orderId));
            setActiveTab('active');
        } catch (err) {
            setError(err.response?.data || 'Nhận đơn thất bại! Vui lòng thử lại.');
        }
    };

    const handleCompleteOrder = async (orderId) => {
        setLoading(true); setError(''); setMessage('');
        try {
            await axiosClient.post('/orders/complete', { orderId });
            setMessage('🏁 Cuốc xe hoàn thành xuất sắc! Tiền cước đã được tất toán.');
            setActiveOrders(activeOrders.filter(order => order.id !== orderId));
        } catch (err) {
            console.error("Chi tiết lỗi hoàn thành đơn:", err.response?.data);

            if (err.response?.data && typeof err.response.data === 'object') {
                const apiError = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
                setError(`Lỗi hệ thống: ${apiError}`);
            } else {
                setError(err.response?.data || 'Không thể cập nhật trạng thái hoàn thành.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">🚖</span>
                    <h1 className="text-xl font-black text-orange-600 tracking-wide">SMART LOGISTIC FOR DRIVER</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{user?.fullName || 'Tài xế ẩn danh'}</p>
                        <p className="text-xs text-orange-600 font-semibold">Tài xế đang trực tuyến</p>
                    </div>
                    <button onClick={logout} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition">Đăng xuất</button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
                {/* THANH TAB */}
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border mb-6 max-w-md">
                    <button onClick={() => setActiveTab('online')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition ${activeTab === 'online' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-600 hover:bg-slate-50'}`}>📡 Đơn trực tuyến ({orders.length})</button>
                    <button onClick={() => setActiveTab('active')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition ${activeTab === 'active' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-slate-50'}`}>🚖 Đang chạy ({activeOrders.length})</button>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-extrabold text-gray-800">{activeTab === 'online' ? '📡 Danh sách cuốc xe đang chờ (Bán kính 5km)' : '📦 Các cuốc xe bạn đang vận chuyển'}</h2>
                    {activeTab === 'online' && <button onClick={fetchPendingOrders} className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">🔄 Làm mới</button>}
                </div>

                {message && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-semibold">✅ {message}</div>}
                {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium">⚠️ {error}</div>}

                {/* GỌI COMPONENT LIST ĐÃ TÁCH */}
                <OrderList
                    orders={activeTab === 'online' ? orders : activeOrders}
                    loading={loading}
                    activeTab={activeTab}
                    onAccept={handleAcceptOrder}
                    onComplete={handleCompleteOrder}
                />
            </main>
        </div>
    );
}