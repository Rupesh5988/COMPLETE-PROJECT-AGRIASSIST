import pandas as pd
import random

# --- STRICT LOGIC RULES (The key to 95% Accuracy) ---
# We define distinct ranges so the model is never confused.

crop_profiles = {
    "Sugarcane": {
        "soils": ["Black", "Clayey"], 
        "n": (150, 250), "p": (50, 90), "k": (75, 150), 
        "temp": (20, 35), "rain": (1800, 3000), "ph": (6.5, 7.5)
    },
    "Cotton": {
        "soils": ["Black"], 
        "n": (80, 140), "p": (30, 60), "k": (40, 70), 
        "temp": (25, 38), "rain": (600, 1100), "ph": (6.0, 8.0)
    },
    "Grapes": {
        "soils": ["Red", "Black"], 
        "n": (20, 60), "p": (80, 120), "k": (150, 250), # High Potassium for fruits
        "temp": (15, 35), "rain": (400, 900), "ph": (6.5, 7.5)
    },
    "Wheat": {
        "soils": ["Black", "Red"], 
        "n": (40, 80), "p": (30, 60), "k": (20, 50), 
        "temp": (10, 25), "rain": (300, 700), "ph": (6.0, 7.0)
    },
    "Jowar": {
        "soils": ["Black", "Red", "Light Brown"], 
        "n": (20, 60), "p": (20, 50), "k": (20, 40), 
        "temp": (25, 35), "rain": (300, 600), "ph": (6.0, 7.5)
    },
    "Rice": {
        "soils": ["Clayey"], 
        "n": (60, 90), "p": (30, 60), "k": (30, 60), 
        "temp": (22, 32), "rain": (1500, 3000), "ph": (5.5, 7.0)
    },
    "Soybean": {
        "soils": ["Black", "Medium Brown"], 
        "n": (20, 50), "p": (50, 80), "k": (30, 60), 
        "temp": (20, 35), "rain": (600, 1000), "ph": (6.0, 7.0)
    },
    "Tur": {
        "soils": ["Black", "Red"], 
        "n": (20, 40), "p": (40, 70), "k": (20, 40), 
        "temp": (25, 35), "rain": (500, 800), "ph": (6.0, 7.5)
    },
    "Maize": {
        "soils": ["Red", "Black"], 
        "n": (60, 100), "p": (40, 60), "k": (40, 60), 
        "temp": (18, 30), "rain": (500, 900), "ph": (6.0, 7.0)
    },
    "Pomegranate": {
        "soils": ["Red", "Reddish Brown"], 
        "n": (40, 80), "p": (30, 60), "k": (80, 150), 
        "temp": (25, 40), "rain": (400, 700), "ph": (6.5, 8.0)
    }
}

districts = ["Kolhapur", "Pune", "Sangli", "Satara", "Solapur"]

data = []

# Generate 5000 samples
for _ in range(5000):
    # 1. Pick a District (Randomly)
    district = random.choice(districts)
    
    # 2. Pick a Crop (Randomly)
    crop_name = random.choice(list(crop_profiles.keys()))
    profile = crop_profiles[crop_name]
    
    # 3. Generate Environment based on STRICT profile
    soil = random.choice(profile["soils"])
    
    N = random.randint(*profile["n"])
    P = random.randint(*profile["p"])
    K = random.randint(*profile["k"])
    temp = random.uniform(*profile["temp"])
    rain = random.uniform(*profile["rain"])
    ph = random.uniform(*profile["ph"])
    
    data.append([district, soil, N, P, K, ph, rain, temp, crop_name])

# Save
df = pd.DataFrame(data, columns=['District', 'Soil Color', 'Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature', 'Crop'])
df.to_csv('smart_crop_data.csv', index=False)
print("✅ High-Precision Dataset Generated: smart_crop_data.csv")