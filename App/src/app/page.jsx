<<<<<<< HEAD
import { WeatherForecast } from "@/components/dashboard/weather-forecast"; 
import { CropRecommendation } from "@/components/dashboard/crop-prediction"; 
import { FertilizerAdvisory } from "@/components/dashboard/fertilizer-advisory"; 
import { IrrigationAdvisory } from "@/components/dashboard/irrigation-advisory"; 
import { AlertSystem } from "@/components/dashboard/alert-system"; 
import { AgriBot } from "@/components/dashboard/agri-bot"; // NEW COMPONENT

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
      
      {/* 1. HERO: WEATHER (Full Width) */}
      <section>
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Farm Overview</h2>
            <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                Live Updates
            </span>
=======
import { DashboardHeader } from "@/components/dashboard/header";
import { WeatherForecast } from "@/components/dashboard/weather-forecast";
import { WeatherAdvisory } from "@/components/dashboard/weather-advisory";
import { CropPrediction } from "@/components/dashboard/crop-prediction";
import { FertilizerAdvisory } from "@/components/dashboard/fertilizer-advisory";
import { IrrigationAdvisory } from "@/components/dashboard/irrigation-advisory";
import ChatAgent from "@/components/dashboard/chat-agent";
import { AlertSystem } from "@/components/dashboard/alert-system";
import { ExpertTalk } from "@/components/dashboard/expert-talk";
import { Footer } from "@/components/dashboard/footer";

export default function Home() {
  return ( 
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <WeatherForecast />
          </div>
          <div className="lg:col-span-3">
            <WeatherAdvisory />
          </div>
          <div className="lg:col-span-1">
            <CropPrediction />
          </div>
          <div className="lg:col-span-1">
            <FertilizerAdvisory />
          </div>
          <div className="lg:col-span-1">
            <IrrigationAdvisory />
          </div>
          <div className="lg:col-span-3">
            <ChatAgent/>
          </div>
          <div className="lg:col-span-3">
            <AlertSystem />
          </div>
           <div className="lg:col-span-3">
             <ExpertTalk />
          </div>
          <div className="lg:col-span-3">
             <Footer />
          </div>

>>>>>>> 9947ffd8022daa817aa6bd3cf854fbdfcf2a7abb
        </div>
        <WeatherForecast />
      </section>

      {/* 2. MAIN WORKSPACE (Tools + Chat) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: THE TOOLBOX (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-slate-700">Planning Tools</h3>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            
            {/* We stack these vertically so they have room to breathe */}
            <div className="grid gap-8">
                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    <CropRecommendation />
                </div>
                
                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    <FertilizerAdvisory />
                </div>

                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    <IrrigationAdvisory />
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: AGRIBOT (Span 1) */}
        <div className="lg:col-span-1">
             <div className="sticky top-24 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-slate-700">Expert Assistant</h3>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                <AgriBot />
                
                {/* Alert System fits nicely under the chat on desktop */}
                <div className="pt-4">
                    <AlertSystem />
                </div>
             </div>
        </div>

      </section>

    </main>
  );
}