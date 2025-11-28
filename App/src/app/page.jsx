"use client"; // IMPORTANT: Needs to be a client component to read the language

import { useLanguage } from "@/components/language-provider"; // Import the hook
import { WeatherForecast } from "@/components/dashboard/weather-forecast"; 
import { CropRecommendation } from "@/components/dashboard/crop-prediction"; 
import { FertilizerAdvisory } from "@/components/dashboard/fertilizer-advisory"; 
import { IrrigationAdvisory } from "@/components/dashboard/irrigation-advisory"; 
import { AlertSystem } from "@/components/dashboard/alert-system"; 
import { AgriBot } from "@/components/dashboard/agri-bot"; 
import { Footer } from "@/components/dashboard/Footer"; 

export default function Home() {
  const { t } = useLanguage(); // Get the translation function

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="container mx-auto px-4 py-6 space-y-8 max-w-7xl flex-grow">
        
        {/* HERO */}
        <section id="weather" className="scroll-mt-20">
          <div className="mb-4 flex items-center justify-between">
              {/* TRANSLATED TITLE */}
              <h2 className="text-2xl font-bold text-foreground tracking-tight">{t("hero_title")}</h2>
              
              <a href="#alerts" className="text-xs font-medium bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full hover:bg-emerald-200 transition cursor-pointer flex items-center gap-1">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 {t("live_updates")}
              </a>
          </div>
          <WeatherForecast />
        </section>

        {/* WORKSPACE */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div id="planning" className="lg:col-span-2 space-y-8 scroll-mt-20">
              <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-foreground">{t("section_planning")}</h3>
                  <div className="h-px bg-border flex-1"></div>
              </div>
              
              <div className="grid gap-8">
                  <div className="p-1">
                      {/* You can pass props to these components later to translate their titles too! */}
                      <p className="mb-2 font-semibold text-muted-foreground">{t("card_crop")}</p>
                      <CropRecommendation />
                  </div>
                  
                  <div className="p-1">
                      <p className="mb-2 font-semibold text-muted-foreground">{t("card_fert")}</p>
                      <FertilizerAdvisory />
                  </div>

                  <div className="p-1">
                      <p className="mb-2 font-semibold text-muted-foreground">{t("card_irri")}</p>
                      <IrrigationAdvisory />
                  </div>
              </div>
          </div>

          {/* RIGHT COLUMN */}
          <div id="assistant" className="lg:col-span-1 scroll-mt-20">
               <div className="sticky top-24 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{t("section_expert")}</h3>
                      <div className="h-px bg-border flex-1"></div>
                  </div>
                  <AgriBot />
                  
                  <div id="alerts" className="pt-4 scroll-mt-24">
                      <AlertSystem />
                  </div>
               </div>
          </div>

        </section>

      </main>
      <Footer />
    </div>
  );
}