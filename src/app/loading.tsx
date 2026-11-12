'use client';

import React from 'react';
import IntelliWattLogo from '@/components/brand/IntelliWattLogo';

export default function Loading() {
  return (
    <div
      style={{
        minHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        position: 'relative',
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading IntelliWatt"
    >
      {/* Subtle radial ambient vignette */}
      <div
        style={{
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Centered Brand Stack */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: '2rem' }}>
        <IntelliWattLogo size="lg" align="center" glow={true} showSubtitle={true} />
      </div>

      {/* Sleek Precision Industrial Loading Bar */}
      <div
        style={{
          width: 220,
          height: 3,
          background: '#1A1A1A',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          boxShadow: '0 0 16px rgba(212, 175, 55, 0.08)',
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '45%',
            background: 'linear-gradient(90deg, transparent, var(--gold-bright), var(--gold-luxury), transparent)',
            animation: 'laserScan 1.6s ease-in-out infinite',
          }}
        />
      </div>

      <div
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: '0.74rem',
          color: 'var(--text-muted)',
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          marginTop: '1.25rem',
          zIndex: 2,
        }}
      >
        Initializing Smart Energy Platform...
      </div>

      <style jsx>{`
        @keyframes laserScan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}
