import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Report from './pages/Report';
import MapView from './pages/MapView';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetail from './pages/ComplaintDetail';
import Emergency from './pages/Emergency';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminComplaints from './pages/admin/ComplaintsList';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminInsights from './pages/admin/AdminInsights';

function ProtectedRoute({ children, role = 'user' }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (role === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function App() {
  const theme = useAuthStore((s) => s.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      
      {/* Admin Dedicated Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/complaints" element={<ProtectedRoute role="admin"><AdminLayout><AdminComplaints /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/map" element={<ProtectedRoute role="admin"><AdminLayout><MapView /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/insights" element={<ProtectedRoute role="admin"><AdminLayout><AdminInsights /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminLayout><AdminAnalytics /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />

      {/* Citizen App Routes */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="report" element={<Report />} />
        <Route path="map" element={<MapView />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-complaints" element={<MyComplaints />} />
        <Route path="complaint/:id" element={<ComplaintDetail />} />
        <Route path="emergency" element={<Emergency />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
