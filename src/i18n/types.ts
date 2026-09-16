export type SupportedLanguage = 'en' | 'fa' | 'tr' | 'pt' | 'ar';

export type LanguageDirection = 'ltr' | 'rtl';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: LanguageDirection;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageMeta> = {
  en: { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  fa: { code: 'fa', name: 'Persian', nativeName: 'فارسی', dir: 'rtl', flag: '🇮🇷' },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', flag: '🇹🇷' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', flag: '🇧🇷' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
};

export interface LanguageContextType {
  language: SupportedLanguage;
  direction: LanguageDirection;
  isRtl: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (path: string, fallback?: string) => string;
}
