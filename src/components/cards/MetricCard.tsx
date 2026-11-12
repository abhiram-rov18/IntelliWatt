'use client';

import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAnimatedCounter } from '@/lib/hooks';

type AccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow' | 'white';

interface MetricCardProps {
  label:      string;
  value:      number | string | null | undefined;
  unit?:      string;
  decimals?:  number;
  accent?:    AccentColor;
  icon:       ReactNode;
  trend?:     number;      // % change from last reading
  trendLabel?: string;
  className?: string;
  stagger?:   number;      // 1–10
}

export default function MetricCard({
  label,
  value,
  unit,
  decimals = 2,
  accent = 'blue',
  icon,
  trend,
  trendLabel,
  className = '',
  stagger,
}: MetricCardProps) {
  const isMissing = value === undefined || value === null || value === '' || value === '--';
  const numericValue = !isMissing && typeof value === 'number'
    ? value
    : (!isMissing && !isNaN(Number(value)) ? Number(value) : null);

  const animated = useAnimatedCounter(numericValue ?? 0, decimals);

  const trendDir = trend === undefined ? null : trend > 0.1 ? 'up' : trend < -0.1 ? 'down' : 'neutral';

  return (
    <article
      className={`metric-card accent-${accent} animate-fade-up ${stagger ? `stagger-${stagger}` : ''} ${className}`}
      aria-label={`${label}: ${isMissing ? '--' : animated} ${unit ?? ''}`}
    >
      {/* Top row: Top left Gold Icon & Label, Top right LIVE badge */}
      <div className="metric-card-header">
        <div className="metric-card-header-left">
          <div className="metric-card-icon gold">
            {icon}
          </div>
          <span className="metric-label">{label}</span>
        </div>
        <div className="metric-live-badge">
          <span className="metric-live-dot" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Center: Large Value */}
      <div className="metric-card-center">
        <div className="metric-value" aria-live="polite" aria-atomic="true">
          {isMissing || numericValue === null ? (
            '--'
          ) : (
            animated.toLocaleString('en-IN', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })
          )}
          {!isMissing && numericValue !== null && unit && <span className="metric-unit">{unit}</span>}
        </div>
      </div>

      {/* Bottom: Helpful Information */}
      <div className="metric-card-bottom">
        {!isMissing && trendDir !== null ? (
          <div className={`metric-trend ${trendDir}`}>
            {trendDir === 'up'      && <TrendingUp  size={13} />}
            {trendDir === 'down'    && <TrendingDown size={13} />}
            {trendDir === 'neutral' && <Minus        size={13} />}
            <span>
              {trend !== undefined && trend > 0 ? '+' : ''}
              {trend?.toFixed(1)}% {trendLabel ?? 'vs last reading'}
            </span>
          </div>
        ) : (
          <div className="metric-helpful-info">
            <span>Nominal telemetry threshold</span>
          </div>
        )}
      </div>
    </article>
  );
}
