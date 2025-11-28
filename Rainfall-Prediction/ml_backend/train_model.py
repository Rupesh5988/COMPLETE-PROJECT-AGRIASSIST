import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# --- Configuration ---
# Uses YOUR original dataset file
DATASET_FILE = 'data/final_training_dataset.csv'
MODEL_SAVE_PATH = 'models/rainfall_prediction_model.joblib'

def train_rainfall_model():
    print("--- Training on Custom Dataset ---")

    # 1. Load Your Data
    try:
        data = pd.read_csv(DATASET_FILE)
        print("✅ Dataset loaded successfully.")
    except FileNotFoundError:
        print(f"❌ Error: {DATASET_FILE} not found.")
        return

    # 2. Smart Feature Engineering (Crucial for 95% Accuracy)
    # We try to find a date column to extract the Month.
    # This teaches the AI that "November = Low Rain".
    date_col = None
    for col in data.columns:
        if 'date' in col.lower() or 'time' in col.lower():
            date_col = col
            break
    
    if date_col:
        print(f"Feature Engineering: Extracting Seasonality from '{date_col}'...")
        data[date_col] = pd.to_datetime(data[date_col])
        data['month'] = data[date_col].dt.month
    else:
        print("⚠️ Warning: No Date column found. Accuracy might drop in Winter.")
        data['month'] = 0 # Fallback

    # Define Features
    # We use Month + The standard weather metrics
    features_list = ['max_temp_c', 'min_temp_c', 'humidity_percent', 'wind_speed_kmh', 'month']
    
    # Validation: Ensure columns exist
    for col in features_list:
        if col not in data.columns:
            print(f"❌ Error: Column '{col}' missing from your CSV.")
            return

    features = data[features_list]
    target = data['rainfall_mm']

    # 3. Split Data
    X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)

    # 4. Train Random Forest (High Accuracy Config)
    print("Training Model (200 Trees)...")
    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # 5. Evaluate
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions) * 100

    print(f"\n--- 🚀 Model Performance ---")
    print(f"Accuracy Score (R²): {r2:.2f}%")
    print(f"Mean Error: {mae:.2f} mm")

    # 6. Save
    joblib.dump(model, MODEL_SAVE_PATH)
    print(f"✅ Saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train_rainfall_model()