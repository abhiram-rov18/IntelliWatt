'use client';

// ─── OfflineBanner ────────────────────────────────────────────────────────────
// Shown when the device goes offline or Firebase loses connection.
// Displays a non-intrusive top banner with reconnecting pulse animation.

import { WifiOff, RefreshCw, KeyRound } from 'lucide-react';

export type OfflineBannerVariant = 'firebase' | 'device' | 'unconfigured';

interface OfflineBannerProps {
  /**
   * 'firebase' = lost connection to Firebase backend;
   * 'device' = ESP32 is offline;
   * 'unconfigured' = .env.local needs Firebase credentials
   */
  variant?:    OfflineBannerVariant;
  deviceName?: string;
  onRetry?:    () => void;
}

const MESSAGES: Record<OfflineBannerVariant, { title: string; sub: string }> = {
  firebase: {
    title: 'Waiting for ESP32...',
    sub:   'Connecting to Realtime Database /intelliwatt… Values will update automatically.',
  },
  device: {
    title: 'Waiting for ESP32...',
    sub:   'Waiting for ESP32 telemetry. Check power and WiFi connection.',
  },
  unconfigured: {
    title: 'Firebase Setup Pending',
    sub:   'Add your Firebase credentials to .env.local to stream live hardware data.',
  },
};

export function OfflineBanner({
  variant    = 'device',
  deviceName = 'ESP32',
  onRetry,
}: OfflineBannerProps) {
  const { title, sub } = MESSAGES[variant] ?? MESSAGES.device;
  const isUnconfigured = variant === 'unconfigured';

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          12,
        padding:      '12px 20px',
        borderRadius: 12,
        background:   '#171717',
        border:       '1px solid rgba(212, 175, 55, 0.35)',
        marginBottom: '1.5rem',
        animation:    'fade-in 0.35s ease',
        boxShadow:    '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(212, 175, 55, 0.08)',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width:          38,
          height:         38,
          borderRadius:   10,
          background:     '#111111',
          border:         '1px solid rgba(212, 175, 55, 0.3)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          animation:      isUnconfigured ? 'none' : 'pulse-dot 1.8s ease-in-out infinite',
        }}
      >
        {isUnconfigured ? (
          <KeyRound size={18} color="var(--gold-bright)" />
        ) : (
          <WifiOff size={18} color="var(--gold-luxury)" />
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          letterSpacing: '0.015em',
          fontSize: '0.88rem',
          color: 'var(--gold-bright)',
        }}>
          {title}
          {variant === 'device' && deviceName !== 'ESP32' && ` — ${deviceName}`}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
          {sub}
        </div>
      </div>

      {/* Optional retry button */}
      {onRetry && !isUnconfigured && (
        <button
          onClick={onRetry}
          className="btn btn-secondary"
          style={{
            padding:      '6px 16px',
            fontSize:     '0.75rem',
            fontWeight:   600,
            flexShrink:   0,
          }}
          aria-label="Retry connection"
        >
          <RefreshCw size={13} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

// ─── Inline "Device Offline" card overlay ─────────────────────────────────────
export function DeviceOfflineCard({ deviceName = 'ESP32' }: { deviceName?: string }) {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            12,
        padding:        '2rem 1.5rem',
        textAlign:      'center',
      }}
    >
      <div
        style={{
          width:          56,
          height:         56,
          borderRadius:   14,
          background:     'rgba(255,51,102,0.1)',
          border:         '1px solid rgba(255,51,102,0.25)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          animation:      'pulse-dot 2s ease-in-out infinite',
        }}
      >
        <WifiOff size={24} color="var(--accent-red)" />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
          {deviceName} Offline
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Last known values are displayed.<br />
          Data will update automatically when reconnected.
        </div>
      </div>
    </div>
  );
}
