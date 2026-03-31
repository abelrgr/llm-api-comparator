import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import { Button } from "../ui/Button";

const STATS = [
  { value: 25, suffix: "+", key: "hero.stats.models", icon: "🧠" },
  { value: 7, suffix: "", key: "hero.stats.providers", icon: "🏢" },
  {
    value: 0,
    suffix: "",
    key: "hero.stats.live",
    icon: "📡",
    label: "Live Pricing",
  },
  {
    value: 0,
    suffix: "",
    key: "hero.stats.free",
    icon: "✨",
    label: "100% Free",
  },
];

function useCountUp(target: number, duration = 1200, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active || target === 0) {
      setCount(target);
      return;
    }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut quad
      const eased = 1 - (1 - progress) ** 2;
      setCount(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);
  return count;
}

function StatItem({
  stat,
  active,
}: {
  stat: (typeof STATS)[0];
  active: boolean;
}) {
  const { t } = useI18n();
  const count = useCountUp(stat.value, 1200, active);
  const isText = stat.value === 0;

  return (
    <div className="flex flex-col items-center gap-1 px-4 sm:px-6 first:pl-0 last:pr-0">
      <span className="text-2xl">{stat.icon}</span>
      <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-400">
        {isText ? (stat.label ?? t(stat.key)) : `${count}${stat.suffix}`}
      </span>
      {!isText && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {t(stat.key)}
        </span>
      )}
    </div>
  );
}

export default function HeroSection() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative overflow-hidden"
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      {/* ── Background gradient ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 transition-colors duration-300" />

      {/* ── Decorative orbs ──────────────────────────────────────────────────── */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-violet-500/5 dark:bg-violet-500/5 blur-3xl pointer-events-none" />

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center min-h-[inherit] py-20 gap-8">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400
            text-sm font-medium transition-all duration-700
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live pricing — updated regularly
        </div>

        {/* Headline */}
        <h1
          className={`text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight
            transition-all duration-700 delay-100
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="text-slate-900 dark:text-white">
            {t("hero.title").split(" ").slice(0, 2).join(" ")}{" "}
          </span>
          <br className="hidden sm:block" />
          <span className="bg-linear-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
            {t("hero.title").split(" ").slice(2).join(" ")}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed
            transition-all duration-700 delay-200
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {t("hero.subtitle")}
        </p>

        {/* CTAs */}
        <div
          className={`flex flex-wrap items-center justify-center gap-4
            transition-all duration-700 delay-300
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <Button
            size="lg"
            variant="primary"
            onClick={() =>
              document
                .getElementById("compare")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {t("hero.cta_compare")}
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() =>
              document
                .getElementById("calculator")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
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
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            {t("hero.cta_calculator")}
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-recommender"))
            }
          >
            ✨ {t("header.ai_match")}
          </Button>
        </div>

        {/* Stats */}
        <div
          className={`flex flex-wrap justify-center gap-6 sm:gap-0 sm:divide-x divide-slate-200 dark:divide-slate-700
            pt-8 border-t border-slate-200 dark:border-slate-700 w-full max-w-2xl
            transition-all duration-700 delay-500
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {STATS.map((stat) => (
            <StatItem key={stat.key} stat={stat} active={visible} />
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 animate-bounce">
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
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </section>
  );
}
