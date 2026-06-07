import { useMapEvents } from 'react-leaflet';

const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const data = await response.json();

        return data.display_name || '';
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return '';
    }
};

export default function MapClickHandler({
    mode,

    setPickupLat,
    setPickupLng,
    setPickupAddress,

    setDeliveryLat,
    setDeliveryLng,
    setDeliveryAddress
}) {
    useMapEvents({
        async click(e) {
            const currentMode = mode;

            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            if (currentMode === 'pickup') {
                setPickupLat(lat);
                setPickupLng(lng);

                setPickupAddress('Đang lấy địa chỉ...');
            } else {
                setDeliveryLat(lat);
                setDeliveryLng(lng);

                setDeliveryAddress('Đang lấy địa chỉ...');
            }

            const address = await reverseGeocode(lat, lng);

            if (!address) {
                if (currentMode === 'pickup') {
                    setPickupAddress(
                        `(${lat.toFixed(6)}, ${lng.toFixed(6)})`
                    );
                } else {
                    setDeliveryAddress(
                        `(${lat.toFixed(6)}, ${lng.toFixed(6)})`
                    );
                }

                return;
            }

            if (currentMode === 'pickup') {
                setPickupAddress(address);
            } else {
                setDeliveryAddress(address);
            }
        }
    });

    return null;
}