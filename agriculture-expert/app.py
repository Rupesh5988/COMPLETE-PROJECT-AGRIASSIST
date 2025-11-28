from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import google.generativeai as genai
import os

app = Flask(__name__)
# Enable CORS for all domains/ports (Fixes network errors)
CORS(app)

# --- 1. CONFIGURATION ---
# ⚠️ PASTE YOUR GOOGLE API KEY HERE
GEMINI_API_KEY = "AIzaSyCakHx7_nL6Md5CJaSPXFW8Tt7Tpf5jcSY"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# --- 2. ROUTE: CHATBOT ---
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_msg = data.get('message', '')
        if not user_msg: return jsonify({"reply": "Please say something."})

        # Smart Prompt
        system_instruction = """
        You are AgriAssist, an AI expert for Indian farmers.
        Answer questions about crops, pests, fertilizer, weather, and government schemes.
        Keep answers practical, short (max 3 sentences), and use bullet points if needed.
        """
        response = model.generate_content(f"{system_instruction}\nUser: {user_msg}")
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"reply": "I am having trouble connecting to the satellite."})

# --- 3. ROUTE: SMART WEATHER & IRRIGATION (No .pkl needed!) ---
@app.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon: return jsonify({'error': 'Coords needed'}), 400

    try:
        # 1. Fetch Live Weather
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
        res = requests.get(url, timeout=10)
        data = res.json()

        # 2. Extract Data
        t_max = data['daily']['temperature_2m_max'][0]
        hum = data['current']['relative_humidity_2m']
        rain = data['daily']['precipitation_sum'][0]

        # 3. ASK GEMINI for Irrigation Advice (Replaces the .pkl model)
        # We construct a prompt with the live data
        prompt = f"""
        Act as an expert agronomist. 
        Current conditions: Max Temp {t_max}°C, Humidity {hum}%, Rain {rain}mm.
        Question: Should the farmer irrigate today?
        Response Format: EXACTLY one word 'YES' or 'NO', followed by a hyphen, then a 10-word reason.
        Example: YES - High heat and low moisture risk crop stress.
        """
        
        try:
            ai_response = model.generate_content(prompt).text.strip()
            # Parse output like "YES - reason..."
            parts = ai_response.split('-', 1)
            decision = parts[0].strip().upper()
            reason = parts[1].strip() if len(parts) > 1 else "Check soil moisture."

            if "YES" in decision:
                advice_text = f"⚠️ Irrigation Recommended. {reason}"
                advice_type = "warning"
            else:
                advice_text = f"✅ No Irrigation Needed. {reason}"
                advice_type = "success"
        except:
            advice_text = "Could not analyze data. Check soil manually."
            advice_type = "neutral"

        # 4. Return Data
        return jsonify({
            "current": {
                "temp": round(data['current']['temperature_2m']),
                "humidity": hum,
                "wind": data['current']['wind_speed_10m'],
                "weather_code": data['current']['weather_code']
            },
            "daily_stats": {
                "max_temp": t_max,
                "min_temp": data['daily']['temperature_2m_min'][0],
                "rain_mm": rain
            },
            "forecast": data['daily'],
            "ai_advice": { "text": advice_text, "type": advice_type }
        })

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

# --- 4. ROUTE: ALERTS ---
@app.route('/get_alerts', methods=['GET'])
def get_alerts():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
        res = requests.get(url, timeout=10)
        data = res.json()
        
        alerts = []
        rain = data['daily']['precipitation_sum'][0]
        temp = data['daily']['temperature_2m_max'][0]
        hum = data['current']['relative_humidity_2m']

        # Logic-Based Alerts (Faster & Safer than AI for emergencies)
        if rain > 65: alerts.append({"id": 1, "type": "critical", "title": "Flood Warning", "desc": f"Extreme rain ({rain}mm). Evacuate low areas."})
        elif rain > 35: alerts.append({"id": 2, "type": "warning", "title": "Heavy Rain", "desc": f"Heavy rain ({rain}mm). Stop chemical spraying."})
        
        if temp > 40: alerts.append({"id": 3, "type": "critical", "title": "Heatwave", "desc": "Extreme heat. Irrigate crops immediately."})
        
        if hum > 85 and temp > 25: alerts.append({"id": 4, "type": "info", "title": "Pest Risk", "desc": "High humidity & heat favor fungal growth."})

        return jsonify({"alerts": alerts})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Smart AgriAssist Backend Running on Port 5003...")
    app.run(port=5003, debug=True)