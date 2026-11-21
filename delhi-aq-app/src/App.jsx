import React, {
  Suspense,
  lazy,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  startTransition,
} from 'react';
import sampleData from './sampleData.json';
import { translations } from './locales';
import VayuShieldLogo from './components/VayuShieldLogo';
import LandingView from './components/LandingView';
import { Shield, Layers, Sun, Moon, Upload } from 'lucide-react';

// Lazy-load View B analytics modules so Recharts stays out of the landing bundle
const HeroDecisionConsole = lazy(() => import('./components/HeroDecisionConsole'));
const TrajectoryChart = lazy(() => import('./components/TrajectoryChart'));
const ScorecardDeck = lazy(() => import('./components/ScorecardDeck'));
const TopFailuresInspector = lazy(() => import('./components/TopFailuresInspector'));
const DiwaliAblationExplorer = lazy(() => import('./components/DiwaliAblationExplorer'));
const ThresholdMatrixTable = lazy(() => import('./components/ThresholdMatrixTable'));

const REMOTE_LATEST_URL =
  'https://raw.githubusercontent.com/dMoon-Reaper/vayu-shield-ai-final-v2/main/latest.json';

const THEME_STORAGE_KEY = 'vayushield_theme:v1';
const LEGACY_THEME_KEY = 'vayushield_theme';
const EMPTY_ARRAY = [];
const PARAM_REGEX = /\{(\w+)\}/g;

const SUB_TABS = [
  { id: 'console', labelKey: 'subTabConsole', fallback: 'Command Console' },
  { id: 'chart', labelKey: 'subTabChart', fallback: 'Trajectory Chart' },
  { id: 'scorecard', labelKey: 'subTabScorecard', fallback: 'Scorecard' },
  { id: 'failures', labelKey: 'subTabFailures', fallback: 'Top 5 Failures' },
  { id: 'diwali', labelKey: 'subTabDiwali', fallback: 'Diwali Ablation' },
  { id: 'matrix', labelKey: 'subTabMatrix', fallback: 'Threshold Matrix' },
  { id: 'all', labelKey: 'subTabAll', fallback: '★ View All Modules' },
];

const MODULE_LOADING_FALLBACK = (
  <div className="w-full p-8 rounded-2xl border border-[#111111]/10 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-900/50 font-mono text-xs text-[#6E6D68] dark:text-slate-400 animate-pulse">
    Loading analytics module…
  </div>
);

const fmt = (val) => {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  return Number(val).toFixed(1);
};

function loadSavedTheme() {
  if (typeof window === 'undefined') return true;
  try {
    const v1 = localStorage.getItem(THEME_STORAGE_KEY);
    if (v1 !== null) return v1 === 'dark';
    const legacy = localStorage.getItem(LEGACY_THEME_KEY);
    if (legacy !== null) {
      localStorage.setItem(THEME_STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_THEME_KEY);
      return legacy === 'dark';
    }
  } catch {
    // Incognito / restricted storage fallback
  }
  return true;
}

function saveTheme(isDark) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch {
    // Ignore quota or privacy-mode storage errors
  }
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}

