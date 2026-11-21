import React, { useState, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Info } from 'lucide-react';

const EMPTY_ARRAY = [];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const THRESHOLD_LABELS = {
  35: 'US EPA LIMIT (35 µg/m³)',
  60: 'INDIAN NAAQS LIMIT (60 µg/m³)',
  90: 'MODERATE / UNHEALTHY (90 µg/m³)',
  120: 'POOR / VERY POOR (120 µg/m³)',
  250: 'SEVERE EMERGENCY (250 µg/m³)',
};

function formatShortDate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string') return '—';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  return `${day} ${MONTH_NAMES[monthIdx] || parts[1]}`;
}

function parseUtcDayMs(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function ChartTooltipContent({ active, payload, failurePinMap }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  const pin = failurePinMap.get(d.date);
  const lower = d.lower_80 ?? d.lower;
  const upper = d.upper_80 ?? d.upper;
  const signedErr = Number(d.actual) - Number(d.model);
  const absErr = Math.abs(signedErr);

  return (
    <div className="p-3.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl font-mono text-xs max-w-[290px] space-y-1.5 z-50">
      <div className="flex justify-between items-center pb-1 border-b border-[#111111]/10 dark:border-white/10 font-bold">
        <span className="text-[#111111] dark:text-white">{d.date}</span>
        {d.in_diwali_window ? (
          <span className="text-amber-500 font-bold text-[10px]">★ DIWALI</span>
        ) : null}
      </div>

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between gap-4">
          <span className="text-[#6E6D68] dark:text-slate-400">Actual PM2.5:</span>
          <strong className="text-[#111111] dark:text-white">
            {Number(d.actual).toFixed(1)} µg/m³
          </strong>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#6E6D68] dark:text-slate-400">Model Forecast:</span>
          <strong className="text-blue-600 dark:text-cyan-400">
            {Number(d.model).toFixed(1)} µg/m³
          </strong>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#6E6D68] dark:text-slate-400">Baseline (t = t-1):</span>
          <span>{Number(d.baseline).toFixed(1)} µg/m³</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#6E6D68] dark:text-slate-400">80% Interval:</span>
          <span>
            {Number(lower).toFixed(1)} – {Number(upper).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-[#111111]/10 dark:border-white/10">
          <span className="text-[#6E6D68] dark:text-slate-400">Signed Error:</span>
          <span className={signedErr >= 0 ? 'font-bold text-red-500' : 'font-bold text-blue-500'}>
            {signedErr >= 0 ? '+' : ''}
            {signedErr.toFixed(1)} µg/m³ (|{absErr.toFixed(1)}|)
          </span>
        </div>
        {pin ? (
          <div className="p-1.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-[10px] font-bold">
            ⚡ {pin.label} (Click to inspect hypothesis)
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default React.memo(function TrajectoryChart({
  chartData = EMPTY_ARRAY,
  selectedDate,
  setSelectedDate,
  threshold = 60,
  diwaliDates = EMPTY_ARRAY,
  worstFailures = EMPTY_ARRAY,
  data = null,
  isDark = true,
  lang = 'en',
  t,
  onSelectFailurePin,
  disabledMotion = false,
}) {
  const [showModel, setShowModel] = useState(true);
  const [showActual, setShowActual] = useState(true);
  const [showBaseline, setShowBaseline] = useState(true);
  const [showBand, setShowBand] = useState(true);
  const [showSeasonSplit, setShowSeasonSplit] = useState(true);
  const [showDataGap, setShowDataGap] = useState(true);
  const [showFailurePins, setShowFailurePins] = useState(true);

  const colors = useMemo(
    () => ({
      axis: isDark ? '#94A3B8' : '#64748B',
      tick: isDark ? '#94A3B8' : '#64748B',
      actual: isDark ? '#F8FAFC' : '#0F172A',
      model: isDark ? '#38BDF8' : '#0284C7',
      baseline: isDark ? '#64748B' : '#94A3B8',
      band: isDark ? '#38BDF8' : '#0284C7',
      bandOpacity: isDark ? 0.12 : 0.08,
      thresholdLine: isDark ? '#F43F5E' : '#DC2626',
      diwali: isDark ? '#F59E0B' : '#D97706',
      split: isDark ? '#A855F7' : '#9333EA',
      gapBg: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.1)',
      cursor: isDark ? '#38BDF8' : '#0284C7',
    }),
    [isDark]
  );

  // Set of present dates in chartData for O(1) membership checks
  const chartDateSet = useMemo(() => {
    const s = new Set();
    for (const d of chartData) {
      if (d?.date) s.add(d.date);
    }
    return s;
  }, [chartData]);

  // Dynamically derive Top 5 failure pins from results.json (or compute directly from chartData)
  const failurePins = useMemo(() => {
    const sourceFailures =
      worstFailures.length > 0
        ? worstFailures
        : data?.worst_failures?.length > 0
        ? data.worst_failures
        : EMPTY_ARRAY;

    if (sourceFailures.length > 0) {
      return sourceFailures
        .map((f) => {
          const dt = f.target_date || f.date;
          if (!dt || !chartDateSet.has(dt)) return null;
          const signed = Number(
            f.signed_error ?? Number(f.actual_pm25 ?? 0) - Number(f.model_forecast ?? 0)
          );
          const sign = signed >= 0 ? '+' : '';
          return {
            date: dt,
            signedError: signed,
            label: `${formatShortDate(dt)} (${sign}${signed.toFixed(1)})`,
            color: signed >= 0 ? '#EF4444' : '#3B82F6',
          };
        })
        .filter(Boolean);
    }

    // Fallback: dynamically compute top 5 absolute errors directly from chartData
    const scored = [];
    for (const d of chartData) {
      if (typeof d?.actual === 'number' && typeof d?.model === 'number') {
        const signed = d.actual - d.model;
        scored.push({ date: d.date, signed, abs: Math.abs(signed) });
      }
    }
    scored.sort((a, b) => b.abs - a.abs);
    return scored.slice(0, 5).map((item) => {
      const sign = item.signed >= 0 ? '+' : '';
      return {
        date: item.date,
        signedError: item.signed,
        label: `${formatShortDate(item.date)} (${sign}${item.signed.toFixed(1)})`,
        color: item.signed >= 0 ? '#EF4444' : '#3B82F6',
      };
    });
  }, [worstFailures, data, chartData, chartDateSet]);

  const failurePinMap = useMemo(() => {
    const map = new Map();
    for (const pin of failurePins) {
      map.set(pin.date, pin);
    }
    return map;
  }, [failurePins]);

  // Dynamically detect real multi-day sensor outage gaps in chartData (gaps > 3 days dropped by pipeline)
  const sensorGaps = useMemo(() => {
    const gaps = [];
    for (let i = 1; i < chartData.length; i++) {
      const prevDate = chartData[i - 1]?.date;
      const currDate = chartData[i]?.date;
      if (!prevDate || !currDate) continue;
      const diffDays = Math.round((parseUtcDayMs(currDate) - parseUtcDayMs(prevDate)) / 86400000);
      if (diffDays > 1) {
        gaps.push({
          x1: prevDate,
          x2: currDate,
          missingDays: diffDays - 1,
        });
      }
    }
    return gaps;
  }, [chartData]);

  // Dynamically locate the first smog-season date (>= 15 Oct) in the active dataset
  const seasonSplitDate = useMemo(() => {
    for (const d of chartData) {
      if (d?.in_season === true) return d.date;
    }
    for (const d of chartData) {
      if (!d?.date) continue;
      const [, mStr, dayStr] = d.date.split('-');
      const m = Number(mStr);
      const day = Number(dayStr);
      if (m > 10 || (m === 10 && day >= 15)) return d.date;
    }
    return null;
  }, [chartData]);

  // Render only Diwali markers that fall inside the active chart window
  const visibleDiwaliDates = useMemo(() => {
    const rawDates =
      diwaliDates.length > 0 ? diwaliDates : data?.diwali_dates || EMPTY_ARRAY;
    return rawDates.filter((dw) => chartDateSet.has(dw));
  }, [diwaliDates, data, chartDateSet]);

  const thresholdLabel =
    THRESHOLD_LABELS[threshold] || `ALERT THRESHOLD (${threshold} µg/m³)`;

  const handleChartClick = useCallback(
    (e) => {
      if (e?.activePayload?.[0]?.payload?.date) {
        const clickedDate = e.activePayload[0].payload.date;
        setSelectedDate(clickedDate);
        if (failurePinMap.has(clickedDate) && onSelectFailurePin) {
          onSelectFailurePin(clickedDate);
        }
      }
    },
    [setSelectedDate, failurePinMap, onSelectFailurePin]
  );

  const renderTooltip = useCallback(
    (tooltipProps) => (
      <ChartTooltipContent {...tooltipProps} failurePinMap={failurePinMap} />
    ),
    [failurePinMap]
  );

  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl border border-[#111111]/15 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-900/80 backdrop-blur-xl shadow-sm space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-baseline justify-between pb-3 border-b border-[#111111]/10 dark:border-white/10 gap-3">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 block">
            {t('chartTitle')}
          </span>
          <h3 className="font-serif text-xl sm:text-2xl text-[#111111] dark:text-white mt-0.5">
            {t('chartSubtitle')}
          </h3>
        </div>

        {/* Series Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setShowModel((v) => !v)}
            className={`px-2 py-0.5 rounded border transition ${
              showModel
                ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-cyan-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleModel')}
          </button>
          <button
            type="button"
            onClick={() => setShowActual((v) => !v)}
            className={`px-2 py-0.5 rounded border transition ${
              showActual
                ? 'border-slate-800 dark:border-white bg-slate-800/10 dark:bg-white/10 text-[#111111] dark:text-white font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleActual')}
          </button>
          <button
            type="button"
            onClick={() => setShowBaseline((v) => !v)}
            className={`px-2 py-0.5 rounded border transition ${
              showBaseline
                ? 'border-slate-500 bg-slate-500/10 text-[#6E6D68] dark:text-slate-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleBaseline')}
          </button>
          <button
            type="button"
            onClick={() => setShowBand((v) => !v)}
            className={`px-2 py-0.5 rounded border transition ${
              showBand
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleBand')}
          </button>

          <span className="w-px h-4 bg-[#111111]/20 dark:bg-white/20 mx-1 hidden sm:block" />

          {/* Diagnostic Overlay Toggles */}
          <button
            type="button"
            onClick={() => setShowSeasonSplit((v) => !v)}
            className={`px-2 py-0.5 rounded border transition ${
              showSeasonSplit
                ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleSplit')}
          </button>
          <button
            type="button"
            onClick={() => setShowDataGap((v) => !v)}
            className={`px-2 py-0.5 rounded border transition ${
              showDataGap
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartToggleGap')}
          </button>
          <button
            type="button"
            onClick={() => setShowFailurePins((v) => !v)}
            className={`px-2 py-0.5 rounded border transition ${
              showFailurePins
                ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300 font-bold'
                : 'border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-500'
            }`}
          >
            {t('chartTogglePins')}
          </button>
        </div>
      </div>

      {/* Interactive Chart Canvas */}
      <div className="h-80 sm:h-[440px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            key={isDark ? 'dark' : 'light'}
            data={chartData}
            margin={{ top: 20, right: 15, left: -15, bottom: 5 }}
            onClick={handleChartClick}
          >
            <XAxis
              dataKey="date"
              stroke={colors.axis}
              strokeWidth={1}
              tickLine={{ stroke: colors.axis }}
              tick={{ fontSize: 10, fill: colors.tick, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(val) => {
                const parts = String(val).split('-');
                return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
              }}
              minTickGap={24}
            />
            <YAxis
              stroke={colors.axis}
              strokeWidth={1}
              tickLine={{ stroke: colors.axis }}
              tick={{ fontSize: 10, fill: colors.tick, fontFamily: 'JetBrains Mono' }}
              domain={[0, 'auto']}
            />

            <Tooltip content={renderTooltip} />

            {/* Dynamically Detected OpenAQ Sensor Outage Gaps */}
            {showDataGap
              ? sensorGaps.map((gap) => (
                  <ReferenceArea
                    key={`${gap.x1}-${gap.x2}`}
                    x1={gap.x1}
                    x2={gap.x2}
                    fill={colors.gapBg}
                    stroke={colors.diwali}
                    strokeDasharray="3 3"
                    label={{
                      value: `${gap.missingDays}-Day OpenAQ Outage Gap (Dropped)`,
                      position: 'insideTopLeft',
                      fill: colors.diwali,
                      fontSize: 9,
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                ))
              : null}

            {/* Dynamic Smog Season Regime Split Line */}
            {showSeasonSplit && seasonSplitDate ? (
              <ReferenceLine
                x={seasonSplitDate}
                stroke={colors.split}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: `${formatShortDate(seasonSplitDate).toUpperCase()}: SMOG SEASON SPLIT →`,
                  position: 'insideTopLeft',
                  fill: colors.split,
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 'bold',
                }}
              />
            ) : null}

            {/* Active Regulatory Threshold Reference Line */}
            <ReferenceLine
              y={threshold}
              stroke={colors.thresholdLine}
              strokeDasharray="4 4"
              strokeWidth={1.25}
              label={{
                value: thresholdLabel,
                fill: colors.thresholdLine,
                fontSize: 9,
                fontFamily: 'JetBrains Mono',
                position: 'top',
              }}
            />

            {/* Diwali Date Markers Inside Active Chart Window */}
            {visibleDiwaliDates.map((dw) => (
              <ReferenceLine
                key={dw}
                x={dw}
                stroke={colors.diwali}
                strokeWidth={1.2}
                label={{
                  value: `DIWALI (${dw})`,
                  fill: colors.diwali,
                  fontSize: 9,
                  fontFamily: 'JetBrains Mono',
                  position: 'insideTopRight',
                }}
              />
            ))}

            {/* 80% Shaded Uncertainty Band */}
            {showBand ? (
              <>
                <Area
                  type="monotone"
                  dataKey="rangeBase"
                  stackId="range"
                  stroke="transparent"
                  fill="transparent"
                  legendType="none"
                  isAnimationActive={!disabledMotion}
                  animationDuration={700}
                />
                <Area
                  name="80% Range"
                  type="monotone"
                  dataKey="rangeDelta"
                  stackId="range"
                  stroke="transparent"
                  fill={colors.band}
                  fillOpacity={colors.bandOpacity}
                  isAnimationActive={!disabledMotion}
                  animationDuration={700}
                />
              </>
            ) : null}

            {/* Actual Ground Station Measurements Line */}
            {showActual ? (
              <Line
                name="Actual"
                type="monotone"
                dataKey="actual"
                stroke={colors.actual}
                strokeWidth={1.75}
                dot={{ r: 1.5, fill: colors.actual }}
                activeDot={{ r: 5, fill: colors.actual }}
                isAnimationActive={!disabledMotion}
                animationDuration={700}
              />
            ) : null}

            {/* Model Forecast Line */}
            {showModel ? (
              <Line
                name="Model"
                type="monotone"
                dataKey="model"
                stroke={colors.model}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: colors.model }}
                isAnimationActive={!disabledMotion}
                animationDuration={700}
              />
            ) : null}

            {/* Naive Persistence Baseline */}
            {showBaseline ? (
              <Line
                name="Baseline"
                type="monotone"
                dataKey="baseline"
                stroke={colors.baseline}
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={!disabledMotion}
                animationDuration={700}
              />
            ) : null}

            {/* Dynamic Top-5 Failure Pins */}
            {showFailurePins
              ? failurePins.map((pin) => (
                  <ReferenceLine
                    key={pin.date}
                    x={pin.date}
                    stroke={pin.color}
                    strokeWidth={1.5}
                    label={{
                      value: `▼ ${pin.label}`,
                      fill: pin.color,
                      fontSize: 8.5,
                      fontFamily: 'JetBrains Mono',
                      position: 'insideBottomRight',
                    }}
                  />
                ))
              : null}

            {/* Active Selected Day Cursor */}
            {selectedDate && chartDateSet.has(selectedDate) ? (
              <ReferenceLine x={selectedDate} stroke={colors.cursor} strokeWidth={2} />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Diagnostic Summary */}
      <div className="pt-3 border-t border-[#111111]/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-[#6E6D68] dark:text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>
            {lang === 'hi'
              ? 'विशिष्ट तिथि का निरीक्षण करने हेतु किसी बिंदु अथवा विफलता पिन पर क्लिक करें।'
              : 'Click any point or failure pin (▼) to inspect that date & open its meteorological hypothesis.'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Smog Split
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Outage Gap
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Failure Pins
          </span>
        </div>
      </div>
    </div>
  );
});