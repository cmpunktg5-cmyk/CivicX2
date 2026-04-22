import { useState } from 'react';
import { useAuthStore } from '../../store';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
  BarChart3, 
  Users, 
  LogOut, 
  Bell,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Map as MapIcon,
  Zap,
  Globe,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Complaints', icon: ListTodo, path: '/admin/complaints' },
    { name: 'Live Map', icon: Globe, path: '/admin/map' },
    { name: 'AI Insights', icon: Zap, path: '/admin/insights' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 md:p-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/CivicX2_logo.png" alt="CivicX Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(30,215,96,0.3)]" />
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tighter leading-none">CivicX</span>
            <span className="text-[10px] font-black text-[var(--color-brand)] uppercase tracking-[0.2em] mt-1">Governance</span>
          </div>
        </Link>
        <button className="lg:hidden text-[var(--color-text-secondary)]" onClick={() => setMobileMenuOpen(false)}>
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
        <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest px-4 mb-4 mt-2">Executive Overview</p>
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`admin-sidebar-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-sm">{item.name}</span>
              {isActive && <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />}
            </Link>
          );
        })}
        
        <div className="pt-8 pb-4 px-4">
          <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-4">System</p>
          <Link to="/admin/settings" onClick={() => setMobileMenuOpen(false)} className="admin-sidebar-item">
            <Settings size={20} />
            <span className="text-sm">Settings</span>
          </Link>
        </div>
      </nav>

      <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/30">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand)] to-[#1db954] p-[2px] shrink-0">
            <div className="w-full h-full rounded-[10px] bg-[var(--color-bg-surface)] flex items-center justify-center font-black text-[var(--color-brand)]">
              {user?.name?.[0]}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate uppercase tracking-tight">{user?.name}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] truncate font-bold">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-[#f3727f] hover:bg-[#f3727f]/10 transition-all duration-300 text-sm font-black uppercase tracking-widest border border-transparent hover:border-[#f3727f]/20"
        >
          <LogOut size={18} />
          Term. Session
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] flex-col sticky top-0 h-screen z-50 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] flex flex-col z-[101] shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="h-20 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/80 backdrop-blur-3xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-[var(--color-text-primary)]" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Live Network Status: Optimal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-full px-5 py-2 text-xs font-bold outline-none focus:border-[var(--color-brand)] transition-all w-48 lg:w-64 shadow-inner"
              />
            </div>
            <button className="p-2.5 rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-border)] transition-all relative group">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--color-brand)] rounded-full border-2 border-[var(--color-bg-surface)] group-hover:scale-125 transition-transform"></span>
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
