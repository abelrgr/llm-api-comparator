import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "../../hooks/useI18n";
import { cn } from "../../lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ABOUT_DATA = {
  name: "Abel Gallo Ruiz",
  initials: "AGR",
  roles: [
    "Full-Stack Web Developer",
    "Astro Enthusiast",
    "Open Source Builder",
  ],
  location: "La Paz, Bolivia 🇧🇴",
  experience: "15+ years",
  focus: "Building platforms for Govs, Foundations & NGOs",
  bio: "Full-stack developer with 15+ years building scalable web platforms, specialized in government, foundation, and NGO digital solutions.",
  topSkills: [
    "Astro",
    "React",
    "Node.js",
    "PHP",
    "PostgreSQL",
    "Docker",
    "TypeScript",
    "D3.js",
  ],
  contact: {
    github: "https://github.com/abelrgr",
    linkedin: "https://www.linkedin.com/in/abel-gallo-ruiz/",
    portfolio: "https://abelgalloruiz.me/",
    cv: "https://abelgalloruiz.me/assets/cv/cv_abel_gallo_ruiz_latest.pdf",
  },
};

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(
  strings: string[],
  typingSpeed = 60,
  pauseMs = 2200,
  active = true,
) {
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "erasing">(
    "typing",
  );
  const [strIdx, setStrIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (!active) return;
    const current = strings[strIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (charIdx < current.length) {
        timeout = setTimeout(() => {
          setDisplay(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => setPhase("pausing"), pauseMs);
      }
    } else if (phase === "pausing") {
      timeout = setTimeout(() => setPhase("erasing"), 400);
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => {
          setDisplay(current.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        }, typingSpeed / 2);
      } else {
        setStrIdx((i) => (i + 1) % strings.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [phase, charIdx, strIdx, strings, typingSpeed, pauseMs]);

  return display;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AboutSection() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const roleText = useTypewriter(ABOUT_DATA.roles, 60, 2200, open);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Listen for custom event fired by Header
  useEffect(() => {
    const handler = () => {
      triggerRef.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
    window.addEventListener("open-about-modal", handler);
    return () => window.removeEventListener("open-about-modal", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus trap: focus the modal when opened
  useEffect(() => {
    if (open) modalRef.current?.focus();
  }, [open]);

  return (
    <>
      {/* ── Modal overlay ─────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-label={t("about.title")}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Card */}
          <div
            ref={modalRef}
            tabIndex={-1}
            className={cn(
              "relative z-10 w-full max-w-md rounded-2xl overflow-hidden",
              "bg-slate-900 border border-slate-700/60",
              "shadow-2xl shadow-black/60",
              "focus:outline-none",
            )}
          >
            {/* ── Header band ─────────────────────────────────────────── */}
            <div className="bg-linear-to-r from-indigo-950 to-slate-900 px-6 pt-6 pb-4 border-b border-slate-700/40">
              {/* Terminal prompt */}
              <p className="font-mono text-xs text-slate-500 mb-3">
                {t("about.terminal_prompt")}
              </p>

              {/* Avatar + Name row */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="text-white font-bold text-lg tracking-tight select-none">
                      {ABOUT_DATA.initials}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold bg-linear-to-r from-white to-indigo-300 bg-clip-text text-transparent leading-tight truncate">
                    {ABOUT_DATA.name}
                  </h2>
                  <div className="flex items-center h-6 mt-0.5">
                    <span className="text-indigo-400 text-sm font-medium">
                      {roleText}
                      <span className="animate-pulse ml-0.5 opacity-70">|</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={close}
                aria-label="Close"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-400"
              >
                <svg
                  className="w-4 h-4"
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
              </button>
            </div>

            {/* ── Body ────────────────────────────────────────────────── */}
            <div className="px-6 py-5 space-y-5">
              {/* Quick facts */}
              <div className="space-y-1.5">
                <FactRow icon="📍" label={ABOUT_DATA.location} />
                <FactRow
                  icon="⏱"
                  label={`${ABOUT_DATA.experience} of experience`}
                />
                <FactRow icon="🎯" label={ABOUT_DATA.focus} />
              </div>

              {/* Bio */}
              <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
                {ABOUT_DATA.bio}
              </p>

              {/* Top skills */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                  {t("about.skills_title")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ABOUT_DATA.topSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/25"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  {t("about.contact_title")}
                </p>
                <TerminalLink
                  href={ABOUT_DATA.contact.github}
                  label="github.com/abelrgr"
                />
                <TerminalLink
                  href={ABOUT_DATA.contact.linkedin}
                  label="linkedin.com/in/abel-gallo-ruiz"
                />
                <TerminalLink
                  href={ABOUT_DATA.contact.portfolio}
                  label="abelgalloruiz.me"
                />
              </div>
            </div>

            {/* ── Footer actions ───────────────────────────────────────── */}
            <div className="px-6 pb-6 flex gap-3 flex-wrap">
              <a
                href={ABOUT_DATA.contact.cv}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm transition-all shadow-md shadow-indigo-500/20 focus-visible:outline-2 focus-visible:outline-indigo-400"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                {t("about.download_cv")}
              </a>
              <a
                href="https://github.com/abelrgr/llm-api-comparator"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 font-medium text-sm transition-all focus-visible:outline-2 focus-visible:outline-indigo-400"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                {t("about.built_this")}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FactRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-300">
      <span className="shrink-0" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

function TerminalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 font-mono text-sm text-slate-400 hover:text-indigo-400 transition-colors group"
    >
      <span className="text-indigo-500 group-hover:text-indigo-400">→</span>
      <span className="underline-offset-2 group-hover:underline">{label}</span>
    </a>
  );
}
