from flask import Flask, request, jsonify
import google.generativeai as genai

app = Flask(__name__)

# --- 1. CONFIGURATION ---
GEMINI_API_KEY = "AIzaSyCakHx7_nL6Md5CJaSPXFW8Tt7Tpf5jcSY"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# --- 2. FORCE CORS HEADERS (The "Nuclear" Fix) ---
# This runs after every single request to guarantee the browser is happy.
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*" 
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

# --- 3. CHAT ROUTE ---
@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    # If the browser sends a "Preflight" check, we say "OK" immediately.
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json()
        user_msg = data.get('message', '')
        if not user_msg: return jsonify({"reply": "Please say something."})

        print(f"User asked: {user_msg}") # Debug print

        response = model.generate_content(
            f"You are AgriAssist and the user asking is farmer and is maharashtrian so speak with him in marathi. Keep answers short. User: {user_msg}"
        )
        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"reply": f"Backend Error: {str(e)}"})

# --- 4. START ON PORT 5005 ---
if __name__ == '__main__':
    print("🚀 AgriAssist Server starting on NEW PORT 5005...")
    app.run(host='0.0.0.0', port=5005, debug=True)