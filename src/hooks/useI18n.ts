import { useState, useEffect, useCallback } from "react";
import {
  type Lang,
  detectLang,
  translate,
  persistLang,
  LANG_EVENT,
} from "../i18n/index";

export function useI18n() {
  const [lang, setLangState] = useState<Lang>("en");

  // On mount: read actual preference from localStorage / navigator
  useEffect(() => {
    const initial = detectLang();
    setLangState(initial);
    document.documentElement.lang = initial;
  }, []);

  // Listen for changes from other Astro islands
  useEffect(() => {
    const handler = (e: Event) => {
      const newLang = (e as CustomEvent<Lang>).detail;
      setLangState(newLang);
    };
    window.addEventListener(LANG_EVENT, handler);
    return () => window.removeEventListener(LANG_EVENT, handler);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    persistLang(newLang);
  }, []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  return { lang, t, setLang };
}
