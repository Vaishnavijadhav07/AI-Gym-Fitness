import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getGymRecommendations } from '../api';

export default function GymFinder() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (!user) return;
    const g = user.goal || 'general_fitness';
    setGoal(g);
    getGymRecommendations({ goal: g, location: 'Pune, Maharashtra' })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const refresh = (g) => {
    setGoal(g);
    setLoading(true);
    getGymRecommendations({ goal: g }).then(r => { setData(r.data); setLoading(false); });
  };

  const starRating = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">🏋️ Gym Finder & Planner</div>
        <div className="page-sub">AI-recommended gyms, programs, and fitness challenges based on your goals</div>
      </div>

      {/* Goal Selector */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600 }}>Filter by Goal:</span>
          {['general_fitness', 'weight_loss', 'muscle_gain', 'flexibility'].map(g => (
            <button key={g} onClick={() => refresh(g)} className={`btn ${goal === g ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize', fontSize: 13 }}>
              {g.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 42, marginBottom: 12 }} className="pulse">🔍</div>
          <p>Finding the best gyms for you...</p>
        </div>
      ) : data && (
        <div>
          {/* Nearby Gyms */}
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>📍 Nearby Gyms</h3>
          <div className="grid-2" style={{ marginBottom: 28 }}>
            {data.nearby_gyms?.map((gym, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(0,245,160,0.1)', border: '1px solid rgba(0,245,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {['🏋️', '🧘', '💪', '🏊'][i % 4]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{gym.name}</div>
                  <div style={{ color: 'var(--orange)', fontSize: 14, marginBottom: 6 }}>{starRating(gym.rating)} <span style={{ color: 'var(--muted)', fontSize: 12 }}>{gym.rating}</span></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-blue">📍 {gym.distance}</span>
                    <span className="badge badge-green">{gym.speciality}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommended Programs */}
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>🎯 Recommended Programs</h3>
          <div className="grid-3" style={{ marginBottom: 28 }}>
            {data.recommended_programs?.map((prog, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,245,160,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{['🏃', '💪', '🧘', '⚡', '🎯', '🔥'][i % 6]}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{prog}</div>
                <button className="btn btn-secondary" style={{ marginTop: 14, width: '100%', fontSize: 13 }}>View Program</button>
              </div>
            ))}
          </div>

          {/* Challenges */}
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>🏆 Active Challenges</h3>
          <div className="grid-3">
            {data.challenges?.map((ch, i) => (
              <div key={i} className="card card-accent" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,245,160,0.15)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {['🔥', '💪', '👣'][i % 3]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ch}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Join Now</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
