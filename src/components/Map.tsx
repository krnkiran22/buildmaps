'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/types';
import { useEffect, useMemo } from 'react';

// Fix for default marker icon
const customIcon = L.divIcon({
    html: `<div class="w-4 h-4 bg-white border-2 border-black rounded-full shadow-lg transition-transform duration-300 hover:scale-150"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

function MapRecenter({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 13, { duration: 1.5 });
    }, [center, map]);
    return null;
}

export default function Map({ locations, center }: { locations: Location[], center: [number, number] }) {
    // Group locations by name to draw lines between same-person points
    const connectionLines = useMemo(() => {
        const groups: Record<string, [number, number][]> = {};

        locations.forEach(loc => {
            const nameKey = loc.name.toLowerCase().trim();
            if (!groups[nameKey]) groups[nameKey] = [];
            groups[nameKey].push([loc.lat, loc.lng]);
        });

        return Object.entries(groups)
            .filter(([_, points]) => points.length > 1)
            .map(([name, points]) => ({
                name,
                points
            }));
    }, [locations]);

    return (
        <MapContainer
            center={center}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapRecenter center={center} />

            {/* Connection Lines */}
            {connectionLines.map((line, idx) => (
                <Polyline
                    key={`line-${line.name}-${idx}`}
                    positions={line.points}
                    pathOptions={{
                        color: 'white',
                        weight: 1,
                        dashArray: '5, 10',
                        opacity: 0.4
                    }}
                />
            ))}

            {locations.map((loc, idx) => (
                <Marker
                    key={loc._id || idx}
                    position={[loc.lat, loc.lng]}
                    icon={customIcon}
                >
                    <Popup className="custom-popup">
                        <div className="text-black font-mono uppercase font-bold tracking-tighter">{loc.name}</div>
                        <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{new Date(loc.timestamp).toLocaleString()}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
