import { useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export const useChatNotifications = (activeOrders) => {
    const notificationSoundRef = useRef(new Audio('/message-notification.mp3'));
    const listenedOrdersRef = useRef({});

    useEffect(() => {
        const unsubscribers = activeOrders.map(order => {
            if (listenedOrdersRef.current[order.id]) return null;
            listenedOrdersRef.current[order.id] = true;

            const driverPhone = String(order?.driverPhone || "unknown");
            const q = query(collection(db, 'chats', String(order.id), 'drivers', driverPhone, 'messages'), orderBy('timestamp', 'asc'));

            let firstLoad = true;
            return onSnapshot(q, (snapshot) => {
                if (firstLoad) { firstLoad = false; return; }
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added' && change.doc.data().senderType === 'CUSTOMER') {
                        notificationSoundRef.current.play().catch(() => {});
                    }
                });
            });
        }).filter(Boolean);

        return () => unsubscribers.forEach(fn => fn && fn());
    }, [activeOrders]);
};