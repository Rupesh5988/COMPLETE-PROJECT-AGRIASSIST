import pandas as pd
import numpy as np
import joblib
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# --- 1. Generate Smart Synthetic Data ---
# We create 5000 scenarios based on real farming logic.
print("Generating dataset...")

data = []
for _ in range(5000):
    # Random realistic weather conditions
    max_temp = np.random.randint(20, 45)  # 20°C to 45°C
    humidity = np.random.randint(10, 90)  # 10% to 90%
    rainfall = np.random.randint(0, 50)   # 0mm to 50mm

    # --- IRRIGATION LOGIC (The "Brain" of the model) ---
    irrigation_needed = 0  # Default: No

    # Rule 1: If it rained significantly (>10mm), NO irrigation needed.
    if rainfall > 10:
        irrigation_needed = 0
    
    # Rule 2: If it's very hot (>35°C) AND dry (<40% humidity), YES irrigation needed.
    elif max_temp > 35 and humidity < 40:
        irrigation_needed = 1
    
    # Rule 3: If moderate heat (30-35°C) and very dry (<30% humidity), YES irrigation needed.
    elif max_temp > 30 and humidity < 30:
        irrigation_needed = 1

    # Rule 4: Otherwise (Cooler or humid), usually NO irrigation.
    else:
        irrigation_needed = 0

    data.append([max_temp, humidity, rainfall, irrigation_needed])

# Create DataFrame
df = pd.DataFrame(data, columns=['max_temp_c', 'humidity_percent', 'rainfall_mm', 'irrigation_needed'])

# --- 2. Train the Model ---
print("Training Decision Tree Model...")

X = df[['max_temp_c', 'humidity_percent', 'rainfall_mm']]
y = df['irrigation_needed']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = DecisionTreeClassifier()
model.fit(X_train, y_train)

# Check Accuracy
preds = model.predict(X_test)
accuracy = accuracy_score(y_test, preds)
print(f"✅ Model Accuracy: {accuracy * 100:.2f}%")

# --- 3. Save the Missing File ---
joblib.dump(model, 'irrigation_model_v2.pkl')
print("✅ Saved 'irrigation_model_v2.pkl' successfully!")