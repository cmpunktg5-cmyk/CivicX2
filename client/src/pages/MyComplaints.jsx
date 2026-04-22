import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Filter, Search } from 'lucide-react';
import { useComplaintsStore } from '../store';
import { CATEGORIES, STATUS_CONFIG, formatDate } from '../utils/constants';

export default function MyComplaints() {
  const navigate = useNavigate();
  const { myComplaints, fetchMyComplaints, loading } = useComplaintsStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const filtered = myComplaints.filter((c) => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-dvh bg-[var(--color-bg-base)]">
      <div className="sticky top-0 z-20 bg-[var(--color-bg-base)]/95 backdrop-blur-xl px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full md:py-8">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
            <ChevronLeft size={20} className="text-[var(--color-text-primary)]" />
          </button>
          <h1 className="text-base font-bold text-[var(--color-text-primary)]">My Reports</h1>
          <span className="ml-auto text-xs text-[var(--color-text-muted)] font-semibold">{myComplaints.length} total</span>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full md:py-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-[500px] pl-10 pr-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#1ed760] placeholder:text-[var(--color-text-muted)]"
            id="my-complaints-search"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['all', ...Object.keys(STATUS_CONFIG)].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                filter === s ? 'bg-[#1ed760] text-[#111827]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>

        {/* Complaints List */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#1ed760]/30 border-t-[#1ed760] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl bg-[var(--color-bg-elevated)] p-8 text-center border border-[var(--color-border)]">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{search ? 'No matching reports' : 'No reports yet'}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Submit your first complaint to see it here</p>
            </div>
          ) : (
            filtered.map((c, i) => {
              const cat = CATEGORIES[c.category] || CATEGORIES.other;
              const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
              return (
                <motion.button
                  key={c._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/complaint/${c._id}`)}
                  className="w-full rounded-xl bg-[var(--color-bg-elevated)] p-4 text-left hover:bg-[var(--color-bg-card)] transition-colors border border-[var(--color-border)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
                      <span className="text-lg">{cat.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{c.title}</p>
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ color: status.color, background: `${status.color}20` }}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-1">{c.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-[var(--color-text-muted)]">{formatDate(c.createdAt)}</span>
                        {c.upvotes?.length > 0 && (
                          <span className="text-[10px] text-[#1ed760]">👍 {c.upvotes.length}</span>
                        )}
                        {c.isVerified && <span className="text-[10px] text-[#1ed760]">✅ Verified</span>}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-1 mt-3">
                    {['pending', 'assigned', 'in_progress', 'resolved'].map((s, idx) => (
                      <div
                        key={s}
                        className="flex-1 h-1 rounded-full"
                        style={{
                          background: ['pending', 'assigned', 'in_progress', 'resolved'].indexOf(c.status) >= idx
                            ? status.color
                            : 'var(--color-bg-card)'
                        }}
                      />
                    ))}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
