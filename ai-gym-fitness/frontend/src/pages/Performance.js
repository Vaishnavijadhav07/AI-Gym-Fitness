import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { recordScore, getPerformanceHistory, getWeeklyReport } from '../api';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Performance() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({ form_score: 70, consistency_score: 70, intensity_score: 70 });
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('score');
  const [msg, setMsg] = useState('');

  const refresh = () => {
    if (!user?._id) return;
    getPerformanceHistory(user._id).then(r => setHistory(r.data.records || []));
    getWeeklyReport(user._id).then(r => setReport(r.data));
  };

  useEffect(() => { refresh(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await recordScore({ ...form, user_id: user._id, form_score: +form.form_score, consistency_score: +form.consistency_score, intensity_score: +form.intensity_score });
      setResult(res.data.record);
      setMsg('✅ Performance recorded!');
      refresh();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Error recording'); }
  };

  const radarData = result ? [
    { subject: 'Form', value: result.form_score },
    { subject: 'Consistency', value: result.consistency_score },
    { subject: 'Intensity', value: result.intensity_score },
  ] : [];

  const chartData = history.map((r, i) => ({ name: `S${i + 1}`, score: r.overall_score })).reverse();

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">🏆 Performance</div>
        <div className="page-sub">Pose-to-Performance Analyzer with weekly progress reports</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {['score', 'report', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}>
            {t === 'score' ? '⚡ Record Score' : t === 'report' ? '📈 Weekly Report' : '📋 History'}
          </button>
        ))}
      </div>

      {tab === 'score' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>Record Performance</h3>
            {msg && <div style={{ background: 'rgba(0,245,160,0.1)', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 14 }}>{msg}</div>}
            <form onSubmit={handleSubmit}>
              {[
                { key: 'form_score', label: 'Form Score', emoji: '🎯' },
                { key: 'consistency_score', label: 'Consistency Score', emoji: '📅' },
                { key: 'intensity_score', label: 'Intensity Score', emoji: '⚡' },
              ].map(({ key, label, emoji }) => (
                <div className="form-group" key={key}>
                  <label>{emoji} {label}: <strong style={{ color: 'var(--accent)' }}>{form[key]}/100</strong></label>
                  <input type="range" min="0" max="100" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ width: '100%', accentColor: 'var(--accent)', marginTop: 6 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    <span>Beginner</span><span>Intermediate</span><span>Elite</span>
                  </div>
                </div>
              ))}
              <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }}>Calculate Performance Score</button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 20 }}>Performance Analysis</h3>
            {result ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div className="score-circle" style={{ width: 120, height: 120, fontSize: 38 }}>{result.overall_score}</div>
                  <div style={{ marginTop: 12, fontWeight: 700, fontSize: 18 }}>Overall Performance Score</div>
                </div>
                {result.badges?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
                    {result.badges.map((b, i) => <span key={i} className="badge badge-green" style={{ fontSize: 13 }}>{b}</span>)}
                  </div>
                )}
                {radarData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" stroke="var(--muted)" fontSize={13} />
                      <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>📊</div>
                <p>Set your scores and calculate your performance rating</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'report' && report && (
        <div>
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {[
              { label: 'Sessions', val: report.week_summary?.sessions_completed || 0 },
              { label: 'Avg Score', val: report.week_summary?.avg_performance_score || 0 },
              { label: 'Calories', val: report.week_summary?.total_calories_burned || 0 },
              { label: 'Top Exercise', val: report.week_summary?.top_exercise || '—' },
            ].map(({ label, val }) => (
              <div className="stat-card" key={label}>
                <div className="stat-value" style={{ fontSize: typeof val === 'string' ? 22 : 42 }}>{val}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {report.recommendation && (
            <div style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, fontSize: 14, color: 'var(--accent2)' }}>
              💡 <strong>AI Recommendation:</strong> {report.recommendation}
            </div>
          )}

          <div className="card">
            <h3 style={{ marginBottom: 20 }}>Score Trend</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
                  <YAxis stroke="var(--muted)" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>Record performance scores to see your trend!</div>
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Performance History</h3>
          {history.length > 0 ? (
            <table>
              <thead><tr><th>Overall</th><th>Form</th><th>Consistency</th><th>Intensity</th><th>Badges</th><th>Date</th></tr></thead>
              <tbody>
                {history.map((r, i) => (
                  <tr key={i}>
                    <td><span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: 'var(--accent)' }}>{r.overall_score}</span></td>
                    <td>{r.form_score}</td>
                    <td>{r.consistency_score}</td>
                    <td>{r.intensity_score}</td>
                    <td style={{ fontSize: 13 }}>{r.badges?.join(', ') || '—'}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(r.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>No performance records yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
