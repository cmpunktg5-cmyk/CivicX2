import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useNavigate } from 'react-router-dom';
import { useComplaintsStore, useAuthStore } from '../store';
import { CATEGORIES, STATUS_CONFIG, formatDate } from '../utils/constants';
import { Filter, Navigation, LocateFixed, ChevronRight, X, List, Loader2, Zap, Flame, ShieldAlert, Layers } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icon based on category color
const createIcon = (color, priority) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 4px 15px ${color}44;display:flex;align-items:center;justify-content:center;position:relative;">
    ${priority === 'critical' ? '<div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;background:#ef4444;border-radius:50%;border:2px solid white;animation:pulse 1s infinite;"></div>' : ''}
    <div style="width:8px;height:8px;border-radius:50%;background:white;box-shadow:0 0 10px rgba(255,255,255,0.8);"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

function LocationControl({ position }) {
  const map = useMap();
  return (
    <button 
      onClick={() => position && map.flyTo(position, 15, { animate: true, duration: 1.5 })}
      className="absolute bottom-24 right-4 z-[1000] w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center border border-[var(--color-border)] shadow-xl hover:bg-[var(--color-bg-hover)] transition-all active:scale-95"
    >
      <LocateFixed size={22} className="text-[var(--color-brand)]" />
    </button>
  );
}

function ComplaintMarkers({ filtered, viewMode, setSelectedComplaint }) {
  const map = useMap();
  
  return (
    <MarkerClusterGroup chunkedLoading maxClusterRadius={30}>
      {filtered.map((c) => {
        if (!c.location?.coordinates) return null;
        const cat = CATEGORIES[c.category] || CATEGORIES.other;
        const latLng = [c.location.coordinates[1], c.location.coordinates[0]];
        
        return (
          <Marker
            key={c._id}
            position={latLng}
            icon={createIcon(viewMode === 'intelligence' && (c.urgency === 'critical' || c.urgency === 'high') ? '#ef4444' : cat.color, c.urgency)}
            eventHandlers={{
              click: () => {
                setSelectedComplaint(c);
                map.flyTo(latLng, 16, { animate: true, duration: 1 });
              }
            }}
          />
        );
      })}
    </MarkerClusterGroup>
  );
}

export default function MapView() {
  const navigate = useNavigate();
  const { complaints, fetchComplaints, loading: storeLoading } = useComplaintsStore();
  const { theme } = useAuthStore();
  
  const [center, setCenter] = useState([12.9716, 77.5946]);
  const [userLocation, setUserLocation] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewMode, setViewMode] = useState('standard'); // standard, intelligence

  useEffect(() => {
    fetchComplaints({ limit: 500 });
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setCenter(loc);
          setUserLocation(loc);
        },
        null,
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Filter to show only active/unsolved complaints or selected category
  const filtered = complaints.filter(c => {
    const isCategoryMatch = filter === 'all' || c.category === filter;
    const isUnsolved = c.status !== 'resolved';
    return isCategoryMatch && isUnsolved;
  });
  const criticalReports = filtered.filter(c => c.urgency === 'critical' || c.urgency === 'high');

  return (
    <div className="h-screen w-full flex flex-col bg-[var(--color-bg-base)] overflow-hidden relative">
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1001] p-4 pointer-events-none">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="flex-1 bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-2xl border border-[var(--color-border)] p-3 shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand)]/10 flex items-center justify-center text-[var(--color-brand)]">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-[var(--color-text-primary)]">Unsolved Complaints Map</h1>
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                    {filtered.length} Active • {criticalReports.length} Critical
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setViewMode(viewMode === 'standard' ? 'intelligence' : 'standard')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${viewMode === 'intelligence' ? 'bg-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'}`}
                >
                  <Flame size={14} /> Intelligence
                </button>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showFilters ? 'bg-[var(--color-brand)] text-black' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'}`}
                >
                  <Filter size={18} />
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="pointer-events-auto bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-2xl border border-[var(--color-border)] p-4 shadow-2xl"
              >
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${filter === key ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10' : 'border-[var(--color-border)] bg-[var(--color-bg-base)]'}`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-[8px] font-black uppercase truncate w-full text-center">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative z-0 h-full w-full">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <LayersControl position="bottomleft">
            <LayersControl.BaseLayer checked name="Street View">
              <TileLayer
                url={theme === 'dark' 
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                }
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite View">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Terrain (3D-like)">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution="Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          <ComplaintMarkers 
            filtered={filtered} 
            viewMode={viewMode} 
            setSelectedComplaint={setSelectedComplaint} 
          />
          
          {userLocation && (
            <Marker 
              position={userLocation}
              icon={L.divIcon({
                className: 'user-loc-arrow',
                html: `<div style="width:30px;height:30px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 20px rgba(59,130,246,0.8);display:flex;align-items:center;justify-content:center;position:relative;">
                  <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid white;transform:rotate(45deg);margin-bottom:2px;margin-left:2px;"></div>
                </div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              })}
            />
          )}

          <LocationControl position={userLocation} />
        </MapContainer>
      </div>

      {/* AI Intelligence Sidebar */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 bottom-0 w-full max-w-sm z-[1002] bg-[var(--color-bg-surface)]/95 backdrop-blur-2xl border-l border-[var(--color-border)] shadow-2xl flex flex-col"
          >
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand)]/10 flex items-center justify-center text-[var(--color-brand)]">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight">AI Analysis</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Governance Intel Dossier</p>
                  </div>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-[var(--color-bg-elevated)] rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[var(--color-bg-base)]/50 rounded-2xl border border-[var(--color-border)]">
                  <h3 className="text-sm font-black mb-1">{selectedComplaint.title}</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{selectedComplaint.description}</p>
                </div>

                {selectedComplaint.aiAnalysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-red-500/5 rounded-2xl border border-red-500/10">
                        <p className="text-[9px] font-black uppercase text-red-500 mb-1">Priority Level</p>
                        <p className="text-xs font-black capitalize">{selectedComplaint.aiAnalysis.priority || selectedComplaint.urgency}</p>
                      </div>
                      <div className="p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <p className="text-[9px] font-black uppercase text-blue-500 mb-1">Public Sentiment</p>
                        <p className="text-xs font-black capitalize">{selectedComplaint.aiAnalysis.sentiment}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-[var(--color-brand)]/5 rounded-2xl border border-[var(--color-brand)]/10">
                      <div className="flex items-center gap-2 mb-2 text-[var(--color-brand)]">
                        <ShieldAlert size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Suggested Resolution</span>
                      </div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)] leading-relaxed italic">
                        "{selectedComplaint.aiAnalysis.suggested_resolution}"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] px-1">Detected Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedComplaint.aiAnalysis.keywords?.map((k, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[var(--color-bg-elevated)] rounded-lg text-[10px] font-bold border border-[var(--color-border)]">
                            #{k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50">
              <button 
                onClick={() => navigate(`/complaint/${selectedComplaint._id}`)}
                className="w-full bg-[#111827] text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 group hover:bg-black transition-all"
              >
                Open Case Record
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .leaflet-container { font-family: 'Inter', sans-serif !important; }
        .marker-cluster { background: rgba(30, 215, 96, 0.2) !important; border-radius: 50% !important; }
        .marker-cluster div { background: var(--color-brand) !important; color: black !important; font-weight: 900 !important; border-radius: 50% !important; border: 2px solid white !important; }
      `}} />
    </div>
  );
}
