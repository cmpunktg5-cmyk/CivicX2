import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon,
  CheckCircle, 
  Clock, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { useComplaintsStore } from '../../store';
import { CATEGORIES } from '../../utils/constants';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminAnalytics() {
  const { stats, fetchStats, loading } = useComplaintsStore();

  useEffect(() => { fetchStats(); }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-4">
        <Loader2 size={40} className="text-[var(--color-brand)] animate-spin" />
        <p className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-widest">Loading Analytics...</p>
      </div>
    );
  }

  const catData = (stats?.categoryBreakdown || []).map(c => ({
    name: CATEGORIES[c._id]?.label || c._id, value: c.count, fill: CATEGORIES[c._id]?.color || 'var(--color-text-muted)'
  }));
  const trendData = stats?.dailyTrend || [];

  return (
    <motion.div 
      variants={container} initial="hidden" animate="show"
      className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Analytics & Reports</h1>
        <p className="text-sm font-bold text-[var(--color-text-secondary)] mt-1 uppercase tracking-wider">Detailed breakdown of city performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2 admin-card">
          <div className="mb-8">
            <h3 className="text-lg font-black tracking-tight">Reports Over Time</h3>
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Tracking how many problems are reported daily</p>
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
                  contentStyle={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '16px' }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--color-brand)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="admin-card">
          <h3 className="text-lg font-black tracking-tight mb-8">Problems by Type</h3>
          <div className="flex flex-col items-center gap-8">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4}>
                    {catData.map((_, i) => <Cell key={i} fill={catData[i].fill} stroke="transparent" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3">
              {catData.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">{d.name}</span>
                  </div>
                  <span className="text-xs font-black">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="admin-card">
        <h3 className="text-lg font-black tracking-tight mb-8">Resolution Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catData.map((d, i) => (
            <div key={i} className="p-4 bg-[var(--color-bg-base)] rounded-2xl border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">{d.name}</span>
                <span className="text-xs font-black text-[var(--color-brand)]">{d.value} Reports</span>
              </div>
              <div className="h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-brand)]" style={{ width: `${Math.random() * 100}%`, opacity: 0.5 }}></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
