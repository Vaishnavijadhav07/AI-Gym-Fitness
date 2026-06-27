import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getDashboard, getWorkoutStats, getStreak, getNudge, predictSkip } from '../api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [streak, setStreak] = useState(null);
  const [nudge, setNudge] = useState('');
  const [skipRisk, setSkipRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    const id = user._id;
    Promise.all([
      getDashboard(id).catch(() => ({ data: {} })),
      getWorkoutStats(id).catch(() => ({ data: {} })),
      getStreak(id).catch(() => ({ data: { streak: 0 } })),
      getNudge(id).catch(() => ({ data: { nudge: '💪 Ready to crush it today?' } })),
      predictSkip(id).catch(() => ({ data: { skip_risk: 'low' } })),
    ]).then(([dash, ws, st, nu, skip]) => {
      setStats(dash.data);
      setWorkoutStats(ws.data);
      setStreak(st.data);
      setNudge(nu.data.nudge);
      setSkipRisk(skip.data);
      setLoading(false);
    });
  }, [user]);

  const chartData = stats?.recent_workouts?.map((w, i) => ({
    name: `W${i + 1}`,
    calories: w.calories_burned || 0,
    score: w.form_score || 0,
  })) || [];

  const riskColor = { low: 'var(--accent)', medium: 'var(--orange)', high: 'var(--red)' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: 'var(--accent)' }} className="pulse">LOADING...</div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</div>
        <div className="page-sub">Here's your fitness overview for today</div>
      </div>

      {/* Nudge Banner */}
      {nudge && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,245,160,0.1), rgba(0,212,255,0.1))',
          border: '1px solid rgba(0,245,160,0.2)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 24,
          fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: 24 }}>🤖</span>
          <span>{nudge}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{workoutStats?.total_sessions || 0}</div>
          <div className="stat-label">Total Workouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{streak?.streak || 0}</div>
          <div className="stat-label">Day Streak 🔥</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{workoutStats?.total_calories_burned || 0}</div>
          <div className="stat-label">Calories Burned</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{workoutStats?.average_form_score || '—'}</div>
          <div className="stat-label">Avg Form Score</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Recent Workout Calories</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="calories" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 40 }}>📊</span>
              <span>Log workouts to see your chart</span>
            </div>
          )}
        </div>

        {/* Recent Workouts + Risk */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {skipRisk && (
            <div className="card">
              <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Skip Risk Prediction 🧠</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  border: `3px solid ${riskColor[skipRisk.skip_risk] || 'var(--accent)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Bebas Neue',sans-serif", fontSize: 22,
                  color: riskColor[skipRisk.skip_risk]
                }}>
                  {skipRisk.skip_risk?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                    Skip rate: <strong style={{ color: 'var(--text)' }}>{skipRisk.skip_rate}%</strong>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{skipRisk.recommendation}</div>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Recent Workouts</h3>
            {stats?.recent_workouts?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.recent_workouts.slice(0, 4).map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--card2)', borderRadius: 10 }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{w.exercise}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{w.sets} sets × {w.reps} reps</div>
                    </div>
                    <div className="badge badge-green">{w.calories_burned} kcal</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
                No workouts yet. Start training! 💪
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BMI & User Info */}
      {user && (
        <div className="card card-accent">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Your Profile Stats</h3>
          <div className="grid-4">
            {[
              { label: 'Goal', value: user.goal?.replace('_', ' ') || 'N/A' },
              { label: 'BMI', value: user.bmi || 'N/A' },
              { label: 'Weight', value: user.weight ? `${user.weight} kg` : 'N/A' },
              { label: 'Height', value: user.height ? `${user.height} cm` : 'N/A' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 600, fontSize: 16, textTransform: 'capitalize' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
