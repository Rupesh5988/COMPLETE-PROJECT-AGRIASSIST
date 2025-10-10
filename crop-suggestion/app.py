# app.py (Updated for React Front-End)

from flask import Flask, request, jsonify
from flask_cors import CORS  # NEW: Import CORS
import pickle
import pandas as pd
import requests
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # NEW: Enable CORS for your entire app

# --- Load Model and Encoder (No changes here) ---
try:
    model = pickle.load(open('final_model.pkl', 'rb'))
    crop_encoder = pickle.load(open('final_crop_encoder.pkl', 'rb'))
except FileNotFoundError:
    print("Error: Model or encoder files not found.")
    exit()

MODEL_FEATURES = [
    'Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature',
    'Soil_color_Dark Brown', 'Soil_color_Light Brown', 'Soil_color_Medium Brown',
    'Soil_color_Red', 'Soil_color_Red ', 'Soil_color_Reddish Brown'
]

SOIL_DEFAULTS = {
    "Black": {"N": 85, "P": 50, "K": 100, "pH": 7.0},
    "Red": {"N": 70, "P": 45, "K": 90, "pH": 6.5},
    "Dark Brown": {"N": 90, "P": 55, "K": 105, "pH": 6.8},
    "Default": {"N": 80, "P": 50, "K": 95, "pH": 6.7}
}

# --- ROUTES ---

@app.route('/')
def home():
    # This route is no longer needed for the React app but can be kept for testing
    return "Flask Crop Prediction API is running!"

# --- /get_all_defaults Endpoint (No changes here, it already works!) ---
@app.route('/get_all_defaults', methods=['POST'])
def get_all_defaults():
    try:
        data = request.get_json()
        lat, lon = data['lat'], data['lon']
        
        # ... (all your API calling logic for soil and weather remains the same) ...
        soil_url = f"https://rest.isric.org/soilgrids/v2.0/properties/query?lon={lon}&lat={lat}&property=wrb_class_name&depth=0-5cm&value=strings"
        soil_response = requests.get(soil_url, timeout=10)
        soil_api_data = soil_response.json()
        soil_class_name = soil_api_data['properties']['layers'][0]['depths'][0]['values']['strings'][0]

        if 'Vertisols' in soil_class_name: soil_type = "Black"
        elif 'Nitisols' in soil_class_name: soil_type = "Red"
        else: soil_type = "Dark Brown"
        
        defaults = SOIL_DEFAULTS.get(soil_type, SOIL_DEFAULTS["Default"])
        defaults['soil_type'] = soil_type

        current_weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m"
        weather_response = requests.get(current_weather_url, timeout=10)
        defaults['temperature'] = weather_response.json()['current']['temperature_2m']

        today = datetime.now(datetime.UTC)
        last_year = today - timedelta(days=365)
        historical_weather_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={last_year.strftime('%Y-%m-%d')}&end_date={today.strftime('%Y-%m-%d')}&daily=precipitation_sum"
        historical_response = requests.get(historical_weather_url, timeout=10)
        precipitation_data = historical_response.json()['daily']['precipitation_sum']
        defaults['rainfall'] = sum(p for p in precipitation_data if p is not None)

        return jsonify(defaults)
    except Exception as e:
        print(f"API Error: {e}")
        defaults = SOIL_DEFAULTS["Default"]
        defaults.update({'soil_type': "Black", 'temperature': 25.0, 'rainfall': 1000})
        return jsonify(defaults)

# --- /predict Endpoint (CHANGED to return JSON) ---
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Create a DataFrame with all the model features initialized to 0
        input_features = pd.DataFrame([[0]*len(MODEL_FEATURES)], columns=MODEL_FEATURES)

        # Fill in the numeric values from the form data
        # Note: 'request.form' works for FormData sent from the browser
        input_features['Nitrogen'] = float(request.form['Nitrogen'])
        input_features['Phosphorus'] = float(request.form['Phosphorus'])
        input_features['Potassium'] = float(request.form['Potassium'])
        input_features['pH'] = float(request.form['pH'])
        input_features['Rainfall'] = float(request.form['Rainfall'])
        input_features['Temperature'] = float(request.form['Temperature'])

        # Handle the one-hot encoded soil color
        selected_soil_color = request.form['Soil_color']
        soil_color_column = f'Soil_color_{selected_soil_color}'
        
        if soil_color_column in input_features.columns:
            input_features[soil_color_column] = 1
        
        # Make and decode the prediction
        prediction_encoded = model.predict(input_features)
        crop_name = crop_encoder.inverse_transform(prediction_encoded)[0]

        # CHANGED: Return a JSON response instead of rendering a template
        return jsonify({
            "prediction_text": crop_name.title()
        })

    except Exception as e:
        print(f"Prediction Error: {e}")
        # CHANGED: Return a JSON error message with a 400 status code
        return jsonify({
            "error": f"An error occurred: {e}"
        }), 400

if __name__ == "__main__":
    app.run(debug=True, port=5001)