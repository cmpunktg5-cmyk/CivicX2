import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MapPin, ThumbsUp, ThumbsDown, Clock, User as UserIcon, CheckCircle, Sparkles, Zap, ShieldAlert, Target, MessageSquare } from 'lucide-react';
import { useComplaintsStore, useAuthStore } from '../store';
import { CATEGORIES, STATUS_CONFIG, URGENCY_CONFIG, formatDate } from '../utils/constants';
import { complaintsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentComplaint: c, fetchComplaint, loading } = useComplaintsStore();

  useEffect(() => { fetchComplaint(id); }, [id]);

  const handleVote = async (type) => {
    try {
      if (type === 'up') { await complaintsAPI.upvote(id); toast.success('+15 pts Earned!'); }
      else { await complaintsAPI.downvote(id); toast.success('Vote Registered'); }
      fetchComplaint(id);
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  if (loading || !c) return (
    <div className="min-h-dvh bg-[var(--color-bg-base)] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-[var(--color-brand)]/20 border-t-[var(--color-brand)] rounded-full animate-spin" />
      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Loading Intel...</p>
    </div>
  );

  const cat = CATEGORIES[c.category] || CATEGORIES.other;
  const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
  const urgency = URGENCY_CONFIG[c.urgency] || URGENCY_CONFIG.medium;
  const ai = c.aiAnalysis || {};

  return (
    <div className="min-h-dvh bg-[var(--color-bg-base)] pb-12">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[var(--color-bg-base)]/80 backdrop-blur-2xl px-4 py-4 flex items-center gap-4 border-b border-[var(--color-border)]/50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center border border-[var(--color-border)] shadow-sm hover:bg-[var(--color-bg-hover)] transition-all">
          <ChevronLeft size={20} className="text-[var(--color-text-primary)]" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-black text-[var(--color-text-primary)] truncate uppercase tracking-tight">Issue Dossier</h1>
          <p className="text-[10px] font-bold text-[var(--color-text-muted)] truncate">ID: {c._id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        
        {/* Status & Category Pills */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] font-black px-3 py-1.5 rounded-xl border" style={{ color: status.color, background: `${status.color}10`, borderColor: `${status.color}20` }}>
            {status.label.toUpperCase()}
          </span>
          <span className="text-[10px] font-black px-3 py-1.5 rounded-xl border" style={{ color: cat.color, background: `${cat.color}10`, borderColor: `${cat.color}20` }}>
            {cat.label.toUpperCase()}
          </span>
          <span className="text-[10px] font-black px-3 py-1.5 rounded-xl border text-[var(--color-brand)] bg-[var(--color-brand)]/10 border-[var(--color-brand)]/20">
            CONFIDENCE {Math.round((ai.confidence || 0.85) * 100)}%
          </span>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--color-text-primary)] leading-tight tracking-tight">{c.title}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium bg-[var(--color-bg-surface)] p-4 rounded-2xl border border-[var(--color-border)] shadow-sm">
            {c.description}
          </p>
        </div>

        {/* Image Gallery */}
        {c.images?.length > 0 && (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {c.images.map((img, i) => (
              <motion.img 
                key={i} src={img} alt="" 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="w-48 h-32 rounded-[24px] object-cover shrink-0 border-2 border-[var(--color-border)] shadow-md" 
              />
            ))}
          </div>
        )}

        {/* --- AI INTELLIGENCE PANEL --- */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-brand)] to-[#539df5] rounded-[28px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative rounded-[28px] bg-[var(--color-bg-surface)] p-6 border border-[var(--color-border)] shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-brand)]/10 flex items-center justify-center text-[var(--color-brand)]">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-[0.15em]">AI Intelligence Analysis</h3>
                  <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase">CivicX Brain v2.5</p>
                </div>
              </div>
              <Sparkles size={18} className="text-[#ffa42b]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Priority Level</p>
                <p className={`text-sm font-black ${
                  c.urgency === 'critical' ? 'text-red-500' :
                  c.urgency === 'high' ? 'text-orange-500' : 'text-[var(--color-brand)]'
                }`}>
                  {c.urgency?.toUpperCase()}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Sentiment</p>
                <p className="text-sm font-black text-indigo-400">
                  {(ai.sentiment || 'NEUTRAL').toUpperCase()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">AI Executive Summary</p>
              <p className="text-sm font-bold text-[var(--color-text-secondary)] italic leading-relaxed">
                "{ai.summary || 'AI is processing this report for structural patterns and safety risks.'}"
              </p>
            </div>

            {ai.suggested_resolution && (
              <div className="bg-[var(--color-bg-elevated)] p-4 rounded-2xl border border-[var(--color-border)]/50">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={14} className="text-[var(--color-brand)]" />
                  <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase">Resolution Hint</span>
                </div>
                <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] leading-relaxed">
                  {ai.suggested_resolution}
                </p>
              </div>
            )}

            {ai.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {ai.keywords.map((kw, i) => (
                  <span key={i} className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-[var(--color-bg-base)] text-[var(--color-text-muted)] uppercase border border-[var(--color-border)]/50">
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Location & Meta */}
        {c.location?.address && (
          <div className="rounded-2xl bg-[var(--color-bg-surface)] p-4 flex items-center gap-4 border border-[var(--color-border)] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <MapPin size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-0.5">Verified Location</p>
              <p className="text-xs font-bold text-[var(--color-text-secondary)] truncate">{c.location.address}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[var(--color-bg-surface)] p-4 border border-[var(--color-border)] shadow-sm">
            <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-2">Timeline</p>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[var(--color-brand)]" />
              <p className="text-xs font-bold text-[var(--color-text-primary)]">{formatDate(c.createdAt)}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--color-bg-surface)] p-4 border border-[var(--color-border)] shadow-sm">
            <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-2">Reporter</p>
            <div className="flex items-center gap-2">
              <UserIcon size={16} className="text-indigo-400" />
              <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{c.user?.name || 'Authorized Citizen'}</p>
            </div>
          </div>
        </div>

        {/* Community Trust Section */}
        <div className="rounded-[32px] bg-[var(--color-bg-surface)] p-6 border border-[var(--color-border)] shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-[0.15em]">Community Trust Network</h3>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#1ed760]/10 text-[#1ed760] border border-[#1ed760]/20">
              <ShieldAlert size={10} />
              <span className="text-[8px] font-black uppercase">Vetting Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button 
              whileTap={{ scale: 0.95 }} onClick={() => handleVote('up')} 
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-[#1ed760]/5 border border-[#1ed760]/20 text-[#1ed760] transition-colors hover:bg-[#1ed760]/10"
            >
              <ThumbsUp size={24} />
              <span className="text-sm font-black">{c.upvotes?.length || 0}</span>
              <span className="text-[8px] font-black uppercase opacity-60">Verified</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }} onClick={() => handleVote('down')} 
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-[#f3727f]/5 border border-[#f3727f]/20 text-[#f3727f] transition-colors hover:bg-[#f3727f]/10"
            >
              <ThumbsDown size={24} />
              <span className="text-sm font-black">{c.downvotes?.length || 0}</span>
              <span className="text-[8px] font-black uppercase opacity-60">Flagged</span>
            </motion.button>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] flex items-center justify-center gap-1.5">
              {c.isVerified ? <CheckCircle size={12} className="text-[#1ed760]" /> : <Clock size={12} />}
              {c.isVerified ? 'FULLY VETTED BY COMMUNITY TRUST' : 'AWAITING SUFFICIENT COMMUNITY SIGN-OFF'}
            </p>
            <p className="text-[9px] text-[var(--color-text-muted)] opacity-50 px-4 leading-relaxed font-medium uppercase tracking-tighter">
              Votes contribute to reporter reputation and issue priority escalation.
            </p>
          </div>
        </div>

        {/* Resolution Timeline */}
        {c.statusHistory?.length > 0 && (
          <div className="rounded-[32px] bg-[var(--color-bg-elevated)] p-6 border border-[var(--color-border)]/30 space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[var(--color-text-muted)]" />
              <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider">Resolution Logs</h3>
            </div>
            <div className="space-y-6 pl-2">
              {c.statusHistory.map((entry, i) => { 
                const s = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending; 
                return (
                  <div key={i} className="flex items-start gap-4 relative">
                    {i < c.statusHistory.length - 1 && (
                      <div className="absolute left-1.5 top-3 w-0.5 h-12 bg-[var(--color-border)]/50" />
                    )}
                    <div className="w-3 h-3 rounded-full shrink-0 z-10 border-2 border-[var(--color-bg-base)]" style={{ background: s.color }} />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: s.color }}>{s.label}</p>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">{entry.comment || 'Status updated by authority'}</p>
                      <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase">{formatDate(entry.updatedAt)}</p>
                    </div>
                  </div>
                ); 
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
