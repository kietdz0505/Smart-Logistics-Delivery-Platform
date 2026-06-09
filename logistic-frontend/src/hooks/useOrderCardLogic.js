import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

export const useOrderCardLogic = (order, stompClient, onAccept, onComplete, onCancel, onStartDelivery) => {
    const [submitting, setSubmitting] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const [realDistance, setRealDistance] = useState("Đang tính đường thực tế...");
    const [showChatBox, setShowChatBox] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(() => Number(localStorage.getItem(`driver_unread_${order?.id}`) || 0));
    const [inputMessage, setInputMessage] = useState("");
    const [otpInput, setOtpInput] = useState("");
    const [driverCurrentLoc, setDriverCurrentLoc] = useState(() => {
        try {
            const cached = localStorage.getItem('driver_last_known_loc');
            return cached ? JSON.parse(cached) : null;
        } catch (e) { return null; }
    });

    const lastSentCoordsRef = useRef({ lat: 0, lng: 0 });
    const chatEndRef = useRef(null);
    const isInitialLoadRef = useRef(true);
    const fileInputRef = useRef(null);
    const showChatBoxRef = useRef(false);
    const notificationSoundRef = useRef(new Audio('/message-notification.mp3'));
    const driverPhone = String(order?.driverPhone || "unknown");
    const mockLocationRef = useRef({
        accepted: { lat: (order?.pickupLatitude || 0) + 0.003, lng: (order?.pickupLongitude || 0) + 0.004 },
        delivering: { lat: (order?.deliveryLatitude || 0) - 0.002, lng: (order?.deliveryLongitude || 0) - 0.002 }
    });

    useEffect(() => {
        showChatBoxRef.current = showChatBox;
        if (showChatBox && order?.id) {
            setUnreadCount(0);
            localStorage.removeItem(`driver_unread_${order.id}`);
        }
    }, [showChatBox, chatMessages, order?.id]);

    useEffect(() => {
        if (!order?.id || (order.status !== 'ACCEPTED' && order.status !== 'DELIVERING')) return;
        const geoOptions = { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 };
        const watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            const newLoc = { lat: latitude, lng: longitude };
            setDriverCurrentLoc(newLoc);
            localStorage.setItem('driver_last_known_loc', JSON.stringify(newLoc));
            if (stompClient?.connected) {
                const latDiff = Math.abs(latitude - lastSentCoordsRef.current.lat);
                const lngDiff = Math.abs(longitude - lastSentCoordsRef.current.lng);
                if (latDiff > 0.0001 || lngDiff > 0.0001) {
                    stompClient.send("/app/driver/share-location", {}, JSON.stringify({ orderId: order.id, latitude, longitude }));
                    lastSentCoordsRef.current = { lat: latitude, lng: longitude };
                }
            }
        }, () => {
            let fallbackLoc = order.status === 'ACCEPTED' ? mockLocationRef.current.accepted : mockLocationRef.current.delivering;
            setDriverCurrentLoc(fallbackLoc);
            localStorage.setItem('driver_last_known_loc', JSON.stringify(fallbackLoc));
        }, geoOptions);
        return () => navigator.geolocation.clearWatch(watchId);
    }, [order?.status, order?.id, stompClient]);

    useEffect(() => {
        if (!order?.id) return;
        setChatMessages([]);
        isInitialLoadRef.current = true;
        setUnreadCount(Number(localStorage.getItem(`driver_unread_${order.id}`) || 0));
        if (order.status !== 'ACCEPTED' && order.status !== 'DELIVERING') return;
        const messagesRef = collection(db, 'chats', String(order.id), 'drivers', driverPhone, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let hasNewCustomerMessage = false;
            querySnapshot.docChanges().forEach((change) => {
                if (change.type === 'added' && !isInitialLoadRef.current && change.doc.data().senderType === 'CUSTOMER') hasNewCustomerMessage = true;
            });
            setChatMessages(querySnapshot.docs.map(doc => doc.data()));
            if (isInitialLoadRef.current) { isInitialLoadRef.current = false; return; }
            if (hasNewCustomerMessage) {
                notificationSoundRef.current.currentTime = 0;
                notificationSoundRef.current.play().catch(() => {});
                if (!showChatBoxRef.current) {
                    setUnreadCount(prev => { const next = prev + 1; localStorage.setItem(`driver_unread_${order.id}`, next); return next; });
                }
            }
        });
        return () => unsubscribe();
    }, [order?.id, order?.status, driverPhone]);

    useEffect(() => { if (showChatBox) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, showChatBox]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !order?.id) return;
        try {
            await addDoc(collection(db, 'chats', String(order.id), 'drivers', driverPhone, 'messages'), { senderType: "DRIVER", senderPhone: driverPhone, content: inputMessage.trim(), timestamp: new Date() });
            setInputMessage("");
        } catch (error) { console.error("Lỗi gửi tin nhắn:", error); alert("Gửi tin nhắn thất bại!"); }
    };

    const openChat = () => { setShowChatBox(true); setUnreadCount(0); if (order?.id) localStorage.removeItem(`driver_unread_${order.id}`); };

    const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
        const R = 6371e3; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const clickAccept = async () => { if (!submitting && order?.id) { setSubmitting(true); try { await onAccept(order.id); } finally { setSubmitting(false); } } };
    const clickStartDelivery = async (otp) => { if (!submitting && order?.id) { setSubmitting(true); try { await onStartDelivery(order.id, otp); } finally { setSubmitting(false); } } };
    const clickComplete = async () => { if (!submitting && order?.id) { setSubmitting(true); try { await onComplete(order.id); } finally { setSubmitting(false); } } };
    const confirmAndCancel = async () => { if (submitting || !order?.id) return; if (window.confirm("Bạn có chắc chắn muốn HỦY cuốc xe này không?")) { setSubmitting(true); try { if (onCancel) await onCancel(order.id); } finally { setSubmitting(false); } } };

    return { submitting, setSubmitting, showMap, setShowMap, realDistance, setRealDistance, showChatBox, setShowChatBox, chatMessages, unreadCount, inputMessage, setInputMessage, chatEndRef, otpInput, setOtpInput, fileInputRef, driverCurrentLoc, handleSendMessage, openChat, getDistanceInMeters, clickAccept, clickStartDelivery, clickComplete, confirmAndCancel };
};