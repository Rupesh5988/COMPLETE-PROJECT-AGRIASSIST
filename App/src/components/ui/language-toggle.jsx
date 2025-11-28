"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleLanguage}
      className="gap-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700"
    >
      <Languages className="w-4 h-4" />
      {lang === "en" ? "मराठी" : "English"}
    </Button>
  );
}