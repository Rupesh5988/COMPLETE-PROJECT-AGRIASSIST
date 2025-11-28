import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

# 1. Load the SMART data
df = pd.read_csv('smart_crop_data.csv')

# 2. Encoders
le_district = LabelEncoder()
le_soil = LabelEncoder()
le_crop = LabelEncoder()

df['District'] = le_district.fit_transform(df['District'])
df['Soil Color'] = le_soil.fit_transform(df['Soil Color'])
df['Crop'] = le_crop.fit_transform(df['Crop'])

# 3. Train
X = df[['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature', 'District', 'Soil Color']]
y = df['Crop']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Increased estimators to 200 for better stability
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# 4. Check Accuracy
acc = accuracy_score(y_test, model.predict(X_test))
print(f"✅ NEW Model Accuracy: {acc * 100:.2f}%")

# 5. Save Files (Overwriting old ones)
pickle.dump(model, open('final_model.pkl', 'wb'))
pickle.dump(le_district, open('le_district_crop.pkl', 'wb'))
pickle.dump(le_soil, open('le_soil_crop.pkl', 'wb'))
pickle.dump(le_crop, open('le_crop_target.pkl', 'wb'))

print("✅ Pro Models Saved!")