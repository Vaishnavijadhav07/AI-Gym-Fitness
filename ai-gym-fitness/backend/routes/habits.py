from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime, timedelta
from app_db import mongo

habits_bp = Blueprint("habits", __name__)

def doc_to_dict(doc):
    if doc is None:
        return None
    result = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, datetime):
            result[k] = v.isoformat()
        else:
            result[k] = v
    return result

@habits_bp.route("/log", methods=["POST"])
def log_habit():
    data = request.json
    habit = {
        "user_id": data["user_id"],
        "type": data.get("type", "workout"),
        "completed": data.get("completed", True),
        "mood": data.get("mood", "neutral"),
        "energy_level": data.get("energy_level", 5),
        "notes": data.get("notes", ""),
        "date": datetime.utcnow()
    }
    result = mongo.db.habits.insert_one(habit)
    habit["_id"] = str(result.inserted_id)
    habit["date"] = habit["date"].isoformat()
    return jsonify({"message": "Habit logged", "habit": habit}), 201

@habits_bp.route("/streak/<user_id>", methods=["GET"])
def get_streak(user_id):
    habits = list(mongo.db.habits.find({"user_id": user_id, "completed": True}).sort("date", -1))
    streak = 0
    today = datetime.utcnow().date()
    for i, h in enumerate(habits):
        habit_date = h["date"].date() if isinstance(h["date"], datetime) else datetime.fromisoformat(str(h["date"])).date()
        if habit_date == today - timedelta(days=i):
            streak += 1
        else:
            break
    return jsonify({"streak": streak, "total_logged": len(habits)})

@habits_bp.route("/nudge/<user_id>", methods=["GET"])
def get_nudge(user_id):
    recent = list(mongo.db.habits.find({"user_id": user_id}).sort("date", -1).limit(3))
    nudges = [
        "💪 You're on fire! Keep the momentum going!",
        "🌟 Great consistency! Your body is thanking you!",
        "🎯 Stay focused — every rep counts!",
        "🔥 You skipped yesterday. Today is your comeback day!",
        "⚡ Short on time? Even a 15-min workout counts!",
        "🏆 You're building habits that last a lifetime!",
    ]
    if not recent:
        nudge = nudges[3]
    elif len(recent) >= 3 and all(r.get("completed") for r in recent):
        nudge = nudges[1]
    else:
        import random
        nudge = random.choice(nudges)
    return jsonify({"nudge": nudge, "recent_activity": len(recent)})

@habits_bp.route("/history/<user_id>", methods=["GET"])
def get_history(user_id):
    habits = list(mongo.db.habits.find({"user_id": user_id}).sort("date", -1).limit(30))
    return jsonify({"habits": [doc_to_dict(h) for h in habits]})

@habits_bp.route("/predict/<user_id>", methods=["GET"])
def predict_skip(user_id):
    habits = list(mongo.db.habits.find({"user_id": user_id}).sort("date", -1).limit(14))
    skipped = sum(1 for h in habits if not h.get("completed", True))
    skip_rate = skipped / max(len(habits), 1)
    risk = "high" if skip_rate > 0.5 else "medium" if skip_rate > 0.3 else "low"
    return jsonify({
        "skip_risk": risk,
        "skip_rate": round(skip_rate * 100, 1),
        "recommendation": "Schedule workouts in the morning to reduce skips." if risk == "high" else "Keep it up — you're consistent!"
    })