const BackgroundMotionLayer = React.memo(function BackgroundMotionLayer({ disabled, isDark }) {
  if (disabled) return null;

  const typoClass = isDark ? 'text-white/[0.02]' : 'text-slate-900/[0.025]';
  const typoClassMuted = isDark ? 'text-white/[0.015]' : 'text-slate-900/[0.02]';
  const boxBorder = isDark ? 'border-white/[0.04]' : 'border-slate-900/[0.04]';

  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      <div className={`absolute top-20 left-10 font-serif font-light text-[150px] leading-none ${typoClass} animate-float-1`}>
        PM2.5
      </div>
      <div className={`absolute top-96 right-12 font-mono text-[130px] leading-none ${typoClassMuted} animate-float-2`}>
        µg/m³
      </div>
      <div className={`absolute top-[680px] left-1/4 font-serif font-light text-[210px] leading-none ${typoClassMuted} animate-float-3`}>
        60
      </div>
      <div className={`absolute top-[1100px] left-8 font-serif italic text-[160px] leading-none ${typoClass} animate-float-1`}>
        DELHI
      </div>
      <div className={`absolute top-[1520px] right-12 font-mono text-[110px] tracking-widest leading-none ${typoClassMuted} animate-float-2`}>
        VAYUSHIELD
      </div>

      <div className={`absolute top-32 right-1/4 w-36 h-24 border ${boxBorder} animate-float-1`} />
      <div className={`absolute top-84 left-24 w-48 h-32 border ${boxBorder} animate-float-3`} />
      <div className={`absolute top-[480px] right-20 w-28 h-40 border ${boxBorder} animate-float-2`} />
      <div className={`absolute top-[820px] left-1/3 w-56 h-20 border ${boxBorder} animate-float-1`} />
    </div>
  );
});

