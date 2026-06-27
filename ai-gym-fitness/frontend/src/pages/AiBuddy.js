import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const RESPONSES = {
  motivation: ["You've got this! Every rep counts. 💪", "Champions aren't born — they're built one workout at a time! 🔥", "Push past the pain. Your future self is watching! ⚡"],
  tired: ["Rest is part of progress! Even elite athletes take recovery days. 😌", "Listen to your body. A proper rest today means a stronger workout tomorrow! 🌙"],
  diet: ["Abs are made in the kitchen! Stick to your meal plan. 🥗", "Fuel your body right — it's your most powerful machine! 🍎"],
  progress: ["Track your workouts daily — small steps lead to giant leaps! 📈", "Progress isn't always visible, but it's always happening when you stay consistent!"],
  happy: ["That positive energy will fuel your best workout! Let's crush it! 🌟", "Amazing! Channel that happiness into your training today! 🎯"],
  sad: ["It's okay to have tough days. Your gym buddy is here for you. 💙 Even a short walk counts!", "Remember why you started. You're stronger than you think! 🌈"],
  default: ["I'm your AI Gym Buddy! I'm here to motivate you, track your mood, and keep you on track! 🤖", "Tell me how you're feeling and I'll give you personalized guidance!", "Ready to make today count? Let's talk about your goals! 🎯"]
};

const SENTIMENTS = {
  motivated: ['motivation', 'fire', 'let\'s go', 'ready', 'pumped', 'excited', 'crush'],
  tired: ['tired', 'exhausted', 'fatigue', 'rest', 'sleep', 'drained'],
  diet: ['diet', 'food', 'eat', 'nutrition', 'meal', 'hungry', 'calorie'],
  progress: ['progress', 'improve', 'better', 'grow', 'gain', 'track', 'result'],
  happy: ['happy', 'great', 'amazing', 'awesome', 'fantastic', 'good', 'love'],
  sad: ['sad', 'depressed', 'bad', 'terrible', 'awful', 'hate', 'struggle', 'fail'],
};

function getReply(msg) {
  const lower = msg.toLowerCase();
  for (const [mood, keywords] of Object.entries(SENTIMENTS)) {
    if (keywords.some(k => lower.includes(k))) {
      const arr = RESPONSES[mood] || RESPONSES.default;
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }
  return RESPONSES.default[Math.floor(Math.random() * RESPONSES.default.length)];
}

const QUICK_PROMPTS = [
  "I need motivation! 🔥",
  "I'm feeling tired today 😓",
  "How's my diet looking?",
  "I'm really happy today! 😄",
  "I've been skipping workouts 😅",
  "Give me a pep talk!",
];

const MOODS = [
  { emoji: '😄', label: 'Great', color: 'var(--accent)' },
  { emoji: '🙂', label: 'Good', color: 'var(--accent2)' },
  { emoji: '😐', label: 'Okay', color: 'var(--orange)' },
  { emoji: '😓', label: 'Tired', color: '#a78bfa' },
  { emoji: '😤', label: 'Stressed', color: 'var(--red)' },
];

export default function AiBuddy() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hey ${user?.name?.split(' ')[0] || 'Champion'}! 👋 I'm your Virtual Gym Buddy powered by AI. I'm here to motivate you, track your mood, and help you stay on track with your fitness journey. How are you feeling today?`, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodLog, setMoodLog] = useState([]);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput('');
    const userMsg = { role: 'user', text: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      const reply = getReply(msg);
      setMessages(prev => [...prev, { role: 'bot', text: reply, time: new Date() }]);
    }, 600);
  };

  const logMood = (mood) => {
    setSelectedMood(mood);
    setMoodLog(prev => [...prev, { ...mood, time: new Date() }]);
    send(`I'm feeling ${mood.label} today ${mood.emoji}`);
  };

  const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">🤖 Virtual Gym Buddy</div>
        <div className="page-sub">Your AI companion for motivation, mood tracking & personalized guidance</div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 20 }}>
        {/* Chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700 }}>FitAI Buddy</div>
              <div style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} className="pulse" />
                Online — Sentiment AI Active
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div className={`chat-msg ${m.role}`}>{m.text}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, paddingLeft: m.role === 'bot' ? 4 : 0 }}>{fmt(m.time)}</div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {QUICK_PROMPTS.map(q => (
                <button key={q} onClick={() => send(q)} className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>{q}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Talk to your AI buddy..." style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={() => send()}>Send</button>
            </div>
          </div>
        </div>

        {/* Mood Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>How are you feeling? 🎭</h3>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              {MOODS.map(m => (
                <button key={m.label} onClick={() => logMood(m)} style={{
                  flex: 1, padding: '16px 8px', borderRadius: 14, border: `2px solid ${selectedMood?.label === m.label ? m.color : 'var(--border)'}`,
                  background: selectedMood?.label === m.label ? `rgba(${m.color === 'var(--accent)' ? '0,245,160' : '0,0,0'},0.1)` : 'var(--card2)',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{m.emoji}</div>
                  <div style={{ fontSize: 11, color: selectedMood?.label === m.label ? m.color : 'var(--muted)', fontWeight: 500 }}>{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Mood Log Today 📊</h3>
            {moodLog.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {moodLog.slice(-5).map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--card2)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{m.emoji}</span>
                      <span style={{ fontWeight: 500 }}>{m.label}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmt(m.time)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>
                Select a mood above to start tracking!
              </div>
            )}
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0,245,160,0.05), rgba(0,212,255,0.05))' }}>
            <h3 style={{ marginBottom: 14 }}>Daily Inspiration ✨</h3>
            <div style={{ fontSize: 18, fontStyle: 'italic', lineHeight: 1.6, color: 'var(--text)' }}>
              "The pain you feel today is the strength you'll feel tomorrow."
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)' }}>— FitAI Daily Quote</div>
          </div>
        </div>
      </div>
    </div>
  );
}
