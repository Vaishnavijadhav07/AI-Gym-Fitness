# 🏋️ FitAI — AI Gym & Fitness Assistant

A full-stack AI-powered fitness ecosystem based on the Trivion/UNLOX project document.

---

## 🗂️ Project Structure

```
ai-gym-fitness/
├── backend/          # Python Flask API
│   ├── app.py        # Main Flask application
│   ├── app_db.py     # MongoDB singleton
│   ├── seed.py       # Database seeder
│   ├── requirements.txt
│   ├── .env.example
│   └── routes/
│       ├── users.py
│       ├── workouts.py
│       ├── diet.py
│       ├── habits.py
│       └── performance.py
└── frontend/         # React.js application
    ├── public/
    └── src/
        ├── App.js
        ├── AuthContext.js
        ├── api.js
        ├── components/
        │   └── Sidebar.js
        ├── pages/
        │   ├── AuthPage.js
        │   ├── Dashboard.js
        │   ├── Workouts.js
        │   ├── Diet.js
        │   ├── Habits.js
        │   ├── Performance.js
        │   ├── AiBuddy.js
        │   ├── GymFinder.js
        │   └── Profile.js
        └── styles/
            └── global.css
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.9+
- **MongoDB** (local or Atlas)

---

## 🚀 Setup & Run

### 1. Start MongoDB

Make sure MongoDB is running locally:
```bash
mongod --dbpath /data/db
```
Or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier).

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env → set your MONGO_URI

# (Optional) Seed demo data
python seed.py

# Start the Flask server
python app.py
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React dev server
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Demo Account (after seeding)

| Field    | Value             |
|----------|-------------------|
| Email    | demo@fitai.com    |
| Password | demo123           |

---

## 🧩 Core AI Modules

| Module | Description |
|---|---|
| 🏋️ AI Gym Trainer | Personalized workout plans + form scoring |
| 🥗 AI Dietician | NLP diet recommendations, calorie tracking |
| 📊 Habit Tracker | Behavioral AI, skip prediction, streak tracking |
| 🏆 Performance Analyzer | Pose-to-Performance Score with radar charts |
| 🤖 Virtual Gym Buddy | Sentiment analysis AI chat companion |
| 🏟️ Gym Finder | AI gym & program recommendations |

---

## 📡 API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/:id` | Update profile |

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts/plan/:goal` | Get workout plan |
| POST | `/api/workouts/log` | Log a workout |
| GET | `/api/workouts/history/:id` | Workout history |
| GET | `/api/workouts/stats/:id` | Workout statistics |
| POST | `/api/workouts/analyze-form` | AI form analysis |

### Diet
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diet/plan` | Get diet plan |
| POST | `/api/diet/log` | Log a meal |
| GET | `/api/diet/history/:id` | Meal history |
| POST | `/api/diet/chat` | AI dietician chat |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/habits/log` | Log a habit |
| GET | `/api/habits/streak/:id` | Get streak |
| GET | `/api/habits/nudge/:id` | Get AI nudge |
| GET | `/api/habits/predict/:id` | Skip risk prediction |

### Performance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/performance/score` | Record scores |
| GET | `/api/performance/history/:id` | Score history |
| GET | `/api/performance/weekly-report/:id` | Weekly report |
| POST | `/api/performance/gym-recommendations` | Gym + program suggestions |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router, Recharts |
| Backend | Python Flask, Flask-PyMongo |
| Database | MongoDB |
| Auth | bcrypt password hashing |
| Styling | Custom CSS with CSS Variables |

---

## 📦 Build for Production

```bash
# Frontend
cd frontend && npm run build

# Serve with Flask (optional)
# Copy build/ into backend/static/ and configure Flask to serve it
```

---

## 🤝 Credits

Project based on the AI Gym & Fitness Assistant spec by **Trivion / UNLOX Academy**.
