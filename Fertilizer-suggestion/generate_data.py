import pandas as pd
import random

# --- CONFIGURATION ---
districts = ["Kolhapur", "Pune", "Sangli", "Satara", "Solapur"]
soil_types = ["Black", "Red", "Clayey"]
crops = ["Sugarcane", "Wheat", "Grapes", "Maize", "Cotton", "Soybean", "Tur", "Pomegranate", "Moong"]

# Valid Logic Rules (To ensure high probability)
# Format: (Crop, Soil Preference, N_range, P_range, K_range) -> Fertilizer
rules = [
    # High Nitrogen Needed (Leafy growth / Sugarcane)
    ({"crop": "Sugarcane", "n_max": 100}, "Urea"),
    ({"crop": "Cotton", "n_max": 100}, "Urea"),
    ({"crop": "Maize", "n_max": 100}, "Urea"),
    
    # Balanced / Basal dose
    ({"crop": "Wheat", "soil": "Black"}, "DAP"),
    ({"crop": "Soybean", "soil": "Clayey"}, "DAP"),
    ({"crop": "Moong", "soil": "Red"}, "DAP"),

    # High Potassium Needed (Fruits/Grapes)
    ({"crop": "Grapes", "k_max": 100}, "MOP"),
    ({"crop": "Pomegranate", "k_max": 100}, "MOP"),
    
    # Complex Fertilizers
    ({"crop": "Sugarcane", "soil": "Red"}, "10:26:26 NPK"),
    ({"crop": "Tur", "soil": "Black"}, "10:26:26 NPK"),
    ({"crop": "Grapes", "soil": "Clayey"}, "19:19:19 NPK"),
    ({"crop": "Pomegranate", "soil": "Red"}, "19:19:19 NPK"),
    ({"crop": "Cotton", "soil": "Black"}, "20:20:0:13"),
    
    # Sulfur lovers
    ({"crop": "Wheat", "soil": "Red"}, "Ammonium Sulphate"),
    ({"crop": "Soybean", "soil": "Black"}, "Ammonium Sulphate"),
]

data = []

for _ in range(5000): # Generate 5000 rows
    district = random.choice(districts)
    
    # Pick a random rule to ensure strong correlation
    rule, fertilizer = random.choice(rules)
    
    crop = rule.get("crop", random.choice(crops))
    soil = rule.get("soil", random.choice(soil_types))
    
    # Generate NPK based on fertilizer requirements (Reverse Engineering)
    # If the fertilizer is Urea, input N should be LOW (indicating need)
    if fertilizer == "Urea":
        N = random.randint(20, 90) # Low N needs Urea
        P = random.randint(40, 60)
        K = random.randint(40, 60)
    elif fertilizer == "DAP":
        N = random.randint(30, 60)
        P = random.randint(20, 50) # Low P needs DAP
        K = random.randint(40, 60)
    elif fertilizer == "MOP":
        N = random.randint(40, 60)
        P = random.randint(40, 60)
        K = random.randint(20, 50) # Low K needs MOP
    else:
        # General Random ranges
        N = random.randint(40, 100)
        P = random.randint(30, 80)
        K = random.randint(30, 80)

    # Weather (Simulated based on district/region)
    temp = random.uniform(20, 35)
    rainfall = random.uniform(400, 1500)
    ph = random.uniform(5.5, 7.5)

    data.append([district, soil, crop, N, P, K, ph, rainfall, temp, fertilizer])

df = pd.DataFrame(data, columns=['District', 'Soil Color', 'Crop Type', 'Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature', 'Fertilizer'])

# Save to CSV
df.to_csv('fertilizer_data.csv', index=False)
print("✅ High-Quality Dataset Generated: fertilizer_data.csv")