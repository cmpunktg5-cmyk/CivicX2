import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Database, HardDrive, Key } from 'lucide-react';

export default function AdminSettings() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)]">System Configuration</h1>
        <p className="text-sm font-bold text-[var(--color-text-secondary)] mt-1 uppercase tracking-wider">Manage platform preferences and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-black tracking-tight">Security & Access</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-base)] rounded-xl border border-[var(--color-border)]">
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">Two-Factor Authentication</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">Extra layer of security</p>
              </div>
              <button className="w-10 h-6 bg-[var(--color-bg-elevated)] rounded-full border border-[var(--color-border)] relative">
                <div className="w-4 h-4 rounded-full bg-[var(--color-text-muted)] absolute left-1 top-1"></div>
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-base)] rounded-xl border border-[var(--color-border)]">
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">Auto-lock Terminal</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">After 15m of inactivity</p>
              </div>
              <button className="w-10 h-6 bg-[#1ed760] rounded-full border border-transparent relative">
                <div className="w-4 h-4 rounded-full bg-black absolute right-1 top-1 shadow-sm"></div>
              </button>
            </div>
            <button className="w-full py-3 rounded-xl border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all">
              Change Admin Password
            </button>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-[#539df5]/10 text-[#539df5]">
              <Database size={24} />
            </div>
            <h3 className="text-lg font-black tracking-tight">Database & AI Engine</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-bg-base)] rounded-xl border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Gemini API Connection</p>
                <span className="flex items-center gap-1 text-[10px] font-black text-[#1ed760]"><div className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse"></div> Active</span>
              </div>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">Using Model: gemini-2.0-flash</p>
            </div>
            <button className="w-full py-3 rounded-xl border border-red-500/30 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
              <HardDrive size={18} /> Purge Resolved Records (30+ days)
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
