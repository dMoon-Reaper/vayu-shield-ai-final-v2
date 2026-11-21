import React from 'react';
import VayuShieldLogo from './VayuShieldLogo';
import IsometricPipeline from './IsometricPipeline';
import AnimatedSvgWrapper from './AnimatedSvgWrapper';
import TiltCard from './TiltCard';
import {
  ShieldAlert,
  ArrowRight,
  BarChart3,
  Award,
  School,
  UserCheck,
  CheckCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function LandingView({
  isDark = true,
  lang = 'en',
  t,
  onLaunchConsole,
  onLaunchWorkbench,
  disabledMotion = false,
}) {
  return (
    <div className="w-full space-y-12 sm:space-y-16 animate-fade-rise">
      {/* ========================================================
          HERO SECTION: 3D LOGO, HACKATHON BADGE, TITLE & TEAM DOSSIER
          ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-[#111111]/15 dark:border-white/10 bg-gradient-to-b from-[#111111]/[0.015] to-[#111111]/[0.04] dark:from-slate-900/80 dark:to-slate-950/90 p-6 sm:p-10 lg:p-12 backdrop-blur-xl">
        {/* Ambient Bioluminescent Background Glows in Dark Mode */}
        {isDark ? (
          <>
            <div
              aria-hidden="true"
              className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none"
            />
          </>
        ) : null}

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Hackathon Badge with Pulsing Green Dot */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 dark:border-cyan-400/30 bg-blue-50/80 dark:bg-cyan-950/40 text-blue-900 dark:text-cyan-200 font-mono text-[11px] uppercase tracking-wider mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-cyan-400 animate-pulse" />
            <Award className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>{t('hackathonBadge')}</span>
          </div>

          {/* 3D Animated Logo Emblem */}
          <div className="my-2 p-2">
            <VayuShieldLogo size={76} isDark={isDark} disabled={disabledMotion} />
          </div>

          {/* Primary Project Title & Tagline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#111111] dark:text-white font-normal tracking-tight mt-3 leading-tight max-w-4xl">
            {t('landingHeadline')}
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#6E6D68] dark:text-slate-300 mt-4 max-w-3xl leading-relaxed">
            {t('landingSubheadline')}
          </p>

          {/* Primary 3D Action Portals */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl">
            {/* Primary Action Button: Launch Main Alert System */}
            <button
              type="button"
              onClick={onLaunchConsole}
              className="w-full sm:w-auto flex-1 px-8 py-4 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 dark:from-cyan-500 dark:to-blue-600 dark:text-slate-950 shadow-lg shadow-blue-500/25 dark:shadow-cyan-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>{t('landingLaunchApp')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Action Button: Explore Honest Evaluation & Failure Audit */}
            <button
              type="button"
              onClick={onLaunchWorkbench}
              className="w-full sm:w-auto flex-1 px-6 py-4 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111111] dark:text-white border border-[#111111]/20 dark:border-white/20 bg-white/50 dark:bg-slate-800/50 hover:bg-[#111111]/[0.03] dark:hover:bg-slate-700/60 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>{t('landingLaunchAudit')}</span>
            </button>
          </div>

          {/* ========================================================
              TEAM & INSTITUTION CARD (Equal Authorship & Attribution)
              ======================================================== */}
          <div className="mt-12 w-full pt-8 border-t border-[#111111]/15 dark:border-white/10 text-left">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-3 border-b border-[#111111]/10 dark:border-white/10 gap-1 font-mono text-xs">
              <span className="font-bold text-[#111111] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                {t('landingDevsTitle')}
              </span>
              <span className="text-[#6E6D68] dark:text-slate-400">
                {t('landingDevsSchool')}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              {/* Co-Developer 1: Swastik Divyanshu */}
              <TiltCard
                maxTilt={5}
                className="p-4 rounded-xl border border-[#111111]/10 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-900/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#6E6D68] dark:text-slate-400 pb-1.5 border-b border-[#111111]/10 dark:border-white/10">
                    <span>CO-DEVELOPER // 01</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">GRADE 11</span>
                  </div>
                  <div className="font-serif text-lg font-bold text-[#111111] dark:text-white mt-2">
                    Swastik Divyanshu
                  </div>
                  <p className="font-sans text-[11px] text-[#6E6D68] dark:text-slate-300 mt-1 leading-snug">
                    {t('landingDev1Role')}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#111111]/5 dark:border-white/5 text-[10px] text-blue-600 dark:text-cyan-400 font-bold">
                  DAV Public School, Chandrasekharpur
                </div>
              </TiltCard>

              {/* Co-Developer 2: Krishnendu Patro */}
              <TiltCard
                maxTilt={5}
                className="p-4 rounded-xl border border-[#111111]/10 dark:border-white/10 bg-[#F8F7F4] dark:bg-slate-900/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#6E6D68] dark:text-slate-400 pb-1.5 border-b border-[#111111]/10 dark:border-white/10">
                    <span>CO-DEVELOPER // 02</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">GRADE 11</span>
                  </div>
                  <div className="font-serif text-lg font-bold text-[#111111] dark:text-white mt-2">
                    Krishnendu Patro
                  </div>
                  <p className="font-sans text-[11px] text-[#6E6D68] dark:text-slate-300 mt-1 leading-snug">
                    {t('landingDev2Role')}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#111111]/5 dark:border-white/5 text-[10px] text-blue-600 dark:text-cyan-400 font-bold">
                  DAV Public School, Chandrasekharpur
                </div>
              </TiltCard>

              {/* Core Empirical Benchmark Summary */}
              <TiltCard
                maxTilt={5}
                className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400 pb-1.5 border-b border-emerald-500/20">
                    <span>CORE VALIDATION</span>
                    <span className="font-bold">HELD-OUT 120-DAY TEST</span>
                  </div>
                  <div className="font-serif text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                    97.5% Accuracy
                  </div>
                  <p className="font-sans text-[11px] text-[#111111] dark:text-slate-200 mt-1 leading-snug">
                    96.9% Safety Recall with only 2 false alarms at the 60 µg/m³ Indian NAAQS threshold.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-500/10 text-[10px] text-emerald-800 dark:text-emerald-300 font-mono flex justify-between">
                  <span>82.5% Interval Coverage</span>
                  <span>±20.7 µg/m³ q80</span>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          INTERACTIVE 3D ISOMETRIC PIPELINE & WORKING SPECIFICATIONS
          ======================================================== */}
      <IsometricPipeline
        isDark={isDark}
        lang={lang}
        onLaunchApp={onLaunchConsole}
      />
    </div>
  );
}
