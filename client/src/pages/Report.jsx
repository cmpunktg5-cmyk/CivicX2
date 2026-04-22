import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronLeft, Loader2, MapPin, Mic, MicOff, Send, Sparkles, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useComplaintsStore } from '../store';
import { CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Clickable Map Component
function LocationSelector({ position, setPosition, setAddress }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createComplaint } = useComplaintsStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(location.state?.category || '');
  const [images, setImages] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-fetch location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (!userLocation) {
            setUserLocation(loc);
            setLocationAddress(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
          }
        },
        () => {
          if (!userLocation) setLocationAddress('Location unavailable. Please select on map.');
        }
      );
    }
  }, []);

  // Speech-to-text
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false; 
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setDescription((prev) => prev ? prev + ' ' + transcript : transcript);
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') return; // Ignore natural silence timeouts
      console.error("Speech error", e.error);
      setIsRecording(false);
      toast.error('Voice recognition stopped. Please try again.');
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast.success('Listening... Speak now');
  };

  // Image upload (convert to base64 preview)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error('Please add a title');
    if (!description.trim()) return toast.error('Please describe the issue');

    setSubmitting(true);

    const complaintData = {
      title: title.trim(),
      description: description.trim(),
      category: category || undefined,
      images,
      location: userLocation ? {
        coordinates: [userLocation.lng, userLocation.lat],
        address: locationAddress
      } : undefined
    };

    const result = await createComplaint(complaintData);

    if (result.success) {
      setAiResult(result.data.aiClassification || result.data.aiAnalysis);
      setStep(3);
      toast.success(`+${result.data.pointsAwarded || 50} points earned!`);
    } else {
      toast.error(result.message);
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-dvh bg-[var(--color-bg-base)]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg-base)]/95 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-[var(--color-border)]">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center" id="report-back">
          <ChevronLeft size={20} className="text-[var(--color-text-primary)]" />
        </button>
        <h1 className="text-base font-bold text-[var(--color-text-primary)]">
          {step === 3 ? 'Submitted!' : 'Report Issue'}
        </h1>
        <div className="ml-auto flex items-center gap-1.5">
          {[1, 2].map((s) => (
            <div key={s} className={`w-6 h-1 rounded-full ${step >= s ? 'bg-[#1ed760]' : 'bg-[var(--color-bg-elevated)]'} transition-colors`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full md:py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 block">Issue Title</label>
                <input
                  id="report-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Broken streetlight on Main Road"
                  className="w-full bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-xl px-4 py-3.5 text-sm outline-none border border-transparent focus:border-[#1ed760] transition-colors placeholder:text-[var(--color-text-muted)]"
                  maxLength={200}
                />
              </div>

              {/* Description with voice */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Description</label>
                  <button
                    onClick={toggleVoiceInput}
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                      isRecording ? 'bg-[#f3727f]/20 text-[#f3727f]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                    id="report-voice"
                  >
                    {isRecording ? <><MicOff size={12} /> Stop</> : <><Mic size={12} /> Voice</>}
                  </button>
                </div>
                <textarea
                  id="report-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-xl px-4 py-3.5 text-sm outline-none border border-transparent focus:border-[#1ed760] transition-colors placeholder:text-[var(--color-text-muted)] resize-none"
                  maxLength={2000}
                />
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 mt-2 text-[#f3727f] text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#f3727f] animate-pulse" />
                    Recording... Speak now
                  </motion.div>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 block">Photos (Optional)</label>
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden relative group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-[var(--color-text-primary)]" />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg bg-[var(--color-bg-elevated)] border border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-1 hover:border-[#1ed760] transition-colors"
                      id="report-upload"
                    >
                      <Camera size={18} className="text-[var(--color-text-muted)]" />
                      <span className="text-[10px] text-[var(--color-text-muted)]">Add</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </div>
              </div>

              {/* Location Map Selector */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 block">Pinpoint Exact Location</label>
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)] relative h-[200px] bg-[var(--color-bg-elevated)]">
                  <MapContainer
                    center={userLocation || [12.9716, 77.5946]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                  >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    <LocationSelector 
                      position={userLocation} 
                      setPosition={setUserLocation} 
                      setAddress={setLocationAddress} 
                    />
                  </MapContainer>
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur text-black text-[10px] p-2 rounded-lg z-[1000] border border-gray-200 pointer-events-none shadow-sm flex items-center gap-2">
                    <MapPin size={14} className="text-[#1ed760] shrink-0" />
                    <span className="truncate">{locationAddress || 'Tap on map to set location'}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                disabled={!title.trim() || !description.trim() || !userLocation}
                className="w-full bg-[#1ed760] text-[#111827] rounded-[500px] py-3.5 text-sm font-bold uppercase tracking-[1.4px] disabled:opacity-40 flex items-center justify-center gap-2 mt-4"
                id="report-next"
              >
                Next <ChevronLeft size={16} className="rotate-180" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Category & Submit */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 block">Select Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategory(key)}
                      className={`flex flex-col items-center gap-1.5 py-3.5 rounded-xl border transition-all ${
                        category === key
                          ? 'bg-[#1ed760]/10 border-[#1ed760]'
                          : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:bg-[var(--color-bg-card)]'
                      }`}
                      id={`select-cat-${key}`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className={`text-[10px] font-medium ${category === key ? 'text-[#1ed760]' : 'text-[var(--color-text-secondary)]'}`}>{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-2 flex items-center gap-1">
                  <Sparkles size={10} className="text-[#1ed760]" />
                  AI will also auto-classify if you skip selection
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-xl bg-[var(--color-bg-elevated)] p-4 border border-[var(--color-border)] space-y-2">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Summary</h3>
                <div className="space-y-1">
                  <p className="text-xs text-[var(--color-text-secondary)]"><span className="text-[var(--color-text-muted)]">Title:</span> {title}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2"><span className="text-[var(--color-text-muted)]">Description:</span> {description}</p>
                  {category && <p className="text-xs text-[var(--color-text-secondary)]"><span className="text-[var(--color-text-muted)]">Category:</span> {CATEGORIES[category]?.icon} {CATEGORIES[category]?.label}</p>}
                  <p className="text-xs text-[var(--color-text-secondary)]"><span className="text-[var(--color-text-muted)]">Images:</span> {images.length}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]"><span className="text-[var(--color-text-muted)]">Location:</span> {locationAddress || 'Not set'}</p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#1ed760] text-[#111827] rounded-[500px] py-3.5 text-sm font-bold uppercase tracking-[1.4px] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ boxShadow: '0 4px 20px rgba(30, 215, 96, 0.3)' }}
                id="report-submit"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing with AI...</>
                ) : (
                  <><Send size={16} strokeWidth={2.5} /> Submit Report</>
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-[#1ed760] flex items-center justify-center"
                style={{ boxShadow: '0 0 60px rgba(30, 215, 96, 0.4)' }}
              >
                <Sparkles size={36} className="text-[#111827]" />
              </motion.div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Issue Reported!</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">AI has processed your complaint</p>
              </div>

              {aiResult && (
                <div className="w-full rounded-xl bg-[var(--color-bg-elevated)] p-4 border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles size={14} className="text-[#1ed760]" />
                    <span className="font-semibold text-[var(--color-text-primary)]">AI Classification</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[var(--color-bg-base)] rounded-lg p-2.5">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Category</p>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">{CATEGORIES[aiResult.category]?.icon} {CATEGORIES[aiResult.category]?.label}</p>
                    </div>
                    <div className="bg-[var(--color-bg-base)] rounded-lg p-2.5">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Urgency</p>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5 capitalize">{aiResult.urgency}</p>
                    </div>
                  </div>
                  {aiResult.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {aiResult.keywords.slice(0, 5).map((kw, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-base)] text-[var(--color-text-secondary)]">{kw}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-[var(--color-text-muted)]">Confidence: {(aiResult.confidence * 100).toFixed(0)}%</p>
                </div>
              )}

              <div className="flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/')}
                  className="flex-1 bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-[500px] py-3 text-sm font-bold uppercase tracking-wider"
                >
                  Home
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/my-complaints')}
                  className="flex-1 bg-[#1ed760] text-[#111827] rounded-[500px] py-3 text-sm font-bold uppercase tracking-wider"
                >
                  Track
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
