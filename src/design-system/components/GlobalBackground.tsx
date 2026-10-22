'use client';

import React from 'react';

interface GlobalBackgroundProps {
  children?: React.ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

/**
 * GlobalBackground — Faithfully reproduces TripSplit's signature
 * atmospheric background from TripSplit/src/components/ui/GlobalBackground.tsx.
 * Provides subtle dual-aura radial gradients (warm gold + cool cyan/sea)
 * with translucent glass depth across light and dark modes.
 */
export function GlobalBackground({
  children,
  intensity = 'subtle',
  className = '',
}: GlobalBackgroundProps) {
  const opacityMap = {
    subtle: 'opacity-40 dark:opacity-60',
    medium: 'opacity-65 dark:opacity-80',
    strong: 'opacity-90 dark:opacity-100',
  };

  return (
    <div className={`relative min-h-screen w-full bg-[var(--color-wakeru-bg)] transition-colors duration-300 ${className}`}>
      {/* ── Atmospheric Dual Aura Radials (Exact Expo Gradient) ── */}
      <div
        className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 ${opacityMap[intensity]}`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 12% 18%, rgba(212, 160, 60, 0.09) 0%, transparent 42%),
            radial-gradient(circle at 88% 82%, rgba(6, 182, 212, 0.08) 0%, transparent 42%),
            radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Subtle Vignette & Grain Layer ── */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.02] dark:to-black/[0.25]" />

      {/* ── Content Canvas ── */}
      <div className="relative z-10 flex min-h-screen flex-col w-full">
        {children}
      </div>
    </div>
  );
}

export default GlobalBackground;
