import React from 'react';

export default function ChatModal({
    show,
    order,
    orderId,
    chatMessages,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    chatEndRef,
    onClose
}) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[500px]">

                <div className="bg-slate-800 px-4 py-3.5 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>

                        <div>
                            <h3 className="text-sm text-white font-black leading-none">
                                Chat với Tài xế:{' '}
                                {order?.driver?.fullName ||
                                    order?.driverName}
                            </h3>

                            <span className="text-[10px] text-slate-400">
                                Đơn hàng #
                                {orderId?.substring(
                                    0,
                                    8
                                )}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
                    >
                        Đóng lại
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
                    {chatMessages.length ===
                    0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                            <p className="text-xs italic">
                                Chưa có tin nhắn.
                                Nhắn tin nhắc nhở
                                tài xế nếu cần!
                            </p>
                        </div>
                    ) : (
                        chatMessages.map(
                            (
                                msg,
                                idx
                            ) => {
                                const isMe =
                                    msg.senderType ===
                                    'CUSTOMER';

                                return (
                                    <div
                                        key={
                                            idx
                                        }
                                        className={`flex ${
                                            isMe
                                                ? 'justify-end'
                                                : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-snug break-all ${
                                                isMe
                                                    ? 'bg-orange-600 text-white rounded-br-none'
                                                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                                            }`}
                                        >
                                            <p>
                                                {
                                                    msg.content
                                                }
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                        )
                    )}

                    <div ref={chatEndRef} />
                </div>

                <form
                    onSubmit={
                        handleSendMessage
                    }
                    className="p-3 border-t border-slate-700 bg-slate-800 flex gap-2 items-center"
                >
                    <input
                        type="text"
                        value={
                            inputMessage
                        }
                        onChange={(
                            e
                        ) =>
                            setInputMessage(
                                e.target
                                    .value
                            )
                        }
                        placeholder="Nhập tin nhắn gửi tài xế..."
                        className="flex-1 bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border border-transparent placeholder-slate-400"
                    />

                    <button
                        type="submit"
                        disabled={
                            !inputMessage.trim()
                        }
                        className="px-4 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 disabled:bg-slate-600 disabled:text-slate-400 transition shrink-0 shadow-md"
                    >
                        Gửi
                    </button>
                </form>
            </div>
        </div>
    );
}