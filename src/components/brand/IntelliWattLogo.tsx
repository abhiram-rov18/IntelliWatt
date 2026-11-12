'use client';

import React from 'react';

export interface IntelliWattLogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show the "Smart Energy Intelligence" subtitle */
  showSubtitle?: boolean;
  /** Alignment: 'center' (default) or 'left' */
  align?: 'center' | 'left';
  /** Enable subtle 8% gold glow */
  glow?: boolean;
  /** Optional extra CSS classes */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Enable living 3D sculpture constant linear rotation (24s per revolution) */
  sculptureRotate?: boolean;
}

// Golden Ratio Φ = 1.618
const SIZES = {
  sm: {
    emblem: 34,
    titleSize: '1.05rem',
    subSize: '0.58rem',
    gap: 6,
    subTracking: '1.4px',
    boxPadding: '6px',
  },
  md: {
    emblem: 48,
    titleSize: '1.35rem',
    subSize: '0.68rem',
    gap: 8,
    subTracking: '1.8px',
    boxPadding: '10px',
  },
  lg: {
    emblem: 64,
    titleSize: '1.85rem',
    subSize: '0.78rem',
    gap: 10,
    subTracking: '2.2px',
    boxPadding: '12px',
  },
  xl: {
    emblem: 84,
    titleSize: '2.4rem',
    subSize: '0.92rem',
    gap: 14,
    subTracking: '2.8px',
    boxPadding: '16px',
  },
} as const;

/**
 * Standalone Precision Golden Ratio Lightning Emblem SVG
 * When sculptureRotate is enabled, it rotates smoothly as a continuous 3D physical object
 */
export function GoldLightningEmblem({
  size = 48,
  glow = true,
  className = '',
  sculptureRotate = true,
}: {
  size?: number;
  glow?: boolean;
  className?: string;
  sculptureRotate?: boolean;
}) {
  return (
    <div
      className={`gold-lightning-emblem-wrap ${sculptureRotate ? 'living-sculpture-wrap' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        filter: glow ? 'drop-shadow(0 0 18px rgba(212, 175, 55, 0.12))' : 'none',
        transition: 'filter 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Rotating Living Brand Body */}
      <div
        className={sculptureRotate ? 'living-sculpture-rotating-body' : ''}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
          aria-hidden="true"
        >
          <defs>
            {/* Subtle Outer Frame Ring Gradient */}
            <linearGradient id="iwRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5D76E" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#9C7A16" stopOpacity="0.5" />
            </linearGradient>

            {/* Shield Badge Background Gradient */}
            <radialGradient id="iwBadgeBg" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#1C180C" />
              <stop offset="70%" stopColor="#100E08" />
              <stop offset="100%" stopColor="#080808" />
            </radialGradient>

            {/* Primary Gold Lightning Facet (Highlights) */}
            <linearGradient id="iwBoltBright" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF4C4" />
              <stop offset="35%" stopColor="#F5D76E" />
              <stop offset="75%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B38F22" />
            </linearGradient>

            {/* Secondary Gold Lightning Facet (Chiseled Depth) */}
            <linearGradient id="iwBoltDark" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="40%" stopColor="#B89426" />
              <stop offset="85%" stopColor="#7A5D12" />
              <stop offset="100%" stopColor="#553F09" />
            </linearGradient>

            {/* Center Specular Glint */}
            <linearGradient id="iwSpecular" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#FFF2B2" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Outer Circular Shield Base */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="url(#iwBadgeBg)"
            stroke="url(#iwRingGrad)"
            strokeWidth="1.5"
          />

          {/* Inner Precision Hexagonal Golden-Ratio Border */}
          <polygon
            points="50,11 83.8,30.5 83.8,69.5 50,89 16.2,69.5 16.2,30.5"
            fill="none"
            stroke="rgba(212, 175, 55, 0.18)"
            strokeWidth="1"
          />

          {/* Left / Upper Facet (Bright Gold) */}
          <path
            d="M52 14 L28 52 L47 52 L41 86 L74 44 L54 44 Z"
            fill="url(#iwBoltBright)"
          />

          {/* Right / Chiseled Shaded Facet for 3D Luxury Aesthetic */}
          <path
            d="M52 14 L50 44 L47 52 L54 44 L74 44 L58 64 L41 86 L45 57 Z"
            fill="url(#iwBoltDark)"
            opacity="0.85"
          />

          {/* Center Specular Ridge Line */}
          <path
            d="M52 15 L47 51 L53 45 L41 84"
            stroke="url(#iwSpecular)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Precision Geometric Accent Dot at Golden Point */}
          <circle cx="50" cy="50" r="1.5" fill="#FFF2B2" opacity="0.75" />
        </svg>
      </div>

      {/* Fixed Directional Lighting Reflection Ring (simulates fixed gallery spotlight) */}
      {sculptureRotate && (
        <div className="living-sculpture-specular-light" aria-hidden="true" />
      )}
    </div>
  );
}

/**
 * Official IntelliWatt Brand Logo Component
 */
export default function IntelliWattLogo({
  size = 'md',
  showSubtitle = true,
  align = 'center',
  glow = true,
  className = '',
  onClick,
  sculptureRotate = true,
}: IntelliWattLogoProps) {
  const conf = SIZES[size];
  const isCentered = align === 'center';

  return (
    <div
      onClick={onClick}
      className={`intelliwatt-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: isCentered ? 'center' : 'flex-start',
        justifyContent: 'center',
        textAlign: isCentered ? 'center' : 'left',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        gap: conf.gap,
        maxWidth: '100%',
      }}
      role="banner"
      aria-label="IntelliWatt — Smart Energy Intelligence"
    >
      {/* 1. [Gold Lightning Logo Emblem] */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <GoldLightningEmblem
          size={conf.emblem}
          glow={glow}
          sculptureRotate={sculptureRotate}
        />
      </div>

      {/* 2. Text Content Stack */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCentered ? 'center' : 'flex-start',
          gap: 2,
          lineHeight: 1.15,
        }}
      >
        {/* Main Brand Title: IntelliWatt in Sora */}
        <span
          style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: conf.titleSize,
            fontWeight: 800,
            letterSpacing: '0.025em',
            background:
              'linear-gradient(135deg, #FFFFFF 30%, var(--gold-bright) 75%, var(--gold-luxury) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          IntelliWatt
        </span>

        {/* Subtitle / Tagline: Smart Energy Intelligence in Sora */}
        {showSubtitle && (
          <span
            style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: conf.subSize,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: conf.subTracking,
              color: 'var(--gold-luxury)',
              opacity: 0.92,
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            Smart Energy Intelligence
          </span>
        )}
      </div>
    </div>
  );
}
