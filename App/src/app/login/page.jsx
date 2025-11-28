"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // To redirect after login
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, Loader2, Phone, Lock, User, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast"; // Assuming you have shadcn toast

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP/Details
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Form Data
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [district, setDistrict] = useState("");

  // --- STEP 1: SEND OTP ---
  const handleSendOtp = async () => {
    if (phone.length < 10) return alert("Please enter a valid mobile number");
    
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5009/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      
      if (res.ok) {
        setStep(2);
        toast({ title: "OTP Sent!", description: "Check your messages." });
      }
    } catch (error) {
      alert("Server error. Is Python running?");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP ---
  // --- STEP 2: VERIFY OTP ---
  const handleVerify = async () => {
    setLoading(true);
    try {
      // (Your fetch code remains the same...)
      const res = await fetch("http://127.0.0.1:5009/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, fullName, district }),
      });
      
      const data = await res.json();

      if (data.status === "new_user_needs_details") {
        setIsNewUser(true);
        toast({ title: "Almost there!", description: "Please enter your name." });
        setLoading(false);
        return;
      }

      if (data.status === "success") {
        // Save user to LocalStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({ title: "Success", description: "Logging you in..." });
        
        // ⚠️ THE FIX: Force a hard refresh so the Navbar updates!
        window.location.href = "/"; 
        
      } else {
        alert(data.error || "Invalid OTP");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-emerald-100">
        <CardHeader className="text-center space-y-2">
          <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl text-emerald-800">AgriAssist Login</CardTitle>
          <CardDescription>
            {step === 1 ? "Enter your mobile number to get started" : "Enter the verification code sent to your mobile"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          
          {/* --- STEP 1: PHONE INPUT --- */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Mobile Number (e.g., 9876543210)" 
                  className="pl-9"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button onClick={handleSendOtp} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
              </Button>
            </div>
          )}

          {/* --- STEP 2: OTP & DETAILS --- */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Enter 4-digit OTP" 
                  className="pl-9"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              {/* If New User, show these extra fields */}
              {isNewUser && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Full Name" 
                      className="pl-9"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="District (e.g. Sangli)" 
                      className="pl-9"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button onClick={handleVerify} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : (isNewUser ? "Register & Login" : "Verify OTP")}
              </Button>
              
              <p className="text-xs text-center text-slate-500 cursor-pointer hover:underline" onClick={() => setStep(1)}>
                Wrong number? Go back
              </p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}