'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/types';
import { useEffect } from 'react';

const customIcon = L.divIcon({
    html: `<div class="w-4 h-4 bg-white border-2 border-black rounded-full shadow-lg"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

function MapRecenter({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function Map({ locations, center }: { locations: Location[], center: [number, number] }) {
    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapRecenter center={center} />
            {locations.map((loc, idx) => (
                <Marker
                    key={loc._id || idx}
                    position={[loc.lat, loc.lng]}
                    icon={customIcon}
                >
                    <Popup>
                        <div className="text-black font-semibold">{loc.name}</div>
                        <div className="text-xs text-gray-500">{new Date(loc.timestamp).toLocaleString()}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
