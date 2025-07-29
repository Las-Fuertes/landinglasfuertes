import { useRouter } from 'next/router';
import es from '../locales/es.json';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

const translations = {
  es,
  en,
  fr,
};

type TranslationKey = string;
type Locale = 'es' | 'en' | 'fr';

export function useTranslation() {
  const router = useRouter();
  const locale = (router.locale as Locale) || 'es';

  const t = (key: TranslationKey, interpolations?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
      return key;
    }

    // Handle interpolations like {emi}
    if (interpolations) {
      return Object.entries(interpolations).reduce(
        (text, [placeholder, replacement]) =>
          text.replace(new RegExp(`{${placeholder}}`, 'g'), replacement),
        value
      );
    }

    return value;
  };

  return {
    t,
    locale,
    locales: router.locales || ['es', 'en', 'fr'],
  };
}
