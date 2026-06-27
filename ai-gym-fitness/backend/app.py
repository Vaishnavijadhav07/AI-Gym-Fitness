from flask import Flask, jsonify, request
from flask_cors import CORS
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv
from app_db import mongo

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/ai_gym_db")
mongo.init_app(app)

from routes.users import users_bp
from routes.workouts import workouts_bp
from routes.diet import diet_bp
from routes.habits import habits_bp
from routes.performance import performance_bp

app.register_blueprint(users_bp, url_prefix="/api/users")
app.register_blueprint(workouts_bp, url_prefix="/api/workouts")
app.register_blueprint(diet_bp, url_prefix="/api/diet")
app.register_blueprint(habits_bp, url_prefix="/api/habits")
app.register_blueprint(performance_bp, url_prefix="/api/performance")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "AI Gym & Fitness API is running"})

@app.route("/api/dashboard/<user_id>", methods=["GET"])
def dashboard(user_id):
    def to_dict(doc):
        if doc is None:
            return None
        r = {}
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                r[k] = str(v)
            elif isinstance(v, datetime):
                r[k] = v.isoformat()
            else:
                r[k] = v
        return r

    try:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return jsonify({"error": "Invalid user id"}), 400

    if not user:
        return jsonify({"error": "User not found"}), 404

    user.pop("password", None)
    workouts_count = mongo.db.workouts.count_documents({"user_id": user_id})
    recent_workouts = list(mongo.db.workouts.find({"user_id": user_id}).sort("date", -1).limit(5))
    habits = list(mongo.db.habits.find({"user_id": user_id}).sort("date", -1).limit(7))
    performance = list(mongo.db.performance.find({"user_id": user_id}).sort("date", -1).limit(1))

    return jsonify({
        "user": to_dict(user),
        "stats": {"total_workouts": workouts_count, "streak": len(habits)},
        "recent_workouts": [to_dict(w) for w in recent_workouts],
        "latest_performance": to_dict(performance[0]) if performance else None,
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
