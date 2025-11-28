from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import random
from datetime import datetime, timedelta, timezone
import requests

app = Flask(__name__)
CORS(app)

# --- Load Model & Encoders ---
try:
    model = pickle.load(open('final_model.pkl', 'rb'))
    le_district = pickle.load(open('le_district_crop.pkl', 'rb'))
    le_soil = pickle.load(open('le_soil_crop.pkl', 'rb'))
    le_crop = pickle.load(open('le_crop_target.pkl', 'rb'))
except FileNotFoundError:
    print("Error: Models missing. Run train_pro.py first.")
    exit()

# --- PRO KNOWLEDGE BASE (High Accuracy) ---
# Specific characteristics for Maharashtra districts
DISTRICT_PROFILES = {
    "Kolhapur": { 
        "soil": "Red",   
        "avg_temp": 27.5, "avg_rain": 2000, "lat": 16.7050, "lon": 74.2433,
        "N": 90, "P": 40, "K": 50, "pH": 6.5 # Acidic soil, heavy rain
    },
    "Pune": { 
        "soil": "Black", 
        "avg_temp": 26.0, "avg_rain": 1100, "lat": 18.5204, "lon": 73.8567,
        "N": 120, "P": 55, "K": 80, "pH": 7.2 # Good for Sugarcane/Cotton
    },
    "Sangli": { 
        "soil": "Black", 
        "avg_temp": 29.0, "avg_rain": 600,  "lat": 16.8524, "lon": 74.5815,
        "N": 100, "P": 80, "K": 140, "pH": 7.4 # High K (Good for Grapes)
    },
    "Satara": { 
        "soil": "Black", 
        "avg_temp": 26.5, "avg_rain": 900,  "lat": 17.6800, "lon": 73.9900,
        "N": 110, "P": 60, "K": 90, "pH": 7.0 
    },
    "Solapur": { 
        "soil": "Black", 
        "avg_temp": 32.0, "avg_rain": 500,  "lat": 17.6599, "lon": 75.9004,
        "N": 80, "P": 40, "K": 100, "pH": 7.5 # Dry, good for Pomegranate/Jowar
    }
}

def fetch_weather_safe(lat, lon, fallback_temp, fallback_rain):
    """Fetches live weather but fails gracefully to averages."""
    try:
        # Short timeout (2s) to keep UI snappy
        resp = requests.get(f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m", timeout=2)
        resp.raise_for_status()
        temp = resp.json()['current']['temperature_2m']
        
        # Historical rain (Past year)
        today = datetime.now(timezone.utc)
        start = (today - timedelta(days=365)).strftime('%Y-%m-%d')
        end = today.strftime('%Y-%m-%d')
        resp_hist = requests.get(f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={start}&end_date={end}&daily=rain_sum", timeout=3)
        rain = sum(filter(None, resp_hist.json()['daily']['rain_sum']))
        
        return temp, rain
    except:
        return fallback_temp, fallback_rain

@app.route('/get_form_options', methods=['GET'])
def get_form_options():
    return jsonify({
        'districts': list(DISTRICT_PROFILES.keys()),
        'soils': list(le_soil.classes_)
    })

@app.route('/get_environmental_data', methods=['POST'])
def get_environmental_data():
    data = request.get_json()
    district = data.get('district')
    
    # 1. Smart Profile Lookup
    profile = DISTRICT_PROFILES.get(district)
    if not profile:
        return jsonify({"error": "District not found"}), 404
    
    # 2. Weather (Live or Fallback)
    if profile['lat'] != 0:
        temp, rain = fetch_weather_safe(profile['lat'], profile['lon'], profile['avg_temp'], profile['avg_rain'])
    else:
        temp, rain = profile['avg_temp'], profile['avg_rain']
        
    # 3. Precise Nutrients (From Profile, not generic defaults)
    # This ensures "Sangli" gets High K for Grapes, etc.
    return jsonify({
        "soil_color": profile['soil'],
        "temperature": round(temp, 1),
        "rainfall": round(rain, 1),
        "N": profile['N'], 
        "P": profile['P'], 
        "K": profile['K'], 
        "pH": profile['pH']
    })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    try:
        # Encode Inputs
        d_val = le_district.transform([data['district']])[0]
        
        # Handle soil gracefully
        s_input = data['soil_color']
        if s_input not in le_soil.classes_:
            # Fallback if UI sends something weird
            s_input = "Black" 
        s_val = le_soil.transform([s_input])[0]
        
        features = np.array([[
            float(data['N']), float(data['P']), float(data['K']), float(data['pH']),
            float(data['rainfall']), float(data['temperature']), d_val, s_val
        ]])
        
        # Get Probabilities (Top 5)
        probs = model.predict_proba(features)[0]
        results = [
            {"crop": name, "probability": round(prob * 100, 2)}
            for name, prob in zip(le_crop.classes_, probs)
        ]
        top_5 = sorted(results, key=lambda x: x['probability'], reverse=True)[:5]
        
        return jsonify({'recommendations': top_5})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)