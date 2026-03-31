import { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { useI18n } from '../../hooks/useI18n';
import { formatCostDisplay } from '../../lib/calculator';
import type { CostBreakdown } from '../../lib/calculator';
import type { LLMModel } from '../../types/index';
import { PROVIDER_COLORS } from '../../types/index';

interface MonthlyCostChartProps {
  breakdowns: CostBreakdown[];
  models: LLMModel[];
  subscriptionMonthly?: number;
  subscriptionName?: string;
}

export default function MonthlyCostChart({
  breakdowns,
  models,
  subscriptionMonthly,
  subscriptionName,
}: MonthlyCostChartProps) {
  const { t } = useI18n();
  const svgRef       = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef   = useRef<HTMLDivElement>(null);

  const modelMap = Object.fromEntries(models.map(m => [m.id, m]));

  const draw = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (!breakdowns.length) return;

    const isDark    = document.documentElement.classList.contains('dark');
    const axisColor = isDark ? '#94a3b8' : '#64748b';
    const tickColor = isDark ? '#1e293b' : '#e2e8f0';
    const valueColor = isDark ? '#f8fafc' : '#0f172a';

    const containerW = containerRef.current.clientWidth;
    const margin = { top: 32, right: 24, bottom: 72, left: 60 };
    const height = 260;
    const innerW = containerW - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('width', containerW)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerW} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('aria-label', t('chart.monthly_cost_title'));

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Compute max cost (include subscription reference if present)
    const maxCost = Math.max(
      d3.max(breakdowns, d => d.monthly_cost) ?? 0,
      subscriptionMonthly ?? 0,
    );

    const x = d3.scaleBand()
      .domain(breakdowns.map(d => d.model_id))
      .range([0, innerW])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, maxCost * 1.2])
      .range([innerH, 0])
      .nice();

    // Grid lines
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(() => ''))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('line').attr('stroke', tickColor).attr('stroke-dasharray', '3,3'));

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}`))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text').attr('fill', axisColor).attr('font-size', '11px'));

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickFormat(() => ''))
      .call(ax => ax.select('.domain').attr('stroke', tickColor));

    // Angled X labels
    breakdowns.forEach(bd => {
      const model = modelMap[bd.model_id];
      const xPos = (x(bd.model_id) ?? 0) + x.bandwidth() / 2;
      g.append('text')
        .attr('transform', `translate(${xPos},${innerH + 8})rotate(-40)`)
        .attr('text-anchor', 'end')
        .attr('fill', axisColor)
        .attr('font-size', '11px')
        .text(() => {
          const name = model?.name ?? bd.model_id;
          return name.length > 14 ? name.slice(0, 13) + '…' : name;
        });
    });

    // Bars
    g.selectAll('.bar')
      .data(breakdowns)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.model_id) ?? 0)
      .attr('width', x.bandwidth())
      .attr('y', innerH)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', d => {
        const model = modelMap[d.model_id];
        return model ? PROVIDER_COLORS[model.provider] : '#6b7280';
      })
      .attr('opacity', 0.85)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1);
        showTooltip(event as MouseEvent, d);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.85);
        hideTooltip();
      })
      .transition().duration(600).ease(d3.easeCubicOut)
      .attr('y', d => d.is_free ? innerH : y(d.monthly_cost))
      .attr('height', d => d.is_free ? 0 : Math.max(0, innerH - y(d.monthly_cost)));

    // Value labels above bars
    g.selectAll('.bar-label')
      .data(breakdowns)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => (x(d.model_id) ?? 0) + x.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', valueColor)
      .attr('y', innerH - 4)
      .attr('opacity', 0)
      .text(d => d.is_free ? 'FREE' : formatCostDisplay(d.monthly_cost))
      .transition().duration(600).ease(d3.easeCubicOut)
      .attr('y', d => d.is_free ? innerH - 4 : y(d.monthly_cost) - 4)
      .attr('opacity', 1);

    // Subscription reference line
    if (subscriptionMonthly && subscriptionMonthly > 0) {
      const refY = y(subscriptionMonthly);
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', refY).attr('y2', refY)
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,4');
      g.append('text')
        .attr('x', innerW - 4)
        .attr('y', refY - 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#f59e0b')
        .attr('font-size', '10px')
        .text(`${subscriptionName ?? 'Sub'} $${subscriptionMonthly}/mo`);
    }

    function showTooltip(event: MouseEvent, d: CostBreakdown) {
      const tooltip = tooltipRef.current;
      if (!tooltip || !containerRef.current) return;
      const model = modelMap[d.model_id];
      tooltip.innerHTML = `
        <div class="font-semibold mb-0.5">${model?.name ?? d.model_id}</div>
        <div class="text-xs text-slate-500 dark:text-slate-400">
          ${d.is_free ? 'FREE (self-hosted)' : `Monthly: <span class="font-mono">${formatCostDisplay(d.monthly_cost)}</span>`}
        </div>
      `;
      const rect = containerRef.current.getBoundingClientRect();
      tooltip.style.left = `${event.clientX - rect.left + 12}px`;
      tooltip.style.top  = `${event.clientY - rect.top  - 10}px`;
      tooltip.style.opacity = '1';
    }

    function hideTooltip() {
      if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
    }
  }, [breakdowns, modelMap, subscriptionMonthly, subscriptionName, t]);

  useEffect(() => {
    draw();
    const ro = new ResizeObserver(draw);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => {
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [draw]);

  if (breakdowns.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 dark:text-slate-500 text-sm">
        {t('chart.empty_select_2')}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <svg ref={svgRef} className="w-full" />
      <div
        ref={tooltipRef}
        className="absolute z-50 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-800 dark:text-slate-200 text-sm pointer-events-none transition-opacity duration-150"
        style={{ opacity: 0, top: 0, left: 0 }}
      />
    </div>
  );
}
