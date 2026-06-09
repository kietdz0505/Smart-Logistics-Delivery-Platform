import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import OrderMap from '../components/driver/OrderMap';

import ChatModal from '../components/customer/ChatModal';
import OrderInfoPanel from '../components/customer/OrderInfoPanel';

import useOrderTracking from '../hooks/useOrderTracking';
import useOrderSocket from '../hooks/useOrderSocket';
import useOrderChat from '../hooks/useOrderChat';

import { Toaster } from 'react-hot-toast';

export default function OrderTracking() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const {
        order,
        setOrder,
        loading,
        driverLocation,
        setDriverLocation
    } = useOrderTracking(orderId);

    useOrderSocket({
        orderId,
        loading,
        order,
        setOrder,
        setDriverLocation
    });

    const chat = useOrderChat(order, orderId);

    const statusText = {
        PENDING: 'Chờ tài xế nhận đơn',
        ACCEPTED: 'Tài xế đã nhận đơn',
        DELIVERING: 'Tài xế đang giao hàng',
        COMPLETED: 'Giao hàng thành công',
        CANCELLED: 'Đơn hàng đã hủy'
    };

    const statusStyles = {
        PENDING:
            'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse',

        ACCEPTED:
            'bg-blue-500/10 text-blue-400 border-blue-500/20',

        DELIVERING:
            'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 ring-1 ring-indigo-500/30',

        COMPLETED:
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',

        CANCELLED:
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>

                <p className="font-bold text-sm text-slate-600 animate-pulse">
                    Đang kết nối luồng định vị...
                </p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-2">
                <p className="font-bold text-red-500">
                    Không tìm thấy dữ liệu đơn hàng.
                </p>

                <button
                    onClick={() =>
                        navigate('/customer')
                    }
                    className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl"
                >
                    Quay lại Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden relative">

            <Toaster position="top-right" />

            <ChatModal
                show={chat.showChatBox}
                order={order}
                orderId={orderId}
                chatMessages={chat.chatMessages}
                inputMessage={chat.inputMessage}
                setInputMessage={chat.setInputMessage}
                handleSendMessage={chat.handleSendMessage}
                chatEndRef={chat.chatEndRef}
                onClose={chat.closeChat}
            />

            <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-10 flex-shrink-0">

                <div className="flex items-center gap-3">
                    <button
                        onClick={() =>
                            navigate('/customer')
                        }
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black text-slate-700 transition active:scale-95"
                    >
                        Dashboard
                    </button>

                    <h1 className="font-black text-slate-800 text-sm md:text-base">
                        Theo dõi hành trình đơn hàng
                    </h1>
                </div>

                <div>
                    <span className="text-[11px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-xl">
                        Mã đơn: #
                        {orderId?.substring(
                            0,
                            8
                        )}
                    </span>
                </div>
            </header>

            <div className="flex-1 flex flex-col-reverse md:flex-row overflow-hidden w-full h-full relative">

                <OrderInfoPanel
                    order={order}
                    orderId={orderId}
                    unreadCount={
                        chat.unreadCount
                    }
                    driverLocation={
                        driverLocation
                    }
                    statusText={statusText}
                    statusStyles={
                        statusStyles
                    }
                    onOpenChat={
                        chat.openChat
                    }
                />

                <div className="flex-1 h-[70%] md:h-full w-full relative z-0">
                    <OrderMap
                        key={orderId}
                        pickupLat={
                            order.pickupLatitude
                        }
                        pickupLng={
                            order.pickupLongitude
                        }
                        deliveryLat={
                            order.deliveryLatitude
                        }
                        deliveryLng={
                            order.deliveryLongitude
                        }
                        driverLat={
                            driverLocation?.lat ||
                            order.driverLatitude
                        }
                        driverLng={
                            driverLocation?.lng ||
                            order.driverLongitude
                        }
                        orderStatus={
                            order.status
                        }
                        pickupAddress={
                            order.pickupAddress
                        }
                        deliveryAddress={
                            order.deliveryAddress
                        }
                    />
                </div>
            </div>
        </div>
    );
}