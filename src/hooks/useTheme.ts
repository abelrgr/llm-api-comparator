import { useState, useEffect, useCallback } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "llm-theme";
const THEME_EVENT = "llm:theme-change";

export function useTheme() {
  // Default to 'dark' so SSR pre-render matches the anti-flash script default
  const [theme, setThemeState] = useState<Theme>("dark");

  // On mount: read actual preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initial: Theme =
      stored === "dark" || stored === "light"
        ? stored
        : prefersDark
          ? "dark"
          : "light";
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  // Listen for changes from other Astro islands
  useEffect(() => {
    const handler = (e: Event) => {
      const newTheme = (e as CustomEvent<Theme>).detail;
      setThemeState(newTheme);
    };
    window.addEventListener(THEME_EVENT, handler);
    return () => window.removeEventListener(THEME_EVENT, handler);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: newTheme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
      return next;
    });
  }, []);

  return { theme, toggleTheme, setTheme };
}
