"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Cloud,
  CloudFog,
  CloudRain,
  CloudSun,
  Sun,
  Cloudy,
  Zap,
  Snowflake,
  Loader2,
  AlertCircle,
  Thermometer, // For temperature
  Droplets,   // For rainfall
} from "lucide-react";

// The URL of your running Flask API
const API_URL = "http://127.0.0.1:5000";

// --- Helper function to map WMO weather codes to icons ---
const getWeatherInfo = (code) => {
  if ([0, 1].includes(code)) return { icon: Sun, condition: "Clear" };
  if ([2].includes(code)) return { icon: CloudSun, condition: "Partly Cloudy" };
  if ([3].includes(code)) return { icon: Cloudy, condition: "Overcast" };
  if ([45, 48].includes(code)) return { icon: CloudFog, condition: "Fog" };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return { icon: CloudRain, condition: "Rain" };
  if ([71, 73, 75, 85, 86].includes(code))
    return { icon: Snowflake, condition: "Snow" };
  if ([95, 96, 99].includes(code))
    return { icon: Zap, condition: "Thunderstorm" };
  return { icon: Cloud, condition: "Cloudy" };
};

// --- NEW: Helper function to describe rainfall amount ---
const getRainfallInfo = (rainfall_mm) => {
    if (rainfall_mm <= 0.1) return { text: "Dry", color: "text-slate-500" };
    if (rainfall_mm <= 2.5) return { text: "Light Rain", color: "text-blue-400" };
    if (rainfall_mm <= 10) return { text: "Moderate Rain", color: "text-blue-600" };
    return { text: "Heavy Rain", color: "text-blue-800" };
}

// --- NEW: Helper function to format the combined API data ---
const transformAdvisoryData = (apiData) => {
  const { weather, predictions } = apiData;

  // We'll create a 7-day advisory starting from today
  const advisory = weather.daily.time.map((date, index) => {
    const { icon: WeatherIcon } = getWeatherInfo(weather.daily.weather_code[index]);
    const predictedRainfall = predictions[index].predicted_rainfall_mm;
    
    return {
      day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      date: new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      WeatherIcon,
      temp: Math.round(weather.daily.temperature_2m_max[index]),
      predictedRainfall: predictedRainfall,
      rainfallInfo: getRainfallInfo(predictedRainfall),
    };
  });

  return advisory;
};

export function WeatherAdvisory() {
  const [advisoryData, setAdvisoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Fetch from the new all-in-one endpoint
          const response = await fetch(
            `${API_URL}/get_weather_and_predict?lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch advisory data from the server.");
          }
          const apiData = await response.json();

          // Transform the new data structure
          const formattedData = transformAdvisoryData(apiData);
          setAdvisoryData(formattedData.slice(0, 5)); // Let's show a 5-day forecast
        } catch (e) {
          setError(e.message);
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setError("Location access denied. Please enable it to see the advisory.");
        setIsLoading(false);
      }
    );
  }, []); // The empty array [] means this effect runs only once

  // --- Conditional Rendering ---
  if (isLoading) {
    return (
      <Card className="flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="ml-4 text-muted-foreground">Generating Local Weather & Rain Advisory...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex items-center justify-center p-10 bg-destructive/10">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="ml-4 text-destructive font-medium">{error}</p>
      </Card>
    );
  }
  
  if (!advisoryData) return null;

  // --- Main Component UI ---
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudRain className="w-6 h-6 text-primary" />
          Weather & Rainfall Advisory
        </CardTitle>
        <CardDescription>5-Day forecast with AI-powered rainfall prediction for your location.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {advisoryData.map((day) => {
            const { WeatherIcon } = day;
            return (
              <div 
                key={day.date} 
                className="flex flex-col items-center justify-between p-4 border rounded-lg bg-background/50 text-center gap-3"
              >
                {/* Day and Date */}
                <div>
                    <p className="font-bold text-lg">{day.day}</p>
                    <p className="text-sm text-muted-foreground">{day.date}</p>
                </div>
                
                {/* Weather Icon */}
                <WeatherIcon className="w-12 h-12 text-yellow-500" />
                
                {/* Temperature */}
                <div className="flex items-center gap-2 text-xl font-semibold">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    <span>{day.temp}°C</span>
                </div>

                {/* AI Rainfall Prediction */}
                <div className="flex flex-col items-center gap-2 mt-2 p-2 bg-blue-500/10 rounded-md w-full">
                    <div className="flex items-center gap-2">
                        <Droplets className={`w-5 h-5 ${day.rainfallInfo.color}`} />
                        <span className={`font-bold text-lg ${day.rainfallInfo.color}`}>
                            {day.predictedRainfall} mm
                        </span>
                    </div>
                    <p className={`text-sm font-medium ${day.rainfallInfo.color}`}>
                        {day.rainfallInfo.text}
                    </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}