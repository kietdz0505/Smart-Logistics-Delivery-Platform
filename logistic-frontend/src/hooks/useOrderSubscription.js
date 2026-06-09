// hooks/useOrderSubscription.js
import { useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export const useOrderSubscription = (userId, setMyOrders, fetchMyOrders, fetchWalletBalance) => {
    useEffect(() => {
        if (!userId || userId === 'Khách-hàng-UUID-Test') return;
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(socket);
        stompClient.debug = null;
        stompClient.connect({}, () => {
            stompClient.subscribe(`/topic/orders/customer/${userId}`, (message) => {
                const updatedOrder = JSON.parse(message.body);
                setMyOrders(prev => prev.some(o => o.id === updatedOrder.id) 
                    ? prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                    : [updatedOrder, ...prev]);
                if (updatedOrder.status === 'ACCEPTED') fetchMyOrders(true);
                if (['COMPLETED', 'CANCELLED'].includes(updatedOrder.status)) fetchWalletBalance();
            });
        });
        return () => stompClient.disconnect();
    }, [userId]);
};