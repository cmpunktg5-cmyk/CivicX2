import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, Lock, Mail, Loader2, Info } from 'lucide-react';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      
      const { user } = useAuthStore.getState();
      if (user.role !== 'admin') {
        toast.error("Access Denied: Administrative privileges required.");
        return;
      }
      toast.success("Authorized: Welcome back, Administrator");
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-brand)]/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-[#539df5]/5 blur-[80px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-[32px] p-10 border border-[var(--color-border)] shadow-2xl space-y-10">
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 mx-auto drop-shadow-[0_0_20px_rgba(30,215,96,0.5)]"
            >
              <img src="/CivicX2_logo.png" alt="CivicX Logo" className="w-full h-full object-contain" />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)]">CivicX <span className="text-[var(--color-brand)]">GOV</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Administrative Terminal</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] px-1">Control Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-brand)] transition-colors" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/5 transition-all"
                    placeholder="admin@civicx.app"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] px-1">Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-brand)] transition-colors" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/5 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-[var(--color-brand)] text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_15px_30px_-10px_rgba(30,215,96,0.4)] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:grayscale"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Establish Connection
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-blue-500/80 leading-relaxed uppercase tracking-tighter">
              Authorized access only. All sessions are logged and monitored via CivicX AI security protocols.
            </p>
          </div>
          </div>
        </motion.div>
      </div>
  );
}
