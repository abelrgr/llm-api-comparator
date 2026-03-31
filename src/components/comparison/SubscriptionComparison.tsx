import { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { useI18n } from '../../hooks/useI18n';
import { formatCostDisplay } from '../../lib/calculator';
import type { CostBreakdown } from '../../lib/calculator';
import type { LLMModel, SubscriptionTier } from '../../types/index';
import { cn } from '../../lib/utils';

interface SubscriptionComparisonProps {
  breakdowns: CostBreakdown[];
  models: LLMModel[];
}

export default function SubscriptionComparison({ breakdowns, models }: SubscriptionComparisonProps) {
  const { t } = useI18n();

  // Collect all unique subscription tiers from selected models
  const tieredModels = models.filter(m => m.subscription_tiers && m.subscription_tiers.length > 0);
  if (!tieredModels.length) return null;

  return (
    <div className="space-y-6">
      {tieredModels.map(model => {
        const bd = breakdowns.find(b => b.model_id === model.id);
        const tiers = model.subscription_tiers!;

        return (
          <div key={model.id} className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {model.name} — {t('subscription.title')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiers.map(tier => (
                <TierCard
                  key={tier.name}
                  tier={tier}
                  breakdown={bd}
                  t={t}
                />
              ))}
            </div>
            {/* Sparkline break-even chart */}
            {bd && bd.cost_per_request > 0 && (
              <BreakEvenChart
                costPerRequest={bd.cost_per_request}
                tiers={tiers}
                t={t}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tier card ────────────────────────────────────────────────────────────────
function TierCard({
  tier,
  breakdown,
  t,
}: {
  tier: SubscriptionTier;
  breakdown: CostBreakdown | undefined;
  t: (k: string) => string;
}) {
  const apiCostMonthly = breakdown?.monthly_cost ?? null;
  const planPrice      = tier.price_monthly;

  let comparison: string | null = null;
  if (apiCostMonthly !== null && !breakdown?.is_free) {
    const diff = Math.abs(planPrice - apiCostMonthly);
    if (planPrice < apiCostMonthly) {
      comparison = t('comparison.plan_saves').replace('{amount}', formatCostDisplay(diff));
    } else {
      comparison = t('comparison.api_cheaper').replace('{amount}', formatCostDisplay(diff));
    }
  }

  return (
    <div className={cn(
      'relative rounded-xl border p-5 space-y-4 transition-all',
      tier.is_popular
        ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30',
    )}>
      {/* Popular badge */}
      {tier.is_popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500 text-white">
            {t('subscription.popular')}
          </span>
        </div>
      )}

      {/* Header */}
      <div>
        <h5 className="font-semibold text-slate-900 dark:text-white">{tier.name}</h5>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white">
            ${planPrice}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">{t('subscription.mo')}</span>
        </div>
        {tier.requests_limit && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {tier.requests_limit.toLocaleString()} {t('subscription.mo')} requests
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-1.5">
        {tier.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
            <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      {/* API vs plan comparison */}
      {comparison && (
        <div className={cn(
          'rounded-lg px-3 py-2 text-xs font-medium',
          planPrice < (apiCostMonthly ?? Infinity)
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
        )}>
          {comparison} at your usage
        </div>
      )}
    </div>
  );
}

// ─── Break-even sparkline ─────────────────────────────────────────────────────
function BreakEvenChart({
  costPerRequest,
  tiers,
  t,
}: {
  costPerRequest: number;
  tiers: SubscriptionTier[];
  t: (k: string) => string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  const drawChart = useCallback(() => {
    if (!svgRef.current) return;
    const tier = tiers.reduce((min, t) => t.price_monthly < min.price_monthly ? t : min);
    const subCost = tier.price_monthly;

    const width = 400;
    const height = 120;
    const margin = { top: 16, right: 16, bottom: 28, left: 48 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const isDark    = document.documentElement.classList.contains('dark');
    const axisColor = isDark ? '#64748b' : '#94a3b8';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const maxMsgs = Math.max(200, Math.ceil((subCost / costPerRequest) * 1.8));

    const x = d3.scaleLinear().domain([0, maxMsgs]).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, subCost * 1.5]).range([innerH, 0]).nice();

    // API cost line: linear with msgs/day (monthly = msgs * 30 * costPerRequest)
    const apiLine = d3.line<number>()
      .x(d => x(d))
      .y(d => y(d * 30 * costPerRequest));

    // Subscription: flat
    const subLine = d3.line<number>()
      .x(d => x(d))
      .y(() => y(subCost));

    const msgs = d3.range(0, maxMsgs + 1, maxMsgs / 80);
    const breakEvenX = costPerRequest > 0 ? subCost / (30 * costPerRequest) : null;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Axes
    g.append('g').attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}`))
      .call(ax => ax.select('.domain').attr('stroke', axisColor))
      .call(ax => ax.selectAll('text').attr('fill', textColor).attr('font-size', '10px'))
      .call(ax => ax.selectAll('line').attr('stroke', axisColor));

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => `$${d}`))
      .call(ax => ax.select('.domain').attr('stroke', axisColor))
      .call(ax => ax.selectAll('text').attr('fill', textColor).attr('font-size', '10px'))
      .call(ax => ax.selectAll('line').attr('stroke', axisColor));

    // API cost line (indigo)
    g.append('path')
      .datum(msgs)
      .attr('fill', 'none')
      .attr('stroke', '#818cf8')
      .attr('stroke-width', 2)
      .attr('d', apiLine as unknown as string);

    // Subscription flat line (amber)
    g.append('path')
      .datum([0, maxMsgs])
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,4')
      .attr('d', subLine as unknown as string);

    // Break-even marker
    if (breakEvenX !== null && breakEvenX <= maxMsgs) {
      const bx = x(breakEvenX);
      const by = y(subCost);
      g.append('circle').attr('cx', bx).attr('cy', by).attr('r', 5)
        .attr('fill', '#10b981').attr('stroke', 'white').attr('stroke-width', 2);
      g.append('text')
        .attr('x', bx + 7).attr('y', by - 4)
        .attr('fill', isDark ? '#34d399' : '#059669')
        .attr('font-size', '10px')
        .text(`${t('calculator.break_even')}: ${Math.ceil(breakEvenX)} msg/day`);
    }

    // X axis label
    g.append('text')
      .attr('x', innerW / 2).attr('y', innerH + 24)
      .attr('text-anchor', 'middle')
      .attr('fill', textColor)
      .attr('font-size', '10px')
      .text('Messages / day');

  }, [costPerRequest, tiers, t]);

  useEffect(() => {
    drawChart();
    const mo = new MutationObserver(drawChart);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [drawChart]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 p-4">
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
        {t('calculator.break_even')} — API
        <span className="inline-block w-6 h-0.5 mx-1.5 bg-indigo-400 align-middle" />
        vs Subscription
        <span className="inline-block w-6 h-0.5 mx-1.5 bg-amber-400 align-middle border-dashed border-t border-amber-400" />
      </p>
      <svg ref={svgRef} className="w-full" style={{ maxHeight: 120 }} />
    </div>
  );
}
