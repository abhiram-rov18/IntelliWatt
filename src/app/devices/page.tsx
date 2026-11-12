'use client';

import { useState } from 'react';
import { Cpu, Wifi, Zap, Thermometer, RefreshCw, Plus, Signal } from 'lucide-react';
import { useDeviceStatus, formatUptime, useSensorData } from '@/lib/hooks';
import EnergyFlowPipeline from '@/components/ui/EnergyFlowPipeline';
import AnimatedCountUp from '@/components/ui/AnimatedCountUp';

const DEVICES = [
  {
    id:       'esp32-001',
    name:     'ESP32 Main Unit',
    model:    'ESP32-WROOM-32',
    location: 'Main Panel',
    icon:     '🔌',
    color:    '#D4AF37',
    bg:       'rgba(212,175,55,0.12)',
  },
  {
    id:       'pzem-004',
    name:     'PZEM-004T Sensor',
    model:    'PZEM-004T v3.0',
    location: 'Energy Meter',
    icon:     '⚡',
    color:    '#F5D76E',
    bg:       'rgba(245,215,110,0.12)',
  },
  {
    id:       'relay-board',
    name:     '4-Ch Relay Board',
    model:    'HW-316 4-Channel',
    location: 'Control Box',
    icon:     '🔄',
    color:    '#FFFFFF',
    bg:       'rgba(255,255,255,0.08)',
  },
  {
    id:       'lcd-screen',
    name:     'LCD Screen',
    model:    '16×2 I2C Display',
    location: 'Front Panel',
    icon:     '📟',
    color:    '#8A6A16',
    bg:       'rgba(138,106,22,0.15)',
  },
];

export default function DevicesPage() {
  const status            = useDeviceStatus();
  const { reading }       = useSensorData();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Connected Devices</h1>
            <p className="page-subtitle">Industrial IoT sensor & microcontroller registry</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-ghost">
              <RefreshCw size={15} />
              Scan Network
            </button>
            <button className="btn btn-primary">
              <Plus size={15} />
              Add Device
            </button>
          </div>
        </div>
      </div>

      {/* ── System Energy Flow Pipeline: ESP32 ↓ Cloud ↓ Dashboard ↓ Analytics ── */}
      <EnergyFlowPipeline />

      {/* Network Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.35rem', marginBottom: '2.25rem' }}>
        {[
          { label: 'Online Devices', val: status.hasHeartbeat ? 4 : 0, suffix: ' of 4', sub: 'of 4 registered' },
          { label: 'Network',        display: status.hasHeartbeat && status.ip && status.ip !== '—' ? status.ip.split('.').slice(0,3).join('.') + '.x' : '—', sub: 'Subnet' },
          { label: 'WiFi Signal',    val: status.hasHeartbeat ? status.rssi : 0, suffix: ' dBm', sub: 'RSSI Strength' },
          { label: 'System Uptime',  display: status.hasHeartbeat ? formatUptime(status.uptime) : 'Offline', sub: 'Since last boot' },
        ].map((kpi, i) => (
          <article key={kpi.label} className={`glass-card animate-fade-up stagger-${i+1}`} style={{ padding: '1.5rem' }}>
            <div className="metric-label">{kpi.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif', margin: '6px 0', letterSpacing: '0.01em' }}>
              {kpi.val !== undefined ? (
                <AnimatedCountUp value={kpi.val} suffix={kpi.suffix} duration={400} />
              ) : (
                kpi.display
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{kpi.sub}</div>
          </article>
        ))}
      </div>

      {/* Device Cards */}
      <div className="device-grid" style={{ marginBottom: '2.5rem' }}>
        {DEVICES.map((device, i) => {
          const isOnline = status.hasHeartbeat;
          const isSelected = selected === device.id;
          return (
            <article
              key={device.id}
              className={`glass-card animate-fade-up stagger-${i + 5}`}
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--gold-luxury)' : undefined,
                boxShadow: isSelected ? 'var(--shadow-card-hover)' : undefined,
              }}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(isSelected ? null : device.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(isSelected ? null : device.id); }}
              aria-pressed={isSelected}
              aria-label={`${device.name} - ${isOnline ? 'online' : 'offline'}`}
            >
              {/* Device header */}
              <div className="device-card-header">
                <div className="device-avatar" style={{ background: device.bg, border: '1px solid var(--border-default)', borderRadius: 14 }}>
                  {device.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.015em' }}>{device.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{device.model}</div>
                </div>
                <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
              </div>

              {/* Stats */}
              <div className="divider" style={{ margin: '0.9rem 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { icon: <Wifi size={12} />,        label: 'Status',   val: isOnline ? 'Online' : 'Offline', col: isOnline ? 'var(--accent-green)' : 'var(--accent-red)' },
                  { icon: <Signal size={12} />,      label: 'Location', val: device.location, col: 'var(--text-secondary)' },
                  { icon: <Cpu size={12} />,         label: 'Protocol', val: 'WiFi 802.11n',  col: 'var(--text-secondary)' },
                  { icon: <Thermometer size={12} />, label: 'IP',       val: isOnline ? status.ip : 'N/A',   col: 'var(--gold-bright)' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.68rem', marginBottom: 4 }}>
                      {s.icon} {s.label}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: s.col, fontFamily: 'Manrope, sans-serif' }}>
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress / signal */}
              {isOnline && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Signal Quality</span>
                    <span style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>
                      {status.rssi > -60 ? 'Excellent' : status.rssi > -70 ? 'Good' : 'Fair'}
                    </span>
                  </div>
                  <div className="progress-bar-container" style={{ marginTop: 0, height: 6 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((status.rssi + 100) / 60) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px' }} onClick={e => e.stopPropagation()}>
                  Ping
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px' }} onClick={e => e.stopPropagation()}>
                  Logs
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px' }} onClick={e => e.stopPropagation()}>
                  OTA
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Firmware / Info table */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.25rem' }}>Device Registry</h2>
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Model</th>
              <th>IP Address</th>
              <th>Firmware</th>
              <th>Uptime</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {DEVICES.map(d => {
              const isOnline = status.hasHeartbeat;
              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.25rem' }}>{d.icon}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'Manrope, sans-serif', fontSize: '0.82rem' }}>{d.model}</td>
                  <td style={{ fontFamily: 'Manrope, sans-serif', color: isOnline ? 'var(--gold-bright)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {isOnline ? status.ip : '—'}
                  </td>
                  <td style={{ fontFamily: 'Manrope, sans-serif', color: isOnline ? 'var(--accent-green)' : 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {isOnline ? status.firmware : '—'}
                  </td>
                  <td style={{ fontFamily: 'Manrope, sans-serif', color: isOnline ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {isOnline ? formatUptime(status.uptime) : '—'}
                  </td>
                  <td>
                    <span className={`badge ${isOnline ? 'badge-green' : 'badge-red'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
