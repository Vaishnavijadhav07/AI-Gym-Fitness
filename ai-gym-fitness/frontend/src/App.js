import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Diet from './pages/Diet';
import Habits from './pages/Habits';
import Performance from './pages/Performance';
import AiBuddy from './pages/AiBuddy';
import GymFinder from './pages/GymFinder';
import Profile from './pages/Profile';
import './styles/global.css';

function ProtectedLayout({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/workouts" element={<ProtectedLayout><Workouts /></ProtectedLayout>} />
      <Route path="/diet" element={<ProtectedLayout><Diet /></ProtectedLayout>} />
      <Route path="/habits" element={<ProtectedLayout><Habits /></ProtectedLayout>} />
      <Route path="/performance" element={<ProtectedLayout><Performance /></ProtectedLayout>} />
      <Route path="/buddy" element={<ProtectedLayout><AiBuddy /></ProtectedLayout>} />
      <Route path="/gyms" element={<ProtectedLayout><GymFinder /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
