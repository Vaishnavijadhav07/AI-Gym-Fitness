"""
Seed script to populate MongoDB with sample data for development/testing.
Run: python seed.py
"""
from pymongo import MongoClient
from datetime import datetime, timedelta
import bcrypt
import random

client = MongoClient("mongodb://localhost:27017/")
db = client["ai_gym_db"]

# Clear existing data
print("🗑️  Clearing existing data...")
for col in ["users", "workouts", "meals", "habits", "performance"]:
    db[col].drop()

# Create demo user
print("👤 Creating demo user...")
hashed = bcrypt.hashpw("demo123".encode(), bcrypt.gensalt())
user = {
    "name": "Alex Johnson",
    "email": "demo@fitai.com",
    "password": hashed,
    "age": 28,
    "weight": 75,
    "height": 175,
    "goal": "muscle_gain",
    "dietary_pref": "none",
    "bmi": round(75 / (1.75 ** 2), 1),
    "created_at": datetime.utcnow()
}
user_id = str(db.users.insert_one(user).inserted_id)
print(f"   ✅ User created: demo@fitai.com / demo123 (ID: {user_id})")

# Seed workouts (last 14 days)
print("💪 Seeding workouts...")
exercises = ["Push-ups", "Squats", "Deadlifts", "Pull-ups", "Burpees", "Lunges", "Plank"]
for i in range(14):
    if random.random() > 0.25:  # ~75% completion rate
        ex = random.choice(exercises)
        db.workouts.insert_one({
            "user_id": user_id,
            "exercise": ex,
            "sets": random.randint(3, 5),
            "reps": random.randint(8, 20),
            "calories_burned": random.randint(40, 120),
            "form_score": round(random.uniform(65, 98), 1),
            "notes": random.choice(["Felt strong today!", "Tough session", "Good form", ""]),
            "date": datetime.utcnow() - timedelta(days=i)
        })

# Seed meals (last 7 days)
print("🥗 Seeding meals...")
meal_options = [
    {"meal_type": "breakfast", "foods": ["Oats", "Banana", "Milk"], "calories": 380, "protein": 15, "carbs": 65, "fat": 8},
    {"meal_type": "lunch", "foods": ["Chicken", "Brown rice", "Salad"], "calories": 550, "protein": 45, "carbs": 50, "fat": 12},
    {"meal_type": "snack", "foods": ["Almonds", "Apple"], "calories": 180, "protein": 5, "carbs": 22, "fat": 10},
    {"meal_type": "dinner", "foods": ["Dal", "Roti", "Vegetables"], "calories": 450, "protein": 20, "carbs": 60, "fat": 9},
]
for i in range(7):
    for meal in random.sample(meal_options, random.randint(2, 4)):
        db.meals.insert_one({
            "user_id": user_id,
            **meal,
            "date": datetime.utcnow() - timedelta(days=i)
        })

# Seed habits (last 14 days)
print("📊 Seeding habits...")
moods = ["Great", "Good", "Okay", "Tired"]
for i in range(14):
    db.habits.insert_one({
        "user_id": user_id,
        "type": "workout",
        "completed": random.random() > 0.25,
        "mood": random.choice(moods),
        "energy_level": random.randint(5, 10),
        "notes": "",
        "date": datetime.utcnow() - timedelta(days=i)
    })

# Seed performance records (last 7 days)
print("🏆 Seeding performance records...")
for i in range(7):
    form = random.randint(60, 95)
    consistency = random.randint(55, 90)
    intensity = random.randint(60, 88)
    overall = round(form * 0.4 + consistency * 0.35 + intensity * 0.25, 1)
    badges = []
    if overall >= 90: badges.append("🏆 Elite Performer")
    if overall >= 75: badges.append("⭐ High Achiever")
    if overall >= 60: badges.append("💪 Consistent Warrior")
    db.performance.insert_one({
        "user_id": user_id,
        "form_score": form,
        "consistency_score": consistency,
        "intensity_score": intensity,
        "overall_score": overall,
        "badges": badges,
        "date": datetime.utcnow() - timedelta(days=i)
    })

print("\n✅ Database seeded successfully!")
print("=" * 40)
print(f"📧 Demo Login: demo@fitai.com")
print(f"🔑 Password:   demo123")
print("=" * 40)
client.close()
