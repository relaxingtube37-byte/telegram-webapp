import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SupportedLanguage, LanguageDirection, LanguageContextType } from './types';
import { SUPPORTED_LANGUAGES } from './types';
import { translations } from './translations';

const STORAGE_KEY = 'user_language';
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

const LanguageContext = createContext<LanguageContextType | null>(null);

/**
 * Lazy loads fonts only when a right-to-left language (Persian / Arabic) is selected.
 * Uses font-display: swap to guarantee zero blocking of first meaningful paint.
 */
function ensureFontLoaded(lang: SupportedLanguage) {
  if (typeof document === 'undefined') return;

  if (lang === 'fa' && !document.getElementById('font-vazirmatn')) {
    const link = document.createElement('link');
    link.id = 'font-vazirmatn';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  if (lang === 'ar' && !document.getElementById('font-noto-arabic')) {
    const link = document.createElement('link');
    link.id = 'font-noto-arabic';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  // Update body font classes
  if (lang === 'fa') {
    document.body.classList.add('font-fa');
    document.body.classList.remove('font-ar');
  } else if (lang === 'ar') {
    document.body.classList.add('font-ar');
    document.body.classList.remove('font-fa');
  } else {
    document.body.classList.remove('font-fa', 'font-ar');
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      if (saved && SUPPORTED_LANGUAGES[saved]) {
        return saved;
      }
    } catch {}
    return DEFAULT_LANGUAGE;
  });

  const direction: LanguageDirection = SUPPORTED_LANGUAGES[language]?.dir || 'ltr';
  const isRtl = direction === 'rtl';

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES[newLang]) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {}

    const newDir = SUPPORTED_LANGUAGES[newLang].dir;
    document.documentElement.lang = newLang;
    document.documentElement.dir = newDir;
    ensureFontLoaded(newLang);
  }, []);

  // Sync DOM attributes and lazy fonts on initial mount
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    ensureFontLoaded(language);
  }, [language, direction]);

  /**
   * Safe nested key resolver with fallback to English, then optional fallback string, then path.
   * Example: t('header.signIn') -> 'Sign In / Join'
   */
  const t = useCallback(
    (path: string, fallback?: string): string => {
      if (!path) return '';
      const parts = path.split('.');

      // 1. Try active language
      let currLangObj: any = translations[language];
      for (const part of parts) {
        if (currLangObj && typeof currLangObj === 'object' && part in currLangObj) {
          currLangObj = currLangObj[part];
        } else {
          currLangObj = undefined;
          break;
        }
      }
      if (typeof currLangObj === 'string' && currLangObj.trim().length > 0) {
        return currLangObj;
      }

      // 2. Fallback to English if active language key is missing
      if (language !== 'en') {
        let enObj: any = translations.en;
        for (const part of parts) {
          if (enObj && typeof enObj === 'object' && part in enObj) {
            enObj = enObj[part];
          } else {
            enObj = undefined;
            break;
          }
        }
        if (typeof enObj === 'string' && enObj.trim().length > 0) {
          return enObj;
        }
      }

      // 3. Fallback string or key
      return fallback !== undefined ? fallback : path;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, direction, isRtl, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return ctx;
};
