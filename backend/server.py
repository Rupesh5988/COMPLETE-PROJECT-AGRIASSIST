from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import requests
import json
import os

app = Flask(__name__)

# --- 1. CONFIGURATION ---
CORS(app, resources={r"/*": {"origins": "*"}})

GEMINI_API_KEY = "AIzaSyCakHx7_nL6Md5CJaSPXFW8Tt7Tpf5jcSY"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# --- 2. ROUTE: IRRIGATION (MARATHI VERSION) ---
@app.route('/irrigation-plan', methods=['POST', 'OPTIONS'])
def irrigation_plan():
    if request.method == 'OPTIONS':
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response, 200

    try:
        print("📥 Received Irrigation Request...") 
        data = request.get_json()
        
        # Inputs
        crop = data.get('cropType')
        soil = data.get('soilType')
        method = data.get('irrigationMethod')
        size = data.get('fieldSize')
        
        # 1. Fetch Weather (Sangli, India)
        lat, lon = 16.8, 74.6 
        try:
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=precipitation_sum,et0_fao_evapotranspiration&timezone=auto"
            w_res = requests.get(weather_url).json()
            rain = sum(w_res['daily']['precipitation_sum'][:3])
            evap = sum(w_res['daily']['et0_fao_evapotranspiration'][:3])
        except:
            rain = 0
            evap = 15

        print(f"📊 Analyzing: {crop}, Rain: {rain}, Evap: {evap}")

        # 2. AI Analysis (MARATHI PROMPT)
        prompt = f"""
        Act as an expert agriculture advisor for a farmer in Maharashtra, India.
        Provide the output in **MARATHI** (Devanagari script).
        
        DATA:
        - Crop: {crop}
        - Soil: {soil}
        - Method: {method}
        - Field Size: {size} acres
        - Rain Forecast (3 days): {rain} mm
        - Evaporation (3 days): {evap} mm

        TASK:
        1. Calculate precise water needs.
        2. Provide simple, actionable advice.
        3. 'notes' MUST be 3-4 short bullet points, not a paragraph.

        OUTPUT JSON ONLY (Keep keys in English, Values in Marathi):
        {{
            "schedule": "Short Marathi phrase (e.g., दररोज सकाळी ६ वाजता)",
            "waterAmount": "Amount in Liters (e.g., एकूण ३३,००० लिटर)",
            "frequency": "Frequency (e.g., दररोज / दिवसाआड)",
            "notes": "• सध्या पावसाची शक्यता कमी आहे, त्यामुळे पाण्याची गरज आहे.\n• जमिनीतील ओलावा टिकवण्यासाठी ठिबकचा वापर करा.\n• पिकाच्या वाढीसाठी हे पाणी अत्यंत गरजेचे आहे."
        }}
        """
        
        response = model.generate_content(prompt)
        cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
        print("✅ AI Response Generated (Marathi)")
        return jsonify(json.loads(cleaned_text))

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

# --- 3. START SERVER ---
if __name__ == '__main__':
    print("🚀 MARATHI SERVER running on Port 5005...")
    app.run(host='0.0.0.0', port=5006, debug=True)