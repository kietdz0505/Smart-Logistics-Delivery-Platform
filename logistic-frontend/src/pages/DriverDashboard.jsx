import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import OrderList from '../components/driver/OrderList';
import DriverHistory from '../components/driver/DriverHistory';
import DriverHeader from '../components/driver/DriverHeader';
import DriverTabs from '../components/driver/DriverTabs';
import useWallet from '../hooks/useWallet';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export default function DriverDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('online');
    const [orders, setOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { walletBalance, fetchWalletBalance } = useWallet();

    const [maxRadius, setMaxRadius] = useState(5);
    const [currentDriverLoc, setCurrentDriverLoc] = useState(null);

    const watchOnlineGeoIdRef = useRef(null);
    const stompClientRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

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

    useEffect(() => {
        if (!user?.id) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(socket);
        stompClient.debug = null; 
        stompClientRef.current = stompClient;

        stompClient.connect({}, () => {
            setIsConnected(true);
            stompClient.subscribe(`/topic/orders/driver/${user.id}`, (message) => {
                if (message.body) {
                    const data = JSON.parse(message.body);
                    setOrders(data);
                    setLoading(false);
                }
            });
        });

        return () => { 
            if (stompClientRef.current) {
                stompClientRef.current.disconnect(); 
                setIsConnected(false);
            }
        };
    }, [user?.id]);

    useEffect(() => {
        if (activeTab === 'online' && isConnected && currentDriverLoc && user?.id) {
            stompClientRef.current.send("/app/driver/screen-online", {}, JSON.stringify({
                driverId: user.id,
                latitude: currentDriverLoc.lat,
                longitude: currentDriverLoc.lng,
                maxRadius: maxRadius
            }));
        }
    }, [currentDriverLoc, maxRadius, isConnected, activeTab, user?.id]);

    useEffect(() => {
        if (activeTab === 'online') {
            setLoading(true); 
            watchOnlineGeoIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    setCurrentDriverLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                () => {
                    setCurrentDriverLoc({ lat: 10.762622, lng: 106.660172 });
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            if (watchOnlineGeoIdRef.current) navigator.geolocation.clearWatch(watchOnlineGeoIdRef.current);
            if (activeTab === 'active') fetchActiveOrders();
            if (activeTab === 'history') fetchHistoryOrders();
        }
    }, [activeTab]);

    const handleAcceptOrder = async (orderId) => {
        try {
            await axiosClient.put('/orders/accept', { orderId });
            setActiveTab('active');
        } catch (err) { setError('Nhận đơn thất bại!'); }
    };

    const handleStartDelivery = async (orderId) => {
        await axiosClient.put('/orders/start-delivery', { orderId });
        fetchActiveOrders();
    };

    const handleCompleteOrder = async (orderId) => {
        await axiosClient.put('/orders/complete', { orderId });
        fetchActiveOrders();
        fetchWalletBalance();
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
                        stompClient={stompClientRef.current}
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