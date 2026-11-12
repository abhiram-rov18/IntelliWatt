import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Zap, BarChart3, Cpu, ToggleRight, Shield,
  Activity, Wifi, Database, ArrowRight, Calculator,
} from 'lucide-react';
import IntelliWattLogo from '@/components/brand/IntelliWattLogo';

export const metadata: Metadata = {
  title:       { absolute: 'IntelliWatt — Smart Energy Intelligence' },
  description: 'IntelliWatt — Professional IoT energy monitoring platform powered by ESP32 and Firebase.',
};

const FEATURES = [
  {
    icon: <Activity size={24} color="var(--gold-bright)" />,
    title: 'Real-Time Monitoring',
    desc:  'Live voltage, current, power, and energy readings updated every second from your ESP32.',
  },
  {
    icon: <ToggleRight size={24} color="var(--gold-bright)" />,
    title: 'Control Center',
    desc:  'Control multiple relays remotely from anywhere. Automate with schedules and thresholds.',
  },
  {
    icon: <BarChart3 size={24} color="var(--gold-bright)" />,
    title: 'Energy Analytics',
    desc:  'Historical charts, consumption trends, and cost estimates. Export data as CSV.',
  },
  {
    icon: <Shield size={24} color="var(--gold-bright)" />,
    title: 'Overload Protection',
    desc:  'Automatic alerts and circuit protection when thresholds are exceeded.',
  },
  {
    icon: <Wifi size={24} color="var(--gold-bright)" />,
    title: 'WiFi Connectivity',
    desc:  'Seamless ESP32 WiFi integration with signal strength monitoring and auto-reconnect.',
  },
  {
    icon: <Database size={24} color="var(--gold-bright)" />,
    title: 'Firebase Backend',
    desc:  'Cloud sync via Firebase Realtime Database. Data persisted securely with live WebSocket streams.',
  },
];

const STATS = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<2s',   label: 'Data Latency' },
  { value: '10K+',  label: 'Readings/Day' },
  { value: 'AES-256', label: 'Encryption' },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section id="home" className="hero-section" aria-label="Hero" style={{ scrollMarginTop: '80px' }}>
        <div className="hero-glow" aria-hidden />

        {/* Centered Master Brand Showcase: Living 3D Sculptural Logo */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <IntelliWattLogo size="xl" align="center" glow={true} showSubtitle={true} sculptureRotate={true} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 20,
            padding: '7px 18px',
            margin: '0 auto 1.75rem',
            fontSize: '0.8rem',
            color: 'var(--gold-bright)',
            fontWeight: 600,
            justifyContent: 'center',
            width: 'fit-content',
            marginLeft: 'auto',
            marginRight: 'auto',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse-dot 1.5s infinite', boxShadow: '0 0 6px rgba(46,204,113,0.8)' }} />
          System Online — All Sensors Active
        </div>

        <h1 className="hero-title">
          Smart Energy<br />Monitoring Platform
        </h1>
        <p className="hero-subtitle">
          Professional-grade IoT dashboard for real-time power monitoring,
          relay control, and energy analytics — powered by ESP32 &amp; Firebase.
        </p>

        <div className="hero-actions">
          <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.85rem 2.2rem', fontSize: '0.95rem' }}>
            <Zap size={18} />
            Open Overview
            <ArrowRight size={16} />
          </Link>
          <Link href="/relay" className="btn btn-ghost" style={{ padding: '0.85rem 1.8rem', fontSize: '0.95rem' }}>
            <ToggleRight size={18} />
            Control Center
          </Link>
        </div>
      </section>

      {/* ── Live Stats Row ────────────────────────────────────────── */}
      <div
        className="glass-card animate-fade-up"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          marginBottom: '3.5rem',
          overflow: 'hidden',
          padding: 0,
          border: '1px solid var(--border-default)',
        }}
        aria-label="Platform statistics"
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              textAlign: 'center',
              padding: '1.75rem 1rem',
              borderRight: i < STATS.length - 1 ? '1px solid var(--border-default)' : 'none',
              background: 'var(--bg-surface-secondary)',
            }}
          >
            <div style={{ fontSize: '1.85rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 5, letterSpacing: '0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section aria-label="Features">
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Everything You Need
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Built for commercial IoT deployments with enterprise-grade reliability.
          </p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className={`glass-card feature-card animate-fade-up stagger-${i + 1}`}
            >
              <div className="feature-icon metric-card-icon" style={{ width: 52, height: 52, borderRadius: 14, marginBottom: '1.25rem' }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Quick Nav ─────────────────────────────────────────────── */}
      <section aria-label="Quick navigation" style={{ marginTop: '2.5rem' }}>
        <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--gold-bright)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
          Quick Access
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { href: '/dashboard', label: 'Overview',           icon: <Activity size={20} color="var(--gold-bright)" /> },
            { href: '/analytics', label: 'Energy Analytics',   icon: <BarChart3 size={20} color="var(--gold-bright)" /> },
            { href: '/analytics#bill-estimator', label: 'Bill Estimator', icon: <Calculator size={20} color="var(--gold-bright)" /> },
            { href: '/devices',   label: 'Connected Devices',  icon: <Cpu size={20} color="var(--gold-bright)" /> },
            { href: '/relay',     label: 'Control Center',     icon: <ToggleRight size={20} color="var(--gold-bright)" /> },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="glass-card"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem 1.25rem', transition: 'all 0.25s ease' }}
            >
              <span className="metric-card-icon" style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0 }}>
                {item.icon}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</span>
              <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
