import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../api';
import { useAuth } from '../AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', weight: '', height: '',
    goal: 'general_fitness', dietary_pref: 'none'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await loginUser({ email: form.email, password: form.password });
        login(res.data.user);
      } else {
        res = await registerUser({
          ...form,
          age: parseInt(form.age) || undefined,
          weight: parseFloat(form.weight) || undefined,
          height: parseFloat(form.height) || undefined,
        });
        login(res.data.user);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(0,245,160,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,212,255,0.05) 0%, transparent 60%)'
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: 'var(--accent)', letterSpacing: 4, textShadow: 'var(--glow)' }}>
            FIT<span style={{ color: 'var(--text)' }}>AI</span>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>AI-Powered Fitness Ecosystem</div>
        </div>

        <div className="card">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: 'var(--card2)', borderRadius: 10, padding: 4 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#000' : 'var(--muted)', fontWeight: 600, fontSize: 14, transition: 'all 0.2s'
              }}>
                {m === 'login' ? '🔐 Login' : '✨ Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <input className="input" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input className="input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>

            {mode === 'register' && (
              <>
                <div className="grid-3" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label>Age</label>
                    <input className="input" name="age" type="number" placeholder="25" value={form.age} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Weight (kg)</label>
                    <input className="input" name="weight" type="number" placeholder="70" value={form.weight} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Height (cm)</label>
                    <input className="input" name="height" type="number" placeholder="170" value={form.height} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Fitness Goal</label>
                  <select className="select" name="goal" value={form.goal} onChange={handleChange}>
                    <option value="general_fitness">General Fitness</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="flexibility">Flexibility</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Dietary Preference</label>
                  <select className="select" name="dietary_pref" value={form.dietary_pref} onChange={handleChange}>
                    <option value="none">No Preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: 'var(--red)', fontSize: 14 }}>
                ⚠️ {error}
              </div>
            )}

            <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? '⏳ Please wait...' : mode === 'login' ? '🚀 Login' : '🎯 Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
