from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import requests
import numpy as np

app = Flask(__name__)
CORS(app)

# --- 1. Load Your Smart Irrigation Model ---
MODEL_PATH = 'irrigation_model_v2.pkl'
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Loaded AI Model: {MODEL_PATH}")
except FileNotFoundError:
    print("❌ Model not found. (Irrigation advice will be generic)")
    model = None

# --- 2. Route: Smart Weather Forecast (For Weather Component) ---
@app.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Coordinates required'}), 400

    try:
        # Fetch Data (Current + Daily Forecast)
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        data = res.json()

        # AI Prediction for Irrigation
        advice_text = "Data unavailable"
        advice_type = "neutral" 

        if model:
            # Prepare inputs: Max Temp, Humidity, Rain
            max_temp = data['daily']['temperature_2m_max'][0]
            humidity = data['current']['relative_humidity_2m']
            rain = data['daily']['precipitation_sum'][0]

            input_df = pd.DataFrame([[max_temp, humidity, rain]], 
                                  columns=['max_temp_c', 'humidity_percent', 'rainfall_mm'])
            
            prediction = model.predict(input_df)[0]
            
            if prediction == 1:
                advice_text = "⚠️ Soil moisture is low. Irrigation is recommended today."
                advice_type = "warning"
            else:
                advice_text = "✅ Moisture levels are good. No irrigation needed."
                advice_type = "success"

        return jsonify({
            "current": {
                "temp": round(data['current']['temperature_2m']),
                "humidity": data['current']['relative_humidity_2m'],
                "wind": data['current']['wind_speed_10m'],
                "weather_code": data['current']['weather_code'],
                "location": "Local Field Sensor"
            },
            "daily_stats": {
                "max_temp": data['daily']['temperature_2m_max'][0],
                "min_temp": data['daily']['temperature_2m_min'][0],
                "rain_mm": data['daily']['precipitation_sum'][0]
            },
            "forecast": data['daily'],
            "ai_advice": {
                "text": advice_text,
                "type": advice_type
            }
        })

    except Exception as e:
        print(f"Weather Error: {e}")
        return jsonify({'error': str(e)}), 500


# --- 3. Route: Intelligent Alert System (For Alert Component) ---
@app.route('/get_alerts', methods=['GET'])
def get_alerts():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Coordinates required'}), 400

    try:
        # Fetch Forecast specifically for Risks
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
        res = requests.get(url, timeout=10)
        data = res.json()

        alerts = []
        
        # --- RISK ANALYSIS LOGIC ---

        # 1. FLOOD & RAIN RISKS
        today_rain = data['daily']['precipitation_sum'][0]
        if today_rain > 65:
            alerts.append({
                "id": 1, "type": "critical", "title": "Flash Flood Warning",
                "desc": f"Extreme rainfall ({today_rain}mm) detected. Evacuate low-lying fields immediately."
            })
        elif today_rain > 35:
            alerts.append({
                "id": 2, "type": "warning", "title": "Heavy Rain Alert",
                "desc": f"Heavy rain ({today_rain}mm) expected. Avoid spraying chemicals today."
            })

        # 2. TEMPERATURE RISKS
        max_temp = data['daily']['temperature_2m_max'][0]
        min_temp = data['daily']['temperature_2m_min'][0]
        
        if max_temp > 40:
             alerts.append({
                "id": 3, "type": "critical", "title": "Heatwave Emergency",
                "desc": f"Extreme heat ({max_temp}°C). Irrigate crops immediately to prevent wilting."
            })
        elif min_temp < 5:
             alerts.append({
                "id": 4, "type": "warning", "title": "Frost Advisory",
                "desc": f"Freezing temperatures ({min_temp}°C) tonight. Cover sensitive saplings."
            })

        # 3. PEST & DISEASE (The "Smart" Part)
        # Innovation: High Humidity + Warmth = Fungus
        humidity = data['current']['relative_humidity_2m']
        if humidity > 85 and max_temp > 25:
             alerts.append({
                "id": 5, "type": "info", "title": "Fungal Blight Risk",
                "desc": "High humidity and heat detected. Conditions are ideal for fungal growth. Scout fields."
            })

        # 4. WIND RISKS
        wind = data['current']['wind_speed_10m']
        if wind > 30:
            alerts.append({
                "id": 6, "type": "warning", "title": "High Wind Alert",
                "desc": f"Strong winds ({wind} km/h). Secure polyhouses and tall crops."
            })

        return jsonify({"alerts": alerts})

    except Exception as e:
        print(f"Alert Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Weather & Alert Backend Running on Port 5003...")
    app.run(port=5003, debug=True)