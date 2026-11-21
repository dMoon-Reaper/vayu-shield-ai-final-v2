import React, { useState, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Flame, Calendar, Info } from 'lucide-react';

const EMPTY_ARRAY = [];

const METRIC_OPTIONS = [
  { id: 'maeSeason', label: 'Smog Season MAE' },
  { id: 'maeDiwali', label: 'Diwali Window MAE' },
  { id: 'maeAll', label: 'Overall MAE' },
  { id: 'rmse', label: 'Overall RMSE' },
];

const METRIC_META = {
  maeSeason: { label: 'Smog Season MAE', prefix: '±' },
  maeDiwali: { label: 'Diwali Window MAE', prefix: '±' },
  maeAll: { label: 'Overall MAE', prefix: '±' },
  rmse: { label: 'Overall RMSE', prefix: '' },
};

function deriveShortName(name) {
  const lower = String(name).toLowerCase();
  if (lower.includes('persistence')) return 'Persistence';
  if (lower.includes('log-ratio') && lower.includes('diwali')) return 'LogRatio + Diwali';
  if (lower.includes('log-ratio')) return 'GBM LogRatio';
  if (lower.includes('diwali')) return 'GBM + Diwali';
  if (lower.includes('gbm')) return 'GBM Base';
  return String(name).slice(0, 18);
}

function deriveDescription(name) {
  const lower = String(name).toLowerCase();
  if (lower.includes('persistence')) {
    return "Naive baseline projecting today's PM2.5 directly onto tomorrow.";
  }
  if (lower.includes('log-ratio') && lower.includes('diwali')) {
    return 'Multiplicative log-ratio target ln(tomorrow/today) combined with Diwali calendar features.';
  }
  if (lower.includes('log-ratio')) {
    return 'HistGradientBoostingRegressor predicting multiplicative log-ratio ln(tomorrow/today).';
  }
  if (lower.includes('diwali')) {
    return 'Additive GBM augmented with diwali_offset (-10 to +10) and festival window flags.';
  }
  return 'HistGradientBoostingRegressor trained on baseline meteorology & autoregressive lag features.';
}

function AblationTooltipContent({ active, payload, selectedMetric }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  const meta = METRIC_META[selectedMetric] || METRIC_META.maeSeason;
  const val = item[selectedMetric];

  return (
    <div className="p-3 rounded-lg border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl font-mono text-xs max-w-[260px] space-y-1">
      <strong className="text-[#111111] dark:text-white block">{item.name}</strong>
      <div className="text-[11px] text-[#6E6D68] dark:text-slate-300">{item.description}</div>
      <div className="pt-1 border-t border-[#111111]/10 dark:border-white/10 text-amber-600 dark:text-amber-400 font-bold">
        {meta.label}: {meta.prefix}
        {Number(val).toFixed(2)} µg/m³
      </div>
    </div>
  );
}

