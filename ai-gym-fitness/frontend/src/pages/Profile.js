import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { updateUser } from '../api';

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', age: user?.age || '', weight: user?.weight || '', height: user?.height || '', goal: user?.goal || 'general_fitness', dietary_pref: user?.dietary_pref || 'none' });
  const [msg, setMsg] = useState('');

  const getBMI = () => {
    if (!form.weight || !form.height) return null;
    return (form.weight / ((form.height / 100) ** 2)).toFixed(1);
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', color: 'var(--accent2)' };
    if (bmi < 25) return { label: 'Normal', color: 'var(--accent)' };
    if (bmi < 30) return { label: 'Overweight', color: 'var(--orange)' };
    return { label: 'Obese', color: 'var(--red)' };
  };

  const bmi = getBMI();
  const bmiStatus = getBMIStatus(bmi);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateUser(user._id, { ...form, age: +form.age, weight: +form.weight, height: +form.height, bmi: bmi ? +bmi : undefined });
      const updated = { ...user, ...form, bmi: bmi ? +bmi : user.bmi };
      login(updated);
      setMsg('✅ Profile updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Failed to update'); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">👤 Profile</div>
        <div className="page-sub">Manage your fitness profile and personal information</div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          {/* Avatar Card */}
          <div className="card card-accent" style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#000', margin: '0 auto 16px', fontFamily: "'Syne',sans-serif" }}>
              {initials}
            </div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{user?.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{user?.email}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <span className="badge badge-green">{(user?.goal || 'general_fitness').replace('_', ' ')}</span>
              {user?.dietary_pref && user.dietary_pref !== 'none' && (
                <span className="badge badge-blue">{user.dietary_pref}</span>
              )}
            </div>
          </div>

          {/* BMI Card */}
          {bmi && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>BMI Calculator</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: bmiStatus?.color, lineHeight: 1 }}>{bmi}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>BMI Score</div>
                </div>
                <div>
                  <div className="badge" style={{ background: `rgba(0,0,0,0.3)`, color: bmiStatus?.color, border: `1px solid ${bmiStatus?.color}`, marginBottom: 10, fontSize: 14 }}>
                    {bmiStatus?.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Healthy range: 18.5 — 24.9</div>
                </div>
              </div>
              {/* BMI Scale */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
                  {[['#60a5fa', 'Under'], ['#34d399', 'Normal'], ['#fbbf24', 'Over'], ['#f87171', 'Obese']].map(([c, l]) => (
                    <div key={l} style={{ flex: 1, background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                  <span>{'<'}18.5</span><span>18.5</span><span>25</span><span>30+</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Edit Profile</h3>
          {msg && <div style={{ background: msg.includes('✅') ? 'rgba(0,245,160,0.1)' : 'rgba(255,77,109,0.1)', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 14 }}>{msg}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid-3" style={{ gap: 12 }}>
              <div className="form-group"><label>Age</label><input className="input" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} /></div>
              <div className="form-group"><label>Weight (kg)</label><input className="input" type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></div>
              <div className="form-group"><label>Height (cm)</label><input className="input" type="number" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} /></div>
            </div>
            <div className="form-group">
              <label>Fitness Goal</label>
              <select className="select" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
                <option value="general_fitness">General Fitness</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="flexibility">Flexibility</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dietary Preference</label>
              <select className="select" value={form.dietary_pref} onChange={e => setForm({ ...form, dietary_pref: e.target.value })}>
                <option value="none">No Preference</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}
