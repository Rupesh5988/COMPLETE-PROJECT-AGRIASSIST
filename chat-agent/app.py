import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

# --- Setup -----------------------------------------------------------------

app = Flask(__name__)
# Enable CORS for your Next.js app (http://localhost:3000)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3002"}})

# [!!! YOUR CODE HERE !!!]
# 1. Get your Google AI Studio API Key
#    (Go to https://aistudio.google.com/app/apikey)
GOOGLE_API_KEY = 'AIzaSyDaiy-1gPiEu0IVOO8XEf50_tS_SU_5OMU'
genai.configure(api_key=GOOGLE_API_KEY)

# 2. Load your scikit-learn models and encoders here
#    This is just an example, use your actual file paths
try:
    crop_model = pickle.load(open('models/crop_recommendation.pkl', 'rb'))
    # e.g., soil_color_encoder = pickle.load(open('models/soil_encoder.pkl', 'rb'))
    
    fertilizer_model = pickle.load(open('models/fertilizer_recommendation.pkl', 'rb'))
    # e.g., crop_type_encoder = pickle.load(open('models/fert_crop_encoder.pkl', 'rb'))
    
    print("All models and encoders loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    print("Agent will run with MOCK DATA.")
    crop_model = None
    fertilizer_model = None

# --- Tool Definitions (Your Python Functions) -----------------------------
# These are the "tools" the AI agent can use.
# We wrap your existing model logic in these functions.

def get_crop_recommendation(N: int, P: int, K: int, temperature: float, rainfall: float, ph: float):
    """
    Recommends a crop based on soil and weather conditions.
    """
    print(f"Tool called: get_crop_recommendation with N={N}, P={P}, K={K}...")
    
    # [!!! YOUR CODE HERE !!!]
    # Replace this with your actual model prediction logic
    if crop_model:
        try:
            # You must pre-process inputs just like your original form did
            # e.g., encode soil_color, etc.
            # For this example, we assume the model only needs these 6 features
            
            data = np.array([[N, P, K, temperature, rainfall, ph]])
            prediction = crop_model.predict(data)
            
            # You must "decode" the prediction if it's a number
            # e.g., return crop_label_encoder.inverse_transform(prediction)[0]
            
            return f"Model prediction: The best crop is {prediction[0]}."
        
        except Exception as e:
            return f"Error during model prediction: {e}"
    else:
        # Mock response if model didn't load
        return f"Mock response: With N={N} and P={P}, 'Rice' is recommended."


def get_fertilizer_recommendation(N: int, P: int, K: int, crop_type: str):
    """
    Recommends a fertilizer based on soil conditions and the crop being grown.
    """
    print(f"Tool called: get_fertilizer_recommendation for crop={crop_type}...")

    # [!!! YOUR CODE HERE !!!]
    # Replace this with your actual model prediction logic
    if fertilizer_model:
        try:
            # Pre-process inputs
            # e.g., encoded_crop = crop_type_encoder.transform([crop_type])
            
            # data = np.array([[N, P, K, encoded_crop[0]]])
            # prediction = fertilizer_model.predict(data)
            # return f"Model prediction: The best fertilizer is {prediction[0]}."
            
            # Placeholder until you add your code
            return f"Mock response: For {crop_type}, 'DAP' fertilizer is recommended."
        except Exception as e:
            return f"Error during model prediction: {e}"
    else:
        # Mock response if model didn't load
        return f"Mock response: For {crop_type}, 'DAP' fertilizer is recommended."


# --- Agent Setup -----------------------------------------------------------

# Define the tools for the Gemini model
tools = [
    get_crop_recommendation,
    get_fertilizer_recommendation,
]

# Initialize the Generative Model
model = genai.GenerativeModel(
    model_name='gemini-1.5-pro-latest',
    tools=tools,
    system_instruction="You are 'AgriAssist', a helpful AI agent for farmers. You are friendly, encouraging, and an expert in agriculture. Your goal is to help the user with their farming questions. If you need information to run a tool, you must ask the user for it. Do not make up values for N, P, K, temperature, rainfall, or pH."
)

# Store chat histories in memory (in a real app, use a database)
chats = {}

# --- API Endpoint ----------------------------------------------------------

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_id = data.get('user_id', 'default_user') # Get a user ID, or use 'default'
    user_message = data.get('message')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        # Get or create a chat session for the user
        if user_id not in chats:
            chats[user_id] = model.start_chat()
        
        chat_session = chats[user_id]

        # Send the user's message to the model
        response = chat_session.send_message(user_message)

        # --- This is the "Agent Loop" ---
        while response.candidates[0].function_calls:
            # 1. The model wants to call a function
            function_call = response.candidates[0].function_calls[0]
            function_name = function_call.name
            function_args = function_call.args
            
            print(f"AI wants to call tool: {function_name} with args: {function_args}")

            # 2. Find and call the correct Python function
            if function_name == 'get_crop_recommendation':
                tool_response = get_crop_recommendation(
                    N=function_args['N'],
                    P=function_args['P'],
                    K=function_args['K'],
                    temperature=function_args['temperature'],
                    rainfall=function_args['rainfall'],
                    ph=function_args['ph']
                )
            elif function_name == 'get_fertilizer_recommendation':
                tool_response = get_fertilizer_recommendation(
                    N=function_args['N'],
                    P=function_args['P'],
                    K=function_args['K'],
                    crop_type=function_args['crop_type']
                )
            else:
                tool_response = "Unknown tool"

            # 3. Send the function's output back to the model
            response = chat_session.send_message(
                genai.Part(function_response={
                    "name": function_name,
                    "response": tool_response,
                })
            )
        # --- End of Agent Loop ---

        # 4. The model has a final text answer. Send it to the user.
        return jsonify({"role": "model", "content": response.text})

    except Exception as e:
        print(f"Error in /api/chat: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5004)