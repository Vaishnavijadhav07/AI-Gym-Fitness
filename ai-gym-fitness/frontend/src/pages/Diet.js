import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getDietPlan, logMeal, getDietHistory, dietChat } from '../api';

export default function Diet() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [tab, setTab] = useState('plan');
  const [mealForm, setMealForm] = useState({ meal_type: 'breakfast', foods: '', calories: '', protein: '', carbs: '', fat: '' });
  const [history, setHistory] = useState([]);
  const [chatMsgs, setChatMsgs] = useState([{ role: 'bot', text: "👋 Hi! I'm your AI Dietician. Ask me anything about nutrition, meal planning, or calorie counting!" }]);
  const [chatInput, setChatInput] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    getDietPlan({ goal: user.goal || 'general_fitness', dietary_pref: user.dietary_pref, bmi: user.bmi }).then(r => setPlan(r.data));
    getDietHistory(user._id).then(r => setHistory(r.data.meals || []));
  }, [user]);

  const handleLogMeal = async (e) => {
    e.preventDefault();
    try {
      await logMeal({
        user_id: user._id, ...mealForm,
        foods: mealForm.foods.split(',').map(f => f.trim()),
        calories: +mealForm.calories, protein: +mealForm.protein, carbs: +mealForm.carbs, fat: +mealForm.fat
      });
      setMsg('✅ Meal logged!');
      setMealForm({ meal_type: 'breakfast', foods: '', calories: '', protein: '', carbs: '', fat: '' });
      getDietHistory(user._id).then(r => setHistory(r.data.meals || []));
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Error logging meal'); }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMsgs(prev => [...prev, { role: 'user', text: userMsg }]);
    const res = await dietChat({ message: userMsg });
    setChatMsgs(prev => [...prev, { role: 'bot', text: res.data.reply }]);
  };

  const macroTotal = history.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fat: acc.fat + (m.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">🥗 Diet & Nutrition</div>
        <div className="page-sub">AI Dietician, meal planning, and calorie tracking</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {['plan', 'log', 'history', 'chat'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }}>
            {t === 'plan' ? '🍽️ Meal Plan' : t === 'log' ? '➕ Log Meal' : t === 'history' ? '📋 History' : '💬 AI Chat'}
          </button>
        ))}
      </div>

      {tab === 'plan' && plan && (
        <div>
          {plan.bmi_advice && (
            <div style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, fontSize: 14, color: 'var(--accent2)' }}>
              🧬 <strong>BMI Insight:</strong> {plan.bmi_advice}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-value">{plan.calories_target}</div>
              <div className="stat-label">Daily Calorie Target</div>
            </div>
            <div className="card" style={{ flex: 2 }}>
              <h4 style={{ marginBottom: 12 }}>🛒 Grocery List</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {plan.grocery_list?.map((item, i) => (
                  <span key={i} className="badge badge-blue">{item}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid-2">
            {plan.meals?.map((meal, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16 }}>{meal.meal}</h3>
                  <span className="badge badge-orange">{meal.calories} kcal</span>
                </div>
                {meal.foods.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: j < meal.foods.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ color: 'var(--accent)', fontSize: 14 }}>▸</span>
                    <span style={{ fontSize: 14 }}>{f}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'log' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>Log a Meal</h3>
            {msg && <div style={{ background: 'rgba(0,245,160,0.1)', borderRadius: 10, padding: '12px', marginBottom: 14, fontSize: 14 }}>{msg}</div>}
            <form onSubmit={handleLogMeal}>
              <div className="form-group">
                <label>Meal Type</label>
                <select className="select" value={mealForm.meal_type} onChange={e => setMealForm({ ...mealForm, meal_type: e.target.value })}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snack">Snack</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
              <div className="form-group">
                <label>Foods (comma-separated)</label>
                <input className="input" placeholder="Rice, Dal, Salad" value={mealForm.foods} onChange={e => setMealForm({ ...mealForm, foods: e.target.value })} required />
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group"><label>Calories</label><input className="input" type="number" placeholder="400" value={mealForm.calories} onChange={e => setMealForm({ ...mealForm, calories: e.target.value })} /></div>
                <div className="form-group"><label>Protein (g)</label><input className="input" type="number" placeholder="20" value={mealForm.protein} onChange={e => setMealForm({ ...mealForm, protein: e.target.value })} /></div>
                <div className="form-group"><label>Carbs (g)</label><input className="input" type="number" placeholder="50" value={mealForm.carbs} onChange={e => setMealForm({ ...mealForm, carbs: e.target.value })} /></div>
                <div className="form-group"><label>Fat (g)</label><input className="input" type="number" placeholder="10" value={mealForm.fat} onChange={e => setMealForm({ ...mealForm, fat: e.target.value })} /></div>
              </div>
              <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Log Meal</button>
            </form>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>Today's Macros</h3>
            {[
              { label: 'Calories', val: macroTotal.calories, max: plan?.calories_target || 2000, color: 'var(--accent)' },
              { label: 'Protein', val: macroTotal.protein, max: 100, unit: 'g', color: 'var(--accent2)' },
              { label: 'Carbs', val: macroTotal.carbs, max: 250, unit: 'g', color: 'var(--orange)' },
              { label: 'Fat', val: macroTotal.fat, max: 70, unit: 'g', color: 'var(--red)' },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                  <span>{m.label}</span>
                  <span style={{ color: m.color }}>{m.val}{m.unit || ' kcal'} / {m.max}{m.unit || ' kcal'}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min((m.val / m.max) * 100, 100)}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Meal History</h3>
          {history.length > 0 ? (
            <table>
              <thead><tr><th>Meal Type</th><th>Foods</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Date</th></tr></thead>
              <tbody>
                {history.map((m, i) => (
                  <tr key={i}>
                    <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{m.meal_type}</td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>{Array.isArray(m.foods) ? m.foods.join(', ') : m.foods}</td>
                    <td><span className="badge badge-orange">{m.calories}</span></td>
                    <td>{m.protein}g</td>
                    <td>{m.carbs}g</td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(m.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>No meals logged yet.</div>}
        </div>
      )}

      {tab === 'chat' && (
        <div className="card" style={{ maxWidth: 680 }}>
          <h3 style={{ marginBottom: 20 }}>💬 AI Dietician Chat</h3>
          <div className="chat-container">
            {chatMsgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <input className="input" placeholder="Ask about nutrition, diet, BMI..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={sendChat}>Send</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {['Tell me about protein', 'Weight loss tips', 'What is BMI?', 'Vegetarian foods'].map(q => (
              <button key={q} onClick={() => { setChatInput(q); }} className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>{q}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
