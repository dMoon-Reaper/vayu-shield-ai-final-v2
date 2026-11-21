import React from 'react';
import AnimatedSvgWrapper from './AnimatedSvgWrapper';

// Hoist static SVG gradient definitions outside component render loop (Rule: rendering-hoist-jsx)
const STATIC_LOGO_DEFS = (
  <defs>
    <linearGradient id="vayuGradientCyanCobalt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#00F5D4" />
      <stop offset="50%" stopColor="#3B82F6" />
      <stop offset="100%" stopColor="#6366F1" />
    </linearGradient>
    <linearGradient id="vayuShieldAura" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
      <stop offset="100%" stopColor="#00F5D4" stopOpacity="0.05" />
    </linearGradient>
    <filter id="vayuGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
);

export default function VayuShieldLogo({ size = 56, isDark = true, disabled = false }) {
  const outerRingClass = disabled ? '' : 'animate-spin-slow';
  const innerRingClass = disabled ? '' : 'animate-spin-reverse-slower';
  const pulseClass = disabled ? '' : 'animate-pulse';

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size, perspective: '1000px' }}
    >
      {/* Outer 3D Gyroscopic Halo Wrapper (Rule: rendering-animate-svg-wrapper) */}
      <AnimatedSvgWrapper
        animationClass={outerRingClass}
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          {STATIC_LOGO_DEFS}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="url(#vayuGradientCyanCobalt)"
            strokeWidth="1.75"
            strokeDasharray="6 8 14 4"
            opacity={isDark ? 0.8 : 0.6}
          />
          <circle cx="85" cy="30" r="2.5" fill="#00F5D4" filter="url(#vayuGlow)" />
          <circle cx="15" cy="70" r="2" fill="#3B82F6" filter="url(#vayuGlow)" />
        </svg>
      </AnimatedSvgWrapper>

      {/* Counter-Rotating Middle Ring */}
      <AnimatedSvgWrapper
        animationClass={innerRingClass}
        className="absolute inset-1.5"
      >
        <svg width={size - 12} height={size - 12} viewBox="0 0 88 88" fill="none">
          <ellipse
            cx="44"
            cy="44"
            rx="38"
            ry="24"
            stroke="#3B82F6"
            strokeWidth="1.25"
            strokeDasharray="4 6"
            opacity={isDark ? 0.65 : 0.45}
            transform="rotate(-25 44 44)"
          />
        </svg>
      </AnimatedSvgWrapper>

      {/* Central Vayu Shield Core */}
      <AnimatedSvgWrapper
        animationClass={pulseClass}
        className="relative z-10"
        style={{ transform: 'translateZ(12px)' }}
      >
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 60 68" fill="none">
          {/* Shield Geometry */}
          <path
            d="M30 4 L54 14 V34 C54 48 43 59 30 64 C17 59 6 48 6 34 V14 Z"
            fill="url(#vayuShieldAura)"
            stroke="url(#vayuGradientCyanCobalt)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Atmospheric Wind Streamline Curves inside Shield */}
          <path
            d="M17 26 C22 22, 28 22, 33 26 C37 29, 43 28, 45 25"
            stroke={isDark ? '#00F5D4' : '#1D4ED8'}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M15 35 C20 31, 26 31, 31 35 C35 38, 41 38, 43 35"
            stroke={isDark ? '#3B82F6' : '#2563EB'}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20 44 C24 41, 28 41, 32 44 C36 47, 39 46, 41 44"
            stroke={isDark ? '#F59E0B' : '#D97706'}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </AnimatedSvgWrapper>
    </div>
  );
}
