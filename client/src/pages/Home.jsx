import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Bell, ChevronRight, MapPin, Plus, Shield, Star, Trophy, Zap } from 'lucide-react';
import { useAuthStore, useComplaintsStore } from '../store';
import { CATEGORIES, STATUS_CONFIG, formatDate, getLevelProgress } from '../utils/constants';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { complaints, fetchComplaints, myComplaints, fetchMyComplaints } = useComplaintsStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchComplaints({ limit: 5 });
    fetchMyComplaints();
  }, []);

  const levelInfo = getLevelProgress(user?.totalPointsEarned || 0);

  return (
    <div className="px-4 pt-4 pb-4">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-lg mx-auto">

        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <p className="text-[var(--color-text-secondary)] text-xs font-medium">{greeting}</p>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{user?.name?.split(' ')[0] || 'Citizen'} 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/emergency')} className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center hover:bg-[var(--color-bg-card)] transition-colors" id="home-emergency">
              <Shield size={18} className="text-[#f3727f]" />
            </button>
            <button className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center hover:bg-[var(--color-bg-card)] transition-colors" id="home-notifications">
              <Bell size={18} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>
        </motion.div>

        {/* Level Progress Card */}
        <motion.div variants={item} className="rounded-xl bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-surface)] p-4 border border-[var(--color-border)]" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1ed760]/15 flex items-center justify-center">
                <Star size={16} className="text-[#1ed760]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Level {levelInfo.level}</p>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">{user?.points || 0} <span className="text-xs font-normal text-[var(--color-text-secondary)]">pts</span></p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {(user?.badges || []).slice(-3).map((badge, i) => (
                <span key={i} className="text-lg">{badge.icon}</span>
              ))}
            </div>
          </div>
          <div className="h-1.5 bg-[var(--color-bg-base)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progress}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#1ed760] to-[#1db954]"
            />
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">{levelInfo.pointsToNext} points to Level {levelInfo.level + 1}</p>
        </motion.div>

        {/* Report Issue CTA */}
        <motion.div variants={item}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/report')}
            className="w-full rounded-xl p-4 flex items-center gap-4 bg-[#1ed760] hover:bg-[#1db954] transition-colors"
            style={{ boxShadow: '0 4px 20px rgba(30, 215, 96, 0.35)' }}
            id="home-report-cta"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-base)]/20 flex items-center justify-center shrink-0">
              <Plus size={24} className="text-[#111827]" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <h3 className="text-[#111827] font-bold text-base">Report an Issue</h3>
              <p className="text-[#111827]/70 text-xs">Earn 50+ points for each valid report</p>
            </div>
            <ArrowRight size={20} className="text-[#111827] ml-auto" />
          </motion.button>
        </motion.div>

        {/* Quick Categories */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">Categories</h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(CATEGORIES).slice(0, 8).map(([key, cat]) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/report', { state: { category: key } })}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card)] transition-colors border border-[var(--color-border)]"
                id={`cat-${key}`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[10px] font-medium text-[var(--color-text-secondary)] text-center leading-tight">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* My Recent Complaints */}
        {myComplaints.length > 0 && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">My Reports</h2>
              <button onClick={() => navigate('/my-complaints')} className="text-xs text-[#1ed760] font-semibold flex items-center gap-0.5">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {myComplaints.slice(0, 3).map((c) => {
                const cat = CATEGORIES[c.category] || CATEGORIES.other;
                const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
                return (
                  <motion.button
                    key={c._id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/complaint/${c._id}`)}
                    className="w-full rounded-xl bg-[var(--color-bg-elevated)] p-3.5 flex items-center gap-3 hover:bg-[var(--color-bg-card)] transition-colors border border-[var(--color-border)] text-left"
                    id={`complaint-${c._id}`}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
                      <span className="text-lg">{cat.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{c.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{formatDate(c.createdAt)}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ color: status.color, background: `${status.color}20` }}>
                      {status.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Nearby Issues */}
        {complaints.length > 0 && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">Recent Issues</h2>
              <button onClick={() => navigate('/map')} className="text-xs text-[#1ed760] font-semibold flex items-center gap-0.5">
                View Map <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {complaints.slice(0, 3).map((c) => {
                const cat = CATEGORIES[c.category] || CATEGORIES.other;
                return (
                  <motion.div
                    key={c._id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/complaint/${c._id}`)}
                    className="rounded-xl bg-[var(--color-bg-elevated)] p-3.5 hover:bg-[var(--color-bg-card)] transition-colors border border-[var(--color-border)] cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
                        <span className="text-lg">{cat.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{c.title}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">{c.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {c.location?.address && (
                            <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-0.5">
                              <MapPin size={10} /> {c.location.address.slice(0, 30)}
                            </span>
                          )}
                          <span className="text-[10px] text-[var(--color-text-muted)]">{formatDate(c.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={item}>
          <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/rewards')} className="rounded-xl bg-[var(--color-bg-elevated)] p-4 flex flex-col gap-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-colors text-left" id="home-rewards">
              <Trophy size={20} className="text-[#ffa42b]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Rewards</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Points & Leaderboard</p>
              </div>
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/emergency')} className="rounded-xl bg-[var(--color-bg-elevated)] p-4 flex flex-col gap-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-colors text-left" id="home-sos">
              <AlertTriangle size={20} className="text-[#f3727f]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Emergency</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">SOS & Helplines</p>
              </div>
            </motion.button>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
