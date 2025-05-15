import { createContext, useContext, useState } from "react";
import i18n from "@/lib/i18n";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language || "id");

  const toggleLanguage = () => {
    const newLang = language === "id" ? "en" : "id";
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
