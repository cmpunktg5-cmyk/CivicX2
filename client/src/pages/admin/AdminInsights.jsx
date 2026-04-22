import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Flame, 
  AlertCircle, 
  TrendingUp, 
  MessageSquare, 
  ArrowUpRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { useComplaintsStore } from '../../store';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminInsights() {
  const { stats, fetchStats, loading } = useComplaintsStore();

  useEffect(() => { fetchStats(); }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-4">
        <Loader2 size={40} className="text-[var(--color-brand)] animate-spin" />
        <p className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-widest">Generating AI Insights...</p>
      </div>
    );
  }

  const hotspots = stats?.hotspots || [];
  const aiInsights = stats?.aiInsights || [];

  return (
    <motion.div 
      variants={container} initial="hidden" animate="show"
      className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand)]/10 flex items-center justify-center text-[var(--color-brand)]">
          <Zap size={32} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">AI Intelligence Hub</h1>
          <p className="text-sm font-bold text-[var(--color-text-secondary)] mt-1 uppercase tracking-wider">Predictive analysis and smart problem detection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={item} className="admin-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tight">Active Trouble Areas</h3>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f3727f]/10 text-[#f3727f] border border-[#f3727f]/20">
              <Flame size={12} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">High Concentration</span>
            </div>
          </div>
          <div className="space-y-4">
            {hotspots.map((h, i) => (
              <div key={i} className="flex items-center gap-4 p-5 bg-[var(--color-bg-base)]/30 rounded-2xl border border-[var(--color-border)] group hover:bg-[var(--color-bg-elevated)] transition-all">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${h.riskLevel === 'Critical' ? 'bg-[#f3727f]/10 text-[#f3727f]' : 'bg-[#ffa42b]/10 text-[#ffa42b]'}`}>
                  <AlertCircle size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-black text-[var(--color-text-primary)]">Zone {i + 1}</p>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${h.riskLevel === 'Critical' ? 'bg-[#f3727f]/20 text-[#f3727f]' : 'bg-[#ffa42b]/20 text-[#ffa42b]'}`}>
                      {h.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1.5"><TrendingUp size={14} /> {h.count} issues nearby</span>
                  </div>
                </div>
              </div>
            ))}
            {hotspots.length === 0 && <div className="text-center py-12 text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest bg-[var(--color-bg-base)]/20 rounded-3xl border border-dashed border-[var(--color-border)]">No trouble areas detected yet</div>}
          </div>
        </motion.div>

        <motion.div variants={item} className="admin-card">
          <h3 className="text-xl font-black tracking-tight mb-8">System Suggestions</h3>
          <div className="space-y-6">
            {aiInsights.map((insight, i) => (
              <div key={i} className="p-6 bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-bg-elevated)] rounded-[32px] border border-[var(--color-border)] shadow-xl hover:shadow-2xl transition-all border-l-4" style={{ borderColor: insight.type === 'warning' ? '#ffa42b' : insight.type === 'alert' ? '#f3727f' : '#539df5' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${insight.type === 'warning' ? 'bg-[#ffa42b]/10 text-[#ffa42b]' : insight.type === 'alert' ? 'bg-[#f3727f]/10 text-[#f3727f]' : 'bg-[#539df5]/10 text-[#539df5]'}`}>
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <h4 className="font-black text-[var(--color-text-primary)] uppercase tracking-tight">{insight.title}</h4>
                </div>
                <p className="text-sm font-bold text-[var(--color-text-secondary)] leading-relaxed">{insight.message}</p>
                <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Confidence Score: 0.94</span>
                  <button className="text-xs font-black text-[var(--color-brand)] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    Apply Fix <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            ))}
            {aiInsights.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShieldAlert size={48} className="text-[var(--color-text-muted)] mb-4 opacity-20" />
                <p className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Collecting System Intelligence...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
