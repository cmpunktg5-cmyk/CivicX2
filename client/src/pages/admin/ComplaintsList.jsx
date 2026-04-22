import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  ShieldAlert, 
  MoreHorizontal, 
  ArrowUpRight,
  Zap,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useComplaintsStore } from '../../store';
import { CATEGORIES, STATUS_CONFIG, URGENCY_CONFIG, formatDate } from '../../utils/constants';
import { complaintsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ComplaintsList() {
  const { complaints, fetchComplaints, loading } = useComplaintsStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchComplaints({ limit: 100 }); }, []);

  const handleStatusUpdate = async (id, status) => {
    const comment = prompt("Enter resolution/update note:");
    if (comment === null) return;
    try {
      await complaintsAPI.updateStatus(id, { status, comment });
      toast.success(`Protocol Updated: ${status.toUpperCase()}`);
      fetchComplaints({ limit: 100 });
    } catch (err) {
      toast.error("Handshake Failed: Status update rejected");
    }
  };

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c._id.includes(search);
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Incident Registry</h1>
          <p className="text-sm font-bold text-[var(--color-text-secondary)] mt-1 uppercase tracking-wider">Queue Management & Response Dispatch</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-brand)] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter by ID or Keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl pl-12 pr-6 py-3 text-sm font-bold outline-none focus:border-[var(--color-brand)] w-80 shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-1.5 rounded-2xl shadow-sm">
            {['all', 'pending', 'resolved'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[var(--color-brand)] text-black' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card !p-0 overflow-hidden border-[var(--color-border)] shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-elevated)]/50 border-b border-[var(--color-border)]">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Priority</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Subject / Category</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">AI Score</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Timestamp</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/50">
            {filtered.map((c) => {
              const cat = CATEGORIES[c.category] || CATEGORIES.other;
              const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
              const urgency = URGENCY_CONFIG[c.urgency] || URGENCY_CONFIG.medium;
              const ai = c.aiAnalysis || {};

              return (
                <motion.tr 
                  key={c._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[var(--color-bg-elevated)]/30 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]`} style={{ background: urgency.color, boxShadow: `0 0 12px ${urgency.color}40` }} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">{c.title}</span>
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">{cat.label} · {c.location?.address?.split(',')[0]}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--color-bg-base)] rounded-full max-w-[60px] overflow-hidden">
                        <div className="h-full bg-[var(--color-brand)]" style={{ width: `${(ai.confidence || 0.8) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-[var(--color-brand)]">{Math.round((ai.confidence || 0.8) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-widest" style={{ color: status.color, background: `${status.color}10`, borderColor: `${status.color}20` }}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col text-right lg:text-left">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">{formatDate(c.createdAt)}</span>
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">Verified Dispatch</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <select 
                        className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:border-[var(--color-brand)]"
                        value={c.status}
                        onChange={(e) => handleStatusUpdate(c._id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="pending">Hold</option>
                        <option value="assigned">Assign</option>
                        <option value="in_progress">Active</option>
                        <option value="resolved">Verify</option>
                        <option value="rejected">Veto</option>
                      </select>
                      <button className="p-2 rounded-xl hover:bg-[var(--color-bg-base)] transition-colors text-[var(--color-text-muted)] hover:text-white">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-base)] flex items-center justify-center mx-auto border border-dashed border-[var(--color-border)]">
              <Search className="text-[var(--color-text-muted)]" size={24} />
            </div>
            <p className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">No Records Matching Search Protocol</p>
          </div>
        )}
      </div>
    </div>
  );
}
