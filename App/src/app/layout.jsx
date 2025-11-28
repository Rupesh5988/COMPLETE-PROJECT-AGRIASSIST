import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Sprout, Menu } from "lucide-react"; 
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/ui/mode-toggle"
// 1. IMPORT THESE
import { LanguageProvider } from "@/components/language-provider"
import { LanguageToggle } from "@/components/ui/language-toggle"

export const metadata = {
  title: "AgriAssist | Smart Farming",
  description: "AI-powered advisory system for modern farmers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background min-h-screen flex flex-col transition-colors duration-300">
        
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* 2. WRAP LANGUAGE PROVIDER INSIDE THEME PROVIDER */}
          <LanguageProvider>
            
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                    <Sprout className="h-6 w-6" />
                  </div>
                  {/* Note: You can translate the App Name too if you want */}
                  <span className="text-xl font-bold text-primary">AgriAssist</span>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* 3. ADD THE LANGUAGE BUTTON HERE */}
                    <LanguageToggle />
                    <ModeToggle />
                    
                    <button className="md:hidden p-2 text-primary">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
              </div>
            </header>

            <div className="flex-1">
              {children}
            </div>

            <Toaster />

          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}