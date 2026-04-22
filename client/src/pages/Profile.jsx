import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Edit2, FileText, LogOut, Phone, Settings, Shield, Star, User as UserIcon, Zap, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../store';
import { getLevelProgress } from '../utils/constants';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, theme, toggleTheme } = useAuthStore();
  const levelInfo = getLevelProgress(user?.totalPointsEarned || 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'My Complaints', icon: FileText, path: '/my-complaints', color: '#539df5' },
    { label: 'Emergency Services', icon: Shield, path: '/emergency', color: '#f3727f' },
    { label: 'Rewards & Badges', icon: Star, path: '/rewards', color: '#ffa42b' },
    ...(user?.role === 'admin' ? [{ label: 'Admin Dashboard', icon: Settings, path: '/admin', color: '#a855f7' }] : [])
  ];

  return (
    <div className="px-4 pt-4 pb-4">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-lg mx-auto">

        <motion.div variants={item} className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Profile</h1>
          <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border)]">
            {theme === 'dark' ? <Sun size={18} className="text-[var(--color-text-secondary)]" /> : <Moon size={18} className="text-[var(--color-text-secondary)]" />}
          </button>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          variants={item}
          className="rounded-2xl p-5 border border-[var(--color-border)] relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, var(--color-bg-surface) 100%)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="absolute top-[-40%] right-[-30%] w-[60%] h-[80%] rounded-full bg-[#1ed760]/5 blur-[60px]" />
          <div className="relative flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1ed760] to-[#1db954] flex items-center justify-center text-2xl font-bold text-[var(--color-bg-base)] shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{user?.name || 'User'}</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-[#1ed760] font-semibold flex items-center gap-1">
                  <Zap size={12} /> {user?.points || 0} pts
                </span>
                <span className="text-xs text-[#ffa42b] font-semibold flex items-center gap-1">
                  <Star size={12} /> Level {levelInfo.level}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: 'Submitted', value: user?.complaintsSubmitted || 0 },
              { label: 'Resolved', value: user?.complaintsResolved || 0 },
              { label: 'Validated', value: user?.complaintsValidated || 0 }
            ].map((stat, i) => (
              <div key={i} className="bg-[var(--color-bg-base)] rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div variants={item} className="space-y-1.5">
          {menuItems.map((mi, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(mi.path)}
              className="w-full flex items-center gap-3 rounded-xl bg-[var(--color-bg-elevated)] p-3.5 hover:bg-[var(--color-bg-card)] transition-colors border border-[var(--color-border)]"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${mi.color}20` }}>
                <mi.icon size={18} style={{ color: mi.color }} />
              </div>
              <span className="flex-1 text-sm font-semibold text-[var(--color-text-primary)] text-left">{mi.label}</span>
              <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
            </motion.button>
          ))}
        </motion.div>

        {/* Emergency Contacts */}
        {user?.emergencyContacts?.length > 0 && (
          <motion.div variants={item}>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
              <Phone size={14} className="text-[#f3727f]" />
              Emergency Contacts
            </h3>
            <div className="space-y-1.5">
              {user.emergencyContacts.map((contact, i) => (
                <div key={i} className="rounded-xl bg-[var(--color-bg-elevated)] p-3 flex items-center gap-3 border border-[var(--color-border)]">
                  <div className="w-8 h-8 rounded-full bg-[#f3727f]/15 flex items-center justify-center">
                    <Phone size={14} className="text-[#f3727f]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">{contact.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{contact.phone} · {contact.relationship}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Logout */}
        <motion.div variants={item}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-[500px] bg-[var(--color-bg-elevated)] py-3.5 text-sm font-bold text-[#f3727f] uppercase tracking-wider hover:bg-[var(--color-bg-card)] transition-colors border border-[#f3727f]/20"
            id="profile-logout"
          >
            <LogOut size={16} />
            Sign Out
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  );
}
