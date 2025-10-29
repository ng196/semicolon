import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/features/landing/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>(() => {
    // Get language from localStorage or default to 'en'
    return localStorage.getItem('saksham_language') || 'en';
  });

  const t = (key: string): string => {
    // Get translation for the current language, fallback to English, then to key itself
    return translations[key]?.[language as 'en' | 'hi'] || translations[key]?.['en'] || key;
  };

  useEffect(() => {
    // Persist language preference to localStorage
    localStorage.setItem('saksham_language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
