import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41]
});

function calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const fLat1 = lat1 * Math.PI / 180;
    const fLat2 = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(fLat2);
    const x = Math.cos(fLat1) * Math.sin(fLat2) - Math.sin(fLat1) * Math.cos(fLat2) * Math.sin(dLng);
    
    let brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
}

const createDriverIcon = (rotationAngle) => {
    return L.divIcon({
        className: 'custom-driver-marker',
        html: `<div style="transform: rotate(${rotationAngle}deg); transition: transform 0.4s ease-in-out; width: 35px; height: 35px; display: flex; items-center; justify-content: center;">
            <img src="https://www.svgrepo.com/show/350375/location-arrow-up.svg" style="width: 100%; height: 100%;" />
        </div>`,
        iconSize: [35, 35],
        iconAnchor: [17, 17]
    });
};

function MapController({ driverCenter, isLocked }) {
    const map = useMap();
    const lastCenterRef = useRef(null);

    useEffect(() => {
        if (!driverCenter || !driverCenter[0] || !driverCenter[1]) return;
        
        if (isLocked) {
            map.flyTo(driverCenter, map.getZoom(), { animate: true, duration: 0.8 });
            lastCenterRef.current = driverCenter;
        } else {
            if (!lastCenterRef.current || lastCenterRef.current[0] !== driverCenter[0] || lastCenterRef.current[1] !== driverCenter[1]) {
                map.panTo(driverCenter); 
                lastCenterRef.current = driverCenter;
            }
        }
    }, [driverCenter, map, isLocked]);
    
    return null;
}

function RoutingEngine({ start, end, onDistanceChange }) {
    const map = useMap();
    const controlRef = useRef(null);

    useEffect(() => {
        if (!map || !start || !end) return;

        if (start[0] === end[0] && start[1] === end[1]) {
            if (controlRef.current) {
                map.removeControl(controlRef.current);
                controlRef.current = null;
            }
            return;
        }

        if (!controlRef.current) {
            controlRef.current = L.Routing.control({
                waypoints: [L.latLng(start), L.latLng(end)],
                lineOptions: { 
                    styles: [{ color: '#2563eb', weight: 6, opacity: 0.85 }] 
                },
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: false,
                show: false, 
                createMarker: () => null 
            }).addTo(map);

            controlRef.current.on('routesfound', function(e) {
                const routes = e.routes;
                if (routes && routes.length > 0) {
                    const distanceInKm = (routes[0].summary.totalDistance / 1000).toFixed(1);
                    if (onDistanceChange) {
                        onDistanceChange(`${distanceInKm} km`);
                    }
                }
            });
        } else {
            controlRef.current.setWaypoints([L.latLng(start), L.latLng(end)]);
        }

        return () => {
            if (controlRef.current && map) {
                try {
                    map.removeControl(controlRef.current);
                } catch (e) {
                    console.warn("Dọn dẹp routing control:", e);
                }
                controlRef.current = null;
            }
        };
    }, [map, start[0], start[1], end[0], end[1], onDistanceChange]); 

    return null;
}

export default function OrderMap({
    pickupLat, pickupLng, deliveryLat, deliveryLng,
    driverLat, driverLng, pickupAddress, deliveryAddress, orderStatus,
    onDistanceChange
}) {
    const [rotation, setRotation] = useState(0);
    const [isMapLocked, setIsMapLocked] = useState(true); 
    const prevLocRef = useRef(null);

    if (!pickupLat || !pickupLng || !deliveryLat || !deliveryLng) return null;

    const pickup = [pickupLat, pickupLng];
    const delivery = [deliveryLat, deliveryLng];
    const driver = (driverLat && driverLng) ? [driverLat, driverLng] : null;

    useEffect(() => {
        if (driverLat && driverLng) {
            if (prevLocRef.current) {
                const { lat: oldLat, lng: oldLng } = prevLocRef.current;
                if (oldLat !== driverLat || oldLng !== driverLng) {
                    const angle = calculateBearing(oldLat, oldLng, driverLat, driverLng);
                    setRotation(angle);
                }
            }
            prevLocRef.current = { lat: driverLat, lng: driverLng };
        }
    }, [driverLat, driverLng]);

    let routeStart = null;
    let routeEnd = null;
    let shouldDrawRoute = false;

    if (orderStatus === 'PENDING') {
        routeStart = pickup;
        routeEnd = delivery;
        shouldDrawRoute = true;
    } else if (orderStatus === 'ACCEPTED' && driver) {
        routeStart = driver;
        routeEnd = pickup;
        shouldDrawRoute = true;
    } else if (orderStatus === 'DELIVERING' && driver) {
        routeStart = driver;
        routeEnd = delivery;
        shouldDrawRoute = true;
    }

    if (routeStart && routeEnd && routeStart[0] === routeEnd[0] && routeStart[1] === routeEnd[1]) {
        shouldDrawRoute = false;
    }

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 relative">
            <MapContainer 
                center={driver || pickup} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }} 
                zoomControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <MapController driverCenter={driver} isLocked={isMapLocked} />

                <Marker position={pickup} icon={DefaultIcon}>
                    <Popup><div className="text-xs"><b>Lấy hàng:</b> {pickupAddress}</div></Popup>
                </Marker>

                <Marker position={delivery} icon={DefaultIcon}>
                    <Popup><div className="text-xs"><b>Giao hàng:</b> {deliveryAddress}</div></Popup>
                </Marker>

                {orderStatus !== 'PENDING' && driver && (
                    <Marker position={driver} icon={createDriverIcon(rotation)}>
                        <Popup><div className="text-xs font-bold">Tài xế (Hướng đi: ${Math.round(rotation)}°)</div></Popup>
                    </Marker>
                )}

                {shouldDrawRoute && (
                    <RoutingEngine
                        start={routeStart}
                        end={routeEnd}
                        onDistanceChange={onDistanceChange}
                    />
                )}
            </MapContainer>

            {orderStatus !== 'PENDING' && driver && (
                <button
                    type="button"
                    onClick={() => setIsMapLocked(!isMapLocked)}
                    className={`absolute bottom-5 right-5 z-[1000] p-3 rounded-full shadow-lg border transition duration-200 flex items-center justify-center group ${
                        isMapLocked 
                            ? 'bg-blue-600 border-blue-700 text-white' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    title={isMapLocked ? "Đang khóa nhìn theo tài xế" : "Định vị lại vị trí của tôi"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-none group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {isMapLocked && (
                        <span className="absolute right-12 bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-bold shadow opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            Đang khóa theo xe
                        </span>
                    )}
                </button>
            )}
        </div>
    );
}