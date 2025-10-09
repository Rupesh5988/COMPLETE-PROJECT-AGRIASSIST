"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cloud, CloudFog, CloudRain, CloudSun, Sun } from "lucide-react";

const weatherData = {
  current: {
    location: "Green Valley, CA",
    temp: 22,
    condition: "Partly Cloudy",
    icon: CloudSun,
  },
  forecast: [
    { day: "Mon", temp: 24, icon: Sun },
    { day: "Tue", temp: 21, icon: CloudSun },
    { day: "Wed", temp: 19, icon: CloudRain },
    { day: "Thu", temp: 20, icon: Cloud },
    { day: "Fri", temp: 18, icon: CloudFog },
  ],
};

export function WeatherAdvisory() {
  const CurrentIcon = weatherData.current.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CurrentIcon className="w-6 h-6 text-accent" />
          Weather Advisory
        </CardTitle>

      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          
        </div>
      </CardContent>
    </Card>
  );
}
