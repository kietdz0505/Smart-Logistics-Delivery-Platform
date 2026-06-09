import { useState, useEffect, useRef } from 'react';

export const useDriverLocation = (shouldWatch) => {
    const [currentDriverLoc, setCurrentDriverLoc] = useState(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        if (shouldWatch) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => setCurrentDriverLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setCurrentDriverLoc({ lat: 10.762622, lng: 106.660172 }),
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }
        return () => watchIdRef.current && navigator.geolocation.clearWatch(watchIdRef.current);
    }, [shouldWatch]);

    return { currentDriverLoc };
};