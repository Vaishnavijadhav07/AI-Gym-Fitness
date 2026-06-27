import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getWorkoutPlan, logWorkout, getWorkoutHistory, analyzeForm } from '../api';

export default function Workouts() {
  const { user } = useAuth();
  const [plan, setPlan] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('plan');
  const [logForm, setLogForm] = useState({ exercise: '', sets: '', reps: '', calories_burned: '', notes: '' });
  const [formAnalysis, setFormAnalysis] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    getWorkoutPlan(user.goal || 'general_fitness').then(r => setPlan(r.data.plan || []));
    getWorkoutHistory(user._id).then(r => setHistory(r.data.workouts || []));
  }, [user]);

  const handleLog = async (e) => {
    e.preventDefault();
    try {
      await logWorkout({ ...logForm, user_id: user._id, sets: +logForm.sets, reps: +logForm.reps, calories_burned: +logForm.calories_burned });
      setMsg('✅ Workout logged successfully!');
      setLogForm({ exercise: '', sets: '', reps: '', calories_burned: '', notes: '' });
      getWorkoutHistory(user._id).then(r => setHistory(r.data.workouts || []));
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('❌ Failed to log workout');
    }
  };

  const handleAnalyze = async () => {
    if (!logForm.exercise) return;
    const res = await analyzeForm({ exercise: logForm.exercise, reps: +logForm.reps || 10 });
    setFormAnalysis(res.data);
  };

  const TABS = ['plan', 'log', 'history'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">💪 Workout Center</div>
        <div className="page-sub">AI-personalized plans, form analysis, and history</div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }}>
            {t === 'plan' ? '📋 My Plan' : t === 'log' ? '➕ Log Workout' : '📈 History'}
          </button>
        ))}
      </div>

      {/* Plan Tab */}
      {tab === 'plan' && (
        <div>
          <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(0,245,160,0.05), rgba(0,212,255,0.05))' }}>
            <h3 style={{ marginBottom: 4 }}>Your Personalized Plan</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Goal: <strong style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>{(user?.goal || 'general_fitness').replace('_', ' ')}</strong></p>
          </div>
          <div className="grid-2">
            {plan.map((ex, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, background: 'rgba(0,245,160,0.1)',
                  border: '1px solid rgba(0,245,160,0.2)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22, flexShrink: 0
                }}>
                  {['🏋️','🤸','🚴','🏃','💪','🧘','⚡','🔥'][i % 8]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{ex.exercise}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-green">{ex.sets} Sets</span>
                    <span className="badge badge-blue">{ex.reps} Reps{ex.duration ? ` / ${ex.duration}` : ''}</span>
                    <span className="badge badge-orange">{ex.calories} kcal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Tab */}
      {tab === 'log' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>Log a Workout</h3>
            {msg && (
              <div style={{ background: msg.includes('✅') ? 'rgba(0,245,160,0.1)' : 'rgba(255,77,109,0.1)', border: `1px solid ${msg.includes('✅') ? 'rgba(0,245,160,0.3)' : 'rgba(255,77,109,0.3)'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
                {msg}
              </div>
            )}
            <form onSubmit={handleLog}>
              <div className="form-group">
                <label>Exercise Name</label>
                <input className="input" placeholder="e.g., Push-ups, Squats" value={logForm.exercise} onChange={e => setLogForm({ ...logForm, exercise: e.target.value })} required />
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group">
                  <label>Sets</label>
                  <input className="input" type="number" placeholder="3" value={logForm.sets} onChange={e => setLogForm({ ...logForm, sets: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Reps</label>
                  <input className="input" type="number" placeholder="15" value={logForm.reps} onChange={e => setLogForm({ ...logForm, reps: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Calories Burned</label>
                <input className="input" type="number" placeholder="50" value={logForm.calories_burned} onChange={e => setLogForm({ ...logForm, calories_burned: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="input" placeholder="How did it feel?" rows={3} value={logForm.notes} onChange={e => setLogForm({ ...logForm, notes: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Log Workout</button>
                <button type="button" className="btn btn-secondary" onClick={handleAnalyze}>🔍 Analyze Form</button>
              </div>
            </form>
          </div>

          {/* Form Analysis */}
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>AI Form Analyzer</h3>
            {formAnalysis ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div className="score-circle">{formAnalysis.form_score}</div>
                  <div style={{ marginTop: 12, fontWeight: 600 }}>Form Score for {formAnalysis.exercise}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>AI Feedback</div>
                  {formAnalysis.feedback.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--accent)', fontSize: 16 }}>✓</span>
                      <span style={{ fontSize: 14 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🤖</div>
                <p>Enter an exercise and click "Analyze Form" to get AI-powered feedback on your technique.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Workout History</h3>
          {history.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Exercise</th><th>Sets</th><th>Reps</th><th>Calories</th><th>Form Score</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((w, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{w.exercise}</td>
                    <td>{w.sets || '—'}</td>
                    <td>{w.reps || '—'}</td>
                    <td><span className="badge badge-orange">{w.calories_burned} kcal</span></td>
                    <td>{w.form_score ? <span className="badge badge-green">{w.form_score}</span> : '—'}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(w.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>📋</div>
              <p>No workouts logged yet. Start your journey!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
