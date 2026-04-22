import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Phone, Plus, Shield, Trash2, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store';
import { EMERGENCY_SERVICES } from '../utils/constants';

import toast from 'react-hot-toast';

export default function Emergency() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('');

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  const addContact = () => {
    if (!contactName || !contactPhone) return toast.error('Fill name and phone');
    const contacts = [...(user?.emergencyContacts || []), { name: contactName, phone: contactPhone, relationship: contactRelation }];
    updateUser({ emergencyContacts: contacts });
    setShowAddContact(false);
    setContactName(''); setContactPhone(''); setContactRelation('');
    toast.success('Contact added');
  };

  return (
    <div className="min-h-dvh bg-[var(--color-bg-base)]">
      <div className="sticky top-0 z-20 bg-[var(--color-bg-base)]/95 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-[var(--color-border)]">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center"><ChevronLeft size={20} className="text-[var(--color-text-primary)]" /></button>
        <Shield size={18} className="text-[#f3727f]" />
        <h1 className="text-base font-bold text-[var(--color-text-primary)]">Emergency Services</h1>
      </div>
      <div className="px-4 py-4 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full md:py-8 space-y-5">
        {/* Services Grid */}
        <div>
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 uppercase tracking-wider">Quick Dial</h2>
          <div className="grid grid-cols-2 gap-3">
            {EMERGENCY_SERVICES.map((svc, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCall(svc.number)}
                className="rounded-2xl p-4 flex flex-col gap-3 border border-[var(--color-border)] hover:border-[var(--color-text-primary)]/10 transition-all text-left"
                style={{ background: `linear-gradient(135deg, ${svc.color}10, ${svc.color}05)` }}
                id={`emergency-${svc.name.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{svc.icon}</span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${svc.color}25` }}>
                    <Phone size={18} style={{ color: svc.color }} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">{svc.name}</p>
                  <p className="text-lg font-black" style={{ color: svc.color }}>{svc.number}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{svc.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Personal Emergency Contacts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">My Contacts</h2>
            <button onClick={() => setShowAddContact(!showAddContact)} className="text-xs text-[#1ed760] font-semibold flex items-center gap-1">
              <Plus size={14} /> Add
            </button>
          </div>

          {showAddContact && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl bg-[var(--color-bg-elevated)] p-4 border border-[var(--color-border)] space-y-3 mb-3">
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact name" className="w-full bg-[var(--color-bg-base)] text-[var(--color-text-primary)] rounded-lg px-3 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-muted)]" />
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone number" type="tel" className="w-full bg-[var(--color-bg-base)] text-[var(--color-text-primary)] rounded-lg px-3 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-muted)]" />
              <input value={contactRelation} onChange={(e) => setContactRelation(e.target.value)} placeholder="Relationship (optional)" className="w-full bg-[var(--color-bg-base)] text-[var(--color-text-primary)] rounded-lg px-3 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-muted)]" />
              <motion.button whileTap={{ scale: 0.97 }} onClick={addContact} className="w-full bg-[#1ed760] text-[#111827] rounded-full py-2.5 text-sm font-bold uppercase tracking-wider">
                Save Contact
              </motion.button>
            </motion.div>
          )}

          {(user?.emergencyContacts || []).length > 0 ? (
            <div className="space-y-2">
              {user.emergencyContacts.map((contact, i) => (
                <motion.div key={i} whileTap={{ scale: 0.98 }} onClick={() => handleCall(contact.phone)} className="rounded-xl bg-[var(--color-bg-elevated)] p-3 flex items-center gap-3 border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-card)] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#539df5]/15 flex items-center justify-center"><Phone size={16} className="text-[#539df5]" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-[var(--color-text-primary)]">{contact.name}</p><p className="text-[10px] text-[var(--color-text-muted)]">{contact.phone}{contact.relationship ? ` · ${contact.relationship}` : ''}</p></div>
                </motion.div>
              ))}
            </div>
          ) : !showAddContact && (
            <div className="rounded-xl bg-[var(--color-bg-elevated)] p-6 text-center border border-[var(--color-border)]">
              <UserPlus size={24} className="text-[var(--color-text-muted)] mx-auto mb-2" />
              <p className="text-xs text-[var(--color-text-secondary)]">No personal contacts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
