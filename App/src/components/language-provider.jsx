"use client";

import { createContext, useContext, useState } from "react";
import { translations } from "@/lib/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default is 'mr' (Marathi) as you requested
  const [lang, setLang] = useState("mr"); 

  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "mr" : "en"));
  };

  // This helper function gets the text: t("hero_title")
  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);