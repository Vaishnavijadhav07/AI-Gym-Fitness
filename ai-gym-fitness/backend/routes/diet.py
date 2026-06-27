from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime
from app_db import mongo

diet_bp = Blueprint("diet", __name__)

DIET_PLANS = {
    "weight_loss": {
        "calories_target": 1500,
        "meals": [
            {"meal": "Breakfast", "foods": ["Oats with banana", "Green tea", "Boiled eggs (2)"], "calories": 350},
            {"meal": "Lunch", "foods": ["Grilled chicken breast", "Brown rice", "Salad"], "calories": 500},
            {"meal": "Snack", "foods": ["Apple", "Almonds (10)"], "calories": 150},
            {"meal": "Dinner", "foods": ["Dal", "Steamed vegetables", "1 roti"], "calories": 400},
        ],
        "grocery_list": ["Oats", "Bananas", "Eggs", "Chicken", "Brown rice", "Apples", "Almonds", "Dal", "Mixed vegetables"]
    },
    "muscle_gain": {
        "calories_target": 2800,
        "meals": [
            {"meal": "Breakfast", "foods": ["Protein shake", "4 eggs scrambled", "Whole wheat toast"], "calories": 650},
            {"meal": "Lunch", "foods": ["Grilled salmon", "Quinoa", "Broccoli"], "calories": 750},
            {"meal": "Pre-workout", "foods": ["Banana", "Peanut butter"], "calories": 300},
            {"meal": "Post-workout", "foods": ["Whey protein shake", "Milk"], "calories": 350},
            {"meal": "Dinner", "foods": ["Paneer", "Sweet potato", "Mixed veggies"], "calories": 600},
        ],
        "grocery_list": ["Whey protein", "Eggs", "Salmon", "Quinoa", "Bananas", "Peanut butter", "Paneer", "Sweet potato"]
    },
    "general_fitness": {
        "calories_target": 2000,
        "meals": [
            {"meal": "Breakfast", "foods": ["Upma", "Fruit bowl", "Low-fat milk"], "calories": 400},
            {"meal": "Lunch", "foods": ["Dal rice", "Curd", "Salad"], "calories": 600},
            {"meal": "Snack", "foods": ["Sprouts", "Coconut water"], "calories": 200},
            {"meal": "Dinner", "foods": ["Roti (2)", "Sabzi", "Dal"], "calories": 500},
        ],
        "grocery_list": ["Lentils", "Rice", "Wheat flour", "Seasonal vegetables", "Curd", "Fruits"]
    },
    "vegetarian": {
        "calories_target": 1800,
        "meals": [
            {"meal": "Breakfast", "foods": ["Idli (3) with sambar", "Green chutney"], "calories": 350},
            {"meal": "Lunch", "foods": ["Rajma", "Brown rice", "Raita"], "calories": 550},
            {"meal": "Snack", "foods": ["Roasted chana", "Herbal tea"], "calories": 150},
            {"meal": "Dinner", "foods": ["Palak paneer", "Roti (2)", "Salad"], "calories": 550},
        ],
        "grocery_list": ["Idli batter", "Sambar ingredients", "Rajma", "Paneer", "Spinach", "Chana"]
    },
    "flexibility": {
        "calories_target": 1700,
        "meals": [
            {"meal": "Breakfast", "foods": ["Smoothie bowl", "Chia seeds", "Berries"], "calories": 320},
            {"meal": "Lunch", "foods": ["Quinoa salad", "Chickpeas", "Olive oil dressing"], "calories": 480},
            {"meal": "Snack", "foods": ["Greek yogurt", "Honey", "Walnuts"], "calories": 200},
            {"meal": "Dinner", "foods": ["Stir-fried tofu", "Brown rice", "Steamed broccoli"], "calories": 450},
        ],
        "grocery_list": ["Quinoa", "Chickpeas", "Tofu", "Greek yogurt", "Berries", "Chia seeds", "Walnuts"]
    }
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


@diet_bp.route("/plan", methods=["POST"])
def get_diet_plan():
    data = request.json or {}
    goal = data.get("goal", "general_fitness")
    dietary_pref = data.get("dietary_pref", "")
    bmi = data.get("bmi")

    plan_key = goal
    if dietary_pref == "vegetarian":
        plan_key = "vegetarian"

    plan = DIET_PLANS.get(plan_key, DIET_PLANS["general_fitness"])

    bmi_advice = ""
    if bmi:
        bmi_val = float(bmi)
        if bmi_val < 18.5:
            bmi_advice = "Your BMI indicates you are underweight. Focus on calorie-dense nutritious foods."
        elif bmi_val < 25:
            bmi_advice = "Your BMI is in the healthy range. Maintain balanced nutrition."
        elif bmi_val < 30:
            bmi_advice = "Your BMI indicates overweight. Focus on portion control and low-calorie nutrient-dense foods."
        else:
            bmi_advice = "Your BMI indicates obesity. Consult a nutritionist for a personalized plan."

    return jsonify({**plan, "bmi_advice": bmi_advice, "goal": goal})


@diet_bp.route("/log", methods=["POST"])
def log_meal():
    data = request.json
    meal = {
        "user_id": data["user_id"],
        "meal_type": data.get("meal_type", "snack"),
        "foods": data.get("foods", []),
        "calories": data.get("calories", 0),
        "protein": data.get("protein", 0),
        "carbs": data.get("carbs", 0),
        "fat": data.get("fat", 0),
        "date": datetime.utcnow()
    }
    result = mongo.db.meals.insert_one(meal)
    meal["_id"] = str(result.inserted_id)
    meal["date"] = meal["date"].isoformat()
    return jsonify({"message": "Meal logged", "meal": meal}), 201


@diet_bp.route("/history/<user_id>", methods=["GET"])
def get_diet_history(user_id):
    meals = list(mongo.db.meals.find({"user_id": user_id}).sort("date", -1).limit(20))
    total_calories = sum(m.get("calories", 0) for m in meals)
    return jsonify({"meals": [doc_to_dict(m) for m in meals], "total_calories_today": total_calories})


@diet_bp.route("/chat", methods=["POST"])
def diet_chat():
    data = request.json or {}
    message = data.get("message", "").lower()

    responses = {
        "protein": "Great sources of protein: eggs, paneer, lentils, chicken, tofu, Greek yogurt. Aim for 0.8-1.2g per kg of body weight.",
        "weight loss": "For weight loss: reduce refined carbs, increase protein, eat more veggies, stay hydrated, and maintain a 300-500 calorie deficit.",
        "bmi": "BMI = weight(kg) / height(m)^2. Healthy BMI is 18.5-24.9. Below 18.5 is underweight; above 25 is overweight.",
        "calorie": "Track calories using our meal logger. For weight loss, aim for a 500 kcal daily deficit. For muscle gain, add 200-300 kcal surplus.",
        "vegetarian": "Vegetarian protein sources: paneer, lentils, chickpeas, tofu, quinoa, milk products, and Greek yogurt.",
        "water": "Aim for 8-10 glasses (2-3 litres) of water daily. Increase intake during workouts and hot weather.",
        "carbs": "Complex carbs like brown rice, oats, sweet potato, and whole wheat provide sustained energy. Limit processed sugars.",
        "fat": "Healthy fats from nuts, seeds, avocado, olive oil, and fatty fish support hormones. Keep fat at 25-35% of calories.",
        "breakfast": "Never skip breakfast! Good options: oats, eggs, idli-sambar, smoothie bowl, or whole wheat toast with peanut butter.",
        "supplement": "Common supplements: Whey protein for muscle gain, Vitamin D and B12 for vegetarians, Omega-3 for joints. Consult a doctor first.",
    }

    reply = "I'm your AI Dietician! Ask me about nutrition, meal plans, protein, calories, BMI, or specific foods. I'm here to help!"
    for key, val in responses.items():
        if key in message:
            reply = val
            break

    return jsonify({"reply": reply})
