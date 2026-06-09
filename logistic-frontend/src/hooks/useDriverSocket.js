import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export const useDriverSocket = (userId, setOrders) => {
    const stompClientRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(socket);
        stompClient.debug = null;
        stompClientRef.current = stompClient;

        stompClient.connect({}, () => {
            setIsConnected(true);
            stompClient.subscribe(`/topic/orders/driver/${userId}`, (message) => {
                if (message.body) setOrders(JSON.parse(message.body));
            });
        });

        return () => stompClient.disconnect();
    }, [userId]);

    return { stompClient: stompClientRef.current, isConnected };
};