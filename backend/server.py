from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import psycopg2 
import random
import os

app = Flask(__name__)

# --- 1. BASIC CONFIG ---
CORS(app) # Basic setup

GEMINI_API_KEY = "AIzaSyCakHx7_nL6Md5CJaSPXFW8Tt7Tpf5jcSY"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# --- 2. THE NUCLEAR CORS FIX (Crucial for you) ---
# This forces every response to say "Allowed"
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*" 
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

# --- 3. DATABASE SETUP ---
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="postgres",
            user="postgres",
            password="raren" # ✅ Your Password
        )
        return conn
    except Exception as e:
        print(f"❌ DB Connection Error: {e}")
        return None

otp_storage = {}

# --- 4. AUTH ROUTES (With Manual OPTIONS check) ---

@app.route('/auth/send-otp', methods=['POST', 'OPTIONS'])
def send_otp():
    # ⚠️ MANUAL HANDSHAKE ⚠️
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json()
        phone = data.get('phone')
        
        if not phone:
            return jsonify({"error": "Enter phone number"}), 400

        otp = str(random.randint(1000, 9999))
        otp_storage[phone] = otp
        
        print(f"\n📲 SMS SENT to {phone}: {otp}\n")
        return jsonify({"message": "OTP sent", "demo_otp": otp})

    except Exception as e:
        print(f"❌ Send OTP Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/auth/verify-otp', methods=['POST', 'OPTIONS'])
def verify_otp():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json()
        phone = data.get('phone')
        user_otp = data.get('otp')
        full_name = data.get('fullName', '')
        district = data.get('district', '')

        # 1. Check if OTP matches
        # If the OTP is gone or wrong, return error
        if otp_storage.get(phone) != user_otp:
            return jsonify({"error": "Invalid or Expired OTP"}), 400

        # 2. Database Check
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database Failed"}), 500
            
        cur = conn.cursor()
        cur.execute("SELECT * FROM farmers WHERE phone_number = %s", (phone,))
        farmer = cur.fetchone()

        if farmer:
            # --- SCENARIO A: OLD USER (LOGIN) ---
            # 1. Login is successful
            # 2. Delete OTP now because we are done
            if phone in otp_storage:
                del otp_storage[phone]
                
            user_data = {"id": farmer[0], "name": farmer[2], "phone": farmer[1]}
            msg = "Login Successful"
            
        else:
            # --- SCENARIO B: NEW USER (REGISTER) ---
            if not full_name:
                # We need details! Do NOT delete OTP yet.
                # The user needs to send it back with their name.
                cur.close()
                conn.close()
                return jsonify({"status": "new_user_needs_details"}), 200
            
            # Name provided? Great, register them.
            cur.execute(
                "INSERT INTO farmers (phone_number, full_name, district) VALUES (%s, %s, %s) RETURNING id",
                (phone, full_name, district)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            
            # Registration done! NOW delete OTP.
            if phone in otp_storage:
                del otp_storage[phone]

            user_data = {"id": new_id, "name": full_name, "phone": phone}
            msg = "Registration Successful"

        cur.close()
        conn.close()
        
        return jsonify({"status": "success", "message": msg, "user": user_data})

    except Exception as e:
        print(f"❌ Verify Error: {e}")
        return jsonify({"error": str(e)}), 500

# --- 5. IRRIGATION ROUTE (Keep this working!) ---
@app.route('/irrigation-plan', methods=['POST', 'OPTIONS'])
def irrigation_plan():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    # ... (Your existing logic is fine, keeping it short for copy-paste)
    # If you need the full irrigation code back here, let me know!
    return jsonify({"status": "ok"})

# --- 6. START SERVER ---
if __name__ == '__main__':
    print("🚀 BULLETPROOF SERVER running on Port 5005...")
    app.run(host='0.0.0.0', port=5009, debug=True)