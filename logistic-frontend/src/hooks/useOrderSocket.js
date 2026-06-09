import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export default function useOrderSocket({
    orderId,
    loading,
    order,
    setOrder,
    setDriverLocation
}) {
    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!orderId || loading || !order) return;

        if (
            order.status === 'COMPLETED' ||
            order.status === 'CANCELLED'
        ) {
            return;
        }

        const socket = new SockJS(
            'http://localhost:8080/ws'
        );

        const stompClient = Stomp.over(socket);

        stompClient.debug = (str) =>
            console.log(
                "[WebSocket Debug] " + str
            );

        stompClient.connect(
            {},
            () => {
                stompClientRef.current = stompClient;

                stompClient.subscribe(
                    `/topic/orders/detail/${orderId}`,
                    (message) => {
                        if (!message.body) return;

                        try {
                            const updatedOrder =
                                JSON.parse(message.body);

                            console.log(
                                "🔔 Nhận gói cập nhật trạng thái mới từ Server:",
                                updatedOrder
                            );

                            if (
                                updatedOrder.status ===
                                'PENDING'
                            ) {
                                setDriverLocation(
                                    null
                                );

                                setOrder(
                                    (prevOrder) => ({
                                        ...prevOrder,
                                        ...updatedOrder,
                                        driver: null,
                                        driverName:
                                            null,
                                        driverPhone:
                                            null,
                                        driverLatitude:
                                            null,
                                        driverLongitude:
                                            null
                                    })
                                );
                            } else {
                                setOrder(
                                    (prevOrder) => {
                                        if (
                                            !prevOrder
                                        ) {
                                            return updatedOrder;
                                        }

                                        return {
                                            ...prevOrder,
                                            ...updatedOrder
                                        };
                                    }
                                );

                                if (
                                    updatedOrder.driverLatitude &&
                                    updatedOrder.driverLongitude
                                ) {
                                    setDriverLocation({
                                        lat: updatedOrder.driverLatitude,
                                        lng: updatedOrder.driverLongitude
                                    });
                                }
                            }
                        } catch (e) {
                            console.error(
                                "Lỗi xử lý dữ liệu đơn hàng cập nhật:",
                                e
                            );
                        }
                    }
                );

                stompClient.subscribe(
                    `/topic/order/${orderId}/location`,
                    (message) => {
                        if (!message.body)
                            return;

                        try {
                            const locationData =
                                JSON.parse(
                                    message.body
                                );

                            console.log(
                                "GPS di động của tài xế cập nhật:",
                                locationData
                            );

                            setDriverLocation({
                                lat: locationData.latitude,
                                lng: locationData.longitude
                            });
                        } catch (e) {
                            console.error(
                                "Lỗi xử lý tọa độ GPS tài xế:",
                                e
                            );
                        }
                    }
                );
            },
            (error) => {
                console.error(
                    "Lỗi thiết lập kết nối WebSocket:",
                    error
                );
            }
        );

        return () => {
            if (
                stompClientRef.current &&
                stompClientRef.current.connected
            ) {
                stompClientRef.current.disconnect();

                console.log(
                    "🔌 Đã ngắt kết nối WebSocket an toàn."
                );
            }
        };
    }, [
        orderId,
        loading,
        order?.status,
        order,
        setOrder,
        setDriverLocation
    ]);

    return {
        stompClientRef
    };
}