import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Loader2, 
  Zap, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { useComplaintsStore } from '../../store';
import { CATEGORIES } from '../../utils/constants';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { stats, fetchStats, loading } = useComplaintsStore();

  useEffect(() => { fetchStats(); }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-4">
        <Loader2 size={40} className="text-[var(--color-brand)] animate-spin" />
        <p className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-widest">Compiling Analytics...</p>
      </div>
    );
  }

  const s = stats?.overview || {};
  const catData = (stats?.categoryBreakdown || []).map(c => ({
    name: CATEGORIES[c._id]?.label || c._id, value: c.count, fill: CATEGORIES[c._id]?.color || 'var(--color-text-muted)'
  }));
  const trendData = stats?.dailyTrend || [];
  const hotspots = stats?.hotspots || [];
  const aiInsights = stats?.aiInsights || [];

  return (
    <motion.div 
      variants={container} initial="hidden" animate="show"
      className="p-8 space-y-8 max-w-[1600px] mx-auto"
    >
      {/* Page Title */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)]">City Overview</h1>
          <p className="text-sm font-bold text-[var(--color-text-secondary)] mt-1 uppercase tracking-wider">Live Updates & Smart Predictions</p>
        </div>
        <div className="flex items-center gap-3 bg-[var(--color-bg-surface)] px-4 py-2 rounded-2xl border border-[var(--color-border)] shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Data Refreshed: Just Now</span>
        </div>
      </div>

      {/* Primary Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Reported Problems', value: s.totalComplaints || 0, trend: '+12%', up: true, icon: AlertCircle, color: '#539df5' },
          { label: 'Active Issues', value: s.activeIssues || 0, trend: '-5%', up: false, icon: Clock, color: '#ffa42b' },
          { label: 'Solution Rate', value: `${s.resolutionRate || 0}%`, trend: '+2.4%', up: true, icon: CheckCircle, color: '#1ed760' },
          { label: 'Total Citizens', value: s.totalUsers || 0, trend: '+84', up: true, icon: Users, color: '#a855f7' },
        ].map((card, i) => (
          <motion.div key={i} variants={item} className="admin-card group hover:border-[var(--color-brand)]/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="admin-stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
                <card.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${card.up ? 'bg-[#1ed760]/10 text-[#1ed760]' : 'bg-[#f3727f]/10 text-[#f3727f]'}`}>
                {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{card.label}</p>
            <p className="text-3xl font-black text-[var(--color-text-primary)]">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Trend Chart */}
        <motion.div variants={item} className="lg:col-span-2 admin-card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black tracking-tight">Daily Activity</h3>
              <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Reports vs Solutions (Last 14 Days)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--color-brand)]" /><span className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Reports</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#539df5]" /><span className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Resolved</span></div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="_id" tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', boxShadow: 'var(--shadow-dialog)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                  labelStyle={{ marginBottom: '8px', color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--color-brand)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                <Area type="monotone" dataKey="resolved" stroke="#539df5" strokeWidth={2} fill="none" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Insight Panel */}
        <motion.div variants={item} className="admin-card bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-bg-elevated)] border-[var(--color-brand)]/20 shadow-[0_0_50px_-12px_rgba(30,215,96,0.1)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand)]/10 flex items-center justify-center text-[var(--color-brand)]">
              <Zap size={24} fill="currentColor" />
            </div>
            <h3 className="text-lg font-black tracking-tight">AI Insights</h3>
          </div>
          <div className="space-y-6">
            {aiInsights.map((insight, i) => (
              <div key={i} className="space-y-2 group">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${insight.type === 'warning' ? 'bg-[#ffa42b]' : insight.type === 'alert' ? 'bg-[#f3727f]' : 'bg-[#539df5]'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">{insight.title}</span>
                </div>
                <div className="bg-[var(--color-bg-base)]/50 p-4 rounded-2xl border border-[var(--color-border)] group-hover:border-[var(--color-brand)]/20 transition-all">
                  <p className="text-xs font-bold leading-relaxed text-[var(--color-text-primary)] opacity-80">{insight.message}</p>
                </div>
              </div>
            ))}
            {aiInsights.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShieldAlert size={32} className="text-[var(--color-text-muted)] mb-3 opacity-30" />
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Collecting System Intelligence...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <motion.div variants={item} className="admin-card">
          <h3 className="text-lg font-black tracking-tight mb-8">Problems by Type</h3>
          <div className="flex items-center gap-8">
            <div className="h-64 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4}>
                    {catData.map((_, i) => <Cell key={i} fill={catData[i].fill} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {catData.slice(0, 6).map((d, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{d.name}</span>
                  </div>
                  <span className="text-xs font-black">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI Predictive Hotspots */}
        <motion.div variants={item} className="admin-card overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black tracking-tight">Trouble Spots</h3>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f3727f]/10 text-[#f3727f] border border-[#f3727f]/20">
              <Flame size={12} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">High Risk Zones</span>
            </div>
          </div>
          <div className="space-y-4">
            {hotspots.map((h, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-[var(--color-bg-base)]/30 rounded-2xl border border-[var(--color-border)] group hover:bg-[var(--color-bg-elevated)] transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${h.riskLevel === 'Critical' ? 'bg-[#f3727f]/10 text-[#f3727f]' : 'bg-[#ffa42b]/10 text-[#ffa42b]'}`}>
                  <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-black uppercase tracking-tight text-[var(--color-text-primary)]">Zone {i + 1}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${h.riskLevel === 'Critical' ? 'bg-[#f3727f]/20 text-[#f3727f]' : 'bg-[#ffa42b]/20 text-[#ffa42b]'}`}>
                      {h.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1"><TrendingUp size={12} /> {h.count} Clustered Issues</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> Predicted Escalation High</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center border border-[var(--color-border)] group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={18} className="text-[var(--color-text-muted)]" />
                </div>
              </div>
            ))}
            {hotspots.length === 0 && <div className="text-center py-8 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">No critical clusters detected</div>}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
