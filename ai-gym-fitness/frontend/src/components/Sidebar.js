import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const navItems = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '💪', label: 'Workouts', path: '/workouts' },
  { icon: '🥗', label: 'Diet & Nutrition', path: '/diet' },
  { icon: '📊', label: 'Habit Tracker', path: '/habits' },
  { icon: '🏆', label: 'Performance', path: '/performance' },
  { icon: '🤖', label: 'AI Buddy', path: '/buddy' },
  { icon: '🏋️', label: 'Gym Finder', path: '/gyms' },
  { icon: '👤', label: 'Profile', path: '/profile' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        FIT<span>AI</span>
      </div>

      {user && (
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Logged in as</div>
          <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{user.name}</div>
          {user.goal && (
            <div className="badge badge-green" style={{ marginTop: 8, fontSize: 11 }}>
              {user.goal.replace('_', ' ')}
            </div>
          )}
        </div>
      )}

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
        <button
          className="btn btn-secondary"
          style={{ width: '100%', fontSize: 13 }}
          onClick={() => { logout(); navigate('/'); }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
