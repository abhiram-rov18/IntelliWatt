'use client';

// ─── FirebaseStatus ───────────────────────────────────────────────────────────
// Compact luxury status pill shown in the Topbar.
// Reflects the live Firebase Realtime Database connection state in real-time.

import { useFirebaseConnection } from '@/lib/hooks';
import { WifiOff, Loader } from 'lucide-react';

export default function FirebaseStatus() {
  const isConnected = useFirebaseConnection();

  // ── Unknown / Connecting ──────────────────────────────────────────────────
  if (isConnected === null) {
    return (
      <div
        aria-label="Firebase connecting"
        title="Connecting to Firebase Realtime Database…"
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          7,
          padding:      '6px 13px',
          borderRadius: 20,
          background:   '#171717',
          border:       '1px solid #2C2C2C',
          fontSize:     '0.75rem',
          color:        'var(--text-muted)',
          fontWeight:   600,
          fontFamily:   'Manrope, sans-serif',
        }}
      >
        <Loader
          size={12}
          color="var(--gold-luxury)"
          style={{ animation: 'spin 0.9s linear infinite', flexShrink: 0 }}
        />
        <span>Connecting…</span>
      </div>
    );
  }

  // ── Connected ─────────────────────────────────────────────────────────────
  if (isConnected) {
    return (
      <div
        aria-label="Firebase connected"
        title="Realtime Database — Synchronized"
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          7,
          padding:      '6px 13px',
          borderRadius: 20,
          background:   '#171717',
          border:       '1px solid rgba(212, 175, 55, 0.35)',
          fontSize:     '0.75rem',
          color:        '#FFFFFF',
          fontWeight:   600,
          fontFamily:   'Manrope, sans-serif',
          boxShadow:    '0 2px 8px rgba(0, 0, 0, 0.4)',
        }}
      >
        <span
          style={{
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   'var(--accent-green)',
            boxShadow:    '0 0 8px rgba(61, 220, 132, 0.7)',
            animation:    'pulse-dot 1.8s ease-in-out infinite',
            flexShrink:   0,
          }}
        />
        <span>Firebase</span>
      </div>
    );
  }

  // ── Disconnected / Waiting ───────────────────────────────────────────────
  return (
    <div
      role="alert"
      aria-label="Waiting for ESP32..."
      title="Realtime Database — Waiting for ESP32..."
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          7,
        padding:      '6px 13px',
        borderRadius: 20,
        background:   '#171717',
        border:       '1px solid rgba(212, 175, 55, 0.35)',
        fontSize:     '0.75rem',
        color:        'var(--gold-bright)',
        fontWeight:   600,
        fontFamily:   'Manrope, sans-serif',
      }}
    >
      <WifiOff size={12} color="var(--gold-luxury)" style={{ flexShrink: 0 }} />
      Waiting for ESP32...
    </div>
  );
}
