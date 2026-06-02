import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

export default function RoutePath({
    pickupLat,
    pickupLng,
    deliveryLat,
    deliveryLng,
    onRouteFound
}) {
    const map = useMap();

    const routingRef = useRef(null);

    // Tạo routing control duy nhất 1 lần
    useEffect(() => {
        routingRef.current = L.Routing.control({
            waypoints: [],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false
        }).addTo(map);

        routingRef.current.on('routesfound', (e) => {
            const route = e.routes[0];

            onRouteFound?.({
                distanceKm:
                    route.summary.totalDistance / 1000,

                durationMin:
                    Math.round(
                        route.summary.totalTime / 60
                    )
            });
        });

        return () => {
            try {
                routingRef.current?.remove();
            } catch (e) {
                console.error(e);
            }
        };
    }, [map]);

    // Chỉ update waypoint
    useEffect(() => {
        if (
            !pickupLat ||
            !pickupLng ||
            !deliveryLat ||
            !deliveryLng
        ) {
            return;
        }

        routingRef.current?.setWaypoints([
            L.latLng(pickupLat, pickupLng),
            L.latLng(deliveryLat, deliveryLng)
        ]);
    }, [
        pickupLat,
        pickupLng,
        deliveryLat,
        deliveryLng
    ]);

    return null;
}