import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function useOrderTracking(orderId) {
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driverLocation, setDriverLocation] = useState(null);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setLoading(true);

                const response = await axiosClient.get(`/orders/${orderId}`);
                const orderData = response.data;

                setOrder(orderData);

                if (
                    orderData.driverLatitude &&
                    orderData.driverLongitude
                ) {
                    setDriverLocation({
                        lat: orderData.driverLatitude,
                        lng: orderData.driverLongitude
                    });
                }
            } catch (err) {
                console.error(
                    "Lỗi tải chi tiết đơn hàng:",
                    err
                );

                alert("Không thể tải thông tin đơn hàng này!");

                navigate('/customer');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetail();
        }
    }, [orderId, navigate]);

    return {
        order,
        setOrder,
        loading,
        driverLocation,
        setDriverLocation
    };
}