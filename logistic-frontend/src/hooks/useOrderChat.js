import { useState, useEffect, useRef } from 'react';

import { db } from '../../firebase';

import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot
} from 'firebase/firestore';

export default function useOrderChat(order, orderId) {
    const [showChatBox, setShowChatBox] = useState(false);

    const [chatMessages, setChatMessages] = useState([]);

    const [inputMessage, setInputMessage] = useState('');

    const [unreadCount, setUnreadCount] = useState(() => {
        return Number(
            localStorage.getItem(
                `customer_unread_${orderId}`
            ) || 0
        );
    });

    const chatEndRef = useRef(null);

    const isInitialLoadRef = useRef(true);

    const notificationSoundRef = useRef(
        typeof Audio !== 'undefined'
            ? new Audio(
                  '/message-notification.mp3'
              )
            : null
    );

    const getDriverPhone = () =>
        order?.driverPhone || null;

    useEffect(() => {
        return () => {
            notificationSoundRef.current?.pause();
        };
    }, []);

    useEffect(() => {
        const driverPhone =
            getDriverPhone();

        if (
            !order?.id ||
            !driverPhone ||
            (
                order.status !== 'ACCEPTED' &&
                order.status !== 'DELIVERING'
            )
        ) {
            setChatMessages([]);
            return;
        }

        const messagesRef = collection(
            db,
            'chats',
            String(order.id),
            'drivers',
            String(driverPhone),
            'messages'
        );

        const q = query(
            messagesRef,
            orderBy(
                'timestamp',
                'asc'
            )
        );

        isInitialLoadRef.current = true;

        const unsubscribe =
            onSnapshot(
                q,
                (querySnapshot) => {
                    const messages = [];

                    querySnapshot.forEach(
                        (doc) => {
                            messages.push(
                                doc.data()
                            );
                        }
                    );

                    setChatMessages(
                        messages
                    );

                    querySnapshot
                        .docChanges()
                        .forEach(
                            (change) => {
                                if (
                                    change.type ===
                                        'added' &&
                                    !isInitialLoadRef.current &&
                                    change.doc.data()
                                        .senderType !==
                                        'CUSTOMER'
                                ) {
                                    notificationSoundRef.current
                                        ?.play()
                                        .catch(
                                            (
                                                e
                                            ) =>
                                                console.error(
                                                    'Audio play failed',
                                                    e
                                                )
                                        );

                                    if (
                                        !showChatBox
                                    ) {
                                        setUnreadCount(
                                            (
                                                prev
                                            ) => {
                                                const next =
                                                    prev +
                                                    1;

                                                localStorage.setItem(
                                                    `customer_unread_${orderId}`,
                                                    next
                                                );

                                                return next;
                                            }
                                        );
                                    }
                                }
                            }
                        );

                    isInitialLoadRef.current =
                        false;
                }
            );

        return () => unsubscribe();
    }, [
        order?.id,
        order?.status,
        order?.driverPhone,
        orderId,
        showChatBox
    ]);

    useEffect(() => {
        if (showChatBox) {
            chatEndRef.current?.scrollIntoView(
                {
                    behavior:
                        'smooth'
                }
            );
        }
    }, [
        chatMessages,
        showChatBox
    ]);

    const handleSendMessage =
        async (e) => {
            e.preventDefault();

            const driverPhone =
                getDriverPhone();

            if (
                !inputMessage.trim()
            )
                return;

            if (!driverPhone) {
                alert(
                    'Thông tin tài xế chưa sẵn sàng để chat.'
                );
                return;
            }

            try {
                const messagesRef =
                    collection(
                        db,
                        'chats',
                        String(order.id),
                        'drivers',
                        String(
                            driverPhone
                        ),
                        'messages'
                    );

                await addDoc(
                    messagesRef,
                    {
                        senderType:
                            'CUSTOMER',
                        content:
                            inputMessage.trim(),
                        timestamp:
                            new Date()
                    }
                );

                setInputMessage('');
            } catch (error) {
                console.error(
                    'Lỗi gửi tin nhắn:',
                    error
                );

                alert(
                    'Có lỗi xảy ra, vui lòng thử lại.'
                );
            }
        };

    const openChat = () => {
        setShowChatBox(true);

        setUnreadCount(0);

        localStorage.removeItem(
            `customer_unread_${orderId}`
        );
    };

    const closeChat = () => {
        setShowChatBox(false);
    };

    return {
        showChatBox,
        setShowChatBox,

        openChat,
        closeChat,

        chatMessages,

        unreadCount,

        inputMessage,
        setInputMessage,

        handleSendMessage,

        chatEndRef
    };
}