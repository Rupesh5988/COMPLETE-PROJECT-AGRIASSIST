import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
import joblib

# --- Step 1: Load the new, processed dataset ---
try:
    df = pd.read_csv('sangli_training_data_2024.csv')
    print("Successfully loaded 'sangli_training_data_2024.csv'")
except FileNotFoundError:
    print("Error: 'sangli_training_data_2024.csv' not found.")
    print("Please make sure you have run the previous data processing step.")
    exit()

print("\n--- Data Head ---")
print(df.head())
print("-----------------\n")


# --- Step 2: Prepare the data for training ---
features = ['max_temp_c', 'humidity_percent', 'rainfall_mm']
target = 'irrigation_needed'

X = df[features]
y = df[target]

# Split data into 80% for training and 20% for testing
# This helps us see how well the model performs on unseen data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training model with {len(X_train)} data points.")
print(f"Testing model with {len(X_test)} data points.\n")


# --- Step 3: Choose and train the model ---
# A Decision Tree is a great choice as it works like a set of 'if-then' rules.
model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)
print("Model training complete.")


# --- Step 4: Evaluate the model ---
# Let's see how accurate our new model is on the test data.
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"\nModel Accuracy on Test Data: {accuracy * 100:.2f}%")


# --- Step 5: Save the new, more powerful model ---
# We'll save it with a new name to avoid confusion.
new_model_filename = 'irrigation_model_v2.pkl'
joblib.dump(model, new_model_filename)
print(f"\nNew model saved as '{new_model_filename}'!")