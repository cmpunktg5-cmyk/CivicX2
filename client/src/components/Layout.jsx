import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MapPin, PlusCircle, Trophy, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/map', icon: MapPin, label: 'Map' },
  { path: '/report', icon: PlusCircle, label: 'Report', isMain: true },
  { path: '/rewards', icon: Trophy, label: 'Rewards' },
  { path: '/profile', icon: User, label: 'Profile' }
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg-base)]">
      {/* Main content area */}
      <main className="flex-1 pb-safe overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border-t border-[var(--color-border)]">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isMain) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative -mt-5 flex flex-col items-center"
                  id="nav-report"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-full bg-[#1ed760] flex items-center justify-center shadow-lg"
                    style={{ boxShadow: '0 4px 20px rgba(30, 215, 96, 0.4)' }}
                  >
                    <Icon size={26} strokeWidth={2.5} className="text-[#111827]" />
                  </motion.div>
                  <span className="text-[10px] font-semibold mt-1 text-[#1ed760]">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center py-2 px-3 relative"
                id={`nav-${item.label.toLowerCase()}`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={`transition-colors duration-200 ${isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}
                />
                <span className={`text-[10px] mt-0.5 font-medium transition-colors duration-200 ${isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-0.5 w-5 h-0.5 rounded-full bg-[#1ed760]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
