"use client";

import { useState, useEffect } from "react"; // Added useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck, RefreshCw, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Ensure this matches your backend port!
const API_URL = "http://127.0.0.1:5009/alerts/check-risk";

export function AlertSystem() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("SAFE"); 
  const [message, setMessage] = useState("तपासत आहे..."); // "Checking..." in Marathi

  const checkRisk = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Added proper headers
      });
      
      if (!res.ok) throw new Error("Server Error");

      const data = await res.json();
      
      setStatus(data.risk_level);
      setMessage(data.message_sent); // Always use the Marathi message from backend
      
      // Notify user visually
      if (data.risk_level !== "SAFE") {
        toast({ 
            title: `⚠️ ${data.risk_level} ALERT`, 
            description: `Alert sent to ${data.farmers_alerted} farmers.`,
            variant: "destructive" 
        });
      }
    } catch (e) {
      console.error(e);
      setMessage("कनेक्शन अयशस्वी. (Connection Failed)");
    } finally {
      setLoading(false);
    }
  };

  // ✅ AUTOMATIC TRIGGER: Run once when page loads
  useEffect(() => {
    checkRisk();
  }, []);

  // Color logic
  const getColors = () => {
    if (status === "CRITICAL") return "bg-red-50 border-red-200 text-red-800";
    if (status === "MODERATE") return "bg-amber-50 border-amber-200 text-amber-800";
    return "bg-emerald-50 border-emerald-200 text-emerald-800";
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base font-medium text-slate-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            AI Field Guardian
          </div>
          {/* Pulse animation to show it's active */}
          <span className={`flex h-2 w-2 rounded-full ${loading ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className={`rounded-lg border p-4 ${getColors()} transition-colors duration-500`}>
          <div className="flex items-start gap-3">
            {status === "SAFE" ? <ShieldCheck className="h-5 w-5 mt-0.5" /> : <AlertTriangle className="h-5 w-5 mt-0.5" />}
            <div>
              <p className="font-semibold text-sm">Status: {status}</p>
              <p className="text-sm mt-1 opacity-90 font-medium">
                {message}
              </p>
            </div>
          </div>
        </div>

        <Button 
            onClick={checkRisk} 
            disabled={loading}
            variant="outline" 
            className="w-full mt-4 text-xs h-9 gap-2 border-slate-200 hover:bg-slate-50"
        >
            {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            {loading ? "Analyzing..." : "Re-Check Risk"}
        </Button>
      </CardContent>
    </Card>
  );
}