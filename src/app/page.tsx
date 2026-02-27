'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Navigation } from 'lucide-react';
import { Location } from '@/types';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-neutral-900 flex items-center justify-center text-white font-mono uppercase tracking-widest text-xs">Initializing Maps...</div>
});

const API_URL = '/api';

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]);
  const [isLocating, setIsLocating] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_URL}/locations`);
      const data = await res.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  useEffect(() => {
    fetchLocations();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  const handleAddLocation = () => {
    setIsLocating(true);
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const name = prompt("Enter your name:") || "Anonymous";

      try {
        const res = await fetch(`${API_URL}/locations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, lat, lng }),
        });

        if (res.ok) {
          await fetchLocations();
          setCenter([lat, lng]);
        }
      } catch (err) {
        console.error('Error adding location:', err);
      } finally {
        setIsLocating(false);
      }
    }, (err) => {
      console.error('Geolocation error:', err);
      alert("Please enable location permissions");
      setIsLocating(false);
    });
  };

  return (
    <main className="fixed inset-0 bg-black text-white overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <Map locations={locations} center={center} />
      </div>

      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
          Build<span className="text-neutral-500">Maps</span>
        </h1>
        <p className="text-[10px] font-mono mt-2 text-neutral-400 tracking-[0.3em] uppercase opacity-60">Squad Locator // Live Feed</p>
      </div>

      <div className="absolute bottom-10 right-10 z-10">
        <button
          onClick={handleAddLocation}
          disabled={isLocating}
          className="group relative flex items-center justify-center w-20 h-20 bg-white text-black rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-500 hover:scale-110 active:scale-90 disabled:opacity-50"
        >
          {isLocating ? (
            <Navigation className="animate-pulse w-8 h-8" />
          ) : (
            <Plus className="w-10 h-10" />
          )}
          <span className="absolute -top-14 right-0 bg-white text-black text-[10px] font-bold px-4 py-2 uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            Push My Location
          </span>
        </button>
      </div>

      <div className="absolute bottom-10 left-10 z-10 bg-black/60 backdrop-blur-xl border border-white/5 p-6 rounded-2xl md:max-w-[240px] pointer-events-none hidden md:block group hover:bg-black/80 transition-all duration-500">
        <div className="text-[10px] text-neutral-500 mb-2 uppercase font-bold tracking-[0.2em]">Active Records</div>
        <div className="text-4xl font-black tabular-nums tracking-tighter">{locations.length}</div>
        <div className="w-full h-[1px] bg-gradient-to-r from-white/20 to-transparent my-4"></div>
        <div className="text-[10px] leading-relaxed text-neutral-500 uppercase font-medium tracking-wider">
          Monochrome Protocol <br />
          Cloud Uplink Established
        </div>
      </div>
    </main>
  );
}
