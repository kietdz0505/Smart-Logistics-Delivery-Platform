export default function MapRoute({ pickupAddress, deliveryAddress }) {
    // Đường link điều hướng gốc mở sang App Google Maps khi click
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickupAddress)}&destination=${encodeURIComponent(deliveryAddress)}&travelmode=driving`;

    return (
        <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">🗺️ Bản đồ lộ trình</span>
                <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 animate-pulse"
                >
                    Mở Bản Đồ Chỉ Đường ↗
                </a>
            </div>
            
            {/* Khung bản đồ Iframe hiển thị điểm đến trực quan */}
            <div className="w-full h-44 rounded-lg overflow-hidden bg-slate-200 border relative shadow-inner">
                <iframe
                    title="Route Map"
                    width="100%"
                    height="100%"
                    frameBorder="0" 
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=BẠN_CÓ_THỂ_BỎ_TRỐNG_HOẶC_DÙNG_LINK_SEARCH&q=${encodeURIComponent(deliveryAddress)}`}
                    // Nếu không có API Key, dùng URL nhúng cộng đồng an toàn dưới đây:
                    srcDoc={`
                        <style>body{margin:0;font-family:sans-serif;background:#e5e7eb;display:flex;justify-content:center;align-items:center;height:100%;color:#4b5563;font-size:12px;}</style>
                        <div style="text-align:center;">
                            <p>📍 <b>Từ:</b> ${pickupAddress}</p>
                            <p>🏁 <b>Đến:</b> ${deliveryAddress}</p>
                            <p style="color:#4f46e5;font-weight:bold;">Bấm "Mở Bản Đồ Chỉ Đường" phía trên để dẫn đường Realtime</p>
                        </div>
                    `}
                ></iframe>
            </div>
        </div>
    );
}