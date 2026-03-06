
import React, { useState, useEffect, useRef } from 'react';
import { User, BusLocation } from '../types';
import { updateBusLocation } from '../services/mockDatabase';
import Layout from '../components/Layout';

interface DriverScreenProps {
  user: User;
  onLogout: () => void;
}

const DriverScreen: React.FC<DriverScreenProps> = ({ user, onLogout }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<BusLocation | null>(null);
  const watchId = useRef<number | null>(null);
  const simInterval = useRef<number | null>(null);
  const simIndex = useRef(0);

  // Predefined Campus Simulation Path (Coordinates around a typical area)
  const simPath = [
    { lat: 12.9716, lng: 77.5946 },
    { lat: 12.9720, lng: 77.5950 },
    { lat: 12.9725, lng: 77.5955 },
    { lat: 12.9730, lng: 77.5960 },
    { lat: 12.9735, lng: 77.5965 },
    { lat: 12.9740, lng: 77.5970 },
    { lat: 12.9745, lng: 77.5965 },
    { lat: 12.9750, lng: 77.5960 },
    { lat: 12.9745, lng: 77.5950 },
    { lat: 12.9735, lng: 77.5940 },
    { lat: 12.9725, lng: 77.5935 },
    { lat: 12.9718, lng: 77.5940 },
  ];

  const broadcastLocation = (lat: number, lng: number) => {
    const newLocation: BusLocation = {
      lat,
      lng,
      updatedAt: Date.now(),
      status: 'running',
      busId: user.busId || 'bus-01',
      driverName: user.name
    };
    setCurrentLocation(newLocation);
    updateBusLocation(newLocation);
  };

  const startTracking = () => {
    if (isSimulating) stopSimulation();
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsTracking(true);
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        broadcastLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("GPS Error:", error);
        setIsTracking(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
    if (currentLocation) {
      updateBusLocation({ ...currentLocation, status: 'stopped', updatedAt: Date.now() });
    }
  };

  const startSimulation = () => {
    if (isTracking) stopTracking();
    setIsSimulating(true);
    simInterval.current = window.setInterval(() => {
      const coord = simPath[simIndex.current % simPath.length];
      broadcastLocation(coord.lat, coord.lng);
      simIndex.current++;
    }, 2000);
  };

  const stopSimulation = () => {
    if (simInterval.current !== null) {
      clearInterval(simInterval.current);
      simInterval.current = null;
    }
    setIsSimulating(false);
    if (currentLocation) {
      updateBusLocation({ ...currentLocation, status: 'stopped', updatedAt: Date.now() });
    }
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (simInterval.current !== null) clearInterval(simInterval.current);
    };
  }, []);

  return (
    <Layout title="Driver Console" onLogout={onLogout} userName={user.name}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Bus Controls</h3>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              Broadcast your location to students. Use <b>Simulation Mode</b> if you are testing the app from a static location.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={isTracking ? stopTracking : startTracking}
                className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                  isTracking 
                    ? 'bg-red-500 hover:bg-red-600 text-white ring-4 ring-red-100' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                <svg className={`w-6 h-6 ${isTracking ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{isTracking ? 'Stop GPS Tracking' : 'Start GPS Tracking'}</span>
              </button>

              <button
                onClick={isSimulating ? stopSimulation : startSimulation}
                className={`w-full py-4 rounded-2xl font-bold text-sm border-2 transition-all duration-300 flex items-center justify-center space-x-3 ${
                  isSimulating 
                    ? 'bg-amber-50 border-amber-500 text-amber-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{isSimulating ? 'Stop Simulation' : 'Run Simulation Mode'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-2 h-6 bg-indigo-600 rounded-full mr-3"></span>
              Live Telemetry
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 text-sm font-medium">Broadcast Status</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isTracking || isSimulating ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                  {isTracking ? 'Live GPS' : isSimulating ? 'Simulating' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 text-sm font-medium">Bus ID</span>
                <span className="font-bold text-slate-700">{user.busId}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 text-sm font-medium">Current Lat/Lng</span>
                <span className="text-xs font-mono text-indigo-600 font-bold">
                  {currentLocation ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` : '--.------, --.------'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="flex items-center text-lg font-bold mb-4">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quick Setup Guide
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm opacity-90">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center font-bold">1</div>
                <p>Open this tab on your mobile device mounted in the bus.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center font-bold">2</div>
                <p>Tap "Start GPS Tracking" before leaving the station.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center font-bold">3</div>
                <p>Keep this tab open. Do not minimize your browser.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center font-bold">4</div>
                <p>Ensure battery saver mode is OFF for accurate GPS.</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </Layout>
  );
};

export default DriverScreen;
