import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Zap } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill all required fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    const result = await register({ name, email, password, phone });
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  const inputClass = "w-full bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-[500px] px-5 py-3.5 text-sm outline-none border border-transparent focus:border-[#1ed760] transition-colors placeholder:text-[var(--color-text-muted)]";
  const inputStyle = { boxShadow: 'var(--shadow-inset)' };

  return (
    <div className="min-h-dvh bg-[var(--color-bg-base)] flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[40%] rounded-full bg-[#1ed760]/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[30%] rounded-full bg-[#1ed760]/3 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-[#1ed760] flex items-center justify-center mb-4"
            style={{ boxShadow: '0 0 40px rgba(30, 215, 96, 0.3)' }}
          >
            <Zap size={32} className="text-[#111827]" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Join CivicX AI</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">Start making your city better</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 block">Full Name *</label>
            <input id="register-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 block">Email *</label>
            <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 block">Phone</label>
            <input id="register-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9999999999" className={inputClass} style={inputStyle} />
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 block">Password *</label>
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className={`${inputClass} pr-12`}
              style={inputStyle}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            id="register-submit"
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#1ed760] text-[#111827] rounded-[500px] py-3.5 text-sm font-bold uppercase tracking-[1.4px] hover:bg-[#1db954] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            style={{ boxShadow: '0 4px 20px rgba(30, 215, 96, 0.3)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={18} strokeWidth={2.5} />
                Create Account
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-[var(--color-text-secondary)] text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1ed760] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
