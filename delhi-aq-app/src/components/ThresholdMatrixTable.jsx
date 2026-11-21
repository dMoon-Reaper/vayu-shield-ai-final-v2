import React from 'react';

export default React.memo(function ThresholdMatrixTable({
  thresholdTable = [],
  activeThreshold = 60,
  activePolicy = 'calibrated',
  onSelectThreshold,
  isDark = true,
  lang = 'en',
  t,
}) {
  return (
    <section className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-3 border-b border-[#111111]/15 dark:border-white/10 gap-2">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-blue-600 dark:text-cyan-400 font-bold block">
            {t('matrixTitle')}
          </span>
          <h3 className="font-serif text-2xl text-[#111111] dark:text-white mt-0.5">
            {t('matrixSubtitle')}
          </h3>
        </div>
        <span className="font-mono text-xs text-[#6E6D68] dark:text-slate-400">
          ALL 5 THRESHOLDS × 3 OPERATIONAL RULES
        </span>
      </div>

      {/* Full-Density Matrix Table */}
      <div className="overflow-x-auto border border-[#111111]/15 dark:border-white/10 rounded-2xl bg-[#F8F7F4] dark:bg-slate-900/80 shadow-sm">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#111111]/15 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-800/60 text-[#6E6D68] dark:text-slate-400">
              <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 font-bold text-[#111111] dark:text-white">
                {t('colThreshold')}
              </th>
              <th className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center">
                {t('colDaysAbove')}
              </th>
              <th
                colSpan={3}
                className={`p-3 border-r border-[#111111]/15 dark:border-white/10 text-center font-bold ${
                  activePolicy === 'point'
                    ? 'bg-blue-500/15 text-blue-900 dark:text-cyan-300'
                    : 'bg-[#111111]/[0.02] dark:bg-slate-800/30'
                }`}
              >
                {t('colPointRule')} {activePolicy === 'point' ? '• [ACTIVE]' : ''}
              </th>
              <th
                colSpan={3}
                className={`p-3 border-r border-[#111111]/15 dark:border-white/10 text-center font-bold ${
                  activePolicy === 'conservative'
                    ? 'bg-indigo-500/15 text-indigo-900 dark:text-indigo-300'
                    : 'bg-[#111111]/[0.04] dark:bg-slate-800/50'
                }`}
              >
                {t('colConservative')} {activePolicy === 'conservative' ? '• [ACTIVE]' : ''}
              </th>
              <th
                colSpan={3}
                className={`p-3 text-center font-bold ${
                  activePolicy === 'calibrated'
                    ? 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-300'
                    : 'bg-[#111111]/[0.02] dark:bg-slate-800/30'
                }`}
              >
                {t('colRiskRule')} {activePolicy === 'calibrated' ? '★ [RECOMMENDED]' : ''}
              </th>
            </tr>
            <tr className="border-b border-[#111111]/15 dark:border-white/10 text-[10px] text-[#6E6D68] dark:text-slate-400">
              <th className="p-2 border-r border-[#111111]/15 dark:border-white/10">Cutoff</th>
              <th className="p-2 border-r border-[#111111]/15 dark:border-white/10 text-center">Ground Truth</th>
              <th className="p-2 text-center text-[#111111] dark:text-white">Hit</th>
              <th className="p-2 text-center text-red-600 dark:text-red-400 font-bold">Miss (FN)</th>
              <th className="p-2 border-r border-[#111111]/15 dark:border-white/10 text-center">FA (FP)</th>
              <th className="p-2 text-center text-[#111111] dark:text-white">Hit</th>
              <th className="p-2 text-center text-red-600 dark:text-red-400 font-bold">Miss (FN)</th>
              <th className="p-2 border-r border-[#111111]/15 dark:border-white/10 text-center">FA (FP)</th>
              <th className="p-2 text-center text-[#111111] dark:text-white">Hit</th>
              <th className="p-2 text-center text-red-600 dark:text-red-400 font-bold">Miss (FN)</th>
              <th className="p-2 text-center">FA (FP)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111111]/10 dark:divide-white/10">
            {thresholdTable.map((r) => {
              const isDefaultChosen = r.threshold === 60;
              const isSelected = r.threshold === activeThreshold;
              return (
                <tr
                  key={r.threshold}
                  onClick={() => onSelectThreshold && onSelectThreshold(r.threshold)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-cyan-950/40 ring-1 ring-blue-500/40'
                      : isDefaultChosen
                      ? 'bg-emerald-500/[0.04] dark:bg-emerald-950/20'
                      : 'hover:bg-[#111111]/[0.02] dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 font-bold">
                    <div className="flex items-center gap-1.5">
                      {isDefaultChosen ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ★ [NAAQS]
                        </span>
                      ) : null}
                      <span>{r.threshold} µg/m³</span>
                      {isSelected ? (
                        <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold">
                          (Active)
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-3 border-r border-[#111111]/15 dark:border-white/10 text-center tabular-nums font-semibold">
                    {r.days_above}
                  </td>
                  {/* Point Rule */}
                  <td className="p-3 text-center tabular-nums text-[#111111] dark:text-white">{r.pt_hit}</td>
                  <td className="p-3 text-center tabular-nums text-red-600 dark:text-red-400 font-bold">{r.pt_miss}</td>
                  <td className="p-3 text-center tabular-nums border-r border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-400">{r.pt_fa}</td>
                  {/* Conservative Rule */}
                  <td className="p-3 text-center tabular-nums text-[#111111] dark:text-white font-bold">{r.ct_hit}</td>
                  <td className="p-3 text-center tabular-nums text-emerald-600 dark:text-emerald-400 font-extrabold">{r.ct_miss}</td>
                  <td className="p-3 text-center tabular-nums border-r border-[#111111]/15 dark:border-white/10 text-[#6E6D68] dark:text-slate-400">{r.ct_fa}</td>
                  {/* Mid-Risk Calibrated Rule */}
                  <td className="p-3 text-center tabular-nums text-[#111111] dark:text-white font-bold">{r.pr_hit}</td>
                  <td className="p-3 text-center tabular-nums text-red-600 dark:text-red-400 font-bold">{r.pr_miss}</td>
                  <td className="p-3 text-center tabular-nums text-[#6E6D68] dark:text-slate-400">{r.pr_fa}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend & Explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-[#111111]/10 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 font-mono text-xs">
        <div>
          <strong className="text-emerald-600 dark:text-emerald-400 block mb-0.5">HIT (True Positive)</strong>
          <span className="text-[11px] text-[#6E6D68] dark:text-slate-400">
            Correct alert issued prior to unhealthy morning air. Children protected.
          </span>
        </div>
        <div>
          <strong className="text-red-600 dark:text-red-400 block mb-0.5">MISS (False Negative)</strong>
          <span className="text-[11px] text-[#6E6D68] dark:text-slate-400">
            Critical pediatric failure: unannounced toxic exposure during morning assembly.
          </span>
        </div>
        <div>
          <strong className="text-[#111111] dark:text-slate-300 block mb-0.5">FALSE ALARM (False Positive)</strong>
          <span className="text-[11px] text-[#6E6D68] dark:text-slate-400">
            Precautionary cancellation when air remained within safe limits.
          </span>
        </div>
      </div>
    </section>
  );
});
