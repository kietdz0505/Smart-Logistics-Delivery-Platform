// hooks/useOrderLogic.js
import { useState } from 'react';
import axiosClient from '../api/axiosClient';

export const useOrderLogic = (user, fetchWalletBalance) => {
    const [senderName, setSenderName] = useState(user?.fullName || '');
    const [senderPhone, setSenderPhone] = useState(user?.phone || '');
    const [receiverName, setReceiverName] = useState('Nguyễn Văn A');
    const [receiverPhone, setReceiverPhone] = useState('0987654320');
    const [pickupAddress, setPickupAddress] = useState('Hiệp Thành 13...');
    const [pickupLat, setPickupLat] = useState(10.88073);
    const [pickupLng, setPickupLng] = useState(106.63917);
    const [deliveryAddress, setDeliveryAddress] = useState('Trường Đại học Mở...');
    const [deliveryLat, setDeliveryLat] = useState(10.67905);
    const [deliveryLng, setDeliveryLng] = useState(106.69088);
    
    const [loading, setLoading] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState('');
    const [mode, setMode] = useState('pickup');
    const [routeInfo, setRouteInfo] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 10.88073, lng: 106.63917 });

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setActionMessage(''); setCreatedOrder(null);
        
        const orderPayload = {
            phone: user?.phone, senderName, senderPhone, receiverName, receiverPhone,
            pickupAddress, pickupLongitude: pickupLng, pickupLatitude: pickupLat,
            deliveryAddress, deliveryLongitude: deliveryLng, deliveryLatitude: deliveryLat,
            distanceKm: routeInfo?.distanceKm || 0,
            customerId: user?.userId || user?.id || 'Khách-hàng-UUID-Test'
        };

        try {
            const response = await axiosClient.post('/orders/create', orderPayload);
            setCreatedOrder(response.data);
            setActionMessage('Đã gửi yêu cầu giao vận thành công! Đang đợi tài xế phản hồi...');
            setReceiverName(''); setReceiverPhone('');
            fetchWalletBalance();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tạo đơn hàng!');
        } finally { setLoading(false); }
    };

    return {
        senderName, setSenderName, senderPhone, setSenderPhone, receiverName, setReceiverName,
        receiverPhone, setReceiverPhone, pickupAddress, setPickupAddress, pickupLat, setPickupLat,
        pickupLng, setPickupLng, deliveryAddress, setDeliveryAddress, deliveryLat, setDeliveryLat,
        deliveryLng, setDeliveryLng, loading, createdOrder, error, actionMessage, mode, setMode,
        routeInfo, setRouteInfo, mapCenter, setMapCenter, handleCreateOrder
    };
};