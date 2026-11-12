'use client';

// ─── LoadingSpinner ────────────────────────────────────────────────────────────
// Reusable loading skeleton and spinner components.
// Used while Firebase data is loading for the first time.

import { type CSSProperties } from 'react';

// ── Sizes ─────────────────────────────────────────────────────────────────────
const SIZES = {
  sm: { ring: 20, border: 2.5 },
  md: { ring: 36, border: 3.5 },
  lg: { ring: 56, border: 4 },
} as const;

type SpinnerSize = keyof typeof SIZES;

// ── Spinner ───────────────────────────────────────────────────────────────────
interface SpinnerProps {
  size?:  SpinnerSize;
  color?: string;
  style?: CSSProperties;
}

export function Spinner({ size = 'md', color = 'var(--gold-luxury)', style }: SpinnerProps) {
  const { ring, border } = SIZES[size];
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width:        ring,
        height:       ring,
        borderRadius: '50%',
        border:       `${border}px solid #222222`,
        borderTop:    `${border}px solid ${color}`,
        animation:    'spin 0.75s linear infinite',
        flexShrink:   0,
        ...style,
      }}
    />
  );
}

// ── Skeleton Block ────────────────────────────────────────────────────────────
interface SkeletonProps {
  width?:        string | number;
  height?:       string | number;
  borderRadius?: string | number;
  style?:        CSSProperties;
}

export function Skeleton({
  width        = '100%',
  height       = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        borderRadius,
        background:   'linear-gradient(90deg, #1a1a1a 25%, #262626 50%, #1a1a1a 75%)',
        backgroundSize: '200% 100%',
        animation:    'shimmer 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

// ── MetricCard Loading Skeleton ───────────────────────────────────────────────
export function MetricCardSkeleton({ stagger = 1 }: { stagger?: number }) {
  return (
    <article
      className={`metric-card animate-fade-up stagger-${stagger}`}
      aria-busy="true"
      aria-label="Loading metric"
      style={{ gap: 12 }}
    >
      <div className="metric-card-header">
        <Skeleton width={44} height={44} borderRadius={12} />
        <Skeleton width={40} height={20} borderRadius={10} />
      </div>
      <Skeleton width="55%" height={14} borderRadius={6} style={{ marginTop: 4 }} />
      <Skeleton width="75%" height={36} borderRadius={8} style={{ marginTop: 4 }} />
      <Skeleton width="60%" height={14} borderRadius={6} style={{ marginTop: 4 }} />
    </article>
  );
}

import IntelliWattLogo from '@/components/brand/IntelliWattLogo';

// ── Full-page loader ──────────────────────────────────────────────────────────
export function PageLoader({ message = 'Initializing Smart Energy Platform...' }: { message?: string }) {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            20,
        padding:        '4rem 2rem',
        textAlign:      'center',
      }}
    >
      <IntelliWattLogo size="md" align="center" glow={true} showSubtitle={true} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'Manrope, sans-serif' }}>
        <Spinner size="sm" />
        <span>{message}</span>
      </div>
    </div>
  );
}