const MarqueeStrip = React.memo(function MarqueeStrip({
  mode,
  liveData,
  currentDay,
  data,
  disabled,
  lang,
}) {
  const items = useMemo(() => {
    const city = (data?.city || 'New Delhi').toUpperCase();
    const threshold = fmt(data?.threshold ?? 60);
    const totalDays = data?.days?.length ?? 0;

    if (mode === 'live' && liveData?.status === 'ok') {
      const statusText = liveData.alert
        ? lang === 'hi'
          ? 'बाहरी गतिविधियाँ प्रतिबंधित // अलर्ट'
          : 'RESTRICT OUTDOOR ACTIVITY // ALERT'
        : lang === 'hi'
        ? 'सामान्य बाहरी गतिविधियाँ // सुरक्षित'
        : 'NORMAL OUTDOOR ACTIVITY // SAFE';
      return [
        `TARGET: ${city}`,
        `FORECAST FOR: ${liveData.forecast_for}`,
        `MODEL: ${fmt(liveData.model)} µg/m³`,
        `80% INTERVAL: ${fmt(liveData.lower_80 ?? liveData.lower)}–${fmt(liveData.upper_80 ?? liveData.upper)} µg/m³`,
        `NAAQS LIMIT: ${threshold} µg/m³`,
        `STATUS: ${statusText}`,
        `SOURCE: ${(liveData.data_source || 'OPENAQ + OPEN-METEO').toUpperCase()}`,
      ];
    }

    if (mode === 'replay' && currentDay) {
      const statusText = currentDay.alert
        ? lang === 'hi'
          ? 'बाहरी गतिविधियाँ प्रतिबंधित // अलर्ट'
          : 'RESTRICT OUTDOOR ACTIVITY // ALERT'
        : lang === 'hi'
        ? 'सामान्य बाहरी गतिविधियाँ // सुरक्षित'
        : 'NORMAL OUTDOOR ACTIVITY // SAFE';
      return [
        `TARGET: ${city}`,
        `EVALUATION DATE: ${currentDay.date}`,
        `MODEL: ${fmt(currentDay.model)} µg/m³`,
        `80% INTERVAL: ${fmt(currentDay.lower_80 ?? currentDay.lower)}–${fmt(currentDay.upper_80 ?? currentDay.upper)} µg/m³`,
        `GROUND TRUTH: ${fmt(currentDay.actual)} µg/m³`,
        `NAAQS LIMIT: ${threshold} µg/m³`,
        `STATUS: ${statusText}`,
        `DATASET: ${totalDays}-DAY HELD-OUT TEST WINDOW`,
      ];
    }

    const decAcc = data?.metrics?.decision_accuracy != null
      ? `${(data.metrics.decision_accuracy * 100).toFixed(1)}%`
      : '—';
    const rec = data?.metrics?.recall != null
      ? `${(data.metrics.recall * 100).toFixed(1)}%`
      : '—';
    return [
      `VAYUSHIELD AI`,
      `VERITAS AI HACKATHON 2026 (AI + CLIMATE)`,
      `CO-DEVELOPERS: SWASTIK DIVYANSHU • KRISHNENDU PATRO`,
      `INSTITUTION: DAV PUBLIC SCHOOL, CHANDRASEKHARPUR, BHUBANESWAR`,
      `DECISION ACCURACY: ${decAcc}`,
      `CHILD SAFETY RECALL: ${rec}`,
      `NAAQS THRESHOLD: ${threshold} µg/m³`,
    ];
  }, [mode, liveData, currentDay, data, lang]);

  const plainText = items.join(' • ');

  return (
    <div className="border-b border-[#111111]/15 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-900/60 py-2 overflow-hidden select-none transition-colors duration-200">
      <span className="sr-only">{plainText}</span>
      {disabled ? (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 font-mono text-[11px] text-[#6E6D68] dark:text-slate-400 overflow-x-auto whitespace-nowrap">
          {items.map((item, idx) => (
            <span key={idx} className="mr-6 inline-flex items-center gap-1.5">
              <span className="text-blue-600 dark:text-cyan-400 font-bold">▪</span>
              <span>{item}</span>
            </span>
          ))}
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="animate-marquee font-mono text-[11px] text-[#6E6D68] dark:text-slate-400 whitespace-nowrap flex items-center"
        >
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="flex items-center">
              {items.map((item, idx) => (
                <span key={idx} className="mx-6 flex items-center gap-2">
                  <span className="text-blue-600 dark:text-cyan-400 font-bold">▪</span>
                  <span>{item}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default function App() {
  const [isDark, setIsDark] = useState(loadSavedTheme);
  const [lang, setLang] = useState('en');
  const [viewStage, setViewStage] = useState('landing');
  const [appSubTab, setAppSubTab] = useState('console');
  const [dataMode, setDataMode] = useState('replay');
  const prefersReducedMotion = usePrefersReducedMotion();

  const [data, setData] = useState(sampleData);
  const [liveData, setLiveData] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const [policy, setPolicy] = useState('calibrated');
  const [selectedThreshold, setSelectedThreshold] = useState(() => sampleData?.threshold ?? 60);
  const [selectedDate, setSelectedDate] = useState(() => {
    return sampleData?.days?.length > 0 ? sampleData.days[sampleData.days.length - 1].date : '';
  });
  const [selectedFailureId, setSelectedFailureId] = useState('fail-1');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(isDark);
  }, [isDark]);

  // Stable translation helper (prevents defeating React.memo on children)
  const t = useCallback(
    (key, params = null) => {
      const text = translations[lang]?.[key] || translations.en?.[key] || key;
      if (!params) return text;
      return text.replace(PARAM_REGEX, (_, p) => (params[p] !== undefined ? String(params[p]) : `{${p}}`));
    },
    [lang]
  );

  // Fetch live forecast JSON with strict schema check so results.json is never mistaken for latest.json
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveForecast() {
      setLiveLoading(true);
      setLiveError(null);
      try {
        const cacheBuster = `?_cb=${Date.now()}`;
        let parsed = null;
        try {
          const remoteRes = await fetch(`${REMOTE_LATEST_URL}${cacheBuster}`);
          if (!remoteRes.ok) throw new Error(`Remote HTTP ${remoteRes.status}`);
          const remoteJson = await remoteRes.json();
          if (remoteJson && typeof remoteJson.status === 'string') {
            parsed = remoteJson;
          } else {
            throw new Error('Remote latest.json has invalid live schema.');
          }
        } catch (netErr) {
          console.warn('Remote live fetch failed, falling back to local /latest.json:', netErr);
          const localRes = await fetch(`/latest.json${cacheBuster}`);
          if (!localRes.ok) throw new Error(`Local /latest.json HTTP ${localRes.status}`);
          const localJson = await localRes.json();
          if (!localJson || typeof localJson.status !== 'string') {
            throw new Error('Local /latest.json does not match live latest.json schema (missing status field).');
          }
          parsed = localJson;
        }

        if (isMounted) {
          setLiveData(parsed);
          if (parsed.status !== 'ok') {
            setLiveError(parsed.reason || 'Live forecast is currently unavailable.');
          }
          setLiveLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setLiveData(null);
          setLiveError(err.message || 'Unable to retrieve live forecast data.');
          setLiveLoading(false);
        }
      }
    }
    fetchLiveForecast();
    return () => {
      isMounted = false;
    };
  }, []);

  const daysList = data?.days || EMPTY_ARRAY;
  const diwaliDates = data?.diwali_dates || EMPTY_ARRAY;
  const thresholdTable = data?.threshold_table || EMPTY_ARRAY;
  const worstFailures = data?.worst_failures || EMPTY_ARRAY;
  const diwaliVariants = data?.diwali_variants || EMPTY_ARRAY;
  const diwaliMetadata = data?.diwali_experiment_metadata || null;
  const dataQuality = data?.data_quality || null;

  const currentDayIndex = useMemo(() => {
    return daysList.findIndex((d) => d.date === selectedDate);
  }, [daysList, selectedDate]);

  const currentDay = useMemo(() => {
    if (currentDayIndex >= 0) return daysList[currentDayIndex];
    return daysList.length > 0 ? daysList[daysList.length - 1] : null;
  }, [daysList, currentDayIndex]);

  const chartData = useMemo(() => {
    return daysList.map((d) => {
      const lowerVal = d.lower_80 !== undefined ? d.lower_80 : d.lower;
      const upperVal = d.upper_80 !== undefined ? d.upper_80 : d.upper;
      return {
        ...d,
        rangeBase: lowerVal,
        rangeDelta: Math.max(0, upperVal - lowerVal),
      };
    });
  }, [daysList]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
          throw new Error("Invalid schema: missing 'days' array.");
        }
        startTransition(() => {
          setData(parsed);
          setSelectedDate(parsed.days[parsed.days.length - 1].date);
          if (parsed.threshold) setSelectedThreshold(parsed.threshold);
        });
      } catch (err) {
        setUploadError(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleJumpDiwali = useCallback(() => {
    const diwaliDay = daysList.find((d) => d.in_diwali_window);
    if (diwaliDay) startTransition(() => setSelectedDate(diwaliDay.date));
  }, [daysList]);

  const handleJumpPeak = useCallback(() => {
    if (daysList.length === 0) return;
    let peak = daysList[0];
    for (const d of daysList) {
      if (d.actual > peak.actual) peak = d;
    }
    startTransition(() => setSelectedDate(peak.date));
  }, [daysList]);

  const handleJumpCleanest = useCallback(() => {
    if (daysList.length === 0) return;
    let clean = daysList[0];
    for (const d of daysList) {
      if (d.actual < clean.actual) clean = d;
    }
    startTransition(() => setSelectedDate(clean.date));
  }, [daysList]);

  const handleJumpWorst = useCallback(() => {
    if (worstFailures.length > 0) {
      startTransition(() => {
        setSelectedDate(worstFailures[0].target_date);
        setSelectedFailureId(worstFailures[0].id || 'fail-1');
      });
      return;
    }
    if (daysList.length === 0) return;
    let worst = daysList[0];
    let maxErr = Math.abs(worst.actual - worst.model);
    for (const d of daysList) {
      const err = Math.abs(d.actual - d.model);
      if (err > maxErr) {
        maxErr = err;
        worst = d;
      }
    }
    startTransition(() => {
      setSelectedDate(worst.date);
      setSelectedFailureId('fail-1');
    });
  }, [worstFailures, daysList]);

  const handleSelectDate = useCallback((dt) => {
    startTransition(() => setSelectedDate(dt));
  }, []);

  const handleSelectFailurePin = useCallback(
    (pinDate) => {
      const matched = worstFailures.find((f) => f.target_date === pinDate);
      startTransition(() => {
        setSelectedDate(pinDate);
        if (matched?.id) setSelectedFailureId(matched.id);
        setAppSubTab('failures');
      });
    },
    [worstFailures]
  );

  const handleSelectThreshold = useCallback((th) => {
    startTransition(() => setSelectedThreshold(th));
  }, []);

  const handleLaunchConsole = useCallback(() => {
    startTransition(() => {
      setViewStage('app');
      setAppSubTab('console');
    });
  }, []);

  const handleLaunchWorkbench = useCallback(() => {
    startTransition(() => {
      setViewStage('app');
      setAppSubTab('scorecard');
    });
  }, []);

  const handleSwitchToReplay = useCallback(() => {
    startTransition(() => setDataMode('replay'));
  }, []);

  const stationLabel = dataQuality
    ? `OpenAQ Station ${dataQuality.station_id} (Sensor ID: ${dataQuality.sensor_id}, ${dataQuality.station_name})`
    : 'OpenAQ Ground Station + Open-Meteo Weather';

  return (
    <div className="relative min-h-screen bg-[#F8F7F4] dark:bg-[#060B19] text-[#111111] dark:text-[#F8FAFC] font-sans flex flex-col overflow-x-hidden selection:bg-blue-600 selection:text-white dark:selection:bg-cyan-500 dark:selection:text-slate-950 transition-colors duration-200">
      <BackgroundMotionLayer disabled={prefersReducedMotion} isDark={isDark} />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Persistent Top Masthead */}
        <header className="sticky top-0 z-50 border-b border-[#111111]/15 dark:border-white/10 px-4 sm:px-8 py-3.5 bg-[#F8F7F4]/90 dark:bg-[#060B19]/85 backdrop-blur-xl transition-colors duration-200 shadow-sm">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <VayuShieldLogo size={38} isDark={isDark} disabled={prefersReducedMotion} />
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#6E6D68] dark:text-slate-400">
                  <span className="font-bold text-[#111111] dark:text-white">VAYUSHIELD AI</span>
                  <span>•</span>
                  <span>VERITAS AI HACKATHON 2026</span>
                </div>
                <h1 className="font-mono text-xs sm:text-sm font-bold tracking-tight text-[#111111] dark:text-white uppercase">
                  {t('appTitle')}
                </h1>
              </div>
            </div>

            <nav
              aria-label="Application Stage Navigation"
              className="flex items-center border border-[#111111]/20 dark:border-white/20 rounded-xl p-1 bg-white/40 dark:bg-slate-900/60 font-mono text-xs shadow-inner"
            >
              <button
                type="button"
                onClick={() => startTransition(() => setViewStage('landing'))}
                className={`px-3.5 py-1.5 rounded-lg uppercase font-bold tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                  viewStage === 'landing'
                    ? 'bg-[#111111] text-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:text-slate-950 shadow-sm'
                    : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('navLanding')}</span>
              </button>

              <button
                type="button"
                onClick={() => startTransition(() => setViewStage('app'))}
                className={`px-3.5 py-1.5 rounded-lg uppercase font-bold tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                  viewStage === 'app'
                    ? 'bg-[#111111] text-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:text-slate-950 shadow-sm'
                    : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>
                  {translations[lang]?.navApp ||
                    (lang === 'hi' ? '02. लाइव अलर्ट सिस्टम (मुख्य ऐप)' : '02. Live Alert System (Main App)')}
                </span>
              </button>
            </nav>

            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
              <div className="flex items-center border border-[#111111]/20 dark:border-white/20 rounded-lg p-0.5 bg-white/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setIsDark(false)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wider flex items-center gap-1 transition ${
                    !isDark
                      ? 'bg-[#111111] text-white'
                      : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                  }`}
                  title="Switch to Lit Mode (Paper Broadsheet)"
                >
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>LIT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDark(true)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wider flex items-center gap-1 transition ${
                    isDark
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                  }`}
                  title="Switch to Dark Mode (Atmospheric Bioluminescence)"
                >
                  <Moon className="w-3 h-3 text-blue-400" />
                  <span>DARK</span>
                </button>
              </div>

              <div className="flex items-center border border-[#111111]/20 dark:border-white/20 rounded-lg p-0.5 bg-white/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                    lang === 'en'
                      ? 'bg-[#111111] text-white dark:bg-white dark:text-slate-950'
                      : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`px-2 py-1 rounded text-[11px] font-bold font-sans transition ${
                    lang === 'hi'
                      ? 'bg-[#111111] text-white dark:bg-white dark:text-slate-950'
                      : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg border border-[#111111]/20 dark:border-white/20 text-[11px] text-[#6E6D68] dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 flex items-center gap-1 hover:bg-[#111111]/5 dark:hover:bg-white/5 transition"
                title="Upload custom results.json file"
              >
                <Upload className="w-3 h-3" />
                <span className="hidden sm:inline">{lang === 'hi' ? 'JSON अपलोड' : 'Upload JSON'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {uploadError ? (
            <div className="max-w-[1440px] mx-auto mt-2 font-mono text-xs text-red-500">
              UPLOAD ERROR: {uploadError}
            </div>
          ) : null}
        </header>

        <MarqueeStrip
          mode={dataMode}
          liveData={liveData}
          currentDay={currentDay}
          data={data}
          disabled={prefersReducedMotion}
          lang={lang}
        />

        {/* View A: Landing Page */}
        {viewStage === 'landing' ? (
          <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-8 flex-1 flex flex-col">
            <LandingView
              isDark={isDark}
              lang={lang}
              t={t}
              onLaunchConsole={handleLaunchConsole}
              onLaunchWorkbench={handleLaunchWorkbench}
              disabledMotion={prefersReducedMotion}
            />
          </main>
        ) : null}

        {/* View B: Main Operations Console & Honesty Workbench */}
        {viewStage === 'app' ? (
          <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-8 flex-1 flex flex-col space-y-10 animate-fade-rise">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-[#111111]/15 dark:border-white/10 bg-[#111111]/[0.02] dark:bg-slate-900/60 backdrop-blur-xl">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-[#6E6D68] dark:text-slate-400 font-bold uppercase">
                  {lang === 'hi' ? 'मोड:' : 'MODE:'}
                </span>
                <div className="flex items-center border border-[#111111]/20 dark:border-white/20 rounded-xl p-0.5 bg-white/40 dark:bg-slate-800/40">
                  <button
                    type="button"
                    onClick={() => startTransition(() => setDataMode('replay'))}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      dataMode === 'replay'
                        ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                        : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    {lang === 'hi'
                      ? `${daysList.length}-दिवसीय परीक्षण रीप्ले`
                      : `${daysList.length}-Day Test Replay (Evaluated)`}
                  </button>
                  <button
                    type="button"
                    onClick={() => startTransition(() => setDataMode('live'))}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      dataMode === 'live'
                        ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                        : 'text-[#6E6D68] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    {lang === 'hi' ? 'लाइव संचालन (4× दैनिक)' : 'Live Operations (4× Daily Ingest)'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                {SUB_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => startTransition(() => setAppSubTab(tab.id))}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] transition ${
                      appSubTab === tab.id
                        ? 'border-blue-600 dark:border-cyan-400 bg-blue-50 dark:bg-cyan-950/40 text-blue-900 dark:text-cyan-200 font-bold'
                        : 'border-[#111111]/15 dark:border-white/10 hover:bg-[#111111]/[0.02] dark:hover:bg-slate-800/40 text-[#6E6D68] dark:text-slate-400'
                    }`}
                  >
                    {translations[lang]?.[tab.labelKey] || tab.fallback}
                  </button>
                ))}
              </div>
            </div>

            <Suspense fallback={MODULE_LOADING_FALLBACK}>
              {appSubTab === 'console' || appSubTab === 'all' ? (
                <HeroDecisionConsole
                  isDark={isDark}
                  lang={lang}
                  t={t}
                  data={data}
                  currentDay={currentDay}
                  currentDayIndex={currentDayIndex}
                  selectedDate={selectedDate}
                  setSelectedDate={handleSelectDate}
                  policy={policy}
                  setPolicy={setPolicy}
                  selectedThreshold={selectedThreshold}
                  setSelectedThreshold={handleSelectThreshold}
                  mode={dataMode}
                  liveData={liveData}
                  liveLoading={liveLoading}
                  liveError={liveError}
                  onSwitchToReplay={handleSwitchToReplay}
                  onJumpDiwali={handleJumpDiwali}
                  onJumpPeak={handleJumpPeak}
                  onJumpCleanest={handleJumpCleanest}
                  onJumpWorst={handleJumpWorst}
                  disabledMotion={prefersReducedMotion}
                />
              ) : null}

              {appSubTab === 'chart' || appSubTab === 'all' ? (
                <TrajectoryChart
                  chartData={chartData}
                  selectedDate={selectedDate}
                  setSelectedDate={handleSelectDate}
                  threshold={selectedThreshold}
                  diwaliDates={diwaliDates}
                  worstFailures={worstFailures}
                  dataQuality={dataQuality}
                  isDark={isDark}
                  lang={lang}
                  t={t}
                  onSelectFailurePin={handleSelectFailurePin}
                  disabledMotion={prefersReducedMotion}
                />
              ) : null}

              {appSubTab === 'scorecard' || appSubTab === 'all' ? (
                <ScorecardDeck data={data} isDark={isDark} lang={lang} t={t} />
              ) : null}

              {appSubTab === 'failures' || appSubTab === 'all' ? (
                <TopFailuresInspector
                  isDark={isDark}
                  lang={lang}
                  t={t}
                  worstFailures={worstFailures}
                  flagshipCaseStudy={data?.flagship_case_study || null}
                  selectedFailureId={selectedFailureId}
                  setSelectedFailureId={setSelectedFailureId}
                  onSelectDate={handleSelectDate}
                />
              ) : null}

              {appSubTab === 'diwali' || appSubTab === 'all' ? (
                <DiwaliAblationExplorer
                  diwaliVariants={diwaliVariants}
                  experimentMetadata={diwaliMetadata}
                  diwaliDates={diwaliDates}
                  isDark={isDark}
                  lang={lang}
                  t={t}
                  disabledMotion={prefersReducedMotion}
                />
              ) : null}

              {appSubTab === 'matrix' || appSubTab === 'all' ? (
                <ThresholdMatrixTable
                  thresholdTable={thresholdTable}
                  activeThreshold={selectedThreshold}
                  activePolicy={policy}
                  onSelectThreshold={handleSelectThreshold}
                  isDark={isDark}
                  lang={lang}
                  t={t}
                />
              ) : null}
            </Suspense>
          </main>
        ) : null}

        {/* Persistent Editorial Footer */}
        <footer className="max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-8 font-mono text-xs text-[#6E6D68] dark:text-slate-400 space-y-2.5 border-t border-[#111111]/15 dark:border-white/10 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-[#111111] dark:text-white font-bold uppercase tracking-wider">
              {t('footerDisclaimer')}
            </p>
            <p className="text-[11px] text-[#6E6D68] dark:text-slate-400">{t('footerColophon')}</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] pt-2 border-t border-[#111111]/10 dark:border-white/5 gap-2">
            <span className="text-[#111111] dark:text-cyan-300 font-bold uppercase">
              RESEARCH & CO-DEVELOPMENT: SWASTIK DIVYANSHU • KRISHNENDU PATRO (GRADE 11)
            </span>
            <span className="text-[#6E6D68] dark:text-slate-400 uppercase">
              DAV PUBLIC SCHOOL, CHANDRASEKHARPUR, BHUBANESWAR, ODISHA, INDIA
            </span>
          </div>
          <p className="text-[10px] text-[#6E6D68] dark:text-slate-500 leading-normal pt-1">
            Verification sources: {stationLabel} • Open-Meteo Weather Archives & Forecast API • Veritas AI International High School Hackathon 2026.
          </p>
        </footer>
      </div>
    </div>
  );
}