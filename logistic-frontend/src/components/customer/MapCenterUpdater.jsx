import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function MapCenterUpdater({
    lat,
    lng
}) {
    const map = useMap();

    useEffect(() => {
        if (!lat || !lng) return;

        map.flyTo(
            [lat, lng],
            map.getZoom(),
            {
                animate: true,
                duration: 1.5
            }
        );
    }, [lat, lng, map]);

    return null;
}