import { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { useI18n } from '../../hooks/useI18n';
import type { CostBreakdown } from '../../lib/calculator';
import type { LLMModel } from '../../types/index';

interface CostBarChartProps {
  breakdowns: CostBreakdown[];
  models: LLMModel[];
}

const INPUT_COLOR  = '#818cf8'; // indigo-400
const OUTPUT_COLOR = '#22d3ee'; // cyan-400

export default function CostBarChart({ breakdowns, models }: CostBarChartProps) {
  const { t } = useI18n();
  const svgRef       = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef   = useRef<HTMLDivElement>(null);

  const modelMap = Object.fromEntries(models.map(m => [m.id, m]));

  const draw = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const data = breakdowns.filter(bd => !bd.is_free);
    if (!data.length) return;

    const isDark = document.documentElement.classList.contains('dark');
    const axisColor  = isDark ? '#94a3b8' : '#64748b';
    const tickColor  = isDark ? '#1e293b' : '#e2e8f0';
    const labelColor = isDark ? '#e2e8f0' : '#1e293b';

    const containerW = containerRef.current.clientWidth;
    const margin = { top: 16, right: 24, bottom: 16, left: 140 };
    const barHeight  = 22;
    const groupGap   = 10;
    const groupH     = barHeight * 2 + groupGap;
    const innerH     = data.length * (groupH + 14);
    const height     = innerH + margin.top + margin.bottom;
    const width      = containerW;
    const innerW     = width - margin.left - margin.right;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('aria-label', t('chart.cost_bar_title'));

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const maxVal = d3.max(data, d => Math.max(d.cost_per_1m_blended,
      modelMap[d.model_id]?.pricing.input_per_1m ?? 0,
      modelMap[d.model_id]?.pricing.output_per_1m ?? 0,
    )) ?? 1;

    const x = d3.scaleLinear().domain([0, maxVal * 1.1]).range([0, innerW]);
    const yBand = d3.scaleBand()
      .domain(data.map(d => d.model_id))
      .range([0, innerH])
      .paddingInner(0.3)
      .paddingOuter(0.15);

    // X axis
    const xAxis = d3.axisBottom(x).ticks(4).tickFormat(d => `$${d}`);
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(xAxis)
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('line').attr('stroke', tickColor))
      .call(ax => ax.selectAll('text').attr('fill', axisColor).attr('font-size', '11px'));

    // Vertical grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisBottom(x).ticks(4).tickSize(-innerH).tickFormat(() => ''))
      .attr('transform', `translate(0,${innerH})`)
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('line').attr('stroke', tickColor).attr('stroke-dasharray', '3,3'));

    // Groups per model
    const groups = g.selectAll('.model-group')
      .data(data)
      .join('g')
      .attr('class', 'model-group')
      .attr('transform', d => `translate(0,${yBand(d.model_id) ?? 0})`);

    const bandH = yBand.bandwidth();
    const singleBarH = (bandH - groupGap) / 2;

    // Y axis labels (model names)
    groups.append('text')
      .attr('x', -8)
      .attr('y', bandH / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', labelColor)
      .attr('font-size', '12px')
      .text(d => {
        const name = modelMap[d.model_id]?.name ?? d.model_id;
        return name.length > 22 ? name.slice(0, 21) + '…' : name;
      });

    // Input bars
    groups.append('rect')
      .attr('y', 0)
      .attr('height', singleBarH)
      .attr('x', 0)
      .attr('width', 0)
      .attr('rx', 3)
      .attr('fill', INPUT_COLOR)
      .attr('opacity', 0.9)
      .on('mouseover', function(event, d) { showTooltip(event, d, 'input'); })
      .on('mouseout', hideTooltip)
      .transition().duration(600).ease(d3.easeCubicOut)
      .attr('width', d => x(modelMap[d.model_id]?.pricing.input_per_1m ?? 0));

    // Output bars
    groups.append('rect')
      .attr('y', singleBarH + groupGap)
      .attr('height', singleBarH)
      .attr('x', 0)
      .attr('width', 0)
      .attr('rx', 3)
      .attr('fill', OUTPUT_COLOR)
      .attr('opacity', 0.9)
      .on('mouseover', function(event, d) { showTooltip(event, d, 'output'); })
      .on('mouseout', hideTooltip)
      .transition().duration(600).ease(d3.easeCubicOut)
      .attr('width', d => x(modelMap[d.model_id]?.pricing.output_per_1m ?? 0));

    function showTooltip(event: MouseEvent, d: CostBreakdown, type: 'input' | 'output') {
      const tooltip = tooltipRef.current;
      if (!tooltip || !containerRef.current) return;
      const m = modelMap[d.model_id];
      if (!m) return;
      const price = type === 'input' ? m.pricing.input_per_1m : m.pricing.output_per_1m;
      const label = type === 'input' ? t('chart.hover_input') : t('chart.hover_output');
      tooltip.innerHTML = `
        <div class="font-semibold mb-1">${m.name}</div>
        <div class="text-xs text-slate-500 dark:text-slate-400">${label}: <span class="font-mono text-slate-800 dark:text-slate-200">$${price}/1M</span></div>
        <div class="text-xs text-slate-500 dark:text-slate-400">Context: ${(m.pricing.context_window / 1000).toFixed(0)}K tokens</div>
      `;
      const rect = containerRef.current.getBoundingClientRect();
      tooltip.style.left = `${(event as MouseEvent).clientX - rect.left + 12}px`;
      tooltip.style.top  = `${(event as MouseEvent).clientY - rect.top  - 10}px`;
      tooltip.style.opacity = '1';
      tooltip.style.pointerEvents = 'none';
    }

    function hideTooltip() {
      if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
    }
  }, [breakdowns, modelMap, t]);

  // Initial draw + resize observer
  useEffect(() => {
    draw();
    const ro = new ResizeObserver(draw);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [draw]);

  // Dark mode observer
  useEffect(() => {
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [draw]);

  const freeModels = breakdowns.filter(bd => bd.is_free);

  if (breakdowns.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 dark:text-slate-500 text-sm">
        {t('chart.empty_select_2')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: INPUT_COLOR }} />
          {t('chart.legend_input')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: OUTPUT_COLOR }} />
          {t('chart.legend_output')}
        </span>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="relative w-full overflow-hidden">
        <svg ref={svgRef} className="w-full" />
        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute z-50 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-800 dark:text-slate-200 text-sm pointer-events-none transition-opacity duration-150"
          style={{ opacity: 0, top: 0, left: 0 }}
        />
      </div>

      {/* Free models note */}
      {freeModels.map(bd => (
        <p key={bd.model_id} className="text-xs text-slate-400 dark:text-slate-500">
          {modelMap[bd.model_id]?.name}: FREE (self-hosted, no API cost)
        </p>
      ))}
    </div>
  );
}
