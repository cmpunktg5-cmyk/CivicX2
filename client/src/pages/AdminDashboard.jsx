import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, ChevronLeft, TrendingUp, Users, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useComplaintsStore, useAuthStore } from '../store';
import { CATEGORIES } from '../utils/constants';

const CHART_COLORS = ['#1ed760', '#539df5', '#ffa42b', '#f3727f', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#eab308', 'var(--color-text-muted)'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { stats, fetchStats, loading } = useComplaintsStore();

  useEffect(() => { fetchStats(); }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-dvh bg-[var(--color-bg-base)] flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={48} className="text-[#f3727f] mb-4" />
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Access Denied</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Admin privileges required</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-[#1ed760] text-[#111827] rounded-full px-6 py-2 text-sm font-bold">Go Home</button>
      </div>
    );
  }

  const s = stats?.stats || {};
  const catData = (stats?.categoryBreakdown || []).map(c => ({
    name: CATEGORIES[c._id]?.label || c._id, value: c.count, fill: CATEGORIES[c._id]?.color || 'var(--color-text-muted)'
  }));
  const trendData = (stats?.dailyTrend || []).map(d => ({ date: d._id.slice(5), count: d.count }));

  return (
    <div className="min-h-dvh bg-[var(--color-bg-base)]">
      <div className="sticky top-0 z-20 bg-[var(--color-bg-base)]/95 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-[var(--color-border)]">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center"><ChevronLeft size={20} className="text-[var(--color-text-primary)]" /></button>
        <BarChart3 size={18} className="text-[#a855f7]" />
        <h1 className="text-base font-bold text-[var(--color-text-primary)]">Admin Dashboard</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-[#1ed760] animate-spin" /></div>
      ) : (
        <div className="px-4 py-4 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full md:py-8 space-y-4">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Total', value: s.total || 0, icon: BarChart3, color: '#1ed760' },
              { label: 'Pending', value: s.pending || 0, icon: Clock, color: '#ffa42b' },
              { label: 'In Progress', value: s.inProgress || 0, icon: Loader2, color: '#a855f7' },
              { label: 'Resolved', value: s.resolved || 0, icon: CheckCircle, color: '#1ed760' },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-[var(--color-bg-elevated)] p-4 border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-2">
                  <card.icon size={16} style={{ color: card.color }} />
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">{card.label}</span>
                </div>
                <p className="text-2xl font-black text-[var(--color-text-primary)]">{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Resolution Rate */}
          <div className="rounded-xl bg-[var(--color-bg-elevated)] p-4 border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Resolution Rate</p>
                <p className="text-3xl font-black text-[#1ed760]">{s.resolutionRate || 0}%</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Avg Resolution</p>
                <p className="text-xl font-bold text-[var(--color-text-primary)]">{s.avgResolutionHours || 'N/A'} <span className="text-xs font-normal text-[var(--color-text-muted)]">hrs</span></p>
              </div>
            </div>
          </div>

          {/* Category Breakdown Chart */}
          {catData.length > 0 && (
            <div className="rounded-xl bg-[var(--color-bg-elevated)] p-4 border border-[var(--color-border)]">
              <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">By Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={catData}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid #4d4d4d', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {catData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily Trend */}
          {trendData.length > 0 && (
            <div className="rounded-xl bg-[var(--color-bg-elevated)] p-4 border border-[var(--color-border)]">
              <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-[#1ed760]" /> 30-Day Trend</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid #4d4d4d', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="#1ed760" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Pie */}
          {catData.length > 0 && (
            <div className="rounded-xl bg-[var(--color-bg-elevated)] p-4 border border-[var(--color-border)]">
              <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">Distribution</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2}>
                      {catData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1">
                  {catData.slice(0, 5).map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      <span className="text-[10px] text-[var(--color-text-secondary)] flex-1">{d.name}</span>
                      <span className="text-[10px] font-bold text-[var(--color-text-primary)]">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
