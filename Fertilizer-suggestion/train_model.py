import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# 1. Load the new high-quality dataset
df = pd.read_csv('fertilizer_data.csv')

print("Training on dataset shape:", df.shape)

# 2. Initialize Encoders
le_district = LabelEncoder()
le_soil = LabelEncoder()
le_crop = LabelEncoder()
le_fertilizer = LabelEncoder()

# 3. Encode Categorical Columns
df['District'] = le_district.fit_transform(df['District'])
df['Soil Color'] = le_soil.fit_transform(df['Soil Color'])
df['Crop Type'] = le_crop.fit_transform(df['Crop Type'])
df['Fertilizer'] = le_fertilizer.fit_transform(df['Fertilizer'])

# 4. Define Features (X) and Target (y)
# MUST MATCH THE ORDER IN YOUR FLASK APP
X = df[['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature', 'District', 'Soil Color', 'Crop Type']]
y = df['Fertilizer']

# 5. Train Model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Using 100 trees (n_estimators) ensures smooth probability distribution
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print(f"✅ Model Training Complete. Accuracy: {accuracy * 100:.2f}%")

# 6. Save Model and Encoders
pickle.dump(model, open('model.pkl', 'wb'))
pickle.dump(le_district, open('le_district.pkl', 'wb'))
pickle.dump(le_soil, open('le_soil.pkl', 'wb'))
pickle.dump(le_crop, open('le_crop.pkl', 'wb'))
pickle.dump(le_fertilizer, open('le_fertilizer.pkl', 'wb'))

print("✅ All .pkl files saved successfully!")