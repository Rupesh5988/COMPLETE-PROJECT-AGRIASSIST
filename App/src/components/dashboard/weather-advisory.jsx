"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Cloud, CloudFog, CloudRain, CloudSun, Sun, Cloudy, Zap, Snowflake, 
    Loader2, AlertTriangle, ThermometerSun, ThermometerSnowflake, Droplets, Wind 
} from "lucide-react";

const API_URL = "http://127.0.0.1:5000";

// --- 1. Smart Weather Icons Mapping ---
const getWeatherConfig = (code) => {
  // Clear / Sunny
  if ([0, 1].includes(code)) return { icon: Sun, label: "Clear Sky", color: "text-amber-500", bg: "bg-amber-50" };
  // Partly Cloudy
  if ([2].includes(code)) return { icon: CloudSun, label: "Partly Cloudy", color: "text-orange-400", bg: "bg-orange-50" };
  // Overcast
  if ([3].includes(code)) return { icon: Cloudy, label: "Overcast", color: "text-gray-500", bg: "bg-gray-50" };
  // Fog
  if ([45, 48].includes(code)) return { icon: CloudFog, label: "Foggy", color: "text-slate-500", bg: "bg-slate-50" };
  // Rain
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { icon: CloudRain, label: "Rain", color: "text-blue-500", bg: "bg-blue-50" };
  // Snow
  if ([71, 73, 75, 85, 86].includes(code)) return { icon: Snowflake, label: "Snow", color: "text-cyan-500", bg: "bg-cyan-50" };
  // Thunderstorm
  if ([95, 96, 99].includes(code)) return { icon: Zap, label: "Thunderstorm", color: "text-purple-600", bg: "bg-purple-50" };
  
  return { icon: Cloud, label: "Cloudy", color: "text-gray-400", bg: "bg-gray-50" };
};

// --- 2. Smart Warning Logic ---
// --- 2. Smart Warning Logic (IMD Standards) ---
const getAdvisoryWarning = (tempMax, tempMin, rain) => {
    // RAINFALL WARNINGS
    if (rain >= 100) return { level: "critical", msg: "Flash Flood Alert", color: "text-red-700 border-red-300 bg-red-100" };
    if (rain >= 65) return { level: "critical", msg: "Flood Risk", color: "text-red-600 border-red-200 bg-red-50" };
    if (rain >= 35) return { level: "warning", msg: "Heavy Rain", color: "text-orange-600 border-orange-200 bg-orange-50" };
    if (rain >= 15) return { level: "caution", msg: "Excess Rain", color: "text-yellow-600 border-yellow-200 bg-yellow-50" }; 
    // ^^^ Changed "Flood Risk" to "Excess Rain" for 15mm. 
    // In winter, 15mm is unseasonal/excess, but not a flood.

    // TEMPERATURE WARNINGS
    if (tempMax >= 40) return { level: "critical", msg: "Heatwave Alert", color: "text-red-600 border-red-200 bg-red-50" };
    if (tempMax >= 36) return { level: "warning", msg: "High Heat", color: "text-orange-600 border-orange-200 bg-orange-50" };
    if (tempMin <= 8) return { level: "warning", msg: "Cold Wave", color: "text-blue-600 border-blue-200 bg-blue-50" };
    
    return { level: "safe", msg: "Normal Conditions", color: "text-emerald-600 border-emerald-200 bg-emerald-50" };
};

export function WeatherAdvisory() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
        setError("Browser does not support geolocation.");
        setLoading(false);
        return;
    }

    // Force High Accuracy GPS
    const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
            const res = await fetch(`${API_URL}/get_weather_and_predict?lat=${latitude}&lon=${longitude}`);
            if (!res.ok) throw new Error("Could not fetch weather data.");
            
            const data = await res.json();
            const { weather, predictions } = data;

            // Transform Data for UI
            const dailyData = weather.daily.time.slice(0, 5).map((date, i) => {
                const maxT = Math.round(weather.daily.temperature_2m_max[i]);
                const minT = Math.round(weather.daily.temperature_2m_min[i]);
                const rain = predictions[i].predicted_rainfall_mm;
                const weatherCode = weather.daily.weather_code[i];
                
                return {
                    day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
                    date: new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
                    tempMax: maxT,
                    tempMin: minT,
                    rain: rain,
                    weatherConfig: getWeatherConfig(weatherCode),
                    warning: getAdvisoryWarning(maxT, minT, rain)
                };
            });

            setForecast(dailyData);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, (err) => {
        setError("Location access denied. Please enable GPS.");
        setLoading(false);
    }, options);
  }, []);

  if (loading) return <Card className="p-8 flex justify-center"><Loader2 className="animate-spin" /> <span className="ml-2">Analyzing satellite data...</span></Card>;
  if (error) return <Card className="p-8 flex justify-center text-red-500"><AlertTriangle /> <span className="ml-2">{error}</span></Card>;
  if (!forecast) return null;

  return (
    <Card className="w-full shadow-lg border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2 text-blue-800">
            <CloudRain className="w-6 h-6" /> 5-Day Weather & Rainfall Advisory
        </CardTitle>
        <CardDescription>Real-time satellite temperature & AI rainfall prediction.</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {forecast.map((day, idx) => (
                <div key={idx} className={`flex flex-col justify-between p-3 border rounded-xl shadow-sm transition-all hover:shadow-md ${day.weatherConfig.bg}`}>
                    
                    {/* Header: Date */}
                    <div className="text-center mb-2 border-b pb-2 border-black/5">
                        <p className="font-bold text-lg text-slate-800">{day.day}</p>
                        <p className="text-xs text-slate-500">{day.date}</p>
                    </div>

                    {/* Icon & Condition */}
                    <div className="flex flex-col items-center gap-1 my-2">
                        <day.weatherConfig.icon className={`w-10 h-10 ${day.weatherConfig.color}`} />
                        <span className={`text-xs font-semibold ${day.weatherConfig.color}`}>{day.weatherConfig.label}</span>
                    </div>

                    {/* Temperature High/Low */}
                    <div className="flex justify-between items-center bg-white/60 rounded-lg p-2 mb-2">
                        <div className="flex flex-col items-center">
                            <ThermometerSun className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-bold">{day.tempMax}°</span>
                        </div>
                        <div className="w-[1px] h-6 bg-gray-300"></div>
                        <div className="flex flex-col items-center">
                            <ThermometerSnowflake className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-bold">{day.tempMin}°</span>
                        </div>
                    </div>

                    {/* AI Rain Prediction */}
                    <div className="flex items-center justify-between bg-white/60 rounded-lg p-2 mb-2">
                         <div className="flex items-center gap-1">
                            <Droplets className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-slate-600">Rain</span>
                         </div>
                         <span className="text-sm font-bold text-blue-700">{day.rain} mm</span>
                    </div>

                    {/* Warning Badge */}
                    <div className={`flex items-center justify-center gap-1 py-1 px-2 rounded-md border text-xs font-bold ${day.warning.color}`}>
                        {day.warning.level !== "safe" ? <AlertTriangle className="w-3 h-3" /> : null}
                        {day.warning.msg}
                    </div>

                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}