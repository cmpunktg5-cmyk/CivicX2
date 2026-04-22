import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Zap, 
  Star, 
  Wallet, 
  ShoppingBag, 
  History, 
  ChevronRight, 
  Gift, 
  Copy,
  TrendingUp,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useAuthStore, useRewardsStore } from '../store';
import { formatPoints, getLevelProgress, formatDate } from '../utils/constants';
import toast from 'react-hot-toast';

const REDEMPTION_OPTIONS = [
  { id: 'Google Play', name: 'Google Play', label: '₹100 Gift Card', points: 500, icon: '🎮', color: '#34a853' },
  { id: 'Amazon', name: 'Amazon Pay', label: '₹250 Gift Card', points: 1000, icon: '🛒', color: '#ff9900' },
  { id: 'Flipkart', name: 'Flipkart', label: '₹250 Gift Card', points: 1000, icon: '🛍️', color: '#2874f0' }
];

export default function Rewards() {
  const { user } = useAuthStore();
  const { transactions, redemptions, leaderboard, fetchHistory, fetchLeaderboard, redeem, loading } = useRewardsStore();
  const [tab, setTab] = useState('shop');
  const [redeemingId, setRedeemingId] = useState(null);
  const [successCode, setSuccessCode] = useState(null);

  useEffect(() => {
    fetchHistory();
    fetchLeaderboard();
  }, []);

  const handleRedeem = async (option) => {
    if (user.points < option.points) {
      toast.error("Insufficient XP for this reward");
      return;
    }
    setRedeemingId(option.id);
    try {
      const res = await redeem(option.id);
      setSuccessCode(res.code);
      toast.success("Reward Claimed Successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Redemption failed");
    } finally {
      setRedeemingId(null);
    }
  };

  const levelInfo = getLevelProgress(user?.totalPointsEarned || 0);

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pb-24 px-4 pt-6">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Simple Dashboard Style Header */}
        <div className="flex items-end justify-between px-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">Civic Rewards</h1>
            <p className="text-xs font-bold text-[var(--color-text-secondary)] mt-1 uppercase tracking-wider">Earn points for making a difference</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--color-brand)]/10 flex items-center justify-center text-[var(--color-brand)]">
            <Trophy size={20} />
          </div>
        </div>

        {/* Unified XP & Balance Card */}
        <div className="admin-card overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand)]/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="admin-stat-icon bg-blue-500/10 text-blue-500">
                <Wallet size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">XP Balance</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-[var(--color-brand)] uppercase tracking-widest bg-[var(--color-brand)]/10 px-3 py-1.5 rounded-full">
              <Sparkles size={12} />
              {user?.tier || 'Bronze'} Tier
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-5xl font-black text-[var(--color-text-primary)]">{user?.points || 0}</span>
            <span className="text-xs font-black text-[var(--color-brand)] uppercase tracking-widest">Points</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
              <span>Level {levelInfo.level}</span>
              <span>{levelInfo.progress}% Progress</span>
            </div>
            <div className="h-2 bg-[var(--color-bg-base)] rounded-full overflow-hidden border border-[var(--color-border)]/50">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${levelInfo.progress}%` }}
                className="h-full bg-gradient-to-r from-[var(--color-brand)] to-[#1db954]" 
              />
            </div>
            <p className="text-[10px] font-bold text-[var(--color-text-secondary)] text-center">
              Next Rank: {levelInfo.pointsToNext} XP Remaining
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border)]">
          {[
            { id: 'shop', icon: ShoppingBag, label: 'Shop' },
            { id: 'history', icon: History, label: 'Activity' },
            { id: 'ranks', icon: Trophy, label: 'Ranks' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-[var(--color-bg-surface)] text-[var(--color-brand)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {tab === 'shop' && (
              <motion.div key="shop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                {REDEMPTION_OPTIONS.map((option) => (
                  <div key={option.id} className="admin-card group hover:border-[var(--color-brand)]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-base)] flex items-center justify-center text-2xl shadow-inner border border-[var(--color-border)]">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-black text-[var(--color-text-primary)]">{option.name}</h3>
                        <p className="text-[10px] font-bold text-[var(--color-text-secondary)]">{option.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[var(--color-brand)]">{option.points} XP</p>
                        <button
                          disabled={user.points < option.points || redeemingId === option.id}
                          onClick={() => handleRedeem(option)}
                          className="mt-1.5 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase bg-[#111827] text-white hover:bg-black disabled:opacity-50 transition-all"
                        >
                          {redeemingId === option.id ? '...' : 'Redeem'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {tab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                {redemptions.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest px-1">My Vouchers</p>
                    {redemptions.map((red, i) => (
                      <div key={i} className="admin-card border-dashed border-2 border-[var(--color-brand)]/30 bg-[var(--color-brand)]/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-black text-[var(--color-brand)] uppercase tracking-widest">{red.rewardType}</p>
                            <p className="text-lg font-black tracking-widest text-[var(--color-text-primary)] font-mono">{red.code}</p>
                          </div>
                          <button onClick={() => { navigator.clipboard.writeText(red.code); toast.success("Code Copied!"); }} className="p-3 bg-[var(--color-bg-base)] rounded-xl border border-[var(--color-border)] hover:text-[var(--color-brand)] transition-all">
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest px-1">XP Transactions</p>
                {transactions.map((tr, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tr.type === 'credit' ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]' : 'bg-red-500/10 text-red-500'}`}>
                      {tr.type === 'credit' ? <ArrowUpRight size={18} /> : <ArrowUpRight size={18} className="rotate-90" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{tr.reason}</p>
                      <p className="text-[9px] text-[var(--color-text-muted)] font-bold">{formatDate(tr.createdAt)}</p>
                    </div>
                    <span className={`text-sm font-black ${tr.type === 'credit' ? 'text-[var(--color-brand)]' : 'text-red-500'}`}>
                      {tr.type === 'credit' ? '+' : '-'}{tr.amount}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {tab === 'ranks' && (
              <motion.div key="ranks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                {leaderboard.map((player, i) => (
                  <div key={player._id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${player._id === user?.id ? 'bg-[var(--color-brand)]/5 border-[var(--color-brand)]/30' : 'bg-[var(--color-bg-surface)] border-[var(--color-border)]'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-[#ffd700] text-black' : i === 1 ? 'bg-[#c0c0c0] text-black' : i === 2 ? 'bg-[#cd7f32] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-[var(--color-text-primary)] truncate">{player._id === user?.id ? 'You (Reporter)' : player.name}</p>
                      <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">{player.tier || 'Bronze'} · Level {Math.floor(player.totalPointsEarned/500)+1}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[var(--color-text-primary)]">{formatPoints(player.totalPointsEarned || 0)}</p>
                      <p className="text-[8px] font-black text-[var(--color-brand)] uppercase">Total XP</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Redemption Success Modal */}
        <AnimatePresence>
          {successCode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-[var(--color-bg-base)]/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="admin-card w-full max-w-sm text-center !p-10 shadow-2xl">
                <div className="w-20 h-20 bg-[var(--color-brand)]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-brand)]">
                  <Gift size={40} />
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">Reward Secured!</h2>
                <p className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-8">Your unique code is ready</p>
                
                <div className="bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-2xl p-6 mb-8 relative">
                  <p className="text-xs font-black tracking-[0.4em] text-[var(--color-brand)] font-mono">{successCode}</p>
                </div>

                <button onClick={() => setSuccessCode(null)} className="w-full bg-[#111827] text-white font-black py-4 rounded-xl hover:bg-black transition-all">
                  Back to Wallet
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
