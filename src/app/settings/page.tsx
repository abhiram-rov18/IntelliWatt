'use client';

import { Settings as SettingsIcon, Save, Bell, Database, Shield } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [rate, setRate] = useState('8.50');
  const [interval, setInterval] = useState('2');
  const [alerts, setAlerts] = useState({ overcurrent: true, overvoltage: true, lowPF: false, email: false });

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Industrial configuration & telemetry parameters</p>
      </div>

      <div className="settings-grid">
        {/* Tariff */}
        <div className="glass-card animate-fade-up stagger-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.35rem' }}>
            <div className="metric-card-icon"><Database size={18} color="var(--gold-luxury)" /></div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Energy Tariff</h2>
          </div>
          <label style={{ display: 'block', marginBottom: '1.15rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Rate per kWh (₹)</div>
            <input
              type="number"
              value={rate}
              onChange={e => setRate(e.target.value)}
              step="0.01"
              style={{
                width: '100%', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-default)',
                borderRadius: 14, padding: '11px 16px', color: 'var(--text-primary)', fontSize: '0.95rem',
                fontFamily: 'Manrope, sans-serif', outline: 'none', transition: 'border-color 0.2s',
              }}
            />
          </label>
          <label style={{ display: 'block' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Update Interval (seconds)</div>
            <input
              type="number"
              value={interval}
              onChange={e => setInterval(e.target.value)}
              min="1" max="60"
              style={{
                width: '100%', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-default)',
                borderRadius: 14, padding: '11px 16px', color: 'var(--text-primary)', fontSize: '0.95rem',
                fontFamily: 'Manrope, sans-serif', outline: 'none', transition: 'border-color 0.2s',
              }}
            />
          </label>
        </div>

        {/* Alerts */}
        <div className="glass-card animate-fade-up stagger-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.35rem' }}>
            <div className="metric-card-icon"><Bell size={18} color="var(--gold-luxury)" /></div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Alert Thresholds</h2>
          </div>
          {[
            { key: 'overcurrent', label: 'Overcurrent Protection (>15A)' },
            { key: 'overvoltage', label: 'Overvoltage Threshold (>260V)' },
            { key: 'lowPF', label: 'Low Power Factor Alert (<0.80)' },
            { key: 'email', label: 'Real-Time Telemetry Dispatch' },
          ].map(a => (
            <label key={a.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>{a.label}</span>
              <div className="smart-home-switch" style={{ width: 50, height: 26, pointerEvents: 'none' }}>
                <input
                  type="checkbox"
                  checked={alerts[a.key as keyof typeof alerts]}
                  onChange={() => setAlerts(prev => ({ ...prev, [a.key]: !prev[a.key as keyof typeof alerts] }))}
                  style={{ pointerEvents: 'auto' }}
                />
                <span className="smart-switch-track" style={{ borderRadius: 13 }}>
                  <span className="smart-switch-thumb" style={{ width: 20, height: 20, top: 2, left: 2 }} />
                </span>
              </div>
            </label>
          ))}
        </div>

        {/* Firebase */}
        <div className="glass-card animate-fade-up stagger-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.35rem' }}>
            <div className="metric-card-icon"><Database size={18} color="var(--gold-luxury)" /></div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Firebase Configuration</h2>
          </div>
          <div className="badge badge-yellow" style={{ marginBottom: '1rem', width: '100%', padding: '8px 12px', justifyContent: 'flex-start' }}>
            <Shield size={14} style={{ marginRight: 6 }} />
            <span>Active Realtime Database live synchronization</span>
          </div>
          {['API Key', 'Project ID', 'Database URL'].map(field => (
            <label key={field} style={{ display: 'block', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 5 }}>{field}</div>
              <input
                type="password"
                placeholder={`NEXT_PUBLIC_FIREBASE_${field.toUpperCase().replace(' ', '_')}`}
                style={{
                  width: '100%', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-default)',
                  borderRadius: 12, padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.82rem',
                  fontFamily: 'Manrope, sans-serif', outline: 'none',
                }}
                readOnly
              />
            </label>
          ))}
        </div>

        {/* System Info */}
        <div className="glass-card animate-fade-up stagger-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.35rem' }}>
            <div className="metric-card-icon"><SettingsIcon size={18} color="var(--gold-luxury)" /></div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>System Profile</h2>
          </div>
          {[
            { k: 'Platform Version', v: 'v2.5.0 Luxury Industrial' },
            { k: 'Next.js Runtime', v: '14.2.5 (App Router)' },
            { k: 'Build Target', v: 'Commercial Production' },
            { k: 'Firmware Spec', v: 'ESP32 PZEM-004T v3.0' },
            { k: 'Cloud Backend', v: 'Realtime Database (/intelliwatt)' },
          ].map(r => (
            <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.k}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <button className="btn btn-primary" style={{ padding: '0.85rem 2.25rem' }}>
          <Save size={16} />
          Save Preferences
        </button>
      </div>
    </>
  );
}
