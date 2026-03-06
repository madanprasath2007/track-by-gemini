
import React, { useEffect, useRef, useState } from 'react';
import { BusLocation } from '../types';

interface MapComponentProps {
  location: BusLocation | null;
  zoom?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ location, zoom = 16 }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError('Google Maps API Key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your environment.');
      return;
    }

    if ((window as any).google && (window as any).google.maps) {
      setIsGoogleMapsReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleMapsReady(true);
    script.onerror = () => setError('Failed to load Google Maps script.');
    document.head.appendChild(script);

    return () => {
      // We don't necessarily want to remove the script on unmount as it might be needed elsewhere
      // but we could if we wanted to be very clean.
    };
  }, []);

  useEffect(() => {
    if (isGoogleMapsReady && mapContainerRef.current && !mapInstance.current) {
      const initialPos = location ? { lat: location.lat, lng: location.lng } : { lat: 12.9716, lng: 77.5946 };
      
      mapInstance.current = new google.maps.Map(mapContainerRef.current, {
        center: initialPos,
        zoom: zoom,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      markerInstance.current = new google.maps.Marker({
        position: initialPos,
        map: mapInstance.current,
        optimized: false,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0, // We'll use a custom overlay or just a standard marker for now
        }
      });

      // Custom marker using OverlayView for the pulse effect
      // For simplicity, let's just use a standard marker with a custom icon first
      // Or better, use the same SVG we had before but as a Data URI or just a standard marker
      
      const busIcon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="18" fill="#4F46E5" fill-opacity="0.2">
              <animate attributeName="r" from="10" to="20" dur="1.5s" begin="0s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" begin="0s" repeatCount="indefinite" />
            </circle>
            <circle cx="22" cy="22" r="14" fill="white" />
            <path d="M22 14C18.134 14 15 17.134 15 21C15 26.25 22 32 22 32C22 32 29 26.25 29 21C29 17.134 25.866 14 22 14ZM22 24C20.3431 24 19 22.6569 19 21C19 19.3431 20.3431 18 22 18C23.6569 18 25 19.3431 25 21C25 22.6569 23.6569 24 22 24Z" fill="#4F46E5"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(44, 44),
        anchor: new google.maps.Point(22, 22)
      };

      markerInstance.current.setIcon(busIcon);
    }
  }, [isGoogleMapsReady]);

  useEffect(() => {
    if (location && markerInstance.current && mapInstance.current) {
      const newPos = { lat: location.lat, lng: location.lng };
      
      markerInstance.current.setPosition(newPos);
      mapInstance.current.panTo(newPos);
    }
  }, [location]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 p-8 text-center">
        <div className="max-w-md">
          <div className="text-red-600 font-bold mb-2">Map Error</div>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!isGoogleMapsReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4 shadow-sm"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initializing Google Maps</span>
        </div>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full bg-slate-100 map-container" />;
};

export default MapComponent;
