from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS 
import requests
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# --- Load Model and Encoders ---
try:
    model = pickle.load(open('model.pkl', 'rb'))
    le_district = pickle.load(open('le_district.pkl', 'rb'))
    le_soil = pickle.load(open('le_soil.pkl', 'rb'))
    le_crop = pickle.load(open('le_crop.pkl', 'rb'))
    le_fertilizer = pickle.load(open('le_fertilizer.pkl', 'rb'))
except FileNotFoundError:
    print("Error: One or more .pkl files are missing. Please run the training script again.")
    exit()

# --- Database of Default NPK/pH Values ---
SOIL_DEFAULTS = {
    "Black": {"N": 85, "P": 50, "K": 100, "pH": 7.0},
    "Red": {"N": 70, "P": 45, "K": 90, "pH": 6.5},
    "Clayey": {"N": 75, "P": 60, "K": 110, "pH": 7.2},
    "Default": {"N": 80, "P": 50, "K": 95, "pH": 6.7}
}

# --- ROUTES ---

@app.route('/get_form_options', methods=['GET'])
def get_form_options():
    """
    Provides the UI with dynamic dropdown options from the trained model data.
    """
    try:
        district_names = list(le_district.classes_)
        crop_names = list(le_crop.classes_)
        
        return jsonify({
            'districts': district_names,
            'crops': crop_names
        })
    except Exception as e:
        print(f"--- ERROR fetching form options ---: {e}")
        return jsonify({'error': 'Could not load form options'}), 500

@app.route('/get_environmental_data', methods=['POST'])
def get_environmental_data():
    """
    API endpoint to fetch environmental data from SoilGrids and Open-Meteo.
    """
    try:
        data = request.get_json()
        lat, lon = data['lat'], data['lon']

        soil_url = f"https://rest.isric.org/soilgrids/v2.0/properties/query?lon={lon}&lat={lat}&property=wrb_class_name&depth=0-5cm&value=strings"
        soil_response = requests.get(soil_url, timeout=30).json()
        soil_class_name = soil_response['properties']['layers'][0]['depths'][0]['values']['strings'][0]

        soil_type_mapped = "Clayey"
        if 'Vertisols' in soil_class_name: soil_type_mapped = "Black"
        elif 'Nitisols' in soil_class_name or 'Ferralsols' in soil_class_name: soil_type_mapped = "Red"
        
        defaults = SOIL_DEFAULTS.get(soil_type_mapped, SOIL_DEFAULTS["Default"])
        defaults['soil_color'] = soil_type_mapped

        current_weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m"
        weather_response = requests.get(current_weather_url, timeout=15).json()
        defaults['temperature'] = weather_response['current']['temperature_2m']

        today = datetime.utcnow()
        last_year = today - timedelta(days=365)
        historical_weather_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={last_year.strftime('%Y-%m-%d')}&end_date={today.strftime('%Y-%m-%d')}&daily=rain_sum"
        historical_response = requests.get(historical_weather_url, timeout=30).json()
        precipitation_data = historical_response['daily']['rain_sum']
        defaults['rainfall'] = sum(p for p in precipitation_data if p is not None)

        return jsonify(defaults)

    except Exception as e:
        print(f"--- API ERROR ---: {e}")
        error_defaults = SOIL_DEFAULTS["Default"]
        error_defaults.update({'soil_color': "Black", 'temperature': 25.0, 'rainfall': 1000})
        return jsonify(error_defaults)

@app.route('/predict', methods=['POST'])
def predict():
    """Receives the final form data and predicts the FERTILIZER."""
    data = request.get_json()
    try:
        encoded_district = le_district.transform([data['district']])[0]
        encoded_soil = le_soil.transform([data['soil_color']])[0]
        encoded_crop = le_crop.transform([data['crop']])[0]
        
        input_data = np.array([[
            float(data['nitrogen']), float(data['phosphorus']), float(data['potassium']),
            float(data['ph']), float(data['rainfall']), float(data['temperature']),
            encoded_district, encoded_soil, encoded_crop
        ]])
        
        prediction_encoded = model.predict(input_data)
        prediction_name = le_fertilizer.inverse_transform(prediction_encoded)[0]
        
        return jsonify({'prediction': prediction_name})
    except Exception as e:
        print(f"--- PREDICTION ERROR ---: {e}")
        return jsonify({'prediction': f"Error during prediction."})

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=5002)