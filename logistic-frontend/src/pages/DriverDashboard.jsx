import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import OrderList from '../components/driver/OrderList';
import DriverHistory from '../components/driver/DriverHistory';
import DriverHeader from '../components/driver/DriverHeader';
import DriverTabs from '../components/driver/DriverTabs';

export default function DriverDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('online');
    const [orders, setOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Lấy ID tự động từ JWT token đã decode thông qua Context
    const finalDriverId = user?.id || user?.userId;

    // 1. API LẤY SỐ DƯ VÍ
    const fetchWallet = async () => {
        if (!finalDriverId) return;
        try {
            const response = await axiosClient.get(`/orders/driver/${finalDriverId}/wallet`);
            setWalletBalance(response.data.balance || 0);
        } catch (err) {
            console.error('Lỗi lấy ví tiền từ Backend:', err);
        }
    };

    // 2. API LẤY ĐƠN HÀNG TRỰC TUYẾN (PENDING)
    const fetchPendingOrders = async () => {
        setLoading(true); setError('');
        try {
            const response = await axiosClient.get('/orders/pending');
            setOrders(response.data || []);
        } catch (err) {
            console.error('Lỗi tải đơn trực tuyến:', err);
        } finally {
            setLoading(false);
        }
    };

    // 3. API LẤY ĐƠN HÀNG ĐANG CHẠY (ACCEPTED)
    const fetchActiveOrders = async () => {
        try {
            const response = await axiosClient.get(`/orders/driver/${finalDriverId}/active`);
            setActiveOrders(response.data || []);
        } catch (err) {
            console.error("Lỗi lấy danh sách đơn đang chạy:", err);
        }
    };

    // 4. API LẤY LỊCH SỬ CHUYẾN ĐI (COMPLETED)
    const fetchHistoryOrders = async () => {
        if (!finalDriverId) return;
        setLoading(true); setError('');
        try {
            const response = await axiosClient.get(`/orders/driver/${finalDriverId}/history`);
            setHistoryOrders(response.data || []);
        } catch (err) {
            console.error('Lỗi tải lịch sử:', err);
            setError('Không thể tải lịch sử cuốc xe từ máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    // Theo dõi thay đổi Tab và ID tài xế để gọi các API tương ứng
    useEffect(() => {
        if (finalDriverId) {
            fetchWallet();
            if (activeTab === 'online') fetchPendingOrders();
            if (activeTab === 'active') fetchActiveOrders();
            if (activeTab === 'history') fetchHistoryOrders();
        }
    }, [activeTab, finalDriverId]);

    // XỬ LÝ NHẬN ĐƠN HÀNG
    const handleAcceptOrder = async (orderId) => {
        setMessage(''); setError('');
        try {
            await axiosClient.post(`/orders/accept`, { orderId, driverId: finalDriverId });
            setMessage(`🎉 Nhận đơn thành công! Khung bản đồ dẫn đường đã được kích hoạt.`);

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

    // XỬ LÝ HỦY CUỐC XE PHÍA TÀI XẾ
    const handleCancelOrder = async (orderId) => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await axiosClient.post('/orders/driver-cancel', {
                orderId,
                reason: "Tài xế báo hủy cuốc vì sự cố đột xuất"
            });

            setMessage('Đã hủy cuốc xe thành công. Đơn hàng đã được trả về hàng đợi chờ tài xế khác.');

            setActiveOrders(activeOrders.filter(order => order.id !== orderId));

            await fetchWallet();
        } catch (err) {
            console.error("Chi tiết lỗi hủy cuốc xe:", err);

            if (err.response?.data && typeof err.response.data === 'object') {
                const apiError = err.response.data.message || err.response.data.error || "Lỗi hệ thống (404/500)";
                setError(apiError);
            } else {
                setError(err.response?.data || 'Không thể thực hiện yêu cầu hủy đơn lúc này.');
            }
        } finally {
            setLoading(false);
        }
    };

    // XỬ LÝ HOÀN THÀNH CHUYẾN ĐI
    const handleCompleteOrder = async (orderId) => {
        setLoading(true); setError(''); setMessage('');
        try {
            await axiosClient.post('/orders/complete', { orderId });
            setMessage('🏁 Cuốc xe hoàn thành xuất sắc! Tiền trung gian đã được giải phóng vào ví của bạn.');
            setActiveOrders(activeOrders.filter(order => order.id !== orderId));
            await fetchWallet();
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

    // Guard Clause: Đợi Context xác thực xong thông tin tài xế
    if (!finalDriverId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <p className="text-gray-500 font-bold animate-pulse">Đang xác thực quyền tài xế...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
            {/* 1. COMPONENT HEADER */}
            <DriverHeader user={user} walletBalance={walletBalance} onLogout={logout} />

            <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
                {/* 2. COMPONENT TABS SWITCHER */}
                <DriverTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    counts={{ online: orders.length, active: activeOrders.length }}
                />

                {/* KHU VỰC TIÊU ĐỀ DƯỚI TAB */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-extrabold text-gray-800">
                        {activeTab === 'online' && '📡 Danh sách cuốc xe đang chờ (Bán kính 5km)'}
                        {activeTab === 'active' && '📦 Các cuốc xe bạn đang vận chuyển'}
                        {activeTab === 'history' && '📊 Nhật ký lịch sử cuốc xe hoàn thành'}
                    </h2>
                    {activeTab === 'online' && (
                        <button onClick={fetchPendingOrders} className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">🔄 Làm mới</button>
                    )}
                </div>

                {/* THÔNG BÁO TRẠNG THÁI */}
                {message && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-semibold">✅ {message}</div>}
                {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium">⚠️ {error}</div>}

                {/* DANH SÁCH ĐƠN HÀNG THEO TAB */}
                {activeTab === 'history' ? (
                    <DriverHistory historyOrders={historyOrders} />
                ) : (
                    <OrderList
                        orders={activeTab === 'online' ? orders : activeOrders}
                        loading={loading}
                        activeTab={activeTab}
                        onAccept={handleAcceptOrder}
                        onComplete={handleCompleteOrder}
                        onCancel={handleCancelOrder}
                    />
                )}
            </main>
        </div>
    );
}