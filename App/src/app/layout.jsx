import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Sprout, Menu } from "lucide-react"; 

export const metadata = {
  title: "AgriAssist | Smart Farming",
  description: "AI-powered advisory system for modern farmers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background min-h-screen flex flex-col">
        
        {/* --- NAVBAR (Simple & Clean) --- */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg text-white">
                <Sprout className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-primary">AgriAssist</span>
            </div>
            
            {/* Mobile Menu Icon (Placeholder) */}
            <button className="md:hidden p-2 text-primary">
                <Menu className="h-6 w-6" />
            </button>

            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                <a href="#" className="hover:text-primary transition-colors">Dashboard</a>
                <a href="#" className="hover:text-primary transition-colors">Weather</a>
                <a href="#" className="hover:text-primary transition-colors">Market</a>
                <a href="#" className="hover:text-primary transition-colors">Profile</a>
            </nav>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1">
          {children}
        </div>

        <Toaster />
      </body>
    </html>
  );
}