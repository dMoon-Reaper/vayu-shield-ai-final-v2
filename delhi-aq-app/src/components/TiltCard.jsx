import React, { useRef, useEffect } from 'react';

/**
 * TiltCard - 3D Interactive Bento Card with Specular Ambient Glow
 * Implements Vercel React Best Practices rules:
 * - `client-passive-event-listeners` (uses passive pointer listeners)
 * - `js-batch-dom-css` (updates CSS variables via requestAnimationFrame, zero layout thrashing)
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 7,
  perspective = 1000,
  glow = true,
  disabled = false,
  onClick,
}) {
  const cardRef = useRef(null);
  const rafIdRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || disabled) return;

    let isHovering = false;

    const handlePointerMove = (e) => {
      if (disabled) return;
      isHovering = true;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

      rafIdRef.current = requestAnimationFrame(() => {
        el.style.setProperty('--rx', `${-y * maxTilt}deg`);
        el.style.setProperty('--ry', `${x * maxTilt}deg`);
        el.style.setProperty('--glow-x', `${Math.round((x + 0.5) * 100)}%`);
        el.style.setProperty('--glow-y', `${Math.round((y + 0.5) * 100)}%`);
        el.style.setProperty('--glow-opacity', '1');
      });
    };

    const handlePointerLeave = () => {
      isHovering = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

      rafIdRef.current = requestAnimationFrame(() => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--glow-opacity', '0');
      });
    };

    el.addEventListener('pointermove', handlePointerMove, { passive: true });
    el.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerleave', handlePointerLeave);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [maxTilt, disabled]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`relative transform-gpu will-change-transform transition-transform duration-200 ease-out select-none ${className}`}
      style={{
        transform: disabled
          ? 'none'
          : `perspective(${perspective}px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(0px)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Dynamic Specular Sheen Glow Overlay */}
      {glow ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-inherit opacity-0 transition-opacity duration-300 z-10"
          style={{
            opacity: 'var(--glow-opacity, 0)',
            background: `radial-gradient(400px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(59, 130, 246, 0.15), transparent 70%)`,
          }}
        />
      ) : null}
      <div className="relative z-20 h-full">{children}</div>
    </div>
  );
}
