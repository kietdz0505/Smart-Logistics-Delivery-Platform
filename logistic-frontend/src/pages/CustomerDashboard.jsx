import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

import CustomerHeader from '../components/customer/CustomerHeader';
import CreateOrderForm from '../components/customer/CreateOrderForm';
import DeliveryMap from '../components/customer/DeliveryMap';
import OrdersList from '../components/customer/OrdersList';
import OrderSummary from '../components/customer/OrderSummary';

export default function CustomerDashboard() {
    const { user, logout } = useContext(AuthContext);

    const finalCustomerId =
        user?.userId ||
        user?.id ||
        'Khách-hàng-UUID-Test';

    const [myOrders, setMyOrders] = useState([]);
    const [listLoading, setListLoading] = useState(false);

    const [routeInfo, setRouteInfo] = useState(null);

    const [actionMessage, setActionMessage] = useState('');

    const [senderName, setSenderName] = useState(
        user?.fullName || ''
    );

    const [senderPhone, setSenderPhone] = useState(
        user?.phone || ''
    );

    const [receiverName, setReceiverName] = useState('');
    const [receiverPhone, setReceiverPhone] = useState('');

    const [pickupAddress, setPickupAddress] = useState(
        'Nhà hát Lớn Hà Nội'
    );

    const [pickupLat, setPickupLat] = useState(21.0245);
    const [pickupLng, setPickupLng] = useState(105.8566);

    const [deliveryAddress, setDeliveryAddress] = useState(
        'Hồ Hoàn Kiếm, Hà Nội'
    );

    const [deliveryLat, setDeliveryLat] = useState(21.0285);
    const [deliveryLng, setDeliveryLng] = useState(105.8525);

    const [mapCenter, setMapCenter] = useState({
        lat: 21.0285,
        lng: 105.8542
    });

    const [mode, setMode] = useState('pickup');

    const [loading, setLoading] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [error, setError] = useState('');

    const fetchMyOrders = async (silent = false) => {
        if (!silent) setListLoading(true);

        try {
            const response = await axiosClient.get(
                `/orders/customer/${finalCustomerId}/history`
            );

            setMyOrders(response.data || []);
        } catch (err) {
            console.error(
                'Lỗi lấy lịch sử đơn khách hàng:',
                err
            );
        } finally {
            if (!silent) setListLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();

        const interval = setInterval(() => {
            fetchMyOrders(true);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleCreateOrder = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError('');
        setActionMessage('');
        setCreatedOrder(null);

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
            deliveryLatitude: deliveryLat,

            customerId: finalCustomerId
        };

        try {
            const response = await axiosClient.post(
                '/orders/create',
                orderPayload
            );

            setCreatedOrder(response.data);

            setActionMessage(
                '🎉 Đã gửi yêu cầu giao vận thành công! Đang đợi tài xế phản hồi...'
            );

            setReceiverName('');
            setReceiverPhone('');

            fetchMyOrders();
        } catch (err) {
            console.error(
                'Chi tiết lỗi tạo đơn:',
                err.response?.data
            );

            if (
                err.response?.data &&
                typeof err.response.data === 'object'
            ) {
                const apiError =
                    err.response.data.message ||
                    err.response.data.error ||
                    JSON.stringify(err.response.data);

                setError(`Lỗi hệ thống: ${apiError}`);
            } else {
                setError(
                    err.response?.data ||
                    'Không thể tạo đơn hàng, vui lòng kiểm tra số dư ví!'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (
            !window.confirm(
                'Bạn có chắc chắn muốn HỦY đơn hàng này?'
            )
        )
            return;

        setActionMessage('');
        setError('');

        try {
            await axiosClient.post(
                '/orders/customer-cancel',
                {
                    orderId,
                    reason:
                        'Khách hàng chủ động hủy từ Dashboard khi chưa có xế nhận'
                }
            );

            setActionMessage(
                '⚠️ Đã hủy đơn hàng thành công! Hệ thống đã tự động hoàn lại tiền vào ví của bạn.'
            );

            fetchMyOrders();
        } catch (err) {
            setError(
                err.response?.data ||
                'Hủy đơn thất bại. Có thể tài xế đã nhận đơn trước đó.'
            );

            fetchMyOrders();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <CustomerHeader
                user={user}
                logout={logout}
            />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">

                <div className="lg:col-span-5 flex flex-col gap-4">
                    <CreateOrderForm
                        senderName={senderName}
                        setSenderName={setSenderName}
                        senderPhone={senderPhone}
                        setSenderPhone={setSenderPhone}
                        receiverName={receiverName}
                        setReceiverName={setReceiverName}
                        receiverPhone={receiverPhone}
                        setReceiverPhone={setReceiverPhone}
                        pickupAddress={pickupAddress}
                        setPickupAddress={setPickupAddress}
                        pickupLat={pickupLat}
                        pickupLng={pickupLng}
                        deliveryAddress={deliveryAddress}
                        setDeliveryAddress={setDeliveryAddress}
                        deliveryLat={deliveryLat}
                        deliveryLng={deliveryLng}
                        mode={mode}
                        setMode={setMode}
                        loading={loading}
                        error={error}
                        actionMessage={actionMessage}
                        handleCreateOrder={handleCreateOrder}
                        setPickupLat={setPickupLat}
                        setPickupLng={setPickupLng}
                        setDeliveryLat={setDeliveryLat}
                        setDeliveryLng={setDeliveryLng}
                        setMapCenter={setMapCenter}
                        routeInfo={routeInfo}
                    />

                    <OrderSummary
                        createdOrder={createdOrder}
                    />
                </div>

                <div className="lg:col-span-7 flex flex-col gap-6">
                    <DeliveryMap
                        mode={mode}

                        pickupLat={pickupLat}
                        pickupLng={pickupLng}
                        pickupAddress={pickupAddress}

                        deliveryLat={deliveryLat}
                        deliveryLng={deliveryLng}
                        deliveryAddress={deliveryAddress}

                        setPickupLat={setPickupLat}
                        setPickupLng={setPickupLng}
                        setPickupAddress={setPickupAddress}

                        setDeliveryLat={setDeliveryLat}
                        setDeliveryLng={setDeliveryLng}
                        setDeliveryAddress={setDeliveryAddress}
                        mapCenter={mapCenter}
                        setRouteInfo={setRouteInfo}
                    />

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