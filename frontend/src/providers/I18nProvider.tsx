import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations, Language, TranslationKey } from '../i18n/translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  availableLanguages: Array<{ code: Language; name: string; nativeName: string }>;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

interface Props {
  children: ReactNode;
  defaultLanguage?: Language;
}

const AVAILABLE_LANGUAGES = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'tr' as Language, name: 'Turkish', nativeName: 'Türkçe' },
];

const STORAGE_KEY = 'app-language';

export const I18nProvider = ({ children, defaultLanguage = 'en' }: Props) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get language from localStorage
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && translations[stored]) {
      return stored;
    }

    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0] as Language;
    if (translations[browserLang]) {
      return browserLang;
    }

    return defaultLanguage;
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);

    // Update HTML lang attribute
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    const translation = translations[language][key];
    if (translation !== undefined) {
      return translation;
    }

    // Fallback to English if translation not found
    const fallback = translations.en[key];
    if (fallback !== undefined) {
      console.warn(`Translation missing for key "${key}" in language "${language}"`);
      return fallback;
    }

    // If not found in English either, return the key
    console.error(`Translation key "${key}" not found`);
    return key;
  }, [language]);

  // Update HTML lang attribute on mount and language change
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        availableLanguages: AVAILABLE_LANGUAGES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};
