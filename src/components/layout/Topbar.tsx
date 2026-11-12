'use client';

import { usePathname, useRouter } from 'next/navigation';
import { RefreshCw, Wifi } from 'lucide-react';
import { useDeviceStatus } from '@/lib/hooks';
import FirebaseStatus from '@/components/ui/FirebaseStatus';
import { GoldLightningEmblem } from '@/components/brand/IntelliWattLogo';
import { useState, useCallback } from 'react';
import { triggerTelemetryRefresh } from '@/lib/refreshService';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/':          { title: 'Home',              subtitle: 'Welcome to IntelliWatt IoT Platform' },
  '/dashboard': { title: 'Overview',          subtitle: 'Real-time energy monitoring & control' },
  '/analytics': { title: 'Energy Analytics',  subtitle: 'Historical data & consumption trends' },
  '/devices':   { title: 'Connected Devices', subtitle: 'Connected IoT devices & sensors' },
  '/relay':     { title: 'Control Center',    subtitle: 'Smart switching & automation' },
  '/about':     { title: 'About IntelliWatt', subtitle: 'System information & documentation' },
  '/settings':  { title: 'Settings',          subtitle: 'Configuration & preferences' },
  '/profile':   { title: 'Executive Profile', subtitle: 'Project Lead & System Credentials' },
};

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { online, isWifiOnline } = useDeviceStatus();
  const info     = PAGE_TITLES[pathname] ?? { title: 'IntelliWatt', subtitle: '' };
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedNotice, setRefreshedNotice] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);

    try {
      // 1. Reload live data and refresh Firebase values immediately
      await triggerTelemetryRefresh();
    } catch (e) {
      console.warn('[Topbar] Telemetry refresh warning:', e);
    }

    try {
      // 2. Refresh current page & re-render React components via App Router
      router.refresh();
    } catch (e) {
      console.warn('[Topbar] router.refresh error, falling back:', e);
      try {
        window.location.reload();
      } catch {}
    }

    // Complete fast spin and trigger confirmation micro-pulse
    setTimeout(() => {
      setRefreshing(false);
      setRefreshedNotice(true);
      setTimeout(() => setRefreshedNotice(false), 2400);
    }, 700);
  }, [refreshing, router]);

  return (
    <header className="topbar" role="banner">
      {/* Left: Page info */}
      <div className="topbar-left">
        <div className="topbar-mobile-emblem" style={{ display: 'none' }}>
          <GoldLightningEmblem size={30} glow={true} />
        </div>
        <div>
          <div className="topbar-title">{info.title}</div>
          <div className="topbar-subtitle">{info.subtitle}</div>
        </div>
      </div>

      {/* Right: Actions & Status */}
      <div className="topbar-right">
        {/* Firebase Live Status */}
        <FirebaseStatus />

        {/* Prototype Status */}
        <div
          className="topbar-status-pill"
          style={
            online
              ? { background: '#171717', borderColor: 'rgba(212, 175, 55, 0.35)', color: 'var(--accent-green)' }
              : { background: '#171717', borderColor: 'rgba(255, 82, 82, 0.35)', color: 'var(--accent-red)' }
          }
          title={`Prototype Status: ${online ? '🟢 ON' : '🔴 OFF'}`}
        >
          <span className={`status-dot ${online ? '' : 'offline'}`} />
          {online ? '🟢 Prototype ON' : '🔴 Prototype OFF'}
        </div>

        {/* WiFi Connection Status */}
        <div
          className="topbar-status-pill"
          style={
            isWifiOnline
              ? { background: '#171717', borderColor: 'rgba(212, 175, 55, 0.35)', color: 'var(--gold-bright)' }
              : { background: '#171717', borderColor: 'rgba(255, 82, 82, 0.35)', color: 'var(--accent-red)' }
          }
          title={`WiFi: ${isWifiOnline ? 'Connected' : 'Disconnected'}`}
        >
          <Wifi size={12} color={isWifiOnline ? 'var(--gold-luxury)' : 'var(--accent-red)'} />
          {isWifiOnline ? '🟢 Wi-Fi ON' : '🔴 Wi-Fi OFF'}
        </div>

        {/* Refresh */}
        <button
          className={`topbar-icon-btn topbar-refresh-btn ${refreshedNotice ? 'refresh-success' : ''}`}
          onClick={handleRefresh}
          title={refreshedNotice ? 'Synchronized with Firebase Realtime Database' : 'Refresh Realtime Database Telemetry'}
          aria-label="Refresh sensor data"
        >
          <RefreshCw
            size={16}
            className={`topbar-refresh-icon ${refreshing ? 'is-refreshing' : ''}`}
          />
          {refreshedNotice && <span className="topbar-refresh-pulse-ring" aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
