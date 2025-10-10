# app.py

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests
import joblib

app = Flask(__name__)
CORS(app) 

try:
    model = joblib.load('irrigation_model_v2.pkl')
    print("Model loaded successfully!")
except FileNotFoundError:
    print("Model file 'irrigation_model_v2.pkl' not found! Please run train_model.py first.")
    model = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/weather')
def get_weather():
    print("\n--- Received request for /weather ---")
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Latitude and Longitude are required'}), 400

    # UPDATED: Added 'weather_code' to the 'current' parameters
    API_URL = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean&timezone=auto"

    try:
        print(f"Calling API: {API_URL}")
        response = requests.get(API_URL, timeout=15) 
        response.raise_for_status()
        data = response.json()
        print("API call successful!")

        advice = "Could not generate advice."
        if model:
            today_temp_max = data['daily']['temperature_2m_max'][0]
            today_humidity = data['daily']['relative_humidity_2m_mean'][0]
            today_rainfall = data['daily']['precipitation_sum'][0]
            model_input = [[today_temp_max, today_humidity, today_rainfall]]
            prediction = model.predict(model_input)
            
            if prediction[0] == 1:
                advice = "High temperature and low rain chance. Irrigation is recommended."
            else:
                advice = "Sufficient rain or cooler temperatures expected. No irrigation needed today."
        
        data['agricultural_advice'] = advice
        print("Prediction generated. Sending data back to browser.")
        return jsonify(data)

    except requests.exceptions.Timeout:
        print("--> ERROR: The request to Open-Meteo timed out.")
        return jsonify({'error': 'The weather API request timed out. This may be due to a network firewall.'}), 500
    except requests.exceptions.RequestException as e:
        print(f"--> ERROR: An error occurred when calling the API: {e}")
        return jsonify({'error': str(e)}), 500
    except (KeyError, IndexError) as e:
        print(f"--> ERROR: Unexpected API response format. Missing key or index: {e}")
        return jsonify({'error': f'Unexpected API response format. Missing data: {e}'}), 500

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=5003)