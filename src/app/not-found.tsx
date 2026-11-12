'use client';

import React from 'react';
import Link from 'next/link';
import IntelliWattLogo from '@/components/brand/IntelliWattLogo';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        position: 'relative',
      }}
      role="main"
      aria-labelledby="not-found-title"
    >
      {/* Background ambient gold vignette */}
      <div
        style={{
          position: 'absolute',
          width: 440,
          height: 440,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Centered Brand Stack */}
      <div style={{ marginBottom: '2.5rem', position: 'relative', zIndex: 2 }}>
        <IntelliWattLogo size="lg" align="center" glow={true} showSubtitle={true} />
      </div>

      {/* 404 Numerical Code in Manrope SemiBold */}
      <div
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 'clamp(4.5rem, 12vw, 7rem)',
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #FFFFFF 30%, var(--gold-bright) 70%, var(--gold-luxury) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.75rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        404
      </div>

      {/* Heading in Sora */}
      <h1
        id="not-found-title"
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: '1.45rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: '#FFFFFF',
          marginBottom: '0.75rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        Telemetry Node Not Found
      </h1>

      <p
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          maxWidth: 460,
          margin: '0 auto 2.25rem',
          lineHeight: 1.65,
          position: 'relative',
          zIndex: 2,
        }}
      >
        The requested monitoring endpoint or route is unavailable. Please return to the live energy overview to inspect active telemetry.
      </p>

      {/* Navigation Return Button */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <Link
          href="/dashboard"
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            fontSize: '0.88rem',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 600,
          }}
        >
          <Home size={16} />
          Return to Overview
        </Link>
        <Link
          href="/"
          className="btn btn-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            fontSize: '0.88rem',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          Back Home
        </Link>
      </div>
    </div>
  );
}
