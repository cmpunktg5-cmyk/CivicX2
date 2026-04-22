// Category configuration with icons, colors, and labels
export const CATEGORIES = {
  garbage: { label: 'Garbage', icon: '🗑️', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  pothole: { label: 'Potholes', icon: '🕳️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  streetlight: { label: 'Street Lights', icon: '💡', color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
  water: { label: 'Water Issues', icon: '💧', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  sewage: { label: 'Sewage', icon: '🚰', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
  noise: { label: 'Noise', icon: '🔊', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
  encroachment: { label: 'Encroachment', icon: '🚧', color: '#14b8a6', bg: 'rgba(20,184,166,0.15)' },
  traffic: { label: 'Traffic', icon: '🚦', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  electrical: { label: 'Electrical', icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  other: { label: 'Other', icon: '📋', color: 'var(--color-text-muted)', bg: 'rgba(124,124,124,0.15)' }
};

export const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#ffa42b', icon: '⏳' },
  assigned: { label: 'Assigned', color: '#539df5', icon: '👤' },
  in_progress: { label: 'In Progress', color: '#a855f7', icon: '🔄' },
  resolved: { label: 'Resolved', color: '#1ed760', icon: '✅' },
  rejected: { label: 'Rejected', color: '#f3727f', icon: '❌' },
  duplicate: { label: 'Duplicate', color: 'var(--color-text-muted)', icon: '📋' }
};

export const URGENCY_CONFIG = {
  low: { label: 'Low', color: '#1ed760' },
  medium: { label: 'Medium', color: '#ffa42b' },
  high: { label: 'High', color: '#f3727f' },
  critical: { label: 'Critical', color: '#ef4444' }
};

export const POINTS_MAP = {
  submit_complaint: 50,
  upload_images: 20,
  complaint_verified: 30,
  complaint_resolved: 100,
  community_validation: 15,
  badge_earned: 75,
  level_up: 200
};

export const EMERGENCY_SERVICES = [
  { name: 'Police', number: '100', icon: '🚔', color: '#3b82f6', description: 'Emergency police assistance' },
  { name: 'Ambulance', number: '108', icon: '🚑', color: '#ef4444', description: 'Medical emergency services' },
  { name: 'Fire', number: '101', icon: '🚒', color: '#f97316', description: 'Fire department services' },
  { name: 'Women Helpline', number: '1091', icon: '👩', color: '#ec4899', description: '24/7 women safety helpline' },
  { name: 'Child Helpline', number: '1098', icon: '👶', color: '#a855f7', description: 'Child protection services' },
  { name: 'Disaster', number: '1078', icon: '⚠️', color: '#ffa42b', description: 'National disaster helpline' }
];

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const formatPoints = (points) => {
  if (points >= 1000) return `${(points / 1000).toFixed(1)}k`;
  return points.toString();
};

export const getLevelProgress = (totalPoints) => {
  const pointsPerLevel = 500;
  const currentLevel = Math.floor(totalPoints / pointsPerLevel) + 1;
  const pointsInCurrentLevel = totalPoints % pointsPerLevel;
  const progress = Math.floor((pointsInCurrentLevel / pointsPerLevel) * 100);
  return { level: currentLevel, progress, pointsToNext: pointsPerLevel - pointsInCurrentLevel };
};
