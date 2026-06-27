from flask import Blueprint, jsonify, request
from flask_pymongo import PyMongo
from bson import ObjectId
from datetime import datetime
import bcrypt
from app_db import mongo

users_bp = Blueprint("users", __name__)

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

@users_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    if not data or not all(k in data for k in ["name", "email", "password"]):
        return jsonify({"error": "Missing fields"}), 400

    existing = mongo.db.users.find_one({"email": data["email"]})
    if existing:
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt())
    user = {
        "name": data["name"],
        "email": data["email"],
        "password": hashed,
        "age": data.get("age"),
        "weight": data.get("weight"),
        "height": data.get("height"),
        "goal": data.get("goal", "general_fitness"),
        "dietary_pref": data.get("dietary_pref", "none"),
        "created_at": datetime.utcnow(),
        "bmi": round(data.get("weight", 70) / ((data.get("height", 170) / 100) ** 2), 1) if data.get("weight") and data.get("height") else None
    }
    result = mongo.db.users.insert_one(user)
    user["_id"] = str(result.inserted_id)
    user.pop("password")
    user["created_at"] = user["created_at"].isoformat()
    return jsonify({"message": "User registered", "user": user}), 201

@users_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = mongo.db.users.find_one({"email": data["email"]})
    if not user or not bcrypt.checkpw(data["password"].encode(), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    user.pop("password")
    return jsonify({"message": "Login successful", "user": doc_to_dict(user)})

@users_bp.route("/<user_id>", methods=["GET"])
def get_user(user_id):
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "Not found"}), 404
    user.pop("password", None)
    return jsonify(doc_to_dict(user))

@users_bp.route("/<user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.json
    data.pop("password", None)
    data.pop("_id", None)
    if "weight" in data and "height" in data:
        data["bmi"] = round(data["weight"] / ((data["height"] / 100) ** 2), 1)
    mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": data})
    return jsonify({"message": "Updated"})
