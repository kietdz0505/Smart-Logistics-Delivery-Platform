import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import useWallet from '../hooks/useWallet';

import { useDriverSocket } from '../hooks/useDriverSocket';
import { useChatNotifications } from '../hooks/useChatNotifications';
import { useDriverLocation } from '../hooks/useDriverLocation';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [maxRadius, setMaxRadius] = useState(5);

    const { walletBalance, fetchWalletBalance } = useWallet();

    // Sử dụng Custom Hooks
    const { stompClient, isConnected } = useDriverSocket(user?.id, setOrders);
    const { currentDriverLoc } = useDriverLocation(activeTab === 'online');
    useChatNotifications(activeOrders);

    // --- Business Logic ---
    useEffect(() => {
        if (activeTab === 'online' && isConnected && currentDriverLoc && user?.id) {
            stompClient.send("/app/driver/screen-online", {}, JSON.stringify({
                driverId: user.id,
                latitude: currentDriverLoc.lat,
                longitude: currentDriverLoc.lng,
                maxRadius: maxRadius
            }));
        } else if (activeTab === 'active') fetchActiveOrders();
        else if (activeTab === 'history') fetchHistoryOrders();
    }, [activeTab, currentDriverLoc, maxRadius, isConnected, user?.id]);

    const fetchActiveOrders = async () => {
        try {
            const response = await axiosClient.get(`/orders/driver/active`);
            setActiveOrders(response.data || []);
        } catch (err) { console.error("Lỗi lấy đơn đang chạy:", err); }
    };

    const fetchHistoryOrders = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/orders/driver/history');
            setHistoryOrders(response.data || []);
        } catch (err) { setError('Không thể tải lịch sử'); }
        finally { setLoading(false); }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            await axiosClient.put('/orders/accept', { orderId });
            setActiveTab('active');
        } catch (err) { setError('Nhận đơn thất bại!'); }
    };

    const handleStartDelivery = async (orderId, otp) => {
        try {
            await axiosClient.put('/orders/start-delivery', { orderId, otp });
            fetchActiveOrders();
        } catch (error) {
            alert(`Lỗi: ${error.response?.data?.message || "Mã OTP không chính xác!"}`);
        }
    };

    const handleCompleteOrder = async (orderId, imageFile) => {
        const formData = new FormData();
        formData.append("orderId", orderId);
        formData.append("podImage", imageFile);
        try {
            await axiosClient.put('/orders/complete', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            fetchActiveOrders();
            fetchWalletBalance();
            alert("Đơn hàng đã được hoàn tất!");
        } catch (error) { alert("Lỗi khi tải ảnh lên. Vui lòng thử lại!"); }
    };

    const handleCancelOrder = async (orderId) => {
        await axiosClient.put('/orders/driver-cancel', { orderId, reason: "Sự cố" });
        fetchActiveOrders();
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
            <DriverHeader user={user} walletBalance={walletBalance} onLogout={logout} />
            <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
                <DriverTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={{ online: orders.length, active: activeOrders.length }} />

                {activeTab === 'online' && (
                    <div className="mb-6 p-4 bg-white border border-orange-100 rounded-2xl flex items-center justify-between">
                        <input type="range" min="1" max="20" value={maxRadius}
                            onChange={(e) => setMaxRadius(Number(e.target.value))}
                            className="w-full mx-4 accent-orange-600" />
                        <span className="text-sm font-black text-orange-600">{maxRadius} km</span>
                    </div>
                )}

                {error && <div className="p-4 mb-4 bg-red-50 rounded-xl text-red-600 font-medium">{error}</div>}

                {activeTab === 'history' ? (
                    <DriverHistory historyOrders={historyOrders} />
                ) : (
                    <OrderList
                        orders={activeTab === 'online' ? orders : activeOrders}
                        loading={loading}
                        activeTab={activeTab}
                        stompClient={stompClient}
                        onAccept={handleAcceptOrder}
                        onStartDelivery={handleStartDelivery}
                        onComplete={handleCompleteOrder}
                        onCancel={handleCancelOrder}
                    />
                )}
            </main>
        </div>
    );
}