"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Cloud, CloudFog, CloudRain, CloudSun, Sun, Cloudy, Zap, Snowflake, 
    Loader2, AlertTriangle, ThermometerSun, ThermometerSnowflake, Droplets, Wind, MapPin
} from "lucide-react";

const API_URL = "http://127.0.0.1:5003";

// --- 1. Weather Icons ---
const getWeatherConfig = (code) => {
  if ([0, 1].includes(code)) return { icon: Sun, label: "Clear", color: "text-amber-500", bg: "bg-amber-50" };
  if ([2].includes(code)) return { icon: CloudSun, label: "Partly Cloudy", color: "text-orange-400", bg: "bg-orange-50" };
  if ([3].includes(code)) return { icon: Cloudy, label: "Overcast", color: "text-gray-500", bg: "bg-gray-50" };
  if ([45, 48].includes(code)) return { icon: CloudFog, label: "Fog", color: "text-slate-500", bg: "bg-slate-50" };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { icon: CloudRain, label: "Rain", color: "text-blue-500", bg: "bg-blue-50" };
  if ([71, 73, 75, 85, 86].includes(code)) return { icon: Snowflake, label: "Snow", color: "text-cyan-500", bg: "bg-cyan-50" };
  if ([95, 96, 99].includes(code)) return { icon: Zap, label: "Storm", color: "text-purple-600", bg: "bg-purple-50" };
  return { icon: Cloud, label: "Cloudy", color: "text-gray-400", bg: "bg-gray-50" };
};

// --- 2. Smart Warning Logic (IMD Standards) ---
const getAdvisoryWarning = (tempMax, tempMin, rain) => {
    // Rain Warnings
    if (rain >= 100) return { level: "critical", msg: "Flash Flood", color: "text-red-700 bg-red-100 border-red-200" };
    if (rain >= 65) return { level: "critical", msg: "Flood Risk", color: "text-red-600 bg-red-50 border-red-200" };
    if (rain >= 35) return { level: "warning", msg: "Heavy Rain", color: "text-orange-600 bg-orange-50 border-orange-200" };
    if (rain >= 10) return { level: "caution", msg: "Excess Rain", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
    
    // Temp Warnings
    if (tempMax >= 40) return { level: "critical", msg: "Heatwave", color: "text-red-600 bg-red-50 border-red-200" };
    if (tempMin <= 8) return { level: "warning", msg: "Cold Wave", color: "text-blue-600 bg-blue-50 border-blue-200" };
    
    return { level: "safe", msg: "Normal Conditions", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
};

export function WeatherForecast() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
        setError("Geolocation needed."); 
        setLoading(false); 
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`${API_URL}/weather?lat=${latitude}&lon=${longitude}`);
            if (!res.ok) throw new Error("API Connection Error");
            const jsonData = await res.json();
            setData(jsonData);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    });
  }, []);

  if (loading) return (
    <Card className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading Forecast...</span>
    </Card>
  );

  if (error) return <Card className="p-6 text-red-500 bg-red-50">Error: {error}</Card>;
  if (!data) return null;

  return (
    <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-900/5">
      
      {/* --- HERO HEADER --- */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center gap-2 text-blue-100 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Local Field Sensor</span>
                </div>
                <h2 className="text-5xl font-bold tracking-tight">{data.current.temp}°</h2>
                <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-blue-100">
                        <Droplets className="w-4 h-4" /> 
                        <span className="text-sm font-medium">{data.current.humidity}% Humidity</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-100">
                        <Wind className="w-4 h-4" /> 
                        <span className="text-sm font-medium">{data.current.wind} km/h</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className="text-lg font-semibold">{data.daily_stats.rain_mm}mm Rain Today</p>
                <p className="text-blue-100 text-sm">High: {Math.round(data.daily_stats.max_temp)}° Low: {Math.round(data.daily_stats.min_temp)}°</p>
            </div>
        </div>
      </div>

      {/* --- 5-DAY CARDS (The Feature You Wanted Back) --- */}
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {data.forecast.time.slice(0, 5).map((date, idx) => {
                const maxT = Math.round(data.forecast.temperature_2m_max[idx]);
                const minT = Math.round(data.forecast.temperature_2m_min[idx]);
                const rain = data.forecast.precipitation_sum[idx];
                const weatherConf = getWeatherConfig(data.forecast.weather_code[idx]);
                const warning = getAdvisoryWarning(maxT, minT, rain);
                const Icon = weatherConf.icon;

                return (
                    <div key={idx} className={`flex flex-col justify-between p-3 border rounded-xl shadow-sm hover:shadow-md transition-all ${weatherConf.bg}`}>
                        
                        {/* Date Header */}
                        <div className="text-center mb-2 pb-2 border-b border-black/5">
                            <p className="font-bold text-slate-800">
                                {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                            </p>
                            <p className="text-xs text-slate-500">
                                {new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                            </p>
                        </div>

                        {/* Icon */}
                        <div className="flex flex-col items-center gap-1 my-2">
                            <Icon className={`w-10 h-10 ${weatherConf.color}`} />
                            <span className={`text-xs font-bold ${weatherConf.color}`}>{weatherConf.label}</span>
                        </div>

                        {/* Temps */}
                        <div className="flex justify-between items-center bg-white/60 rounded-lg p-2 mb-2">
                            <div className="flex items-center gap-1 text-red-500">
                                <ThermometerSun className="w-3 h-3" /> <span className="text-sm font-bold">{maxT}°</span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-500">
                                <ThermometerSnowflake className="w-3 h-3" /> <span className="text-sm font-bold">{minT}°</span>
                            </div>
                        </div>

                        {/* Rainfall Amount */}
                        <div className="flex items-center justify-between bg-white/60 rounded-lg p-2 mb-2">
                             <div className="flex items-center gap-1">
                                <Droplets className="w-3 h-3 text-blue-600" />
                                <span className="text-xs text-slate-600">Rain</span>
                             </div>
                             <span className="text-sm font-bold text-blue-700">{rain}mm</span>
                        </div>

                        {/* Warning Badge */}
                        <div className={`text-center py-1 rounded border text-[10px] font-bold uppercase tracking-wide ${warning.color}`}>
                            {warning.msg}
                        </div>

                    </div>
                );
            })}
        </div>
      </CardContent>
    </Card>
  );
}