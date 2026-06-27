from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime
from app_db import mongo

workouts_bp = Blueprint("workouts", __name__)

WORKOUT_PLANS = {
    "weight_loss": [
        {"exercise": "Jumping Jacks", "sets": 3, "reps": 30, "calories": 50},
        {"exercise": "Burpees", "sets": 3, "reps": 15, "calories": 80},
        {"exercise": "Mountain Climbers", "sets": 3, "reps": 20, "calories": 60},
        {"exercise": "High Knees", "sets": 3, "reps": 40, "calories": 55},
    ],
    "muscle_gain": [
        {"exercise": "Push-ups", "sets": 4, "reps": 15, "calories": 40},
        {"exercise": "Pull-ups", "sets": 4, "reps": 10, "calories": 50},
        {"exercise": "Squats", "sets": 4, "reps": 20, "calories": 60},
        {"exercise": "Deadlifts", "sets": 3, "reps": 12, "calories": 70},
    ],
    "general_fitness": [
        {"exercise": "Plank", "sets": 3, "reps": 1, "duration": "60s", "calories": 20},
        {"exercise": "Lunges", "sets": 3, "reps": 15, "calories": 45},
        {"exercise": "Bicycle Crunches", "sets": 3, "reps": 20, "calories": 35},
        {"exercise": "Jogging in Place", "sets": 1, "reps": 1, "duration": "10min", "calories": 100},
    ],
    "flexibility": [
        {"exercise": "Sun Salutation", "sets": 3, "reps": 5, "calories": 30},
        {"exercise": "Hip Flexor Stretch", "sets": 2, "reps": 1, "duration": "30s each", "calories": 10},
        {"exercise": "Hamstring Stretch", "sets": 2, "reps": 1, "duration": "30s each", "calories": 10},
    ]
}

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

@workouts_bp.route("/plan/<goal>", methods=["GET"])
def get_plan(goal):
    plan = WORKOUT_PLANS.get(goal, WORKOUT_PLANS["general_fitness"])
    return jsonify({"goal": goal, "plan": plan})

@workouts_bp.route("/log", methods=["POST"])
def log_workout():
    data = request.json
    workout = {
        "user_id": data["user_id"],
        "exercise": data["exercise"],
        "sets": data.get("sets"),
        "reps": data.get("reps"),
        "duration": data.get("duration"),
        "calories_burned": data.get("calories_burned", 0),
        "form_score": data.get("form_score", 0),
        "notes": data.get("notes", ""),
        "date": datetime.utcnow()
    }
    result = mongo.db.workouts.insert_one(workout)
    workout["_id"] = str(result.inserted_id)
    workout["date"] = workout["date"].isoformat()
    return jsonify({"message": "Workout logged", "workout": workout}), 201

@workouts_bp.route("/history/<user_id>", methods=["GET"])
def get_history(user_id):
    workouts = list(mongo.db.workouts.find({"user_id": user_id}).sort("date", -1).limit(20))
    return jsonify({"workouts": [doc_to_dict(w) for w in workouts]})

@workouts_bp.route("/stats/<user_id>", methods=["GET"])
def get_stats(user_id):
    all_w = list(mongo.db.workouts.find({"user_id": user_id}))
    total_calories = sum(w.get("calories_burned", 0) for w in all_w)
    avg_score = sum(w.get("form_score", 0) for w in all_w) / len(all_w) if all_w else 0
    return jsonify({
        "total_sessions": len(all_w),
        "total_calories_burned": total_calories,
        "average_form_score": round(avg_score, 1),
        "exercises": list({w["exercise"] for w in all_w})
    })

@workouts_bp.route("/analyze-form", methods=["POST"])
def analyze_form():
    data = request.json
    exercise = data.get("exercise", "")
    reps = data.get("reps", 0)
    score = min(100, max(50, 70 + reps * 0.5))
    tips = {
        "Push-ups": ["Keep back straight", "Lower chest to ground", "Full arm extension"],
        "Squats": ["Knees over toes", "Back straight", "Go below parallel"],
        "Deadlifts": ["Keep bar close to body", "Drive hips forward", "Neutral spine"],
        "Burpees": ["Land softly", "Full hip extension at top", "Jump feet back together"],
    }
    return jsonify({
        "exercise": exercise,
        "form_score": round(score, 1),
        "feedback": tips.get(exercise, ["Maintain proper form", "Breathe consistently", "Control the movement"]),
        "reps_detected": reps
    })
