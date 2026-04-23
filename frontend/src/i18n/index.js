import storage, { STORAGE_KEYS } from '../utils/storage';

// Import translations
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import nl from './locales/nl.json';
import pt from './locales/pt.json';

const translations = {
  en,
  es,
  fr,
  nl,
  pt,
};

let currentLocale = 'en';

// Initialize language from storage
export const initializeLanguage = async () => {
  try {
    const savedLanguage = await storage.getItem(STORAGE_KEYS.LANGUAGE);
    if (savedLanguage && translations[savedLanguage]) {
      currentLocale = savedLanguage;
    }
  } catch (error) {
    console.warn('Failed to load language preference:', error);
  }
};

// Change language
export const changeLanguage = async (languageCode) => {
  if (translations[languageCode]) {
    currentLocale = languageCode;
    await storage.setItem(STORAGE_KEYS.LANGUAGE, languageCode);
  }
};

// Get current locale
export const getCurrentLocale = () => currentLocale;

// Translate function
export const t = (key, params = {}) => {
  const keys = key.split('.');
  let value = translations[currentLocale];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  // Replace parameters
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/{{(\w+)}}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  }
  
  return value || key;
};

export default { t, initializeLanguage, changeLanguage, getCurrentLocale };
