"use client"; // We need client features for auth state

import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Sprout, Menu, LogIn, User, LogOut } from "lucide-react"; 
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { LanguageProvider } from "@/components/language-provider"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Metadata needs to be in a separate file or handled differently in "use client" components, 
// but for simplicity in this file structure, we will omit the export metadata here 
// since we switched to "use client". Next.js usually wants metadata in a separate layout 
// or page file, but this will work for dev.
// ... imports

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);

  // ✅ THIS CODE CHECKS FOR THE NAME
  useEffect(() => {
    // We wrap this in a try-catch to prevent errors if data is corrupted
    try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
    } catch (e) {
        console.error("Failed to load user", e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/"; // Refresh on logout too
  };

  // ... (rest of the code)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <title>AgriAssist | Smart Farming</title>
      </head>
      <body className="font-sans antialiased bg-background min-h-screen flex flex-col transition-colors duration-300">
        
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            
            {/* --- NAVBAR --- */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2">
                  <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                    <Sprout className="h-6 w-6" />
                  </div>
                  <span className="text-xl font-bold text-primary">AgriAssist</span>
                </Link>
                
                <div className="flex items-center gap-3">
                    <LanguageToggle />
                    <ModeToggle />
                    
                    {/* --- SMART AUTH BUTTON --- */}
                    {user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-800">
                            <User className="w-4 h-4" />
                            <span className="hidden md:inline">{user.name}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>My Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" /> Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Link href="/login">
                        <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                          <LogIn className="w-4 h-4" />
                          <span className="hidden md:inline">Login</span>
                        </Button>
                      </Link>
                    )}

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