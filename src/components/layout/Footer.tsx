'use client';

import React from 'react';
import Link from 'next/link';
import IntelliWattLogo from '@/components/brand/IntelliWattLogo';

export default function Footer() {
  return (
    <footer
      className="app-footer"
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-default)',
        background: 'rgba(11, 11, 11, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '3rem 2rem 2.5rem',
        position: 'relative',
        zIndex: 2,
      }}
      role="contentinfo"
      aria-label="Site Footer"
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '1.75rem',
        }}
      >
        {/* Centered Brand Showcase: [Gold Lightning Logo] / IntelliWatt / Smart Energy Intelligence */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <IntelliWattLogo size="md" align="center" glow={true} showSubtitle={true} />
        </div>

        {/* Quick Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.8rem',
            flexWrap: 'wrap',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
          aria-label="Footer Navigation"
        >
          <Link href="/dashboard" style={{ transition: 'color 0.2s', textDecoration: 'none' }} className="footer-nav-link">
            Overview
          </Link>
          <span style={{ color: 'var(--border-default)' }}>•</span>
          <Link href="/analytics" style={{ transition: 'color 0.2s', textDecoration: 'none' }} className="footer-nav-link">
            Energy Analytics
          </Link>
          <span style={{ color: 'var(--border-default)' }}>•</span>
          <Link href="/devices" style={{ transition: 'color 0.2s', textDecoration: 'none' }} className="footer-nav-link">
            Connected Devices
          </Link>
          <span style={{ color: 'var(--border-default)' }}>•</span>
          <Link href="/relay" style={{ transition: 'color 0.2s', textDecoration: 'none' }} className="footer-nav-link">
            Control Center
          </Link>
          <span style={{ color: 'var(--border-default)' }}>•</span>
          <Link href="/about" style={{ transition: 'color 0.2s', textDecoration: 'none' }} className="footer-nav-link">
            About IntelliWatt
          </Link>
        </nav>

        {/* System & Hardware Specifications Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 16px',
            borderRadius: '24px',
            background: 'rgba(212, 175, 55, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gold-bright)', fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
            IoT Micro-Grid
          </span>
          <span>·</span>
          <span>ESP32 Dual-Core</span>
          <span>·</span>
          <span>PZEM-004T AC Sensor</span>
          <span>·</span>
          <span>Realtime Database Telemetry</span>
        </div>

        {/* Copyright & Research Note */}
        <div
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          <div>
            © {new Date().getFullYear()} IntelliWatt. All rights reserved.
          </div>
          <div style={{ marginTop: 3, opacity: 0.8 }}>
            Engineered by K. Abhiram · Project Lead · EEE HITAM
          </div>
        </div>
      </div>
    </footer>
  );
}
