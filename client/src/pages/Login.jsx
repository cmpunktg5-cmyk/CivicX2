import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    const result = await login({ email, password });
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--color-bg-base)] flex flex-col items-center justify-center px-6">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[40%] rounded-full bg-[#1ed760]/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] rounded-full bg-[#1ed760]/3 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            className="w-20 h-20 mb-4 drop-shadow-[0_0_20px_rgba(30,215,96,0.5)]"
          >
            <img src="/CivicX2_logo.png" alt="CivicX Logo" className="w-full h-full object-contain" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">CivicX AI</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">Smart Civic Engagement</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 block">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-[500px] px-5 py-3.5 text-sm outline-none border border-transparent focus:border-[#1ed760] transition-colors placeholder:text-[var(--color-text-muted)]"
              style={{ boxShadow: 'var(--shadow-inset)' }}
            />
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 block">Password</label>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-[500px] px-5 py-3.5 text-sm outline-none border border-transparent focus:border-[#1ed760] transition-colors placeholder:text-[var(--color-text-muted)] pr-12"
              style={{ boxShadow: 'var(--shadow-inset)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            id="login-submit"
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#1ed760] text-[#111827] rounded-[500px] py-3.5 text-sm font-bold uppercase tracking-[1.4px] hover:bg-[#1db954] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            style={{ boxShadow: '0 4px 20px rgba(30, 215, 96, 0.3)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} strokeWidth={2.5} />
                Sign In
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-[var(--color-text-secondary)] text-sm mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#1ed760] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
