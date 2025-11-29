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
# ... (Previous code)

# --- 5. ROUTE: AI RISK GUARDIAN (The Innovation) ---
# --- 5. ROUTE: AI RISK GUARDIAN (AUTO & MARATHI) ---
@app.route('/alerts/check-risk', methods=['POST', 'OPTIONS'])
def check_risk():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    try:
        # 1. Fetch Real Weather (Sangli)
        lat, lon = 16.8, 74.6
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=precipitation_sum,wind_speed_10m_max,temperature_2m_max&timezone=auto"
        w = requests.get(weather_url).json()
        
        rain = w['daily']['precipitation_sum'][0]
        wind = w['daily']['wind_speed_10m_max'][0]
        temp = w['daily']['temperature_2m_max'][0]

        print(f"🔎 Checking Risk: Rain {rain}mm, Wind {wind}km/h, Temp {temp}C")

        # 2. ASK GEMINI (Always Marathi)
        prompt = f"""
        Analyze this weather for a farmer in Maharashtra.
        Weather: Rain {rain}mm, Wind {wind}km/h, Temp {temp}°C.
        
        Task:
        1. Determine Risk Level: 'SAFE', 'MODERATE', or 'CRITICAL'.
        2. Write a short SMS message in **MARATHI** (Max 15 words).
           - If SAFE: Write a reassuring message (e.g., "हवामान सुरक्षित आहे. शेतीची कामे चालू ठेवा.").
           - If RISK: Write a warning message.

        Output JSON ONLY:
        {{
            "level": "SAFE",
            "sms_text": "मराठी संदेश"
        }}
        """
        
        response = model.generate_content(prompt)
        cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
        analysis = json.loads(cleaned_text)

        # 3. AUTO-SEND SMS IF RISK IS FOUND
        sent_count = 0
        if analysis['level'] in ['MODERATE', 'CRITICAL']:
            conn = get_db_connection()
            if conn:
                cur = conn.cursor()
                cur.execute("SELECT phone_number FROM farmers")
                numbers = cur.fetchall()
                
                for num in numbers:
                    phone = num[0]
                    print(f"🚨 URGENT SMS to {phone}: {analysis['sms_text']}")
                    sent_count += 1
                
                cur.close()
                conn.close()

        return jsonify({
            "status": "success", 
            "risk_level": analysis['level'], 
            "message_sent": analysis['sms_text'], # Now always Marathi
            "farmers_alerted": sent_count
        })

    except Exception as e:
        print(f"❌ Alert Error: {e}")
        return jsonify({"error": str(e)}), 500

# ... (app.run is here)

# --- 6. START SERVER ---
if __name__ == '__main__':
    print("🚀 BULLETPROOF SERVER running on Port 5005...")
    app.run(host='0.0.0.0', port=5009, debug=True)