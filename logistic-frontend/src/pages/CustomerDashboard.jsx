import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import useWallet from '../hooks/useWallet';
import CustomerHeader from '../components/customer/CustomerHeader';
import CreateOrderForm from '../components/customer/CreateOrderForm';
import DeliveryMap from '../components/customer/DeliveryMap';
import OrdersList from '../components/customer/OrdersList';
import OrderSummary from '../components/customer/OrderSummary';
import { useOrderLogic } from '../hooks/useOrderLogic';
import { useOrderSubscription } from '../hooks/useOrderSubscription';
import Swal from 'sweetalert2';

export default function CustomerDashboard() {
    const { user, logout } = useContext(AuthContext);
    const { walletBalance, fetchWalletBalance } = useWallet();

    const [myOrders, setMyOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [listLoading, setListLoading] = useState(false);

    // Sử dụng Hook logic cho form và các trạng thái liên quan
    const formProps = useOrderLogic(user, fetchWalletBalance);

    // Hàm lấy danh sách đơn hàng
    const fetchMyOrders = useCallback(async (silent = false) => {
        if (!silent) setListLoading(true);
        try {
            const response = await axiosClient.get('/orders/customer/history');
            setMyOrders(response.data || []);
        } catch (err) {
            console.error('Lỗi lấy lịch sử đơn khách hàng:', err);
        } finally {
            if (!silent) setListLoading(false);
        }
    }, []);

    // Sử dụng Hook WebSocket
    useOrderSubscription(user?.id, setMyOrders, fetchMyOrders, fetchWalletBalance);

    useEffect(() => {
        fetchMyOrders();
        fetchWalletBalance();
    }, [fetchMyOrders, fetchWalletBalance]);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc chắn muốn HỦY đơn hàng này?')) return;

        formProps.setActionMessage('');
        formProps.setError('');

        try {
            await axiosClient.put('/orders/customer-cancel', {
                orderId,
                reason: 'Khách hàng chủ động hủy từ Dashboard khi chưa có xế nhận'
            });
            formProps.setActionMessage('Đã hủy đơn hàng thành công! Hệ thống đã tự động hoàn lại tiền vào ví của bạn.');
            fetchWalletBalance();
        } catch (err) {
            formProps.setError(err.response?.data || 'Hủy đơn thất bại. Có thể tài xế đã nhận đơn trước đó.');
            fetchMyOrders();
        }
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
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <CustomerHeader user={user} walletBalance={walletBalance} logout={handleLogout} />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <CreateOrderForm {...formProps} />
                    <OrderSummary createdOrder={formProps.createdOrder} />
                </div>

                <div className="lg:col-span-7 flex flex-col gap-6">
                    <DeliveryMap {...formProps} />
                    <OrdersList
                        myOrders={myOrders}
                        listLoading={listLoading}
                        fetchMyOrders={fetchMyOrders}
                        handleCancelOrder={handleCancelOrder}
                    />
                </div>
            </div>
        </div>
    );
}