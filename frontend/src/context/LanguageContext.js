import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeLanguage, changeLanguage as changeI18nLanguage, getCurrentLocale } from '../i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      await initializeLanguage();
      const currentLocale = getCurrentLocale();
      setLocale(currentLocale);
    } catch (error) {
      console.error('Failed to load language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      await changeI18nLanguage(languageCode);
      setLocale(languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const value = {
    locale,
    changeLanguage,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
