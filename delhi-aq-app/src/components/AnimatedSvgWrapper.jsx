import React from 'react';

/**
 * AnimatedSvgWrapper - Implements Vercel React Best Practices rule:
 * `rendering-animate-svg-wrapper`
 * Always wrap <svg> icons, logos, and chart embellishments in a <div>
 * and apply CSS 3D transforms/animations to the wrapper <div> for hardware GPU acceleration.
 */
export default function AnimatedSvgWrapper({
  children,
  className = '',
  animationClass = '',
  style = {},
  perspective = false,
  role = 'img',
  ariaLabel,
}) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center transform-gpu will-change-transform ${
        perspective ? 'style-3d-perspective' : ''
      } ${animationClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