export default React.memo(function DiwaliAblationExplorer({
  diwaliVariants = EMPTY_ARRAY,
  diwaliMetadata = null,
  diwaliDates = EMPTY_ARRAY,
  data = null,
  isDark = true,
  t,
  disabledMotion = false,
}) {
  const [selectedMetric, setSelectedMetric] = useState('maeSeason');

  // Normalize variants from results.json (supports model_diwali.py snake_case & camelCase)
  const variants = useMemo(() => {
    const raw =
      diwaliVariants.length > 0
        ? diwaliVariants
        : data?.diwali_variants?.length > 0
        ? data.diwali_variants
        : EMPTY_ARRAY;

    if (raw.length === 0) return EMPTY_ARRAY;

    const normalized = raw.map((v) => {
      const name = v.variant ?? v.name ?? 'Variant';
      return {
        name,
        shortName: v.shortName ?? deriveShortName(name),
        description: v.description ?? deriveDescription(name),
        rmse: Number(v.rmse_all ?? v.rmse ?? 0),
        maeAll: Number(v.mae_all ?? v.maeAll ?? 0),
        maeSeason: Number(v.mae_season ?? v.maeSeason ?? 0),
        maeDiwali: Number(v.mae_diwali_window ?? v.maeDiwali ?? 0),
        maePreSeason: Number(v.mae_pre_season ?? v.maePreSeason ?? 0),
      };
    });

    // Identify lowest Smog Season MAE dynamically via single-pass min loop
    let minSeason = Infinity;
    for (const item of normalized) {
      if (item.maeSeason < minSeason) minSeason = item.maeSeason;
    }

    return normalized.map((item) => ({
      ...item,
      highlight: item.maeSeason <= minSeason + 1e-9,
    }));
  }, [diwaliVariants, data]);

  // Identify lowest value for the currently active chart metric
  const bestSelectedValue = useMemo(() => {
    let minVal = Infinity;
    for (const item of variants) {
      const val = item[selectedMetric];
      if (typeof val === 'number' && val < minVal) minVal = val;
    }
    return minVal;
  }, [variants, selectedMetric]);

  // Dynamically derive period day counts from results.json
  const periodCounts = useMemo(() => {
    const days = data?.days || EMPTY_ARRAY;
    const total = days.length || null;
    const season =
      data?.seasonal_split?.smog_season_from_oct_15?.day_count ??
      (days.length ? days.filter((d) => d.in_season).length : null);
    const pre =
      data?.seasonal_split?.pre_season_before_oct_15?.day_count ??
      (days.length ? days.filter((d) => !d.in_season).length : null);
    const diwali = days.length ? days.filter((d) => d.in_diwali_window).length : null;
    return { total, season, pre, diwali };
  }, [data]);

  const resolvedMeta = diwaliMetadata || data?.diwali_experiment_metadata || null;

  const citedDates = useMemo(() => {
    const rawDates =
      resolvedMeta?.cited_diwali_dates?.length > 0
        ? resolvedMeta.cited_diwali_dates
        : diwaliDates.length > 0
        ? diwaliDates
        : data?.diwali_dates || EMPTY_ARRAY;
    const sourceLabel =
      resolvedMeta?.date_sources || 'Astronomical Ephemeris & Drik Panchang (Lakshmi Puja)';

    return rawDates.map((dt) => ({
      year: String(dt).slice(0, 4),
      date: String(dt),
      source: sourceLabel,
    }));
  }, [resolvedMeta, diwaliDates, data]);

  const takeawayText = resolvedMeta?.scientific_conclusion || t('diwaliTakeaway');

  const renderTooltip = useCallback(
    (tooltipProps) => (
      <AblationTooltipContent {...tooltipProps} selectedMetric={selectedMetric} />
    ),
    [selectedMetric]
  );

  return (
    <section className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-3 border-b border-[#111111]/15 dark:border-white/10 gap-2">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            {t('diwaliTitle')}
          </span>
          <h3 className="font-serif text-2xl text-[#111111] dark:text-white mt-0.5">
            {t('diwaliSubtitle')}
          </h3>
        </div>
        <span className="font-mono text-xs text-[#6E6D68] dark:text-slate-400">
          {variants.length} EXPERIMENTAL VARIANTS FROM MODEL_DIWALI.PY
        </span>
      </div>

      {/* Scientific Integrity Callout */}
      <div className="p-4 rounded-xl border border-blue-300 dark:border-cyan-800/40 bg-blue-50/60 dark:bg-slate-900/60 font-mono text-xs space-y-1">
        <div className="font-bold text-blue-900 dark:text-cyan-300 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
          <span>SCIENTIFIC INTEGRITY DISCLOSURE // ABLATION SUMMARY:</span>
        </div>
        <p className="font-sans text-xs text-[#111111] dark:text-slate-300 leading-relaxed">
          {takeawayText}
        </p>
      </div>

      {variants.length === 0 ? (
        <div className="p-6 rounded-2xl border border-amber-400/40 bg-amber-50/60 dark:bg-amber-950/20 font-mono text-xs text-amber-800 dark:text-amber-300">
          No <code>diwali_variants</code> found in the loaded <code>results.json</code>. Run{' '}
          <code>python model_diwali.py</code> and upload or refresh the dataset to populate this
          ablation table.
        </div>
      ) : (
        <>
          {/* Comparative Bar Chart */}
          <div className="p-6 rounded-2xl border border-[#111111]/15 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-900/80 backdrop-blur-xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#111111]/10 dark:border-white/10 gap-2">
              <span className="font-mono text-xs font-bold text-[#111111] dark:text-white uppercase">
                REGRESSION ERROR COMPARISON (µg/m³ • LOWER IS BETTER)
              </span>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="text-[#6E6D68] dark:text-slate-400">Metric:</span>
                {METRIC_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMetric(m.id)}
                    className={`px-2 py-0.5 rounded border text-[11px] transition ${
                      selectedMetric === m.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                        : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={variants}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={isDark ? 0.1 : 0.15} />
                  <XAxis
                    dataKey="shortName"
                    tick={{
                      fontSize: 10,
                      fill: isDark ? '#94A3B8' : '#64748B',
                      fontFamily: 'JetBrains Mono',
                    }}
                    stroke={isDark ? '#64748B' : '#94A3B8'}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: isDark ? '#94A3B8' : '#64748B',
                      fontFamily: 'JetBrains Mono',
                    }}
                    stroke={isDark ? '#64748B' : '#94A3B8'}
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={renderTooltip} />
                  <Bar
                    dataKey={selectedMetric}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={!disabledMotion}
                  >
                    {variants.map((entry) => {
                      const isBest = entry[selectedMetric] <= bestSelectedValue + 1e-9;
                      const fill = isBest
                        ? isDark
                          ? '#10B981'
                          : '#059669'
                        : isDark
                        ? '#38BDF8'
                        : '#0284C7';
                      return <Cell key={entry.name} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dynamic 5-Variant Comparison Table */}
          <div className="overflow-x-auto border border-[#111111]/15 dark:border-white/10 rounded-2xl bg-[#F8F7F4] dark:bg-slate-900/80 shadow-sm">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#111111]/[0.03] dark:bg-slate-800/60 border-b border-[#111111]/15 dark:border-white/10 text-[11px] text-[#6E6D68] dark:text-slate-400">
                  <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 font-bold text-[#111111] dark:text-white">
                    MODEL VARIANT
                  </th>
                  <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center">
                    RMSE ALL
                  </th>
                  <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center">
                    MAE ALL{periodCounts.total ? ` (${periodCounts.total}d)` : ''}
                  </th>
                  <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center text-purple-700 dark:text-purple-300 font-bold">
                    MAE SEASON (≥15 Oct{periodCounts.season ? `, ${periodCounts.season}d` : ''})
                  </th>
                  <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center text-amber-700 dark:text-amber-300 font-bold">
                    MAE DIWALI{periodCounts.diwali ? ` (${periodCounts.diwali}d)` : ''}
                  </th>
                  <th className="p-3 text-center">
                    MAE PRE-OCT 15{periodCounts.pre ? ` (${periodCounts.pre}d)` : ''}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/10 dark:divide-white/10">
                {variants.map((v) => (
                  <tr
                    key={v.name}
                    className={`hover:bg-[#111111]/[0.02] dark:hover:bg-slate-800/40 transition-colors ${
                      v.highlight ? 'bg-blue-50/50 dark:bg-cyan-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-[#111111] dark:text-white">
                      <div className="flex items-center gap-1.5">
                        {v.highlight ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-cyan-400 shrink-0" />
                        ) : null}
                        <span>{v.name}</span>
                      </div>
                    </td>
                    <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center tabular-nums">
                      {v.rmse.toFixed(1)}
                    </td>
                    <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center tabular-nums">
                      {v.maeAll.toFixed(1)}
                    </td>
                    <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center tabular-nums text-purple-700 dark:text-purple-300 font-bold">
                      {v.maeSeason.toFixed(1)}
                    </td>
                    <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center tabular-nums text-amber-700 dark:text-amber-300 font-bold">
                      {v.maeDiwali.toFixed(1)}
                    </td>
                    <td className="p-3 text-center tabular-nums text-[#6E6D68] dark:text-slate-400">
                      {v.maePreSeason.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Cited Diwali Dates Reference Deck (Dynamic from results.json) */}
      {citedDates.length > 0 ? (
        <div className="p-4 rounded-xl border border-[#111111]/10 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 font-mono text-xs space-y-2">
          <div className="font-bold text-[#111111] dark:text-white uppercase flex items-center gap-1.5 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>CITED DIWALI DATES (LAKSHMI PUJA EPHEMERIS SOURCES):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {citedDates.map((s) => (
              <div
                key={s.date}
                className="p-2 rounded border border-[#111111]/10 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-800/40"
              >
                <div className="flex justify-between font-bold text-[#111111] dark:text-white">
                  <span>{s.year}</span>
                  <span className="text-amber-600 dark:text-amber-400">{s.date}</span>
                </div>
                <span
                  className="text-[10px] text-[#6E6D68] dark:text-slate-400 block mt-0.5 truncate"
                  title={s.source}
                >
                  {s.source}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
});