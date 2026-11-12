import type { Metadata } from 'next';
import { Zap, Github, Mail, Shield, Cpu, Database, Wifi } from 'lucide-react';
import IntelliWattLogo from '@/components/brand/IntelliWattLogo';
import TeamMembersSection from '@/components/team/TeamMembersSection';

export const metadata: Metadata = {
  title:       'About IntelliWatt',
  description: 'About IntelliWatt — professional IoT energy monitoring platform.',
};

const TECH_STACK = [
  { icon: <Cpu size={20} color="var(--gold-bright)" />,      name: 'ESP32',               desc: 'Dual-core IoT microcontroller with WiFi & BT' },
  { icon: <Zap size={20} color="var(--gold-bright)" />,      name: 'PZEM-004T',           desc: 'High-accuracy AC energy measurement module' },
  { icon: <Database size={20} color="var(--gold-bright)" />, name: 'Firebase RTDB',    desc: 'Real-time WebSocket database for live telemetry sync' },
  { icon: <Shield size={20} color="var(--gold-bright)" />,   name: 'Next.js 14',          desc: 'React framework with App Router & SSR' },
  { icon: <Wifi size={20} color="var(--gold-bright)" />,     name: 'Recharts',            desc: 'Composable charting library with luxury gold gradients' },
  { icon: <Github size={20} color="var(--gold-bright)" />,   name: 'TypeScript',          desc: 'Type-safe JavaScript for robust development' },
];

const CHANGELOG = [
  { version: 'v2.4.1', date: '2026-10-13', notes: 'Live counter animations, improved glassmorphism cards, responsive sidebar.' },
  { version: 'v2.3.0', date: '2026-09-28', notes: 'Analytics page, monthly trend chart, cost breakdown table.' },
  { version: 'v2.2.0', date: '2026-09-10', notes: 'Relay control page with protection alerts.' },
  { version: 'v2.0.0', date: '2026-08-01', notes: 'Full dark UI overhaul. Firebase placeholder integration.' },
  { version: 'v1.0.0', date: '2026-07-15', notes: 'Initial release — basic ESP32 dashboard.' },
];

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <div id="about" className="page-header" style={{ scrollMarginTop: '80px' }}>
        <h1 className="page-title">About IntelliWatt</h1>
        <p className="page-subtitle">Platform documentation and system information</p>
      </div>

      {/* Hero Info */}
      <div className="glass-card animate-fade-up" style={{ padding: '2.5rem', marginBottom: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-60%', left: '50%', transform: 'translateX(-50%)',
          width: 400, height: 300,
          background: 'radial-gradient(ellipse, rgba(212,175,55,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <IntelliWattLogo size="lg" align="center" glow={true} showSubtitle={true} />
        </div>
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-yellow">v2.4.1</span>
          <span className="badge badge-green">Production Ready</span>
          <span className="badge badge-yellow">Next.js 14</span>
          <span className="badge badge-yellow">ESP32</span>
        </div>
        <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8, fontSize: '0.9rem' }}>
          A professional-grade IoT energy monitoring dashboard designed for commercial deployments.
          Real-time power analytics, smart relay control, and cloud sync via Firebase — built for
          reliability and scale.
        </p>
        <div id="contact" style={{ marginTop: '1.5rem', display: 'flex', gap: 12, justifyContent: 'center', scrollMarginTop: '80px' }}>
          <a href="mailto:admin@intelliwatt.io" className="btn btn-ghost">
            <Mail size={16} />
            Contact
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <Github size={16} />
            GitHub
          </a>
        </div>
      </div>

      {/* Tech Stack */}
      <section id="tech-stack" aria-label="Technology stack" style={{ marginBottom: '2rem', scrollMarginTop: '80px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Technology Stack</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {TECH_STACK.map((tech, i) => (
            <article
              key={tech.name}
              className={`glass-card animate-fade-up stagger-${i + 1}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}
            >
              <div className="metric-card-icon gold" style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0 }}>
                {tech.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{tech.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{tech.desc}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Core Project Team */}
      <TeamMembersSection />

      {/* Firebase Setup Guide */}
      <section aria-label="Firebase setup guide" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Firebase Integration Guide</h2>
        <div className="glass-card animate-fade-up" style={{ padding: '1.75rem' }}>
          <div className="alert info" style={{ marginBottom: '1.25rem' }}>
            <Database size={16} />
            <span>Firebase is pre-configured as a placeholder. Follow these steps to connect your live ESP32 data.</span>
          </div>

          {[
            { step: '01', title: 'Create Firebase Project',    desc: 'Go to console.firebase.google.com → Add Project → Enable Realtime Database.' },
            { step: '02', title: 'Add Web App',                desc: 'Project Settings → Your Apps → Add Web App → Copy config credentials.' },
            { step: '03', title: 'Configure .env.local',       desc: 'Create .env.local in root, add NEXT_PUBLIC_FIREBASE_* variables from your config.' },
            { step: '04', title: 'Uncomment Firebase services', desc: 'Open src/lib/firebase.ts → initializeApp and getDatabase(app).' },
            { step: '05', title: 'Real-time Listeners',        desc: 'Connect components via subscribeToIntelliWatt() listeners.' },
            { step: '06', title: 'Flash ESP32 firmware',       desc: 'Use the provided Arduino/PlatformIO sketch to push PZEM-004T readings to Realtime Database.' },
          ].map((s, i) => (
            <div key={s.step} style={{ display: 'flex', gap: 16, marginBottom: i < 5 ? '1rem' : 0, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(212,175,55,0.12)',
                border: '1px solid rgba(212,175,55,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'Manrope, sans-serif',
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold-bright)',
              }}>
                {s.step}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 3, color: '#FFFFFF' }}>{s.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Changelog */}
      <section aria-label="Changelog">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Changelog</h2>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Date</th>
                <th>Release Notes</th>
              </tr>
            </thead>
            <tbody>
              {CHANGELOG.map((c, i) => (
                <tr key={c.version}>
                  <td>
                    <span className={`badge ${i === 0 ? 'badge-blue' : 'badge-purple'}`}>
                      {c.version}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'Manrope, sans-serif', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {c.date}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer note */}
      <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        IntelliWatt v2.4.1 · Built with Next.js 14, TypeScript, Recharts · ESP32 + Firebase
      </div>
    </>
  );
}
