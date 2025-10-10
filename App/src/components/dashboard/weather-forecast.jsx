"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Leaf,
} from "lucide-react";

// The URL of your running Flask API
const API_URL = "http://127.0.0.1:5003";

// --- Helper function to map WMO weather codes to icons and descriptions ---
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

// --- Helper function to format the API data for our component ---
const transformApiData = (apiData) => {
  // Current weather
  const { icon: currentIcon, condition: currentCondition } = getWeatherInfo(
    apiData.current.weather_code
  );
  const current = {
    location: "Your Current Location", // We'll use a generic name
    temp: Math.round(apiData.current.temperature_2m),
    condition: currentCondition,
    icon: currentIcon,
  };

  // 5-day forecast
  const forecast = apiData.daily.time.slice(1, 6).map((date, index) => {
    const { icon: dayIcon } = getWeatherInfo(
      apiData.daily.weather_code[index + 1]
    );
    return {
      day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      temp: Math.round(apiData.daily.temperature_2m_max[index + 1]),
      icon: dayIcon,
    };
  });

  return { current, forecast, advice: apiData.agricultural_advice };
};

export function WeatherForecast() {
  // State to hold weather data, loading status, and errors
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect runs once when the component loads to fetch data
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    // 1. Get user's current location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 2. Fetch data from our Flask API
          const response = await fetch(
            `${API_URL}/weather?lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch weather data from the server.");
          }
          const apiData = await response.json();

          // 3. Transform the API data into the format our component needs
          const formattedData = transformApiData(apiData);
          setWeatherData(formattedData);
        } catch (e) {
          setError(e.message);
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setError("Location access denied. Please enable it to see the weather.");
        setIsLoading(false);
      }
    );
  }, []); // The empty array [] means this effect runs only once

  // --- Conditional Rendering ---
  if (isLoading) {
    return (
      <Card className="flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="ml-4 text-muted-foreground">Fetching your local forecast...</p>
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
  
  if (!weatherData) return null; // Should not happen, but good practice

  // --- Main Component UI ---
  const CurrentIcon = weatherData.current.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CurrentIcon className="w-6 h-6 text-primary" />
          Weather Forecast
        </CardTitle>
        <CardDescription>{weatherData.current.location}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <CurrentIcon className="w-16 h-16 text-primary" />
          <div>
            <div className="text-5xl font-bold">
              {weatherData.current.temp}°C
            </div>
            <div className="text-muted-foreground">
              {weatherData.current.condition}
            </div>
          </div>
        </div>
        <div className="flex gap-4 sm:gap-6">
          {weatherData.forecast.map((day) => {
            const DayIcon = day.icon;
            return (
              <div key={day.day} className="flex flex-col items-center gap-1">
                <div className="font-medium text-muted-foreground">{day.day}</div>
                <DayIcon className="w-8 h-8 text-muted-foreground" />
                <div className="font-bold">{day.temp}°</div>
              </div>
            );
          })}
        </div>
      </CardContent>
      {/* NEW: Section for Agricultural Advice */}
      <CardFooter>
          <div className="flex items-center gap-3 text-sm text-primary bg-primary/10 p-3 rounded-lg w-full">
            <Leaf className="w-5 h-5 flex-shrink-0"/>
            <div>
              <h4 className="font-bold">Today's Irrigation Advice</h4>
              <p className="text-primary/90">{weatherData.advice}</p>
            </div>
          </div>
      </CardFooter>
    </Card>
  );
}