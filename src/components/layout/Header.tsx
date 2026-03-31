import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../hooks/useTheme";
import { useI18n } from "../../hooks/useI18n";
import { ALL_LANGS, type Lang } from "../../i18n/index";
import { cn } from "../../lib/utils";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Show border-bottom on scroll
  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      ) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu and lang dropdown on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const currentLang = ALL_LANGS.find((l) => l.code === lang) ?? ALL_LANGS[0];

  // Sync language → <html lang="...">
  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const openAboutModal = () =>
    window.dispatchEvent(new CustomEvent("open-about-modal"));
  const openRecommender = () =>
    window.dispatchEvent(new CustomEvent("open-recommender"));

  const navLinks = [
    { href: "#compare", label: t("header.compare"), modal: false },
    { href: "#calculator", label: t("header.calculator"), modal: false },
    { href: "#faq", label: t("header.faq"), modal: false },
    { href: "#about", label: t("header.about"), modal: true },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-16",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md",
        "transition-all duration-200",
        hasScrolled &&
          "border-b border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-900/50",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <a
          href="#home"
          className="flex items-center gap-1.5 font-bold text-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          aria-label="LLM Comparator – home"
        >
          <img
            src="/favicon.svg"
            alt=""
            aria-hidden="true"
            width={28}
            height={28}
            className="shrink-0"
          />
          <span className="text-slate-900 dark:text-white">LLM</span>
          <span className="text-indigo-500">Comparator</span>
        </a>

        {/* ── Desktop nav ───────────────────────────────────────────────── */}
        <nav
          className="hidden sm:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {/* AI Recommender button — prominent CTA */}
          <button
            onClick={openRecommender}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors mr-1"
          >
            <span aria-hidden="true">✨</span>
            {t("header.ai_match")}
          </button>
          {navLinks.map((link) =>
            link.modal ? (
              <button
                key={link.href}
                onClick={openAboutModal}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {link.label}
              </button>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        {/* ── Right controls ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Lang selector (desktop) */}
          <div className="relative hidden sm:block" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangDropdownOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isLangDropdownOpen}
              aria-label={t("header.lang_label")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {/* Globe icon */}
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <span>
                {currentLang.flag} {currentLang.code.toUpperCase()}
              </span>
              <svg
                className={cn(
                  "w-3 h-3 transition-transform duration-200",
                  isLangDropdownOpen && "rotate-180",
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isLangDropdownOpen && (
              <div
                role="listbox"
                aria-label={t("header.lang_label")}
                className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden z-50 py-1"
              >
                {ALL_LANGS.map((option) => (
                  <button
                    key={option.code}
                    role="option"
                    aria-selected={lang === option.code}
                    onClick={() => {
                      setLang(option.code as Lang);
                      setIsLangDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150",
                      lang === option.code
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white font-semibold shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60",
                    )}
                  >
                    <span className="text-base leading-none">
                      {option.flag}
                    </span>
                    <span className="flex-1 text-left">{option.label}</span>
                    {lang === option.code && (
                      <svg
                        className="w-3.5 h-3.5 text-white shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? t("header.theme.light")
                : t("header.theme.dark")
            }
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            suppressHydrationWarning
          >
            {/* Sun icon (shown in dark mode to switch to light) */}
            <svg
              className={cn(
                "w-5 h-5 transition-all duration-300",
                theme === "dark"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-50 absolute",
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {/* Moon icon (shown in light mode to switch to dark) */}
            <svg
              className={cn(
                "w-5 h-5 transition-all duration-300",
                theme === "light"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-50 absolute",
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-16 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-lg z-40">
          <nav
            className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1"
            aria-label="Mobile navigation"
          >
            {/* AI Recommender — mobile */}
            <button
              onClick={() => {
                openRecommender();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors mb-1"
            >
              <span aria-hidden="true">✨</span>
              {t("header.ai_match")}
            </button>
            {navLinks.map((link) =>
              link.modal ? (
                <button
                  key={link.href}
                  onClick={() => {
                    openAboutModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-left"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  {link.label}
                </a>
              ),
            )}

            {/* Language picker (mobile) */}
            <div className="pt-3 mt-1 border-t border-slate-200 dark:border-slate-700">
              <p className="px-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t("header.lang_label")}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {ALL_LANGS.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => {
                      setLang(option.code as Lang);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors",
                      lang === option.code
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}
                  >
                    <span>{option.flag}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
