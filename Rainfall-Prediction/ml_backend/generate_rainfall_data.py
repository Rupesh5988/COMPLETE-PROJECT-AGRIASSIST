import pandas as pd
import numpy as np
import random

# --- HIGH CONTRAST LOGIC GENERATOR ---
# This forces the AI to learn: "Low Humidity + Winter = NO RAIN"

data = []

for _ in range(10000): # 10,000 samples for strong learning
    # 1. Pick a Month
    month = random.randint(1, 12)
    
    # 2. Strict Seasonal Rules
    
    # --- WINTER (Nov, Dec, Jan, Feb) ---
    # Goal: Teach AI that winter is DRY.
    if month in [11, 12, 1, 2]: 
        max_temp = random.randint(26, 31)
        min_temp = random.randint(12, 18)
        humidity = random.randint(30, 50) # Winter is usually dry air
        wind = random.randint(5, 12)
        rainfall = 0.0 # STRICTLY ZERO RAIN for clear patterns
            
    # --- SUMMER (March, April, May) ---
    # Goal: Teach AI that summer is HOT and DRY.
    elif month in [3, 4, 5]: 
        max_temp = random.randint(36, 42)
        min_temp = random.randint(22, 28)
        humidity = random.randint(20, 35) # Very dry air
        wind = random.randint(10, 20)
        rainfall = 0.0 # No rain
        
    # --- MONSOON (June, July, Aug, Sept) ---
    # Goal: Teach AI that Humidity = Rain.
    elif month in [6, 7, 8, 9]: 
        max_temp = random.randint(26, 30)
        min_temp = random.randint(23, 26)
        humidity = random.randint(80, 98) # Very high humidity
        wind = random.randint(15, 30)
        
        # Physics Logic: If humidity is high, it rains.
        if humidity > 85:
            rainfall = random.uniform(25, 120) # Heavy Rain
        else:
            rainfall = random.uniform(5, 20)   # Light Rain
            
    # --- RETREATING MONSOON (October) ---
    else: 
        max_temp = random.randint(28, 33)
        min_temp = random.randint(20, 24)
        humidity = random.randint(60, 75)
        wind = random.randint(10, 15)
        
        if random.random() > 0.5:
            rainfall = random.uniform(5, 25)
        else:
            rainfall = 0.0

    # Simulate 2024 dates
    day = random.randint(1, 28)
    date = f"2024-{month:02d}-{day:02d}"
    
    data.append([date, max_temp, min_temp, humidity, wind, round(rainfall, 2)])

df = pd.DataFrame(data, columns=['date', 'max_temp_c', 'min_temp_c', 'humidity_percent', 'wind_speed_kmh', 'rainfall_mm'])
df.to_csv('data/final_training_dataset.csv', index=False)
print("✅ High-Contrast Dataset Generated (Winter = Dry).") 