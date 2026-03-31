import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { type LLMModel } from "../../types/index";
import { getSnippets, type SnippetLang } from "../../lib/apiSnippets";
import { tokenize, TOKEN_COLORS } from "../../lib/codeHighlight";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  model: LLMModel;
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

// ─── Language tab config ──────────────────────────────────────────────────────

const TABS: { id: SnippetLang; label: string; badge: string }[] = [
  { id: "javascript", label: "JavaScript", badge: "JS" },
  { id: "typescript", label: "TypeScript", badge: "TS" },
  { id: "python", label: "Python", badge: "PY" },
  { id: "php", label: "PHP", badge: "PHP" },
  { id: "curl", label: "cURL", badge: "cURL" },
];

// ─── Highlighted Code Block ───────────────────────────────────────────────────

function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const lines = code.split("\n");
  const tokens = tokenize(code, lang);

  // Rebuild a line-by-line structure from the flat token list
  // We split each token at newline boundaries so we can assign line numbers
  const lineTokens: Array<Array<{ type: string; text: string }>> = [[]];
  for (const tok of tokens) {
    const parts = tok.text.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lineTokens.push([]);
      // Always add the part, even if empty (for blank lines and spacing)
      lineTokens[lineTokens.length - 1].push({ type: tok.type, text: part });
    });
  }

  // Ensure line count matches
  while (lineTokens.length < lines.length) lineTokens.push([]);

  return (
    <div className="flex text-[12.5px] leading-[1.65] font-mono whitespace-pre">
      {/* Line numbers */}
      <div
        className="shrink-0 select-none pr-4 text-right text-slate-600 border-r border-slate-700/60 whitespace-pre"
        style={{ minWidth: `${String(lines.length).length + 2}ch` }}
        aria-hidden="true"
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Code tokens */}
      <div className="pl-4 overflow-x-auto flex-1 whitespace-pre">
        {lineTokens.map((tokLine, lineIdx) => (
          <div key={lineIdx} className="whitespace-pre">
            {tokLine.length === 0 ? (
              <span className="whitespace-pre">&nbsp;</span>
            ) : (
              tokLine.map((tok, tokIdx) => (
                <span
                  key={tokIdx}
                  className={cn(
                    "whitespace-pre",
                    TOKEN_COLORS[tok.type as keyof typeof TOKEN_COLORS] ??
                      "text-slate-300",
                    tok.type === "comment" && "italic",
                  )}
                >
                  {tok.text === "" ? "\u200b" : tok.text}
                </span>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function ModalContent({ model, isOpen, onClose, t }: Props) {
  const [activeTab, setActiveTab] = useState<SnippetLang>("javascript");
  const [copied, setCopied] = useState(false);

  const baseSnippets = getSnippets({
    id: model.id,
    name: model.name,
    provider: model.provider,
    is_local: model.is_local,
  });

  // Prefer backend-provided JS snippet (always up-to-date, cached in localStorage)
  const snippets = model.snippet_js
    ? { ...baseSnippets, javascript: model.snippet_js }
    : baseSnippets;

  const currentCode = snippets[activeTab];

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select textarea
    }
  }, [currentCode]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${t("models.code_example")} – ${model.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-3xl max-h-[90dvh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#0d1117] shadow-2xl border border-slate-700/60 overflow-hidden">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 text-xs font-mono truncate">
                <span className="text-slate-500">// </span>
                {t("models.code_example")} —{" "}
                <span className="text-emerald-400">{model.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t("recommender.close")}
            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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

        {/* ── Language tabs ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 px-4 py-2.5 border-b border-slate-700/60 shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/40",
              )}
            >
              {tab.label}
            </button>
          ))}

          {/* Copy button – pushed right */}
          <button
            onClick={handleCopy}
            className={cn(
              "ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap",
              copied
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border border-transparent",
            )}
            aria-label={copied ? t("models.copied") : t("models.copy_code")}
          >
            {copied ? (
              <>
                <svg
                  className="w-3.5 h-3.5"
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
                {t("models.copied")}
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                {t("models.copy_code")}
              </>
            )}
          </button>
        </div>

        {/* ── Code area ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#0d1117]">
          <HighlightedCode code={currentCode} lang={activeTab} />
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="shrink-0 px-5 py-2.5 border-t border-slate-700/60 flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-mono">
            {model.provider === "local"
              ? "🖥️ Self-hosted · No API key required · Install Ollama to run"
              : `🔑 Requires ${model.provider.toUpperCase()} API key · See official docs`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Portal wrapper ───────────────────────────────────────────────────────────

export default function CodeExampleModal(props: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !props.isOpen) return null;

  return createPortal(<ModalContent {...props} />, document.body);
}
