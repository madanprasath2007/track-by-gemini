
import React, { useState, useEffect, useRef } from 'react';
import { User, BusLocation } from '../types';
import { subscribeToBus } from '../services/mockDatabase';
import { getBusInsights, speakStatus } from '../services/geminiService';
import Layout from '../components/Layout';
import MapComponent from '../components/MapComponent';
import AiAssistant from '../components/AiAssistant';

interface StudentScreenProps {
  user: User;
  onLogout: () => void;
}

const StudentScreen: React.FC<StudentScreenProps> = ({ user, onLogout }) => {
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [aiStatus, setAiStatus] = useState<string>("Initializing tracker...");
  const [lastUpdateText, setLastUpdateText] = useState<string>("Never");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [followBus, setFollowBus] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToBus('bus-01', (location) => {
      setBusLocation(location);
      const diff = Math.floor((Date.now() - location.updatedAt) / 1000);
      if (diff < 5) {
        setLastUpdateText("Just now");
      } else {
        setLastUpdateText(`${diff}s ago`);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update "time ago" display even if no new coordinates come in
  useEffect(() => {
    const timer = setInterval(() => {
      if (busLocation) {
        const diff = Math.floor((Date.now() - busLocation.updatedAt) / 1000);
        if (diff < 5) setLastUpdateText("Just now");
        else if (diff < 60) setLastUpdateText(`${diff}s ago`);
        else setLastUpdateText(`${Math.floor(diff/60)}m ago`);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [busLocation]);

  useEffect(() => {
    if (busLocation && busLocation.status === 'running') {
      const fetchAiInsight = async () => {
        const insight = await getBusInsights({ lat: busLocation.lat, lng: busLocation.lng }, "Normal Flow");
        setAiStatus(insight);
      };
      
      const interval = setInterval(fetchAiInsight, 45000);
      fetchAiInsight();
      return () => clearInterval(interval);
    } else {
      setAiStatus("Waiting for driver to start route...");
    }
  }, [busLocation?.status]);

  const handleSpeak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    await speakStatus(aiStatus);
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  return (
    <Layout title="UniTrack Map" onLogout={onLogout} userName={user.name}>
      <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden">
        <div className="flex-1 relative">
          {/* Map Component with Auto-Pan Toggle */}
          <MapComponent location={followBus ? busLocation : null} />
          
          <div className="absolute top-6 left-6 flex flex-col space-y-3 z-10">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${busLocation?.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                {busLocation?.status === 'running' ? 'Live Now' : 'Offline'}
              </span>
            </div>

            <button 
              onClick={() => setFollowBus(!followBus)}
              className={`px-4 py-2 rounded-full shadow-lg border backdrop-blur-md transition-all font-bold text-[10px] uppercase tracking-widest flex items-center space-x-2 ${
                followBus 
                ? 'bg-indigo-600 text-white border-indigo-500' 
                : 'bg-white/90 text-slate-600 border-slate-200'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{followBus ? 'Locked to Bus' : 'Free View'}</span>
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-2xl px-4 z-20">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-5 flex items-center space-x-4">
              <button 
                onClick={handleSpeak}
                disabled={isSpeaking}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isSpeaking ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg'}`}
              >
                {isSpeaking ? (
                  <div className="flex items-end space-x-0.5 h-4">
                    <div className="w-1 bg-indigo-400 animate-[bounce_1s_infinite]"></div>
                    <div className="w-1 bg-indigo-400 animate-[bounce_1s_infinite_0.2s]"></div>
                    <div className="w-1 bg-indigo-400 animate-[bounce_1s_infinite_0.4s]"></div>
                  </div>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Route Insight</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Updated: {lastUpdateText}</span>
                </div>
                <p className="text-slate-800 font-bold text-base sm:text-lg truncate leading-tight">
                  {aiStatus}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    Driver: <span className="text-slate-900">{busLocation?.driverName || 'Waiting...'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AiAssistant busLocation={busLocation} />

        <div className="hidden xl:block w-96 bg-white border-l border-slate-200 p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Campus Express</h2>
            <p className="text-slate-400 text-sm font-medium">Line #01 • Morning Route</p>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-indigo-200 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Arrival</p>
                  <p className="text-slate-900 font-black text-xl">4 mins</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[65%] rounded-full"></div>
              </div>
            </div>

            <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-4 flex items-center justify-between">
                <span className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>Route Progress</span>
                <span className="text-[10px] bg-white px-2 py-1 rounded-lg text-indigo-600 font-bold">2/5 Stops</span>
              </h4>
              <div className="space-y-4 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-indigo-100" />
                {[
                  { name: 'Central Gate', status: 'Passed', active: false },
                  { name: 'Library Square', status: 'In Transit', active: true },
                  { name: 'Science Block', status: 'Next', active: false },
                  { name: 'Student Hub', status: 'Scheduled', active: false }
                ].map((stop, i) => (
                  <div key={i} className="flex items-center space-x-4 relative z-10">
                    <div className={`w-4 h-4 rounded-full border-2 bg-white ${stop.active ? 'border-indigo-600 scale-125' : 'border-indigo-200'}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${stop.active ? 'text-indigo-900' : 'text-slate-500'}`}>{stop.name}</p>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${stop.active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {stop.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xs font-black mb-2 opacity-60 uppercase tracking-widest">System Advisory</h4>
              <p className="text-xs leading-relaxed font-medium">
                Simulation mode may be active. Always verify the "Live Now" badge for real-time accuracy.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/20 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentScreen;
