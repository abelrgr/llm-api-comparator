import { useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import { cn } from "../../lib/utils";
import { FAQ_DATA, type FAQItem, type FAQCategory } from "./faqContent";

// ─── API Diagram ─────────────────────────────────────────────────────────────

function ApiDiagram({ t }: { t: (key: string) => string }) {
  const requestJson = `POST /v1/chat/completions HTTP/1.1
Content-Type: application/json

{
  "model": "gpt-4o",
  "messages": [
    { "role": "system",
      "content": "You are a helpful assistant." },
    { "role": "user",
      "content": "Summarise this article..." }
  ],
  "max_tokens": 500,
  "temperature": 0.7,
  "stream": true
}`;

  const responseJson = `data: {"choices":[{"delta":
  {"content":"Sure!"}}]}

data: {"choices":[{"delta":
  {"content":" Here is the"}}]}

// ... more chunks ...

data: {"choices":[{"finish_reason":"stop"}],
  "usage":{
    "prompt_tokens": 70,
    "completion_tokens": 150,
    "total_tokens": 220
  }}

data: [DONE]`;

  return (
    <div className="mt-4 space-y-6">
      {/* Flow boxes */}
      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {/* Your App */}
        <div className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💻</span>
            <span className="font-semibold text-indigo-800 dark:text-indigo-200 text-sm">
              {t("faq.diagram_your_app")}
            </span>
          </div>
          <div className="space-y-2 text-xs text-indigo-700 dark:text-indigo-300">
            <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/50 px-3 py-2 font-mono">
              openai.chat.completions
              <br />
              &nbsp;&nbsp;.create(&#123; model, messages,
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;stream: true &#125;)
            </div>
            <p className="text-indigo-600 dark:text-indigo-400 leading-snug">
              Sends a JSON payload over HTTPS and listens for a Server-Sent
              Events (SSE) stream.
            </p>
          </div>
        </div>

        {/* Arrows  */}
        <div className="flex md:flex-col items-center justify-center gap-2 py-2 md:py-0 md:w-24 shrink-0">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {t("faq.diagram_request")}
            </span>
            <div className="flex items-center gap-1">
              <div className="h-px md:h-auto md:w-px w-10 md:h-6 bg-gradient-to-r md:bg-gradient-to-b from-indigo-400 to-emerald-400" />
              <span className="text-emerald-500 font-bold text-lg leading-none md:rotate-90">
                →
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 md:mt-2">
            <div className="flex items-center gap-1">
              <span className="text-amber-500 font-bold text-lg leading-none md:-rotate-90">
                ←
              </span>
              <div className="h-px md:h-auto md:w-px w-10 md:h-6 bg-gradient-to-l md:bg-gradient-to-t from-amber-400 to-orange-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {t("faq.diagram_response")}
            </span>
          </div>
        </div>

        {/* LLM API Provider */}
        <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <span className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">
              {t("faq.diagram_llm_api")}
            </span>
          </div>
          <ol className="space-y-1.5">
            {[
              t("faq.diagram_step1"),
              t("faq.diagram_step2"),
              t("faq.diagram_step3"),
              t("faq.diagram_step4"),
              t("faq.diagram_step5"),
            ].map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-[10px]">
                  {i + 1}
                </span>
                <span>{step.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Request / Response code blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Request */}
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 dark:bg-slate-900">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span className="ml-2 text-xs font-mono text-slate-400">
              {t("faq.diagram_request")}
            </span>
          </div>
          <pre className="overflow-x-auto bg-slate-900 dark:bg-slate-950 p-4 text-[11px] leading-relaxed text-slate-300 font-mono">
            <code>{requestJson}</code>
          </pre>
        </div>
        {/* Response */}
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 dark:bg-slate-900">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span className="ml-2 text-xs font-mono text-slate-400">
              {t("faq.diagram_response")}
            </span>
          </div>
          <pre className="overflow-x-auto bg-slate-900 dark:bg-slate-950 p-4 text-[11px] leading-relaxed text-slate-300 font-mono">
            <code>{responseJson}</code>
          </pre>
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">💰</span>
          <span className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
            {t("faq.diagram_cost_title")}
          </span>
        </div>
        <div className="space-y-2">
          <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 px-3 py-2 font-mono text-xs text-amber-800 dark:text-amber-200">
            {t("faq.diagram_cost_formula")}
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            {t("faq.diagram_cost_example")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Accordion Item ───────────────────────────────────────────────────────────

function FaqItem({
  item,
  open,
  onToggle,
  t,
}: {
  item: FAQItem;
  open: boolean;
  onToggle: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 last:border-0">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-sm"
      >
        <span
          className={cn(
            "mt-0.5 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              d="M4 6l4 4 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="font-medium text-slate-800 dark:text-slate-100 text-sm leading-snug">
          {item.q}
        </span>
      </button>

      {/* Animated body */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-5 pl-7 pr-2 space-y-3">
            {/* Main answer */}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.answer}
            </p>

            {/* Bullet list */}
            {item.bullets && (
              <ul className="space-y-1.5 ml-1">
                {item.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 leading-snug"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 dark:bg-indigo-500" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Tip box */}
            {item.tip && (
              <div className="flex gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 px-3 py-2.5">
                <span className="shrink-0 text-indigo-500 dark:text-indigo-400 text-sm mt-0.5">
                  💡
                </span>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  <span className="font-semibold">{t("faq.tip_label")}: </span>
                  {item.tip}
                </p>
              </div>
            )}

            {/* API Diagram */}
            {item.diagram && <ApiDiagram t={t} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Category Block ───────────────────────────────────────────────────────────

function FaqCategory({
  category,
  openItems,
  onToggle,
  t,
}: {
  category: FAQCategory;
  openItems: Set<string>;
  onToggle: (id: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Category header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
        <span className="text-2xl leading-none" role="img" aria-hidden="true">
          {category.icon}
        </span>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
            {category.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {category.items.length}{" "}
            {category.items.length === 1 ? "question" : "questions"}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="px-5">
        {category.items.map((item) => (
          <FaqItem
            key={item.id}
            item={item}
            open={openItems.has(`${category.id}-${item.id}`)}
            onToggle={() => onToggle(`${category.id}-${item.id}`)}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function FaqSection() {
  const { lang, t } = useI18n();
  const categories = FAQ_DATA[lang] ?? FAQ_DATA["en"];
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  function toggle(id: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Filter categories/items by search term
  const query = search.trim().toLowerCase();
  const filteredCategories = query
    ? categories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.q.toLowerCase().includes(query) ||
              item.answer.toLowerCase().includes(query),
          ),
        }))
        .filter((cat) => cat.items.length > 0)
    : categories;

  const allIds = filteredCategories.flatMap((cat) =>
    cat.items.map((item) => `${cat.id}-${item.id}`),
  );
  const allOpen = allIds.length > 0 && allIds.every((id) => openItems.has(id));

  function toggleAll() {
    setOpenItems(allOpen ? new Set() : new Set(allIds));
  }

  return (
    <section
      id="faq"
      className="w-full py-16 px-4 bg-slate-50 dark:bg-slate-950/60"
    >
      <div className="mx-auto max-w-3xl">
        {/* Section intro */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-4">
            <span>❓</span> FAQ
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            {t("faq.title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            {t("faq.subtitle")}
          </p>

          {/* Search box */}
          <div className="mt-6 relative max-w-sm mx-auto">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("faq.search_placeholder")}
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-shadow"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {!query && (
            <button
              onClick={toggleAll}
              className="mt-4 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 underline underline-offset-2 transition-colors"
            >
              {allOpen ? t("faq.collapse_all") : t("faq.expand_all")}
            </button>
          )}
        </div>

        {/* No results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <svg
              className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">{t("faq.no_results")}</p>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-4">
          {filteredCategories.map((cat) => (
            <FaqCategory
              key={cat.id}
              category={cat}
              openItems={openItems}
              onToggle={toggle}
              t={t}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
