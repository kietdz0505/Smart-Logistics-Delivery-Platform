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
        <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[45vh] min-h-[350px]">
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

                <Marker position={[pickupLat, pickupLng]}>

                    <Tooltip
                        permanent
                        direction="top"
                        offset={[0, -15]}
                    >
                        📍 Điểm lấy
                    </Tooltip>

                    <Popup>
                        <div>
                            <b>📍 Điểm lấy hàng</b>
                            <br />
                            {pickupAddress}
                        </div>
                    </Popup>

                </Marker>

                <Marker position={[deliveryLat, deliveryLng]}>

                    <Tooltip
                        permanent
                        direction="top"
                        offset={[0, -15]}
                    >
                        🏁 Điểm giao
                    </Tooltip>

                    <Popup>
                        <div>
                            <b>🏁 Điểm giao hàng</b>
                            <br />
                            {deliveryAddress}
                        </div>
                    </Popup>

                </Marker>
            </MapContainer>
        </div>
    );
}