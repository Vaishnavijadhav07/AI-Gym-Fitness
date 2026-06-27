import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { logHabit, getStreak, getNudge, getHabitHistory, predictSkip } from '../api';

const MOODS = ['😄 Great', '🙂 Good', '😐 Okay', '😓 Tired', '😤 Stressed'];

export default function Habits() {
  const { user } = useAuth();
  const [streak, setStreak] = useState({ streak: 0, total_logged: 0 });
  const [nudge, setNudge] = useState('');
  const [history, setHistory] = useState([]);
  const [skipData, setSkipData] = useState(null);
  const [form, setForm] = useState({ type: 'workout', mood: 'Good', energy_level: 7, notes: '', completed: true });
  const [msg, setMsg] = useState('');

  const refresh = () => {
    if (!user?._id) return;
    const id = user._id;
    getStreak(id).then(r => setStreak(r.data));
    getNudge(id).then(r => setNudge(r.data.nudge));
    getHabitHistory(id).then(r => setHistory(r.data.habits || []));
    predictSkip(id).then(r => setSkipData(r.data));
  };

  useEffect(() => { refresh(); }, [user]);

  const handleLog = async (e) => {
    e.preventDefault();
    try {
      await logHabit({ ...form, user_id: user._id, energy_level: +form.energy_level, mood: form.mood.split(' ')[1] || form.mood });
      setMsg('✅ Habit logged!');
      refresh();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Error logging habit'); }
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const found = history.find(h => new Date(h.date).toDateString() === dateStr);
    return { date: d, found, day: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()] };
  });

  const riskColor = { low: 'var(--accent)', medium: 'var(--orange)', high: 'var(--red)' };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">📊 Habit Tracker</div>
        <div className="page-sub">Behavioral AI — track consistency and get motivational nudges</div>
      </div>

      {nudge && (
        <div style={{ background: 'linear-gradient(135deg, rgba(0,245,160,0.08), rgba(0,212,255,0.08))', border: '1px solid rgba(0,245,160,0.15)', borderRadius: 14, padding: '18px 22px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 28 }}>🤖</span>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Today's Motivation</div>
            <div style={{ fontWeight: 500 }}>{nudge}</div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--orange)' }}>🔥 {streak.streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{streak.total_logged}</div>
          <div className="stat-label">Total Logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: riskColor[skipData?.skip_risk] || 'var(--accent)' }}>
            {skipData?.skip_risk?.toUpperCase() || '—'}
          </div>
          <div className="stat-label">Skip Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{skipData?.skip_rate || 0}%</div>
          <div className="stat-label">Skip Rate</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24, alignItems: 'start' }}>
        {/* Weekly heatmap */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>This Week</h3>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            {last7.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{d.day}</div>
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: 10,
                  background: d.found ? (d.found.completed ? 'var(--accent)' : 'rgba(255,77,109,0.4)') : 'var(--card2)',
                  border: `1px solid ${d.found ? 'transparent' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                }}>
                  {d.found ? (d.found.completed ? '✓' : '✗') : ''}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                  {d.date.getDate()}
                </div>
              </div>
            ))}
          </div>
          {skipData?.recommendation && (
            <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--card2)', borderRadius: 10, fontSize: 13, color: 'var(--muted)' }}>
              💡 {skipData.recommendation}
            </div>
          )}
        </div>

        {/* Log Form */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Log Today's Habit</h3>
          {msg && <div style={{ background: 'rgba(0,245,160,0.1)', borderRadius: 10, padding: '12px', marginBottom: 14, fontSize: 14 }}>{msg}</div>}
          <form onSubmit={handleLog}>
            <div className="form-group">
              <label>Activity Type</label>
              <select className="select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="workout">Workout</option>
                <option value="meditation">Meditation</option>
                <option value="diet">Diet</option>
                <option value="sleep">Sleep</option>
                <option value="steps">Steps / Walk</option>
              </select>
            </div>
            <div className="form-group">
              <label>Mood</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {MOODS.map(m => (
                  <button type="button" key={m} onClick={() => setForm({ ...form, mood: m })} style={{
                    padding: '8px 14px', borderRadius: 20, border: `1px solid ${form.mood === m ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.mood === m ? 'rgba(0,245,160,0.1)' : 'var(--card2)',
                    color: form.mood === m ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', fontSize: 13, transition: 'all 0.2s'
                  }}>{m}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Energy Level: {form.energy_level}/10</label>
              <input type="range" min="1" max="10" value={form.energy_level} onChange={e => setForm({ ...form, energy_level: e.target.value })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            </div>
            <div className="form-group">
              <label>Completed?</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[true, false].map(v => (
                  <button type="button" key={String(v)} onClick={() => setForm({ ...form, completed: v })} style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${form.completed === v ? (v ? 'var(--accent)' : 'var(--red)') : 'var(--border)'}`,
                    background: form.completed === v ? (v ? 'rgba(0,245,160,0.1)' : 'rgba(255,77,109,0.1)') : 'var(--card2)',
                    color: form.completed === v ? (v ? 'var(--accent)' : 'var(--red)') : 'var(--muted)',
                    cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
                  }}>{v ? '✅ Yes' : '❌ Skipped'}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input className="input" placeholder="How was your session?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Log Habit</button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Recent Activity</h3>
        {history.length > 0 ? (
          <table>
            <thead><tr><th>Type</th><th>Completed</th><th>Mood</th><th>Energy</th><th>Notes</th><th>Date</th></tr></thead>
            <tbody>
              {history.slice(0, 15).map((h, i) => (
                <tr key={i}>
                  <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{h.type}</td>
                  <td>{h.completed ? <span className="badge badge-green">Done ✓</span> : <span className="badge badge-red">Skipped</span>}</td>
                  <td style={{ textTransform: 'capitalize' }}>{h.mood || '—'}</td>
                  <td>{h.energy_level}/10</td>
                  <td style={{ fontSize: 13, color: 'var(--muted)' }}>{h.notes || '—'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(h.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <p>Start logging your daily habits to track consistency!</p>
          </div>
        )}
      </div>
    </div>
  );
}
