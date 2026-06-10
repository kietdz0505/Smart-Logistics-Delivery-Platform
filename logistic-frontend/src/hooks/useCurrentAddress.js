// hooks/useCurrentAddress.js
import { useEffect, useState } from 'react';
import { reverseGeocode } from '../utils/geocoding';

export default function useCurrentAddress(location) {
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (!location) return;

        reverseGeocode(location.lat, location.lng)
            .then(addr => setAddress(addr))
            .catch(console.error);

    }, [
        location?.lat?.toFixed(3),
        location?.lng?.toFixed(3)
    ]);

    return address;
}