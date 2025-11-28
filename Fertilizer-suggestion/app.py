from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS 
import requests
from datetime import datetime, timedelta, timezone
import random

app = Flask(__name__)
CORS(app)

# --- Load Model and Encoders ---
try:
    model = pickle.load(open('model.pkl', 'rb'))
    le_district = pickle.load(open('le_district.pkl', 'rb'))
    le_soil = pickle.load(open('le_soil.pkl', 'rb'))
    le_crop = pickle.load(open('le_crop.pkl', 'rb'))
    le_fertilizer = pickle.load(open('le_fertilizer.pkl', 'rb'))
    print("✅ Models loaded successfully")
except FileNotFoundError:
    print("❌ Error: One or more .pkl files are missing. Please run train.py first.")
    exit()

# --- SMART KNOWLEDGE BASE ---
# Maps District Names -> Geographic & Soil Data
DISTRICT_PROFILES = {
    "Kolhapur": { "soil": "Red",   "avg_temp": 27.0, "avg_rain": 2500, "lat": 16.7050, "lon": 74.2433 },
    "Pune":     { "soil": "Black", "avg_temp": 26.0, "avg_rain": 1200, "lat": 18.5204, "lon": 73.8567 },
    "Sangli":   { "soil": "Black", "avg_temp": 28.5, "avg_rain": 600,  "lat": 16.8524, "lon": 74.5815 },
    "Satara":   { "soil": "Black", "avg_temp": 26.5, "avg_rain": 900,  "lat": 17.6800, "lon": 73.9900 },
    "Solapur":  { "soil": "Black", "avg_temp": 30.0, "avg_rain": 500,  "lat": 17.6599, "lon": 75.9004 }
}

# Default NPK values if lab data isn't provided
SOIL_NUTRIENTS = {
    "Black":  {"N": 100, "P": 60, "K": 120, "pH": 7.2}, 
    "Red":    {"N": 80,  "P": 40, "K": 80,  "pH": 6.5},
    "Clayey": {"N": 90,  "P": 50, "K": 100, "pH": 7.0},
    "Default":{"N": 80,  "P": 50, "K": 90,  "pH": 6.8}
}

# --- Utility: Safe Weather Fetch ---
def fetch_weather_safe(lat, lon, fallback_temp, fallback_rain):
    try:
        # 1. Current Temp
        curr_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m"
        resp_curr = requests.get(curr_url, timeout=2) 
        resp_curr.raise_for_status()
        temp = resp_curr.json()['current']['temperature_2m']
        
        # 2. Historical Rain
        today = datetime.now(timezone.utc)
        start_date = (today - timedelta(days=365)).strftime('%Y-%m-%d')
        end_date = today.strftime('%Y-%m-%d')
        hist_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={start_date}&end_date={end_date}&daily=rain_sum"
        
        resp_hist = requests.get(hist_url, timeout=3)
        resp_hist.raise_for_status()
        rain = sum(filter(None, resp_hist.json()['daily']['rain_sum']))
        
        return temp, rain
    except Exception as e:
        print(f"⚠️ Weather API unavailable: {e}. Using averages.")
        return fallback_temp, fallback_rain

# --- ROUTES ---

@app.route('/get_form_options', methods=['GET'])
def get_form_options():
    try:
        # Return districts from our Knowledge Base so the UI matches the Backend
        return jsonify({
            'districts': list(DISTRICT_PROFILES.keys()), 
            'crops': list(le_crop.classes_)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_environmental_data', methods=['POST'])
def get_environmental_data():
    """
    FIXED: Now accepts 'district' name instead of 'lat/lon'.
    """
    try:
        data = request.get_json()
        district_name = data.get('district') # This is what React sends now

        # 1. Look up the district in our database
        # If not found, default to Pune's data
        profile = DISTRICT_PROFILES.get(district_name, DISTRICT_PROFILES["Pune"])
        
        # 2. Get Soil Type
        soil_color = profile['soil']
        
        # 3. Get Weather (Try Live API first, fallback to Profile Average)
        temp, rain = fetch_weather_safe(
            profile['lat'], 
            profile['lon'], 
            profile['avg_temp'], 
            profile['avg_rain']
        )

        # 4. Get NPK Defaults
        nutrients = SOIL_NUTRIENTS.get(soil_color, SOIL_NUTRIENTS["Default"])

        return jsonify({
            "soil_color": soil_color,
            "temperature": round(temp, 1),
            "rainfall": round(rain, 1),
            "N": nutrients['N'],
            "P": nutrients['P'],
            "K": nutrients['K'],
            "pH": nutrients['pH']
        })

    except Exception as e:
        print(f"--- API ERROR ---: {e}")
        # Fallback values to prevent crash
        return jsonify({
            "soil_color": "Black", "temperature": 25.0, "rainfall": 1000,
            "N": 80, "P": 50, "K": 90, "pH": 7.0
        })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    try:
        d_val = le_district.transform([data['district']])[0]
        
        # Handle case where soil color might not match model training
        s_color = data.get('soil_color', 'Black')
        if s_color not in le_soil.classes_: s_color = 'Black'
        s_val = le_soil.transform([s_color])[0]
        
        c_val = le_crop.transform([data['crop']])[0]
        
        input_data = np.array([[
            float(data['nitrogen']), float(data['phosphorus']), float(data['potassium']),
            float(data['ph']), float(data['rainfall']), float(data['temperature']),
            d_val, s_val, c_val
        ]])
        
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(input_data)[0]
            results = [
                {"fertilizer": name, "probability": round(prob * 100, 2)}
                for name, prob in zip(le_fertilizer.classes_, probs)
            ]
            top_results = sorted(results, key=lambda x: x['probability'], reverse=True)[:5]
            return jsonify({'recommendations': top_results})
        else:
            pred = le_fertilizer.inverse_transform(model.predict(input_data))[0]
            return jsonify({'recommendations': [{"fertilizer": pred, "probability": 100.0}]})

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=5002)