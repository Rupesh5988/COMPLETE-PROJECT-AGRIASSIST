from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

# --- Load Model ---
MODEL_PATH = 'models/rainfall_prediction_model.joblib'
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded from {MODEL_PATH}")
except:
    print("❌ Model not found. Run train_model.py first.")
    model = None

@app.route('/get_weather_and_predict', methods=['GET'])
def get_weather_and_predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not lat or not lon:
        return jsonify({'error': 'Coordinates required'}), 400

    try:
        # 1. Fetch Live Weather Data (Open-Meteo)
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        weather_data = response.json()

        # 2. Prepare AI Inputs
        predictions = []
        # MUST Match the order in train_model.py
        required_columns = ['max_temp_c', 'min_temp_c', 'humidity_percent', 'wind_speed_kmh', 'month']

        daily = weather_data['daily']
        
        for i in range(len(daily['time'])):
            # Extract Month from API Date
            date_obj = datetime.strptime(daily['time'][i], '%Y-%m-%d')
            
            input_dict = {
                'max_temp_c': daily['temperature_2m_max'][i],
                'min_temp_c': daily['temperature_2m_min'][i],
                'humidity_percent': daily['relative_humidity_2m_mean'][i],
                'wind_speed_kmh': daily['wind_speed_10m_max'][i],
                'month': date_obj.month # The Key to Accuracy
            }
            
            # Predict
            df = pd.DataFrame([input_dict])[required_columns]
            pred = model.predict(df)[0]
            
            # Ensure no negative rain
            predictions.append({'predicted_rainfall_mm': max(0, round(pred, 2))})

        return jsonify({
            'weather': weather_data,
            'predictions': predictions
        })

    except Exception as e:
        print(f"API Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)