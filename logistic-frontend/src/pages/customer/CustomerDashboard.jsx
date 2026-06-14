import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import CreateOrderForm from '../../components/customer/CreateOrderForm';
import DeliveryMap from '../../components/customer/DeliveryMap';
import OrdersList from '../../components/customer/OrdersList';
import OrderSummary from '../../components/customer/OrderSummary';
import { useOrderLogic } from '../../hooks/useOrderLogic';
import { useOrderSubscription } from '../../hooks/useOrderSubscription';
import Swal from 'sweetalert2';
import { useOutletContext } from 'react-router-dom';

export default function CustomerDashboard() {
    const { user } = useContext(AuthContext);

    const {
        walletBalance,
        fetchWalletBalance
    } = useOutletContext();

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
            const response = await axiosClient.get('/orders/customer/active');
            setMyOrders(response.data || []);
        } catch (err) {
            console.error('Lỗi lấy danh sách đơn hàng đang xử lý:', err);
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
        const result = await Swal.fire({
            title: 'Hủy đơn hàng?',
            text: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Hủy đơn',
            cancelButtonText: 'Quay lại',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            await axiosClient.put('/orders/customer-cancel', {
                orderId,
                reason: 'Khách hàng chủ động hủy từ Dashboard khi chưa có xế nhận'
            });

            await Swal.fire({
                icon: 'success',
                title: 'Đã hủy đơn hàng',
                text: 'Tiền đã được hoàn lại vào ví của bạn.',
                confirmButtonText: 'OK'
            });

            fetchWalletBalance();
            fetchMyOrders();

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Không thể hủy đơn',
                text:
                    err.response?.data ||
                    'Hủy đơn thất bại. Có thể tài xế đã nhận đơn trước đó.',
                confirmButtonText: 'Đóng'
            });

            fetchMyOrders();
        }
    };

    return (
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
    );
}