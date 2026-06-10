import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Tooltip
} from 'react-leaflet';

import MapClickHandler from './MapClickHandler';
import MapCenterUpdater from './MapCenterUpdater';
import RoutePath from './RoutePath';
import {
    pickupIcon,
    deliveryIcon
} from '../../utils/mapIcons';

export default function DeliveryMap({
    mode,

    pickupLat,
    pickupLng,
    pickupAddress,

    deliveryLat,
    deliveryLng,
    deliveryAddress,

    setPickupLat,
    setPickupLng,
    setPickupAddress,
    mapCenter,
    setDeliveryLat,
    setDeliveryLng,
    setDeliveryAddress,
    setRouteInfo
}) {
    return (
        <div
            className="
                    bg-white
                    rounded-2xl
                    overflow-hidden
                    border border-slate-200
                    shadow-sm
                    h-[80vh]
                    min-h-[350px]
                "
        >
            <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">
                    Bản đồ điều phối
                </h3>

                <span className="text-xs text-slate-500">
                    Chọn điểm lấy và điểm giao hàng
                </span>
            </div>
            <MapContainer
                center={[21.0285, 105.8542]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapCenterUpdater
                    lat={mapCenter.lat}
                    lng={mapCenter.lng}
                />
                <RoutePath
                    pickupLat={pickupLat}
                    pickupLng={pickupLng}
                    deliveryLat={deliveryLat}
                    deliveryLng={deliveryLng}
                    onRouteFound={setRouteInfo}
                />

                <MapClickHandler
                    mode={mode}

                    setPickupLat={setPickupLat}
                    setPickupLng={setPickupLng}
                    setPickupAddress={setPickupAddress}

                    setDeliveryLat={setDeliveryLat}
                    setDeliveryLng={setDeliveryLng}
                    setDeliveryAddress={setDeliveryAddress}
                />

                <Marker
                    position={[pickupLat, pickupLng]}
                    icon={pickupIcon}
                >
                    <Tooltip
                        permanent
                        direction="top"
                        offset={[0, -15]}
                    >
                        Điểm lấy hàng
                    </Tooltip>
                    <Popup>
                        <div className="min-w-[180px]">
                            <p className="font-bold text-emerald-700 mb-1">
                                Điểm lấy hàng
                            </p>

                            <p className="text-sm text-slate-600">
                                {pickupAddress}
                            </p>
                        </div>
                    </Popup>

                </Marker>

                <Marker
                    position={[deliveryLat, deliveryLng]}
                    icon={deliveryIcon}
                >

                    <Tooltip
                        permanent
                        direction="top"
                        offset={[0, -15]}
                    >
                        Điểm giao hàng
                    </Tooltip>

                    <Popup>
                        <div className="min-w-[180px]">
                            <p className="font-bold text-red-600 mb-1">
                                Điểm giao hàng
                            </p>

                            <p className="text-sm text-slate-600">
                                {deliveryAddress}
                            </p>
                        </div>
                    </Popup>

                </Marker>
            </MapContainer>
        </div>
    );
}