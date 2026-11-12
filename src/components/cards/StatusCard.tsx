'use client';

import { Wifi, WifiOff, Cpu, Zap } from 'lucide-react';
import { useDeviceStatus, formatUptime } from '@/lib/hooks';

type StatusCardProps = {
  type: 'wifi' | 'esp32' | 'relay';
  relayState?: boolean | string | null;
  relayName?:  string;
  wifiStatus?: boolean | string | null;
  deviceStatus?: boolean | string | null;
  stagger?: number;
};

export default function StatusCard({
  type,
  relayState,
  relayName,
  wifiStatus,
  deviceStatus,
  stagger,
}: StatusCardProps) {
  const fallbackStatus = useDeviceStatus();

  if (type === 'wifi') {
    const hasExplicitWifi = wifiStatus !== undefined && wifiStatus !== null;
    const isWifiMissing = !hasExplicitWifi && !fallbackStatus.online;
    const isWifiOnline = hasExplicitWifi
      ? (typeof wifiStatus === 'boolean'
          ? wifiStatus
          : ['online', 'connected', 'true', 'active', 'ok'].includes(String(wifiStatus).toLowerCase().trim()))
      : fallbackStatus.online;

    const wifiStatusLabel = isWifiMissing
      ? '--'
      : (isWifiOnline ? '🟢 Online' : '🔴 Offline');

    const connectionDetail = hasExplicitWifi
      ? (typeof wifiStatus === 'boolean'
          ? (wifiStatus ? 'Connected' : 'Disconnected')
          : String(wifiStatus))
      : (fallbackStatus.online ? (fallbackStatus.ip || 'Connected') : 'Disconnected');

    const strength = isWifiOnline ? (fallbackStatus.rssi > -60 ? 100 : fallbackStatus.rssi > -70 ? 75 : 50) : 0;

    return (
      <article className={`glass-card animate-fade-up ${stagger ? `stagger-${stagger}` : 'stagger-8'}`} aria-label="WiFi Status">
        <div className="metric-card-header">
          <div className={`metric-card-icon ${isWifiOnline ? 'blue' : 'red'}`}>
            {isWifiOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
          </div>
          <div className={`badge ${isWifiMissing ? 'badge-blue' : (isWifiOnline ? 'badge-green' : 'badge-red')}`}>
            {wifiStatusLabel}
          </div>
        </div>
        <div className="metric-label">WiFi Status</div>
        <div
          className={`metric-value ${isWifiMissing ? 'white' : (isWifiOnline ? 'green' : 'red')}`}
          style={{ fontSize: '1.4rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {wifiStatusLabel}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          Connection: <span style={{ color: isWifiOnline ? 'var(--gold-bright)' : 'var(--text-muted)', fontFamily: 'Manrope, sans-serif' }}>{connectionDetail}</span>
        </div>

        {/* Signal bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 20, marginBottom: 8 }}>
          {[25, 50, 75, 100].map((bar) => (
            <div
              key={bar}
              style={{
                width: 7,
                height: `${bar}%`,
                borderRadius: 3,
                background: isWifiOnline && strength >= bar ? 'var(--gold-luxury)' : '#2C2C2C',
                transition: 'background 0.4s',
                boxShadow: isWifiOnline && strength >= bar ? '0 0 6px rgba(212,175,55,0.6)' : 'none',
              }}
            />
          ))}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
            {isWifiOnline ? (fallbackStatus.rssi !== -100 ? `${fallbackStatus.rssi} dBm` : 'Connected') : '--'}
          </span>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${strength}%` }} />
        </div>
      </article>
    );
  }

  if (type === 'esp32') {
    const hasExplicitDevice = deviceStatus !== undefined && deviceStatus !== null;
    const isDeviceMissing = !hasExplicitDevice && !fallbackStatus.online;
    const isDeviceOnline = hasExplicitDevice
      ? (typeof deviceStatus === 'boolean'
          ? deviceStatus
          : ['online', 'active', 'ready', 'connected', 'true', 'ok'].includes(String(deviceStatus).toLowerCase().trim()))
      : fallbackStatus.online;

    const deviceStatusLabel = isDeviceMissing
      ? '--'
      : (isDeviceOnline ? '🟢 Online' : '🔴 Offline');

    return (
      <article className={`glass-card animate-fade-up ${stagger ? `stagger-${stagger}` : 'stagger-9'}`} aria-label="ESP32 Status">
        <div className="metric-card-header">
          <div className={`metric-card-icon ${isDeviceOnline ? 'purple' : 'red'}`}>
            <Cpu size={20} />
          </div>
          <div className={`badge ${isDeviceMissing ? 'badge-blue' : (isDeviceOnline ? 'badge-green' : 'badge-red')}`}>
            {deviceStatusLabel}
          </div>
        </div>
        <div className="metric-label">Device Status</div>
        <div
          className={`metric-value ${isDeviceMissing ? 'white' : (isDeviceOnline ? 'green' : 'red')}`}
          style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {deviceStatusLabel}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Status</span>
            <span style={{ color: isDeviceOnline ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
              {deviceStatusLabel}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>IP Address</span>
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'Manrope, sans-serif' }}>
              {fallbackStatus.online ? fallbackStatus.ip : '--'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Firmware</span>
            <span style={{ color: 'var(--gold-bright)', fontFamily: 'Manrope, sans-serif' }}>
              {hasExplicitDevice && typeof deviceStatus === 'string' && !['online', 'offline', 'true', 'false'].includes(deviceStatus.toLowerCase())
                ? deviceStatus
                : (fallbackStatus.online ? fallbackStatus.firmware : '--')}
            </span>
          </div>
        </div>

        <div
          className={`status-indicator ${isDeviceOnline ? 'online' : 'offline'}`}
          style={{ position: 'absolute', top: 16, right: 16 }}
        />
      </article>
    );
  }

  // Relay status
  const isRelayMissing = relayState === undefined || relayState === null || relayState === '';
  const isRelayOn = !isRelayMissing && (
    typeof relayState === 'boolean'
      ? relayState
      : ['on', 'active', 'true', '1'].includes(String(relayState).toLowerCase().trim())
  );

  return (
    <article className={`glass-card animate-fade-up ${stagger ? `stagger-${stagger}` : 'stagger-10'}`} aria-label={`Relay ${relayName ?? '1'} status`}>
      <div className="metric-card-header">
        <div className={`metric-card-icon ${isRelayMissing ? 'blue' : (isRelayOn ? 'green' : 'red')}`}>
          <Zap size={20} />
        </div>
        <div className={`badge ${isRelayMissing ? 'badge-blue' : (isRelayOn ? 'badge-green' : 'badge-red')}`}>
          {isRelayMissing ? '--' : (isRelayOn ? 'ON' : 'OFF')}
        </div>
      </div>
      <div className="metric-label">{relayName ? `${relayName} Status` : 'Relay Status'}</div>
      <div className={`metric-value ${isRelayMissing ? 'white' : (isRelayOn ? 'green' : 'red')}`} style={{ fontSize: '1.6rem' }}>
        {isRelayMissing ? '--' : (isRelayOn ? 'ACTIVE' : 'INACTIVE')}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
        {relayName ?? 'Main Load'}
      </div>

      <div
        style={{
          marginTop: 12,
          height: 4,
          borderRadius: 4,
          background: isRelayMissing
            ? '#2C2C2C'
            : (isRelayOn
                ? 'linear-gradient(90deg, #8A6A16, var(--gold-luxury))'
                : 'rgba(255,82,82,0.3)'),
          boxShadow: !isRelayMissing && isRelayOn ? '0 0 10px rgba(212,175,55,0.45)' : 'none',
          transition: 'all 0.4s ease',
        }}
      />
    </article>
  );
}
