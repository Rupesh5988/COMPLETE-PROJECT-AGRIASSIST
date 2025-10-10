from flask import Flask, request, jsonify
from flask_cors import CORS # Make sure CORS is imported
import joblib
import pandas as pd
import requests # Import the requests library

# Initialize the Flask application
app = Flask(__name__)
CORS(app) # Enable CORS for your entire app

# --- Load the Trained Model ---
try:
    MODEL_PATH = 'models/rainfall_prediction_model.joblib'
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    print(f"❌ Error: Model file not found at {MODEL_PATH}.")
    model = None

# --- NEW, ALL-IN-ONE API ENDPOINT ---
@app.route('/get_weather_and_predict', methods=['GET'])
def get_weather_and_predict():
    if model is None:
        return jsonify({'error': 'Model is not loaded.'}), 500

    # 1. Get latitude and longitude from the React app's request
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'Latitude and longitude are required'}), 400

    try:
        # 2. Call the Open-Meteo API from the server
        print(f"Fetching weather for lat={lat}, lon={lon} from server...")
        weather_api_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto"
        weather_response = requests.get(weather_api_url, timeout=15)
        weather_response.raise_for_status() # Raise an exception for bad status codes
        weather_data = weather_response.json()
        print("✅ Weather data fetched successfully.")

        # 3. Prepare data and get predictions for all 5 days
        predictions = []
        required_columns = ['max_temp_c', 'min_temp_c', 'humidity_percent', 'wind_speed_kmh']
        
        for i in range(len(weather_data['daily']['time'])):
            # Create a dictionary for the model input for each day
            model_input_dict = {
                'max_temp_c': weather_data['daily']['temperature_2m_max'][i],
                'min_temp_c': weather_data['daily']['temperature_2m_min'][i],
                'humidity_percent': weather_data['daily']['relative_humidity_2m_mean'][i],
                'wind_speed_kmh': weather_data['daily']['wind_speed_10m_max'][i]
            }
            
            # Convert to DataFrame and predict
            features_df = pd.DataFrame([model_input_dict])[required_columns]
            prediction = model.predict(features_df)
            predictions.append({'predicted_rainfall_mm': round(prediction[0], 2)})
        
        print("✅ AI predictions generated for all days.")
        
        # 4. Combine the weather data and our predictions into one response
        final_response = {
            'weather': weather_data,
            'predictions': predictions
        }
        
        return jsonify(final_response)

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to fetch weather data: {e}'}), 502 # 502 Bad Gateway
    except Exception as e:
        return jsonify({'error': f'An error occurred: {e}'}), 500

# --- Run the Flask App ---
if __name__ == '__main__':
    print("🚀 Starting Flask API server...")
    app.run(host='0.0.0.0', port=5000)