"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
    AlertTriangle, Bell, ShieldCheck, Wind, Droplets, Thermometer, 
    Bug, Siren, Loader2, X 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_URL = "http://127.0.0.1:5003";

export function AlertSystem() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
        setError("Location access needed for alerts.");
        setLoading(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`${API_URL}/get_alerts?lat=${latitude}&lon=${longitude}`);
            if (!res.ok) throw new Error("Connection failed");
            const data = await res.json();
            setAlerts(data.alerts);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    });
  }, []);

  // --- Helper to style alerts based on severity ---
  const getAlertStyle = (type) => {
    switch (type) {
        case "critical": return { 
            bg: "bg-red-50", border: "border-red-200", icon: Siren, color: "text-red-600", badge: "destructive" 
        };
        case "warning": return { 
            bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle, color: "text-amber-600", badge: "default" // Using default as orange-ish 
        };
        case "info": return { 
            bg: "bg-blue-50", border: "border-blue-200", icon: Bug, color: "text-blue-600", badge: "secondary" 
        };
        default: return { 
            bg: "bg-gray-50", border: "border-gray-200", icon: Bell, color: "text-gray-600", badge: "outline" 
        };
    }
  };

  if (loading) return (
    <Card className="border-dashed flex flex-col items-center justify-center p-8 text-muted-foreground animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        <span className="text-sm">Scanning satellite data...</span>
    </Card>
  );

  return (
    <Card className="h-full border-0 shadow-lg ring-1 ring-slate-900/5 relative overflow-hidden">
      <CardHeader className="bg-slate-900 text-white pb-8">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
                <div className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                </div>
                Live Alert System
            </CardTitle>
            <span className="text-xs font-mono opacity-70 bg-slate-800 px-2 py-1 rounded">
                REAL-TIME
            </span>
        </div>
      </CardHeader>

      <CardContent className="-mt-6 space-y-3 px-4 pb-4">
        {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <X className="w-4 h-4" /> {error}
            </div>
        )}

        {/* --- STATE: ALL CLEAR (The "Happy Path") --- */}
        {!error && alerts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-xl border shadow-sm">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800">All Clear</h3>
                <p className="text-sm text-slate-500 px-6">
                    No immediate weather or pest threats detected in your area.
                </p>
            </div>
        )}

        {/* --- STATE: ACTIVE ALERTS --- */}
        {alerts.map((alert) => {
            const style = getAlertStyle(alert.type);
            const Icon = style.icon;

            return (
                <div 
                    key={alert.id} 
                    className={`relative p-4 rounded-xl border ${style.bg} ${style.border} transition-all hover:scale-[1.02] shadow-sm`}
                >
                    <div className="flex items-start gap-4">
                        <div className={`p-2 bg-white rounded-lg shadow-sm ${style.color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-bold text-sm ${style.color}`}>{alert.title}</h4>
                                <Badge variant={style.badge} className="text-[10px] h-5 px-1.5 uppercase">
                                    {alert.type}
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {alert.desc}
                            </p>
                        </div>
                    </div>
                </div>
            );
        })}
      </CardContent>
    </Card>
  );
}