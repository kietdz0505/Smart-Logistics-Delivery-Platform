import OrderMap from './OrderMap';
import { useOrderCardLogic } from '../../hooks/useOrderCardLogic';

export default function OrderCard({ order, activeTab, stompClient, onAccept, onComplete, onCancel, onStartDelivery }) {
    const { 
        submitting, setSubmitting, showMap, setShowMap, realDistance, setRealDistance, showChatBox, setShowChatBox, 
        chatMessages, unreadCount, inputMessage, setInputMessage, chatEndRef, otpInput, setOtpInput, 
        fileInputRef, driverCurrentLoc, handleSendMessage, openChat, getDistanceInMeters, 
        clickAccept, clickStartDelivery, clickComplete, confirmAndCancel 
    } = useOrderCardLogic(order, stompClient, onAccept, onComplete, onCancel, onStartDelivery);

    if (!order) return null;

    return (
        <div className={`bg-white p-5 rounded-2xl shadow-sm border flex flex-col justify-between transition duration-200 relative ${activeTab === 'online' ? 'hover:border-orange-400' : 'border-indigo-200 bg-indigo-50/10'}`}>
            {showChatBox && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[500px]">
                        <div className="bg-slate-800 px-4 py-3.5 border-b border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <div>
                                    <h3 className="text-sm text-white font-black leading-none">Chat với Khách hàng</h3>
                                    <span className="text-[10px] text-slate-400">Đơn hàng #{order.id}</span>
                                </div>
                            </div>
                            <button type="button" onClick={() => setShowChatBox(false)} className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition">Đóng lại</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
                            {chatMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    <p className="text-xs italic">Chưa có tin nhắn nào. Hãy chào khách hàng!</p>
                                </div>
                            ) : (
                                chatMessages.map((msg, idx) => {
                                    const isMe = msg.senderType === 'DRIVER';
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-snug break-all ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'}`}>
                                                <p>{msg.content}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 bg-slate-800 flex gap-2 items-center">
                            <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Nhập nội dung tin nhắn..." className="flex-1 bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent placeholder-slate-400" />
                            <button type="submit" disabled={!inputMessage.trim()} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:bg-slate-600 disabled:text-slate-400 transition shrink-0 shadow-md">Gửi</button>
                        </form>
                    </div>
                </div>
            )}
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : order.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{order.status}</span>
                    <span className={`text-lg font-black ${activeTab === 'online' ? 'text-orange-600' : 'text-indigo-600'}`}>{(order.price || 25000).toLocaleString()} VNĐ</span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                    <p><b>Mã đơn:</b> <span className="font-mono text-gray-700 font-semibold">{order.id}</span></p>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                        <div>
                            <p className="text-slate-400 font-medium text-[11px]">KHÁCH HÀNG</p>
                            <p className="text-gray-800 font-bold text-sm">{order.senderName || "Chưa có tên"}</p>
                        </div>
                        {(order.status === 'ACCEPTED' || order.status === 'DELIVERING') && (
                            <div className="flex gap-1.5">
                                <button type="button" onClick={openChat} className="relative p-2 bg-white text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50 shadow-sm transition flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                                </button>
                                <a href={`tel:${order.senderPhone}`} className="p-2 bg-white text-emerald-600 border border-emerald-200 rounded-full hover:bg-emerald-50 shadow-sm transition flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></a>
                            </div>
                        )}
                    </div>
                    <p className="pt-1"><b>Khoảng cách:</b> {order.distanceKm || 1.2} km</p>
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-0.5">📍</span>
                        <p className="text-gray-700 text-xs"><b className="text-indigo-600">Điểm lấy:</b> {order.pickupAddress}</p>
                    </div>
                    <div className="flex items-start justify-between gap-2 border-l-2 border-dashed border-gray-200 pl-2 ml-1">
                        <div className="flex items-start gap-2">
                            <span className="text-orange-600 mt-0.5">🏁</span>
                            <p className="text-gray-700 text-xs"><b className="text-orange-600">Điểm giao:</b> {order.deliveryAddress}</p>
                        </div>
                        {(order.status === 'ACCEPTED' || order.status === 'DELIVERING') && order.receiverPhone && (
                            <a href={`tel:${order.receiverPhone}`} className="p-1.5 text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100 rounded-lg hover:bg-orange-100 transition flex items-center gap-1 shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>Gọi người nhận</a>
                        )}
                    </div>
                </div>
                {activeTab === 'active' && (
                    <div className="mt-3 pt-2 border-t border-gray-50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">{order.status === 'ACCEPTED' ? <>Lộ trình ĐẾN ĐIỂM LẤY: <span className="text-indigo-600 font-black text-sm bg-indigo-50 px-1.5 py-0.5 rounded">{realDistance}</span></> : <>Lộ trình ĐI GIAO HÀNG: <span className="text-indigo-600 font-black text-sm bg-indigo-50 px-1.5 py-0.5 rounded">{realDistance}</span></>}</span>
                            <button type="button" onClick={() => setShowMap(!showMap)} className="text-[11px] text-indigo-600 font-black hover:underline">{showMap ? 'Ẩn bản đồ' : 'Hiện bản đồ'}</button>
                        </div>
                        {showMap && (
                            <div className="w-full h-[360px] rounded-xl overflow-hidden mt-2 border border-gray-150 shadow-sm">
                                <OrderMap pickupLat={order.pickupLatitude} pickupLng={order.pickupLongitude} deliveryLat={order.deliveryLatitude} deliveryLng={order.deliveryLongitude} driverLat={driverCurrentLoc?.lat} driverLng={driverCurrentLoc?.lng} orderStatus={order.status} pickupAddress={order.pickupAddress} deliveryAddress={order.deliveryAddress} onDistanceChange={setRealDistance} />
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="mt-5">
                {order.status === 'PENDING' && <button onClick={clickAccept} disabled={submitting} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl">Nhận Đơn Hàng Này</button>}
                {order.status === 'ACCEPTED' && (
                    <div className="flex flex-col gap-2.5 w-full">
                        <div className="relative">
                            <input type="text" placeholder="Nhập mã OTP lấy hàng..." value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-center tracking-widest font-black uppercase text-gray-800 placeholder-gray-400 bg-gray-50/50" />
                            {otpInput && <button type="button" onClick={() => setOtpInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs bg-gray-200 px-1.5 py-0.5 rounded">Xóa</button>}
                        </div>
                        <div className="flex gap-2 w-full">
                            <button type="button" onClick={confirmAndCancel} disabled={submitting} className="px-4 py-3 bg-red-50 text-red-600 font-bold text-sm rounded-xl border border-red-200 hover:bg-red-100 transition">Hủy cuốc</button>
                            <button onClick={() => { if (!otpInput.trim()) { alert("Vui lòng nhập mã OTP nhận hàng từ khách hàng!"); return; } clickStartDelivery(otpInput.trim()); }} disabled={submitting} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-sm rounded-xl text-center transition">Bắt đầu giao hàng</button>
                        </div>
                    </div>
                )}
                {order.status === 'DELIVERING' && (
                    <div className="flex flex-col gap-2 w-full">
                        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file && !submitting) { setSubmitting(true); onComplete(order.id, file).catch(() => setSubmitting(false)); } }} />
                        <div className="flex gap-2">
                            <button type="button" onClick={confirmAndCancel} disabled={submitting} className="px-4 py-3 bg-red-50 text-red-600 font-bold text-sm rounded-xl border border-red-200 hover:bg-red-100 transition">Hủy</button>
                            <button onClick={() => { const distance = getDistanceInMeters(driverCurrentLoc?.lat, driverCurrentLoc?.lng, order.deliveryLatitude, order.deliveryLongitude); if (distance > 200) { alert(`Bạn đang ở quá xa (${Math.round(distance)}m).`); return; } fileInputRef.current.click(); }} disabled={submitting} className={`flex-1 py-3 text-white font-bold text-sm rounded-xl transition ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>{submitting ? 'Đang tải lên...' : 'Chụp ảnh & Hoàn thành'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}