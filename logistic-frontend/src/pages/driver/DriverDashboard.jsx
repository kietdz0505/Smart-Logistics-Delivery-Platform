import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import useWallet from '../../hooks/useWallet';

import { useDriverSocket } from '../../hooks/useDriverSocket';
import { useChatNotifications } from '../../hooks/useChatNotifications';
import { useDriverLocation } from '../../hooks/useDriverLocation';

import OrderList from '../../components/driver/OrderList';
import DriverHistory from '../../components/driver/DriverHistory';
import DriverHeader from '../../components/driver/DriverHeader';
import DriverTabs from '../../components/driver/DriverTabs';
import Swal from 'sweetalert2';
import { MapPin, Navigation } from 'lucide-react';
import useCurrentAddress from '../../hooks/useCurrentAddress';

export default function DriverDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('online');
    const [orders, setOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { currentDriverLoc } = useDriverLocation(activeTab === 'online');
    const [maxRadius, setMaxRadius] = useState(5);

    const [historyOrders, setHistoryOrders] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);

    const { walletBalance, fetchWalletBalance } = useWallet();

    // Sử dụng Custom Hooks
    const { stompClient, isConnected } = useDriverSocket(user?.id, setOrders);
    const currentAddress = useCurrentAddress(currentDriverLoc);
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



    const fetchHistoryOrders = async (page = 0) => {
        setLoading(true);

        try {
            const response = await axiosClient.get(
                `/orders/driver/history?page=${page}`
            );

            setHistoryOrders(response.data.content || []);
            setPageInfo(response.data);

        } catch (err) {
            setError('Không thể tải lịch sử');
        } finally {
            setLoading(false);
        }
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
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title:
                    error.response?.data?.message ||
                    'OTP không hợp lệ',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
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

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Đăng xuất?',
            text: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Ở lại',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            logout();

            Swal.fire({
                icon: 'success',
                title: 'Đã đăng xuất',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
            <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
                <DriverTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={{ online: orders.length, active: activeOrders.length }} />

                {activeTab === 'online' && (
                    <div className="mb-6 p-4 bg-white border border-orange-100 rounded-2xl">
                        <div className="mb-3">
                            <h3 className="text-sm font-bold text-slate-800">
                                Phạm vi tìm kiếm đơn hàng
                            </h3>

                            <p className="text-xs text-slate-500">
                                Chỉ hiển thị các đơn hàng trong bán kính {maxRadius} km tính từ vị trí hiện tại của bạn.
                            </p>

                            {currentAddress && (
                                <div className="mt-3 flex items-start gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <MapPin className="w-4 h-4 text-orange-600" />
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-700">
                                            Vị trí hiện tại
                                        </p>

                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            {currentAddress}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xs font-semibold text-slate-400">
                                1 km
                            </span>

                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={maxRadius}
                                onChange={(e) => setMaxRadius(Number(e.target.value))}
                                className="flex-1 accent-orange-600"
                            />

                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-sm font-black min-w-[70px] text-center">
                                {maxRadius} km
                            </span>
                        </div>
                    </div>
                )}

                {error && <div className="p-4 mb-4 bg-red-50 rounded-xl text-red-600 font-medium">{error}</div>}

                {activeTab === 'history' ? (
                    <DriverHistory
                        historyOrders={historyOrders}
                        pageInfo={pageInfo}
                        onPageChange={fetchHistoryOrders}
                    />
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