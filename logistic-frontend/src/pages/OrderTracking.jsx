import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

import axiosClient from '../api/axiosClient';
import OrderMap from '../components/driver/OrderMap';

import { db } from '../../firebase'; 
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function OrderTracking() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driverLocation, setDriverLocation] = useState(null);

    const stompClientRef = useRef(null);

    const [showChatBox, setShowChatBox] = useState(false); 
    const [chatMessages, setChatMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const chatEndRef = useRef(null);

    const statusText = {
        PENDING: 'Chờ tài xế nhận đơn',
        ACCEPTED: 'Tài xế đã nhận đơn',
        DELIVERING: 'Tài xế đang giao hàng',
        COMPLETED: 'Giao hàng thành công',
        CANCELLED: 'Đơn hàng đã hủy'
    };

    const statusStyles = {
        PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse',
        ACCEPTED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        DELIVERING: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 ring-1 ring-indigo-500/30',
        COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/orders/${orderId}`);
                const orderData = response.data;
                setOrder(orderData);

                if (orderData.driverLatitude && orderData.driverLongitude) {
                    setDriverLocation({
                        lat: orderData.driverLatitude,
                        lng: orderData.driverLongitude
                    });
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết đơn hàng:", err);
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

    useEffect(() => {
        if (!orderId || loading || !order) return;
        if (order.status === 'COMPLETED' || order.status === 'CANCELLED') return;

        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(socket);

        stompClient.debug = (str) => console.log("[WebSocket Debug] " + str);

        stompClient.connect({}, () => {
            stompClientRef.current = stompClient;

            stompClient.subscribe(`/topic/orders/detail/${orderId}`, (message) => {
                if (message.body) {
                    try {
                        const updatedOrder = JSON.parse(message.body);
                        console.log("🔔 Nhận gói cập nhật trạng thái mới từ Server:", updatedOrder);

                        if (updatedOrder.status === 'PENDING') {
                            setDriverLocation(null);
                            setOrder(prevOrder => {
                                return {
                                    ...prevOrder,
                                    ...updatedOrder,
                                    driver: null,
                                    driverName: null,
                                    driverPhone: null,
                                    driverLatitude: null,
                                    driverLongitude: null
                                };
                            });
                        } else {
                            setOrder(prevOrder => {
                                if (!prevOrder) return updatedOrder;
                                return { ...prevOrder, ...updatedOrder };
                            });

                            if (updatedOrder.driverLatitude && updatedOrder.driverLongitude) {
                                setDriverLocation({
                                    lat: updatedOrder.driverLatitude,
                                    lng: updatedOrder.driverLongitude
                                });
                            }
                        }
                    } catch (e) {
                        console.error("Lỗi xử lý dữ liệu đơn hàng cập nhật:", e);
                    }
                }
            });

            stompClient.subscribe(`/topic/order/${orderId}/location`, (message) => {
                if (message.body) {
                    try {
                        const locationData = JSON.parse(message.body);
                        console.log("GPS di động của tài xế cập nhật:", locationData);
                        setDriverLocation({
                            lat: locationData.latitude,
                            lng: locationData.longitude
                        });
                    } catch (e) {
                        console.error("Lỗi xử lý tọa độ GPS tài xế:", e);
                    }
                }
            });
        }, (error) => {
            console.error("Lỗi thiết lập kết nối WebSocket:", error);
        });

        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.disconnect();
                console.log("🔌 Đã ngắt kết nối WebSocket an toàn.");
            }
        };
    }, [orderId, loading, order?.status]);


    useEffect(() => {
        if (!order || (order.status !== 'ACCEPTED' && order.status !== 'DELIVERING')) return;

        const cleanOrderId = orderId.toString().trim();
        console.log(`Khách hàng kết nối Firestore chat cho đơn hàng #${cleanOrderId}`);

        const messagesRef = collection(db, 'chats', cleanOrderId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = [];
            querySnapshot.forEach((doc) => { msgs.push(doc.data()); });
            setChatMessages(msgs);
        }, (error) => {
            console.error("Lỗi lắng nghe Firestore Chat phía Khách Hàng:", error);
        });

        return () => {
            console.log(`🔌 Khách hàng ngắt kết nối Chat đơn #${cleanOrderId}`);
            unsubscribe();
        };
    }, [orderId, order?.status]);

    useEffect(() => {
        if (showChatBox) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, showChatBox]);



    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const messageData = {
            senderType: "CUSTOMER", 
            content: inputMessage.trim(),
            timestamp: new Date()
        };

        try {
            const messagesRef = collection(db, 'chats', String(order.id), 'messages');
            setInputMessage("");
            await addDoc(messagesRef, messageData);
        } catch (error) {
            console.error("Lỗi khách hàng không gửi được tin nhắn:", error);
            alert("Gửi tin nhắn thất bại!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-sm text-slate-600 animate-pulse">Đang kết nối luồng định vị...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-2">
                <p className="font-bold text-red-500">Không tìm thấy dữ liệu đơn hàng.</p>
                <button onClick={() => navigate('/customer')} className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl">
                    Quay lại Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden relative">

            {showChatBox && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[500px]">

                        <div className="bg-slate-800 px-4 py-3.5 border-b border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <div>
                                    <h3 className="text-sm text-white font-black leading-none">
                                        Chat với Tài xế: {order.driver?.fullName || order.driverName}
                                    </h3>
                                    <span className="text-[10px] text-slate-400">Đơn hàng #{orderId?.substring(0, 8)}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowChatBox(false)}
                                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
                            >
                                Đóng lại
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
                            {chatMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                                    <p className="text-xs italic">Chưa có tin nhắn. Nhắn tin nhắc nhở tài xế nếu cần!</p>
                                </div>
                            ) : (
                                chatMessages.map((msg, idx) => {
                                    const isMe = msg.senderType === 'CUSTOMER';
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-snug break-all ${isMe ? 'bg-orange-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'}`}>
                                                <p>{msg.content}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 bg-slate-800 flex gap-2 items-center">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Nhập tin nhắn gửi tài xế..."
                                className="flex-1 bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border border-transparent placeholder-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim()}
                                className="px-4 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 disabled:bg-slate-600 disabled:text-slate-400 transition shrink-0 shadow-md"
                            >
                                Gửi
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-10 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/customer')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black text-slate-700 transition active:scale-95">
                        Dashboard
                    </button>
                    <h1 className="font-black text-slate-800 text-sm md:text-base">Theo dõi hành trình đơn hàng</h1>
                </div>
                <div>
                    <span className="text-[11px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-xl">
                        Mã đơn: #{orderId?.substring(0, 8)}
                    </span>
                </div>
            </header>

            <div className="flex-1 flex flex-col-reverse md:flex-row overflow-hidden w-full h-full relative">

                <div className="w-full h-[30%] md:h-full md:w-[340px] bg-slate-900 text-white p-5 overflow-y-auto flex flex-col justify-between border-t md:border-t-0 md:border-r border-slate-800 flex-shrink-0 z-10 shadow-2xl">
                    <div className="space-y-4">
                        <div className="border-b border-white/10 pb-3">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Trạng thái hiện tại</p>
                            <div className="flex">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border border-solid shadow-sm transition-all duration-300 ${statusStyles[order.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${order.status === 'PENDING' ? 'bg-amber-500 animate-ping' : order.status === 'ACCEPTED' ? 'bg-blue-400' : order.status === 'DELIVERING' ? 'bg-indigo-400 animate-pulse' : order.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                    {statusText[order.status] || order.status}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Nhân sự phụ trách</p>

                            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-slate-100">
                                        {order.driver?.fullName || order.driverName || 'Hệ thống đang điều phối...'}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Tài xế giao vận</p>
                                </div>

                                {(order.status === 'ACCEPTED' || order.status === 'DELIVERING') && (
                                    <button
                                        type="button"
                                        onClick={() => setShowChatBox(true)}
                                        className="p-2.5 bg-orange-600 text-white hover:bg-orange-700 rounded-xl transition shadow-md flex items-center justify-center gap-1 active:scale-95"
                                        title="Chat với tài xế"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span className="text-xs font-black px-0.5">Chat</span>
                                    </button>
                                )}
                            </div>

                            {(order.driver?.phone || order.driverPhone) && (
                                <div className="flex justify-between items-center text-xs bg-white/5 px-3 py-2.5 rounded-xl border border-white/5">
                                    <span className="text-slate-400">Điện thoại:</span>
                                    <a href={`tel:${order.driver?.phone || order.driverPhone}`} className="font-mono font-bold text-emerald-400 hover:underline">
                                        {order.driver?.phone || order.driverPhone}
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2.5 pt-1">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Thông tin lộ trình</p>
                            <div className="space-y-2 text-xs">
                                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                                    <p className="text-slate-400 font-medium text-[10px] uppercase">Địa điểm lấy hàng</p>
                                    <p className="text-slate-200 mt-0.5 font-semibold leading-relaxed">{order.pickupAddress}</p>
                                </div>
                                <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                                    <p className="text-slate-400 font-medium text-[10px] uppercase">Địa điểm giao hàng</p>
                                    <p className="text-slate-200 mt-0.5 font-semibold leading-relaxed">{order.deliveryAddress}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 grid grid-cols-2 gap-2 text-center">
                            <div className="border-r border-white/10">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quãng đường</p>
                                <p className="text-xs font-black text-slate-100 mt-1">{order.distanceKm || 0} km</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tổng cước phí</p>
                                <p className="text-xs font-black text-emerald-400 mt-1">{(order.price || 0).toLocaleString()}đ</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-xs flex-shrink-0">
                        <span className="text-slate-400">Tín hiệu GPS Tài xế:</span>
                        <span className={`font-bold ${driverLocation ? "text-emerald-400" : "text-amber-400 animate-pulse"}`}>
                            {driverLocation ? "Đang truyền" : "Chờ kết nối..."}
                        </span>
                    </div>
                </div>

                <div className="flex-1 h-[70%] md:h-full w-full relative z-0">
                    <OrderMap
                        key={orderId}
                        pickupLat={order.pickupLatitude}
                        pickupLng={order.pickupLongitude}
                        deliveryLat={order.deliveryLatitude}
                        deliveryLng={order.deliveryLongitude}
                        driverLat={driverLocation?.lat || order.driverLatitude}
                        driverLng={driverLocation?.lng || order.driverLongitude}
                        orderStatus={order.status}
                        pickupAddress={order.pickupAddress}
                        deliveryAddress={order.deliveryAddress}
                    />
                </div>
            </div>
        </div>
    );
}