import React, { useState } from 'react';
import TiltCard from './TiltCard';
import AnimatedSvgWrapper from './AnimatedSvgWrapper';
import NoveltyComparisonMatrix from './NoveltyComparisonMatrix';
import {
  Layers,
  Wind,
  Cpu,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Database,
  ArrowRight,
  TrendingDown,
  Calendar,
  Sparkles,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';

export default function IsometricPipeline({ isDark = true, lang = 'en', onLaunchApp }) {
  const [activeLayer, setActiveLayer] = useState(3); // default to top layer (Decision Shield)
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'novelty'

  return (
    <section className="w-full space-y-12">
      {/* 3D Isometric Atmospheric Visualizer Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#111111]/15 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-900/60 p-6 sm:p-10 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left: Interactive Layer Explanation */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-blue-500/10 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-300 border border-blue-500/20 dark:border-cyan-500/30">
              <Layers className="w-3.5 h-3.5" />
              <span>3D ISOMETRIC TELEMETRY STACK // 4 STAGES</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#111111] dark:text-white font-normal leading-tight">
              From Raw Atmospheric Physics to School Gate Protection
            </h3>
            <p className="font-sans text-sm text-[#6E6D68] dark:text-slate-300 leading-relaxed">
              Air pollution prediction cannot rely on simple time-series persistence during severe inversion seasons. Hover over the isometric strata on the right to examine each transformation layer.
            </p>

            {/* Quick Layer Switcher Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 font-mono text-xs">
              {[
                { id: 0, name: 'L1: Ground Sensors', icon: Database },
                { id: 1, name: 'L2: Meteorology', icon: Wind },
                { id: 2, name: 'L3: HistGBM + q80', icon: Cpu },
                { id: 3, name: 'L4: Decision Shield', icon: ShieldCheck },
              ].map((layer) => {
                const IconComponent = layer.icon;
                const isActive = activeLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => setActiveLayer(layer.id)}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-200 ${
                      isActive
                        ? 'border-blue-600 dark:border-cyan-400 bg-blue-50 dark:bg-cyan-950/40 text-blue-900 dark:text-cyan-200 shadow-sm'
                        : 'border-[#111111]/15 dark:border-white/10 hover:bg-[#111111]/[0.02] dark:hover:bg-slate-800/40 text-[#6E6D68] dark:text-slate-400'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mb-1" />
                    <span className="font-bold text-[11px]">{layer.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Layer Deep-Dive Info Box */}
            <div className="mt-4 p-4 rounded-xl border border-blue-200 dark:border-cyan-900/50 bg-blue-50/50 dark:bg-slate-800/60 font-mono text-xs space-y-1.5">
              <div className="font-bold text-blue-900 dark:text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-ping" />
                {activeLayer === 0 && 'LAYER 01: OPENAQ GROUND SENSOR TELEMETRY'}
                {activeLayer === 1 && 'LAYER 02: OPEN-METEO MULTI-PARAMETER METEOROLOGY'}
                {activeLayer === 2 && 'LAYER 03: HIST-GRADIENT BOOSTING & q80 UNCERTAINTY'}
                {activeLayer === 3 && 'LAYER 04: PEDIATRIC DECISION ENGINE & 07:30 PROTOCOL'}
              </div>
              <p className="font-sans text-xs text-[#111111] dark:text-slate-300">
                {activeLayer === 0 &&
                  'Continuous ingestion of real ground truth from OpenAQ Delhi station (loc 8118, sensor 23534). 1,019 days of calibrated PM2.5 measurements forming the empirical target.'}
                {activeLayer === 1 &&
                  'Surface wind speed, sin/cos directional vectors, boundary layer dynamics, relative humidity, surface temperature, and precipitation sum capturing washout & inversion events.'}
                {activeLayer === 2 &&
                  'Non-linear HistGradientBoostingRegressor (scikit-learn) with lag-1, lag-2, lag-3, lag-6, and rolling 3d/7d averages, augmented by empirical q80 training residual quantile (±20.7 µg/m³).'}
                {activeLayer === 3 &&
                  'Evaluates 3 operational decision rules against the 60 µg/m³ Indian NAAQS threshold, triggering automated directives for assemblies, sports, recess, and asthmatic child protection.'}
              </p>
            </div>
          </div>

          {/* Right: Pure CSS 3D Layered Isometric Atmospheric Stack */}
          <div className="w-full lg:w-1/2 flex items-center justify-center py-8">
            <div
              className="relative w-72 h-72 sm:w-80 sm:h-80"
              style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className="w-full h-full relative transition-transform duration-500"
                style={{
                  transform: 'rotateX(58deg) rotateZ(-34deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Layer 1: Ground Sensors (Base) */}
                <div
                  onClick={() => setActiveLayer(0)}
                  className={`absolute inset-0 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between p-4 ${
                    activeLayer === 0
                      ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                      : 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-400'
                  }`}
                  style={{
                    transform: `translateZ(${activeLayer === 0 ? '20px' : '0px'})`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="flex justify-between items-center text-emerald-400 font-mono text-[10px] uppercase font-bold">
                    <span>L1 // Ground Truth</span>
                    <span>OpenAQ (8118)</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold">
                    <Database className="w-4 h-4" />
                    <span>Station PM2.5 Ingestion</span>
                  </div>
                </div>

                {/* Layer 2: Weather & Boundary Layer (+45px) */}
                <div
                  onClick={() => setActiveLayer(1)}
                  className={`absolute inset-0 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between p-4 ${
                    activeLayer === 1
                      ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                      : 'border-blue-500/40 bg-blue-950/20 hover:border-blue-400'
                  }`}
                  style={{
                    transform: `translateZ(${activeLayer === 1 ? '75px' : '50px'})`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="flex justify-between items-center text-blue-400 font-mono text-[10px] uppercase font-bold">
                    <span>L2 // Atmosphere</span>
                    <span>Open-Meteo API</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-300 font-mono text-xs font-bold">
                    <Wind className="w-4 h-4" />
                    <span>Wind, Rain & Boundary Inversions</span>
                  </div>
                </div>

                {/* Layer 3: HistGBM + Quantiles (+95px) */}
                <div
                  onClick={() => setActiveLayer(2)}
                  className={`absolute inset-0 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between p-4 ${
                    activeLayer === 2
                      ? 'border-indigo-500 bg-indigo-500/25 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                      : 'border-indigo-500/40 bg-indigo-950/20 hover:border-indigo-400'
                  }`}
                  style={{
                    transform: `translateZ(${activeLayer === 2 ? '135px' : '100px'})`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="flex justify-between items-center text-indigo-400 font-mono text-[10px] uppercase font-bold">
                    <span>L3 // ML Forecasting</span>
                    <span>HistGBM + q80</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>Lag Features & ±20.7 Bounds</span>
                  </div>
                </div>

                {/* Layer 4: Pediatric Decision Engine (+145px) */}
                <div
                  onClick={() => setActiveLayer(3)}
                  className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between p-4 ${
                    activeLayer === 3
                      ? 'border-cyan-400 bg-cyan-500/25 shadow-[0_0_40px_rgba(0,245,212,0.4)] ring-2 ring-cyan-400/50'
                      : 'border-cyan-400/60 bg-cyan-950/25 hover:border-cyan-300'
                  }`}
                  style={{
                    transform: `translateZ(${activeLayer === 3 ? '195px' : '150px'})`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="flex justify-between items-center text-cyan-300 font-mono text-[10px] uppercase font-bold">
                    <span>L4 // School Decision</span>
                    <span>97.5% Acc • 96.9% Rec</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-200 font-mono text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-cyan-300" />
                    <span>07:30 AM Morning Shield</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive Bento Specification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: End-to-End Architecture Flow */}
        <TiltCard
          maxTilt={6}
          className="rounded-2xl border border-[#111111]/15 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-900/80 p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-[#111111]/10 dark:border-white/10 pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                CARD 01 // ARCHITECTURE
              </span>
              <span className="font-mono text-[10px] text-[#6E6D68] dark:text-slate-400">
                SCIKIT-LEARN 1.4+
              </span>
            </div>
            <h4 className="font-serif text-2xl text-[#111111] dark:text-white mt-3 font-normal">
              End-to-End Predictive Pipeline
            </h4>
            <p className="font-sans text-xs text-[#6E6D68] dark:text-slate-300 mt-2 leading-relaxed">
              Continuous machine learning flow translating ground station PM2.5 and boundary layer meteorology into calibrated next-day action gates.
            </p>

            {/* Mini Pipeline Flow Diagram */}
            <div className="mt-5 space-y-2.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg border border-[#111111]/10 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-[#111111] dark:text-white font-semibold">1. Telemetry Ingest</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">OpenAQ + Open-Meteo</span>
              </div>
              <div className="text-center text-xs text-[#6E6D68] dark:text-slate-400 font-bold">↓</div>
              <div className="p-2.5 rounded-lg border border-[#111111]/10 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-[#111111] dark:text-white font-semibold">2. Feature Engineering</span>
                <span className="text-blue-600 dark:text-blue-400 text-[11px]">Lags 1,2,3,6 + Rolling 3/7d</span>
              </div>
              <div className="text-center text-xs text-[#6E6D68] dark:text-slate-400 font-bold">↓</div>
              <div className="p-2.5 rounded-lg border border-[#111111]/10 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-[#111111] dark:text-white font-semibold">3. HistGBM Regressor</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-[11px]">q80 Quantile Interval</span>
              </div>
              <div className="text-center text-xs text-[#6E6D68] dark:text-slate-400 font-bold">↓</div>
              <div className="p-2.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-900 dark:text-cyan-200 font-bold flex items-center justify-between">
                <span>4. School Action Engine</span>
                <span className="text-xs">07:30 AM Protocol Gate</span>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[#111111]/10 dark:border-white/10 text-[11px] font-mono text-[#6E6D68] dark:text-slate-400 flex justify-between">
            <span>Execution Cadence: 4× Daily</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Zero GPU Overhead</span>
          </div>
        </TiltCard>

        {/* Card 2: Why 60 µg/m³ (Indian NAAQS) vs. 35 µg/m³ (US EPA) */}
        <TiltCard
          maxTilt={6}
          className="rounded-2xl border border-[#111111]/15 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-900/80 p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-[#111111]/10 dark:border-white/10 pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                CARD 02 // THRESHOLD BENCHMARK
              </span>
              <span className="font-mono text-[10px] text-[#6E6D68] dark:text-slate-400">
                CPCB 24-HR STANDARD
              </span>
            </div>
            <h4 className="font-serif text-2xl text-[#111111] dark:text-white mt-3 font-normal">
              Why 60 µg/m³ (India) vs. 35 µg/m³ (US EPA)
            </h4>
            <p className="font-sans text-xs text-[#6E6D68] dark:text-slate-300 mt-2 leading-relaxed">
              Standard US EPA cutoffs trigger continuous alert fatigue in Delhi winter, leading schools to disregard warnings altogether.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20">
                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold block uppercase">
                  35 µg/m³ (US EPA)
                </span>
                <div className="text-xl font-bold text-red-700 dark:text-red-300 mt-1">63% Days</div>
                <p className="font-sans text-[11px] text-red-900 dark:text-red-200 mt-1 leading-snug">
                  Triggers alerts even during clean monsoon weeks. Causes total administrative fatigue.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/20">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase">
                  60 µg/m³ (NAAQS) ★
                </span>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">27% Days</div>
                <p className="font-sans text-[11px] text-emerald-900 dark:text-emerald-200 mt-1 leading-snug">
                  Identifies toxic episodes. Catches 96.9% of hazardous days with only 2 false alarms!
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg border border-[#111111]/10 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-800/40 font-mono text-[11px] text-[#6E6D68] dark:text-slate-300">
              💡 <strong>System Flexibility:</strong> While 60 µg/m³ is our operational default, the console allows principals to instantly toggle to 35, 90, 120, or 250 µg/m³.
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[#111111]/10 dark:border-white/10 text-[11px] font-mono text-[#6E6D68] dark:text-slate-400 flex justify-between">
            <span>India CPCB Gazette: 60 µg/m³ 24h</span>
            <span className="font-bold text-[#111111] dark:text-white">Zero Alert Fatigue</span>
          </div>
        </TiltCard>

        {/* Card 3: Data Provenance & Quality Specifications */}
        <TiltCard
          maxTilt={6}
          className="rounded-2xl border border-[#111111]/15 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-900/80 p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-[#111111]/10 dark:border-white/10 pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                CARD 03 // PROVENANCE & DISCLOSURE
              </span>
              <span className="font-mono text-[10px] text-[#6E6D68] dark:text-slate-400">
                OPEN SENSOR AUDIT
              </span>
            </div>
            <h4 className="font-serif text-2xl text-[#111111] dark:text-white mt-3 font-normal">
              Station Data & Missing-Gap Audit
            </h4>
            <p className="font-sans text-xs text-[#6E6D68] dark:text-slate-300 mt-2 leading-relaxed">
              Full transparency on ground station coordinates, correlation metrics, and physical sensor outage handling.
            </p>

            <div className="mt-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between p-2 rounded border border-[#111111]/10 dark:border-white/10">
                <span className="text-[#6E6D68] dark:text-slate-400">OpenAQ Station:</span>
                <span className="font-bold text-[#111111] dark:text-white">New Delhi (Loc 8118, Sensor 23534)</span>
              </div>
              <div className="flex justify-between p-2 rounded border border-[#111111]/10 dark:border-white/10">
                <span className="text-[#6E6D68] dark:text-slate-400">Valid Observation Days:</span>
                <span className="font-bold text-[#111111] dark:text-white">1,019 Days (2024 to Nov 2026)</span>
              </div>
              <div className="flex justify-between p-2 rounded border border-[#111111]/10 dark:border-white/10">
                <span className="text-[#6E6D68] dark:text-slate-400">OpenAQ vs. Meteo Correlation (r):</span>
                <span className="font-bold text-blue-600 dark:text-cyan-400">r = 0.662 (Significant p &lt; 0.001)</span>
              </div>
            </div>

            {/* Transparent Disclosure Box */}
            <div className="mt-4 p-3 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-mono text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SCIENTIFIC DISCLOSURE // 14-DAY SENSOR GAP:</span>
              </div>
              <p className="font-sans text-[11px] leading-relaxed">
                Between 24-Sep-2026 and 09-Oct-2026, the central Delhi OpenAQ station experienced a 14-day hardware dropout. This gap was linearly interpolated with daily bounds, which temporarily introduced lag alignment drag in rolling feature calculations before winter inversion onset.
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[#111111]/10 dark:border-white/10 text-[11px] font-mono text-[#6E6D68] dark:text-slate-400 flex justify-between">
            <span>Quality Standard: OpenAQ API v3</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Verifiable</span>
          </div>
        </TiltCard>

        {/* Card 4: How We Stand Out (Uniqueness & Novelty Matrix) */}
        <TiltCard
          maxTilt={6}
          className="rounded-2xl border border-[#111111]/15 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-900/80 p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-[#111111]/10 dark:border-white/10 pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                CARD 04 // COMPETITIVE NOVELTY
              </span>
              <span className="font-mono text-[10px] text-[#6E6D68] dark:text-slate-400">
                UNPRECEDENTED SCHOOL INTELLIGENCE
              </span>
            </div>
            <h4 className="font-serif text-2xl text-[#111111] dark:text-white mt-3 font-normal">
              How We Stand Out From Existing Solutions
            </h4>
            <p className="font-sans text-xs text-[#6E6D68] dark:text-slate-300 mt-2 leading-relaxed">
              CPCB Sameer, SAFAR, and IQAir provide retrospective or general public indices. VayuShield AI is purpose-built for the asymmetric school decision problem.
            </p>

            <div className="mt-5 space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-lg border border-[#111111]/10 dark:border-white/10 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#111111] dark:text-white">24-Hour Advance Lead Time:</strong>
                  <p className="font-sans text-[11px] text-[#6E6D68] dark:text-slate-400">Enables bus routing, hall reservations, and inhaler checks the night before.</p>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-[#111111]/10 dark:border-white/10 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#111111] dark:text-white">Calibrated 80% Uncertainty Band:</strong>
                  <p className="font-sans text-[11px] text-[#6E6D68] dark:text-slate-400">Replaces false deterministic precision with empirical confidence intervals.</p>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-[#111111]/10 dark:border-white/10 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#111111] dark:text-white">Full Transparency & Failure Audit:</strong>
                  <p className="font-sans text-[11px] text-[#6E6D68] dark:text-slate-400">Publishes walk-forward backtests, top-5 failure cases, and 5-variant Diwali ablation.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[#111111]/10 dark:border-white/10 text-[11px] font-mono text-[#6E6D68] dark:text-slate-400 flex justify-between items-center">
            <span>Pediatric Safety Recall: 96.9%</span>
            <button
              onClick={() => setActiveTab(activeTab === 'novelty' ? 'pipeline' : 'novelty')}
              className="text-blue-600 dark:text-cyan-400 font-bold underline hover:opacity-80"
            >
              {activeTab === 'novelty' ? 'Close Matrix' : 'View Full Novelty Matrix →'}
            </button>
          </div>
        </TiltCard>
      </div>

      {/* Expanded Novelty Comparison Matrix (Toggleable) */}
      {activeTab === 'novelty' ? (
        <div className="p-6 rounded-2xl border border-blue-300 dark:border-cyan-800/40 bg-[#F8F7F4] dark:bg-slate-900/90 shadow-xl">
          <NoveltyComparisonMatrix isDark={isDark} lang={lang} />
        </div>
      ) : null}
    </section>
  );
}
