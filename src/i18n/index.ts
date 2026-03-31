import en from './locales/en';
import es from './locales/es';
import pt from './locales/pt';
import fr from './locales/fr';

export type Lang = 'en' | 'es' | 'pt' | 'fr';

const translations = { en, es, pt, fr } as const;

export const ALL_LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
];

// ─── Detect language from localStorage / browser ──────────────────────────────
export function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('llm-lang');
  if (stored && stored in translations) return stored as Lang;
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('pt')) return 'pt';
  if (nav.startsWith('fr')) return 'fr';
  return 'en';
}

// ─── Dot-notation lookup ──────────────────────────────────────────────────────
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const result = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
  return typeof result === 'string' ? result : path;
}

export function translate(lang: Lang, key: string): string {
  const value = getNestedValue(
    translations[lang] as unknown as Record<string, unknown>,
    key
  );
  if (value !== key) return value;
  // Fallback to English
  return getNestedValue(
    translations.en as unknown as Record<string, unknown>,
    key
  );
}

// ─── Persist and broadcast lang change ───────────────────────────────────────
export const LANG_EVENT = 'llm:lang-change';

export function persistLang(lang: Lang): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('llm-lang', lang);
  document.documentElement.lang = lang;
  window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: lang }));
}
