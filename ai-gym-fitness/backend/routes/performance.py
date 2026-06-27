from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime
from app_db import mongo

performance_bp = Blueprint("performance", __name__)

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

@performance_bp.route("/score", methods=["POST"])
def record_score():
    data = request.json
    form_score = data.get("form_score", 0)
    consistency_score = data.get("consistency_score", 0)
    intensity_score = data.get("intensity_score", 0)
    overall = round((form_score * 0.4 + consistency_score * 0.35 + intensity_score * 0.25), 1)

    record = {
        "user_id": data["user_id"],
        "form_score": form_score,
        "consistency_score": consistency_score,
        "intensity_score": intensity_score,
        "overall_score": overall,
        "badges": _compute_badges(overall),
        "date": datetime.utcnow()
    }
    result = mongo.db.performance.insert_one(record)
    record["_id"] = str(result.inserted_id)
    record["date"] = record["date"].isoformat()
    return jsonify({"message": "Performance recorded", "record": record}), 201

def _compute_badges(score):
    badges = []
    if score >= 90:
        badges.append("🏆 Elite Performer")
    if score >= 75:
        badges.append("⭐ High Achiever")
    if score >= 60:
        badges.append("💪 Consistent Warrior")
    if score >= 40:
        badges.append("🔥 Getting Stronger")
    return badges

@performance_bp.route("/history/<user_id>", methods=["GET"])
def get_history(user_id):
    records = list(mongo.db.performance.find({"user_id": user_id}).sort("date", -1).limit(10))
    return jsonify({"records": [doc_to_dict(r) for r in records]})

@performance_bp.route("/weekly-report/<user_id>", methods=["GET"])
def weekly_report(user_id):
    records = list(mongo.db.performance.find({"user_id": user_id}).sort("date", -1).limit(7))
    workouts = list(mongo.db.workouts.find({"user_id": user_id}).sort("date", -1).limit(7))

    avg_score = sum(r.get("overall_score", 0) for r in records) / len(records) if records else 0
    total_calories = sum(w.get("calories_burned", 0) for w in workouts)
    total_sessions = len(workouts)

    return jsonify({
        "week_summary": {
            "sessions_completed": total_sessions,
            "avg_performance_score": round(avg_score, 1),
            "total_calories_burned": total_calories,
            "top_exercise": workouts[0]["exercise"] if workouts else "N/A",
        },
        "performance_trend": [doc_to_dict(r) for r in records],
        "recommendation": _get_recommendation(avg_score, total_sessions)
    })

def _get_recommendation(avg_score, sessions):
    if sessions < 3:
        return "Try to complete at least 3 workouts per week for better results."
    if avg_score < 60:
        return "Focus on form and technique — quality over quantity."
    if avg_score >= 80:
        return "Excellent! Consider increasing workout intensity or adding new exercises."
    return "Good progress! Keep maintaining this consistency."

@performance_bp.route("/gym-recommendations", methods=["POST"])
def gym_recommendations():
    data = request.json
    goal = data.get("goal", "general_fitness")

    gyms = [
        {"name": "PowerZone Gym", "rating": 4.5, "distance": "1.2 km", "speciality": "Strength Training"},
        {"name": "FitLife Wellness Centre", "rating": 4.3, "distance": "2.1 km", "speciality": "Cardio & Yoga"},
        {"name": "Iron Temple Gym", "rating": 4.7, "distance": "3.4 km", "speciality": "Bodybuilding"},
        {"name": "AquaFit Club", "rating": 4.2, "distance": "1.8 km", "speciality": "Swimming & CrossFit"},
    ]

    programs = {
        "weight_loss": ["HIIT Boot Camp (6 weeks)", "Cardio Blast Challenge", "Zumba Fitness Program"],
        "muscle_gain": ["Strength Foundation (8 weeks)", "Hypertrophy Pro", "Powerlifting Intro"],
        "general_fitness": ["Total Body Transformation", "Functional Fitness 30-Day", "Core & Flexibility"],
        "flexibility": ["Yoga Fundamentals", "Mobility Masterclass", "Pilates Essentials"]
    }

    return jsonify({
        "nearby_gyms": gyms,
        "recommended_programs": programs.get(goal, programs["general_fitness"]),
        "challenges": ["7-Day Plank Challenge", "30-Day Push-up Challenge", "10K Steps Daily"]
    })
