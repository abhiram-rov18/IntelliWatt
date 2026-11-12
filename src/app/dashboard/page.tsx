'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Zap, BatteryCharging, Activity, Gauge,
  Radio, TrendingUp, DollarSign, Cpu,
  Wifi, Cloud, ToggleRight, Clock,
  ArrowUpRight, ChevronRight, ShieldCheck,
  FileText, CheckCircle, Loader2,
} from 'lucide-react';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import EnergyFlowPipeline from '@/components/ui/EnergyFlowPipeline';
import {
  LivePowerChart, PowerFactorGauge, HourlyConsumptionChart,
  FrequencyChart, LoadDistributionChart,
} from '@/components/charts/Charts';
import {
  subscribeToIntelliWatt,
  type IntelliWattData,
} from '@/lib/realtimeDb';
import type { SensorReading } from '@/lib/firebase';
import { isFirebaseConfigured } from '@/lib/firebase';
import { useSystemHeartbeat } from '@/lib/hooks';
import { generateSmartEnergyReport } from '@/lib/generatePdfReport';
import SmartInsightsCard from '@/components/cards/SmartInsightsCard';

// ─── Tesla Dashboard Smooth Live Value Component ─────────────────────────────
interface AnimatedCountUpProps {
  value: number | '--';
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}

function AnimatedCountUp({
  value,
  decimals = 1,
  duration = 400,
  prefix = '',
  suffix = '',
  className = '',
  style,
}: AnimatedCountUpProps) {
  const isMissing = value === '--' || typeof value !== 'number' || isNaN(value);
  const targetVal = isMissing ? null : value;

  // Track the exact instantaneous float at all times for seamless interpolation without jumps or flicker
  const currentValRef = useRef<number>(targetVal ?? 0);
  const targetValRef = useRef<number | null>(targetVal);
  const rafRef = useRef<number>(0);
  const glowTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [displayStr, setDisplayStr] = useState<string>(() =>
    targetVal !== null ? `${prefix}${targetVal.toFixed(decimals)}${suffix}` : '--'
  );
  const [isChanging, setIsChanging] = useState<boolean>(false);

  useEffect(() => {
    if (value === '--' || typeof value !== 'number' || isNaN(value)) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
      setDisplayStr('--');
      setIsChanging(false);
      targetValRef.current = null;
      return;
    }

    const startVal = currentValRef.current;
    const endVal = value;

    // Precision threshold to avoid micro-float subpixel noise
    const precisionThreshold = Math.pow(10, -(decimals + 1));
    if (targetValRef.current !== null && Math.abs(targetValRef.current - endVal) < precisionThreshold) {
      return;
    }

    targetValRef.current = endVal;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);

    if (Math.abs(startVal - endVal) < precisionThreshold) {
      currentValRef.current = endVal;
      setDisplayStr(`${prefix}${endVal.toFixed(decimals)}${suffix}`);
      return;
    }

    // Activate Tesla dashboard glow while changing
    setIsChanging(true);

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Tesla cluster cubic deceleration easing
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * ease;
      currentValRef.current = current;

      setDisplayStr(`${prefix}${current.toFixed(decimals)}${suffix}`);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete: lock to final value and dissipate glow
        currentValRef.current = endVal;
        setDisplayStr(`${prefix}${endVal.toFixed(decimals)}${suffix}`);
        glowTimeoutRef.current = setTimeout(() => {
          setIsChanging(false);
        }, 40);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
    };
  }, [value, decimals, duration, prefix, suffix]);

  return (
    <span
      className={`tesla-counter ${isChanging ? 'is-changing' : 'is-idle'} ${className}`}
      style={style}
    >
      {displayStr}
    </span>
  );
}

// ─── Animated Industrial Waveform SVG ────────────────────────────────────────
function IndustrialWaveform() {
  return (
    <div className="hero-waveform-container" aria-hidden="true">
      <svg
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        className="hero-waveform-svg"
      >
        <defs>
          <linearGradient id="heroWaveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#F5D76E" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#8A6A16" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="heroWaveStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8A6A16" />
            <stop offset="50%" stopColor="#F5D76E" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <filter id="goldGlow" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          className="waveform-path wave-ambient"
          d="M0,75 Q125,35 250,75 T500,75 T750,75 T1000,75 L1000,120 L0,120 Z"
          fill="url(#heroWaveFill)"
        />

        <path
          className="waveform-path wave-active"
          d="M0,70 Q125,20 250,70 T500,70 T750,70 T1000,70"
          fill="none"
          stroke="url(#heroWaveStroke)"
          strokeWidth="2.5"
          filter="url(#goldGlow)"
        />

        <path
          d="M0,75 Q62.5,58 125,75 T250,75 T375,75 T500,75 T625,75 T750,75 T875,75 T1000,75"
          fill="none"
          stroke="rgba(245, 215, 110, 0.35)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const [docData, setDocData]                 = useState<IntelliWattData | null>(null);
  const [isLoading, setIsLoading]             = useState<boolean>(true);
  const [history, setHistory]                 = useState<SensorReading[]>([]);
  const [lastUpdated, setLastUpdated]         = useState<string>('Live Sync');

  // Real-time listener on path IntelliWatt in Firebase Realtime Database
  useEffect(() => {
    setIsLoading(true);

    const unsub = subscribeToIntelliWatt(
      (data) => {
        console.log("========== FIREBASE LIVE DATA ==========");
        console.log(data);
        console.log("Voltage:", data?.voltage);
        console.log("Current:", data?.current);
        console.log("Power:", data?.power);
        console.log("Energy:", data?.energy);
        console.log("Frequency:", data?.frequency);
        console.log("PowerFactor:", data?.powerFactor);
        console.log("WiFi:", data?.wifiStatus);
        console.log("Device:", data?.deviceStatus);
        console.log("Relay1:", data?.relay1);
        console.log("Relay2:", data?.relay2);
        console.log("========================================");

        setDocData(data);
        setIsLoading(false);
        const timeStr = data.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        setLastUpdated(data.date ? `${data.date} · ${timeStr}` : timeStr);

        if (data) {
          const power       = typeof data.power === 'number' ? data.power : (data.power ? Number(data.power) : 0);
          const voltage     = typeof data.voltage === 'number' ? data.voltage : (data.voltage ? Number(data.voltage) : 0);
          const current     = typeof data.current === 'number' ? data.current : (data.current ? Number(data.current) : 0);
          const energy      = typeof data.energy === 'number' ? data.energy : (data.energy ? Number(data.energy) : 0);
          const frequency   = typeof data.frequency === 'number' ? data.frequency : (data.frequency ? Number(data.frequency) : 50);
          const powerFactor = typeof data.powerFactor === 'number' ? data.powerFactor : (data.powerFactor ? Number(data.powerFactor) : 1);

          setHistory((prev) => [
            ...prev.slice(-59),
            {
              voltage,
              current,
              power,
              energy,
              frequency,
              powerFactor,
              timestamp: Date.now(),
            },
          ]);
        }
      },
      (err) => {
        console.warn('[Dashboard] Realtime Database listener error:', err.message);
        setIsLoading(false);
      }
    );

    return () => {
      unsub();
    };
  }, []);

  // Listen for Topbar manual refresh events to immediately update widgets, charts, and timestamps
  useEffect(() => {
    const handleManualRefresh = (e: Event) => {
      const customEvent = e as CustomEvent<{ data?: IntelliWattData; timeStr?: string; dateStr?: string }>;
      const data = customEvent.detail?.data;
      if (!data) return;

      setDocData(data);
      setIsLoading(false);

      const timeStr = data.time || customEvent.detail?.timeStr || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      setLastUpdated(data.date ? `${data.date} · ${timeStr}` : timeStr);

      const power       = typeof data.power === 'number' ? data.power : (data.power ? Number(data.power) : 0);
      const voltage     = typeof data.voltage === 'number' ? data.voltage : (data.voltage ? Number(data.voltage) : 0);
      const current     = typeof data.current === 'number' ? data.current : (data.current ? Number(data.current) : 0);
      const energy      = typeof data.energy === 'number' ? data.energy : (data.energy ? Number(data.energy) : 0);
      const frequency   = typeof data.frequency === 'number' ? data.frequency : (data.frequency ? Number(data.frequency) : 50);
      const powerFactor = typeof data.powerFactor === 'number' ? data.powerFactor : (data.powerFactor ? Number(data.powerFactor) : 1);

      setHistory((prev) => [
        ...prev.slice(-59),
        {
          voltage,
          current,
          power,
          energy,
          frequency,
          powerFactor,
          timestamp: Date.now(),
        },
      ]);
    };

    window.addEventListener('intelliwatt:refresh-data', handleManualRefresh);
    return () => {
      window.removeEventListener('intelliwatt:refresh-data', handleManualRefresh);
    };
  }, []);

  // Helper to safely determine numeric values or fallback to "--"
  const isNumeric = (v: unknown): v is number =>
    typeof v === 'number' ? !isNaN(v) : (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)));

  const getNumOrDash = (v: unknown): number | '--' => {
    if (v === undefined || v === null || v === '') return '--';
    const n = Number(v);
    return isNaN(n) ? '--' : n;
  };


  const heartbeat = useSystemHeartbeat();
  const { hasHeartbeat, prototypeOnline, wifiOnline, firebaseOnline } = heartbeat;

  const isDeviceOnline = prototypeOnline;
  const isWifiOnline = wifiOnline;
  const isOnline = prototypeOnline;

  const showOfflineBanner =
    !isFirebaseConfigured ||
    (!isLoading && !hasHeartbeat);

  const bannerVariant =
    !isFirebaseConfigured
      ? 'unconfigured'
      : 'firebase';

  const formatRelay = (val: unknown): string => {
    if (val === undefined || val === null || val === '') return '--';
    if (typeof val === 'boolean') return val ? 'ON' : 'OFF';
    return String(val).toUpperCase();
  };

  const isRelayActive = (val: unknown): boolean => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return ['on', 'true', '1', 'active'].includes(val.toLowerCase().trim());
    if (typeof val === 'number') return val === 1;
    return false;
  };

  const powerNumeric = isNumeric(docData?.power) ? Number(docData.power) : '--';
  const voltageNumeric = isNumeric(docData?.voltage) ? Number(docData.voltage) : '--';
  const currentNumeric = isNumeric(docData?.current) ? Number(docData.current) : '--';
  const frequencyNumeric = isNumeric(docData?.frequency) ? Number(docData.frequency) : '--';
  const powerFactorNumeric = isNumeric(docData?.powerFactor) ? Number(docData.powerFactor) : '--';
  const energyNumeric = isNumeric(docData?.energy) ? Number(docData.energy) : '--';
  const billNumeric = docData?.estimatedBill !== undefined && docData?.estimatedBill !== null && isNumeric(docData.estimatedBill)
    ? Number(docData.estimatedBill)
    : (isNumeric(docData?.energy) ? +(Number(docData.energy) * 8.5).toFixed(2) : '--');

  const apparentPower = isNumeric(docData?.voltage) && isNumeric(docData?.current)
    ? (Number(docData.voltage) * Number(docData.current)).toFixed(1)
    : '--';

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const filename = await generateSmartEnergyReport({
        power: typeof powerNumeric === 'number' ? powerNumeric : 0,
        voltage: typeof voltageNumeric === 'number' ? voltageNumeric : 0,
        current: typeof currentNumeric === 'number' ? currentNumeric : 0,
        frequency: typeof frequencyNumeric === 'number' ? frequencyNumeric : 0,
        powerFactor: typeof powerFactorNumeric === 'number' ? powerFactorNumeric : 0,
        energy: typeof energyNumeric === 'number' ? energyNumeric : 0,
        bill: typeof billNumeric === 'number' ? billNumeric : 0,
        isOnline: prototypeOnline,
        isWifiOnline: wifiOnline,
        dbConnected: firebaseOnline,
        relay1: docData?.relay1,
        relay2: docData?.relay2,
        relay3: docData?.relay3,
        relay4: docData?.relay4,
        hourlyHistory: history.slice(-8).map((h) => ({
          hour: new Date(h.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
          power: Math.round(h.power),
        })),
        recentEvents: [
          {
            time: new Date().toLocaleTimeString('en-IN'),
            event: 'Active Power Telemetry',
            device: 'intelliwatt',
            value: isNumeric(docData?.power) ? `${Number(docData.power).toFixed(1)} W` : '--',
            status: 'Verified',
          },
          {
            time: '—',
            event: 'Relay 1 Status',
            device: 'Relay-01',
            value: formatRelay(docData?.relay1),
            status: 'Nominal',
          },
          {
            time: new Date().toLocaleTimeString('en-IN'),
            event: 'Line Voltage Nominal Check',
            device: 'intelliwatt',
            value: isNumeric(docData?.voltage) ? `${Number(docData.voltage).toFixed(1)} V` : '--',
            status: 'Locked',
          },
          {
            time: '—',
            event: 'WiFi Telemetry Link',
            device: 'intelliwatt',
            value: isWifiOnline ? '🟢 Online' : '🔴 Offline',
            status: isWifiOnline ? 'Active' : 'Offline',
          },
          {
            time: '—',
            event: 'Realtime Database Sync',
            device: 'IntelliWatt',
            value: firebaseOnline ? 'Synchronized' : 'Offline',
            status: firebaseOnline ? 'Connected' : 'Offline',
          },
        ],
      });

      setReportSuccessMsg(`Smart Energy Report Generated (${filename})`);
      setTimeout(() => {
        setReportSuccessMsg(null);
      }, 4000);
    } catch (err) {
      console.error('Error generating smart energy report:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Overview</h1>
            <p className="page-subtitle">
              Industrial Monitoring Telemetry · Realtime Database · /intelliwatt
            </p>
          </div>
          <div className="page-actions">
            <div
              className="metric-live-badge"
              style={{
                fontSize: '0.75rem',
                padding: '6px 14px',
                borderColor: prototypeOnline ? 'var(--gold-border)' : 'rgba(231, 76, 60, 0.35)',
                color: prototypeOnline ? 'var(--gold-bright)' : 'var(--accent-red)',
                background: 'var(--bg-surface-secondary)',
              }}
            >
              <span
                className="metric-live-dot"
                style={{
                  background: prototypeOnline ? 'var(--accent-green)' : 'var(--accent-red)',
                  boxShadow: prototypeOnline ? '0 0 8px rgba(46,204,113,0.8)' : '0 0 8px rgba(231,76,60,0.8)',
                }}
              />
              {isLoading && heartbeat.isLoading ? 'Connecting…' : (prototypeOnline ? '🟢 Prototype ON' : '🔴 Prototype OFF')}
            </div>
            <button
              id="generate-smart-energy-report-btn"
              className={`btn-perimeter-glow btn-smart-energy-report ${isGeneratingReport ? 'generating' : ''}`}
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              title="Generate Official Smart Energy Audit & Telemetry PDF Report"
              aria-label="Generate Smart Energy Report"
            >
              <span className="btn-report-icon">
                {isGeneratingReport ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FileText size={16} />
                )}
              </span>
              <span>{isGeneratingReport ? 'Generating Report…' : 'Generate Smart Energy Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Offline / Status Banner ──────────────────────────────── */}
      {showOfflineBanner && (
        <OfflineBanner
          variant={bannerVariant}
          deviceName="intelliwatt"
        />
      )}

      {/* ── System Energy Flow Pipeline: ESP32 ↓ Cloud ↓ Dashboard ↓ Analytics ── */}
      <EnergyFlowPipeline />

      {/* ── Top Industrial Telemetry & Summary Grid ──────────────── */}
      <section aria-label="Real-time telemetry and summary" className="dashboard-top-grid">
        {/* Left Column: Hero Card & 4 Compact Metric Cards */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* ⚡ Large Hero Card: Real-Time Power */}
          <article className="hero-card-industrial" aria-label="Real-Time Active Power Monitor">
            {/* Top row */}
            <div className="hero-card-header">
              <div className="hero-card-tag">
                <Zap size={16} color="var(--gold-bright)" />
                <span>Real-Time Power</span>
              </div>
              <div className="hero-card-header-actions">
                <div className="hero-card-live-pill">
                  <span className="hero-card-live-dot" />
                  <span>LIVE</span>
                </div>
                <div className="hero-card-updated" suppressHydrationWarning>
                  <Clock size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: -1 }} />
                  {lastUpdated}
                </div>
              </div>
            </div>

            {/* Main Value & Secondary Substats */}
            <div className="hero-card-body">
              <div className="hero-card-main-val">
                <div className="hero-card-number">
                  <AnimatedCountUp value={powerNumeric} decimals={1} />
                </div>
                <span className="hero-card-unit">W</span>
              </div>

              <div className="hero-card-stats-secondary">
                <div className="hero-substat">
                  <span className="hero-substat-label">Apparent Load</span>
                  <span className="hero-substat-val">{apparentPower} VA</span>
                </div>
                <div className="hero-substat">
                  <span className="hero-substat-label">System State</span>
                  <span className="hero-substat-val" style={{ color: isOnline ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {isOnline ? 'Active Nominal' : 'Standby'}
                  </span>
                </div>
              </div>
            </div>

            {/* Animated Industrial Waveform SVG */}
            <IndustrialWaveform />
          </article>

          {/* 4 Compact Cards Row: Voltage, Current, Frequency, Power Factor */}
          <div className="compact-metrics-row">
            {/* 1. Voltage */}
            <div className="compact-metric-card" aria-label="Voltage metric">
              {/* Top Left: Gold icon & label | Top Right: LIVE badge */}
              <div className="compact-card-top">
                <div className="compact-card-top-left">
                  <div className="compact-card-gold-icon">
                    <Zap size={15} color="var(--gold-bright)" />
                  </div>
                  <span className="compact-card-label">Voltage</span>
                </div>
                <div className="compact-card-live-badge">
                  <span className="card-live-dot" />
                  <span>LIVE</span>
                </div>
              </div>
              {/* Center: Large Value */}
              <div className="compact-card-center">
                <span className="compact-card-large-val">
                  <AnimatedCountUp value={voltageNumeric} decimals={1} />
                </span>
                <span className="compact-card-unit">V</span>
              </div>
              {/* Bottom: Helpful Information */}
              <div className="compact-card-bottom">
                <span className="compact-card-info">
                  {isNumeric(docData?.voltage) && Number(docData.voltage) > 0
                    ? `${+(((Number(docData.voltage) - 230) / 230) * 100).toFixed(1)}% vs 230V Nominal`
                    : 'Nominal 230V Single-Phase'}
                </span>
              </div>
            </div>

            {/* 2. Current */}
            <div className="compact-metric-card" aria-label="Current metric">
              {/* Top Left: Gold icon & label | Top Right: LIVE badge */}
              <div className="compact-card-top">
                <div className="compact-card-top-left">
                  <div className="compact-card-gold-icon">
                    <Activity size={15} color="var(--gold-bright)" />
                  </div>
                  <span className="compact-card-label">Current</span>
                </div>
                <div className="compact-card-live-badge">
                  <span className="card-live-dot" />
                  <span>LIVE</span>
                </div>
              </div>
              {/* Center: Large Value */}
              <div className="compact-card-center">
                <span className="compact-card-large-val">
                  <AnimatedCountUp value={currentNumeric} decimals={2} />
                </span>
                <span className="compact-card-unit">A</span>
              </div>
              {/* Bottom: Helpful Information */}
              <div className="compact-card-bottom">
                <span className="compact-card-info">
                  {isNumeric(docData?.current) && Number(docData.current) > 0
                    ? `${(Number(docData.current) * 230).toFixed(0)} VA instantaneous draw`
                    : 'Total phase load · Safe zone'}
                </span>
              </div>
            </div>

            {/* 3. Frequency */}
            <div className="compact-metric-card" aria-label="Frequency metric">
              {/* Top Left: Gold icon & label | Top Right: LIVE badge */}
              <div className="compact-card-top">
                <div className="compact-card-top-left">
                  <div className="compact-card-gold-icon">
                    <Radio size={15} color="var(--gold-bright)" />
                  </div>
                  <span className="compact-card-label">Frequency</span>
                </div>
                <div className="compact-card-live-badge">
                  <span className="card-live-dot" />
                  <span>LIVE</span>
                </div>
              </div>
              {/* Center: Large Value */}
              <div className="compact-card-center">
                <span className="compact-card-large-val">
                  <AnimatedCountUp value={frequencyNumeric} decimals={2} />
                </span>
                <span className="compact-card-unit">Hz</span>
              </div>
              {/* Bottom: Helpful Information */}
              <div className="compact-card-bottom">
                <span className="compact-card-info">
                  {isNumeric(docData?.frequency) && Number(docData.frequency) > 0
                    ? `${+(((Number(docData.frequency) - 50) / 50) * 100).toFixed(2)}% vs 50Hz base`
                    : '50.00 Hz grid synchronized'}
                </span>
              </div>
            </div>

            {/* 4. Power Factor */}
            <div className="compact-metric-card" aria-label="Power Factor metric">
              {/* Top Left: Gold icon & label | Top Right: LIVE badge */}
              <div className="compact-card-top">
                <div className="compact-card-top-left">
                  <div className="compact-card-gold-icon">
                    <Gauge size={15} color="var(--gold-bright)" />
                  </div>
                  <span className="compact-card-label">Power Factor</span>
                </div>
                <div className="compact-card-live-badge">
                  <span className="card-live-dot" />
                  <span>LIVE</span>
                </div>
              </div>
              {/* Center: Large Value */}
              <div className="compact-card-center">
                <span className="compact-card-large-val">
                  <AnimatedCountUp value={powerFactorNumeric} decimals={3} />
                </span>
                <span className="compact-card-unit">cos φ</span>
              </div>
              {/* Bottom: Helpful Information */}
              <div className="compact-card-bottom">
                <span
                  className="compact-card-info"
                  style={{
                    color: isNumeric(docData?.powerFactor) && Number(docData.powerFactor) >= 0.9
                      ? 'var(--gold-bright)'
                      : 'var(--text-muted)',
                  }}
                >
                  {isNumeric(docData?.powerFactor)
                    ? (Number(docData.powerFactor) >= 0.9 ? '✓ Optimal Efficiency (≥ 0.90)' : '⚠ Inductive loss warning')
                    : 'Target threshold ≥ 0.90'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary Panel: 6 Premium Mini Cards */}
        <aside className="right-summary-panel" aria-label="System Summary Panel">
          <div className="summary-panel-header">
            <div className="summary-panel-title">
              <ShieldCheck size={16} color="var(--gold-bright)" />
              <span>System Summary</span>
            </div>
            <div className="summary-live-badge">
              <span className="card-live-dot" />
              <span>LIVE</span>
            </div>
          </div>

          {/* 1. Today's Energy */}
          <div className="summary-mini-card">
            <div className="summary-card-top">
              <div className="summary-card-top-left">
                <div className="summary-mini-icon">
                  <TrendingUp size={15} color="var(--gold-bright)" />
                </div>
                <span className="summary-mini-name">Today&apos;s Energy</span>
              </div>
              <div className="card-pill-tag">DAILY</div>
            </div>
            <div className="summary-card-center">
              <span className="summary-large-val" style={{ color: 'var(--gold-bright)' }}>
                <AnimatedCountUp value={energyNumeric} decimals={3} duration={400} />
              </span>
              <span className="summary-unit">kWh</span>
            </div>
            <div className="summary-card-bottom">
              <span className="summary-mini-sub">Accumulated consumption today</span>
            </div>
          </div>

          {/* 2. Estimated Bill */}
          <div className="summary-mini-card">
            <div className="summary-card-top">
              <div className="summary-card-top-left">
                <div className="summary-mini-icon">
                  <DollarSign size={15} color="var(--gold-bright)" />
                </div>
                <span className="summary-mini-name">Estimated Bill</span>
              </div>
              <div className="card-pill-tag">TARIFF</div>
            </div>
            <div className="summary-card-center">
              <span className="summary-large-val" style={{ color: '#FFFFFF' }}>
                <AnimatedCountUp value={billNumeric} decimals={2} prefix="₹" duration={400} />
              </span>
            </div>
            <div className="summary-card-bottom">
              <span className="summary-mini-sub">Calculated @ ₹8.50 / kWh base</span>
            </div>
          </div>

          {/* 3. WiFi Status */}
          <div className="summary-mini-card">
            <div className="summary-card-top">
              <div className="summary-card-top-left">
                <div className="summary-mini-icon">
                  <Wifi size={15} color="var(--gold-bright)" />
                </div>
                <span className="summary-mini-name">WiFi Status</span>
              </div>
              <div className="compact-card-live-badge">
                <span
                  className="card-live-dot"
                  style={{
                    background: wifiOnline ? 'var(--accent-green)' : 'var(--accent-red)',
                    boxShadow: wifiOnline ? '0 0 8px rgba(61, 220, 132, 0.8)' : '0 0 8px rgba(255, 82, 82, 0.8)',
                  }}
                />
                <span>{wifiOnline ? 'ON' : 'OFF'}</span>
              </div>
            </div>
            <div className="summary-card-center">
              <span
                className="summary-large-val"
                style={{
                  fontSize: '1.25rem',
                  color: wifiOnline ? 'var(--accent-green)' : 'var(--accent-red)',
                }}
              >
                {wifiOnline ? 'Wi-Fi ON' : 'Wi-Fi OFF'}
              </span>
            </div>
            <div className="summary-card-bottom">
              <span className="summary-mini-sub">IoT Telemetry Radio Band</span>
            </div>
          </div>

          {/* 4. Firebase Status */}
          <div className="summary-mini-card">
            <div className="summary-card-top">
              <div className="summary-card-top-left">
                <div className="summary-mini-icon">
                  <Cloud size={15} color="var(--gold-bright)" />
                </div>
                <span className="summary-mini-name">Firebase Status</span>
              </div>
              <div className="compact-card-live-badge">
                <span
                  className="card-live-dot"
                  style={{
                    background: firebaseOnline ? 'var(--accent-green)' : 'var(--accent-red)',
                    boxShadow: firebaseOnline ? '0 0 8px rgba(61, 220, 132, 0.8)' : '0 0 8px rgba(255, 82, 82, 0.8)',
                  }}
                />
                <span>{firebaseOnline ? 'CONNECTED' : 'OFF'}</span>
              </div>
            </div>
            <div className="summary-card-center">
              <span
                className="summary-large-val"
                style={{
                  fontSize: '1.25rem',
                  color: firebaseOnline ? 'var(--accent-green)' : 'var(--accent-red)',
                }}
              >
                {firebaseOnline ? 'Firebase Connected' : 'Firebase OFF'}
              </span>
            </div>
            <div className="summary-card-bottom">
              <span className="summary-mini-sub">Real-time WebSocket synchronization</span>
            </div>
          </div>

          {/* 5. Prototype Status */}
          <div className="summary-mini-card">
            <div className="summary-card-top">
              <div className="summary-card-top-left">
                <div className="summary-mini-icon">
                  <Cpu size={15} color="var(--gold-bright)" />
                </div>
                <span className="summary-mini-name">Prototype Status</span>
              </div>
              <div className="compact-card-live-badge">
                <span
                  className="card-live-dot"
                  style={{
                    background: prototypeOnline ? 'var(--accent-green)' : 'var(--accent-red)',
                    boxShadow: prototypeOnline ? '0 0 8px rgba(61, 220, 132, 0.8)' : '0 0 8px rgba(255, 82, 82, 0.8)',
                  }}
                />
                <span>{prototypeOnline ? 'ON' : 'OFF'}</span>
              </div>
            </div>
            <div className="summary-card-center">
              <span
                className="summary-large-val"
                style={{
                  fontSize: '1.25rem',
                  color: prototypeOnline ? 'var(--accent-green)' : 'var(--accent-red)',
                }}
              >
                {prototypeOnline ? 'Prototype ON' : 'Prototype OFF'}
              </span>
            </div>
            <div className="summary-card-bottom">
              <span className="summary-mini-sub">Dual-Core 240MHz Microcontroller</span>
            </div>
          </div>

          {/* 6. Relay Status */}
          <div className="summary-mini-card">
            <div className="summary-card-top">
              <div className="summary-card-top-left">
                <div className="summary-mini-icon">
                  <ToggleRight size={15} color="var(--gold-bright)" />
                </div>
                <span className="summary-mini-name">Relay Status</span>
              </div>
              <Link
                href="/relay"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '0.72rem',
                  color: 'var(--gold-bright)',
                  textDecoration: 'none',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  padding: '2px 8px',
                  borderRadius: 8,
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <span>Control</span>
                <ArrowUpRight size={11} />
              </Link>
            </div>
            <div className="summary-card-center" style={{ margin: '4px 0' }}>
              <div className="summary-relays-grid" style={{ width: '100%' }}>
                {[
                  { label: 'R1', state: docData?.relay1 },
                  { label: 'R2', state: docData?.relay2 },
                  { label: 'R3', state: docData?.relay3 },
                  { label: 'R4', state: docData?.relay4 },
                ].map((r) => {
                  const active = isRelayActive(r.state);
                  return (
                    <span
                      key={r.label}
                      className={`summary-relay-chip ${active ? 'active' : ''}`}
                      title={`${r.label}: ${formatRelay(r.state)}`}
                    >
                      {r.label}:{active ? 'ON' : 'OFF'}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="summary-card-bottom">
              <span className="summary-mini-sub">4-Channel Optocoupled Isolation</span>
            </div>
          </div>
        </aside>
      </section>

      {/* ── Smart Insights Card: Real-Time Rule-Based Observations ── */}
      <SmartInsightsCard
        docData={docData}
        voltage={voltageNumeric}
        current={currentNumeric}
        power={powerNumeric}
        energy={energyNumeric}
        frequency={frequencyNumeric}
        powerFactor={powerFactorNumeric}
        isOnline={prototypeOnline}
        isWifiOnline={wifiOnline}
        dbConnected={firebaseOnline}
        lastUpdated={lastUpdated}
      />

      {/* ── Charts Section (Increased Size & Spacing) ─────────────── */}
      <section aria-label="Charts and analytics" style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.02em', color: '#FFFFFF' }}>
            Live Telemetry &amp; Analysis
          </h2>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
        </div>

        {/* Primary Row: Large Power Area Chart + Power Factor Radial Gauge */}
        <div className="charts-section" style={{ marginBottom: '1.5rem' }}>
          <LivePowerChart history={history} />
          <PowerFactorGauge value={isNumeric(docData?.powerFactor) ? Number(docData.powerFactor) : 0} />
        </div>

        {/* Secondary Row: Hourly Consumption, Grid Frequency, Load Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <HourlyConsumptionChart />
          <FrequencyChart history={history} />
          <LoadDistributionChart />
        </div>
      </section>

      {/* ── Recent Events (Below Charts, Alternating Rows & Hover) ─── */}
      <section aria-label="Recent system events" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.02em', color: '#FFFFFF' }}>
            Recent Events
          </h2>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Real-time telemetry event stream
          </span>
        </div>

        <div className="events-table-card">
          <table className="data-table-industrial" aria-label="Recent system events table">
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '26%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '16%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Device</th>
                <th>Value</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  time: new Date().toLocaleTimeString('en-IN'),
                  event: 'Power Reading',
                  device: 'intelliwatt',
                  value: isNumeric(docData?.power) ? `${Number(docData.power).toFixed(1)} W` : '--',
                  status: 'success',
                },
                {
                  time: '—',
                  event: 'Relay 1 Status',
                  device: 'Relay-01',
                  value: formatRelay(docData?.relay1),
                  status: 'info',
                },
                {
                  time: new Date().toLocaleTimeString('en-IN'),
                  event: 'Voltage Reading',
                  device: 'intelliwatt',
                  value: isNumeric(docData?.voltage) ? `${Number(docData.voltage).toFixed(1)} V` : '--',
                  status: 'success',
                },
                {
                  time: '—',
                  event: 'WiFi Status',
                  device: 'intelliwatt',
                  value: wifiOnline ? '🟢 Wi-Fi ON' : '🔴 Wi-Fi OFF',
                  status: wifiOnline ? 'success' : 'danger',
                },
                {
                  time: '—',
                  event: 'Firebase Status',
                  device: 'intelliwatt',
                  value: firebaseOnline ? '🟢 Connected' : '🔴 Disconnected',
                  status: firebaseOnline ? 'success' : 'danger',
                },
                {
                  time: '—',
                  event: 'Prototype Status',
                  device: 'intelliwatt',
                  value: prototypeOnline ? '🟢 Prototype ON' : '🔴 Prototype OFF',
                  status: prototypeOnline ? 'success' : 'danger',
                },
              ].map((row, i) => (
                <tr key={i}>
                  <td
                    suppressHydrationWarning
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.82rem',
                      color: 'var(--gold-luxury)',
                    }}
                  >
                    {row.time}
                  </td>
                  <td
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0.015em',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                    }}
                  >
                    {row.event}
                  </td>
                  <td
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {row.device}
                  </td>
                  <td
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      color: 'var(--gold-bright)',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                    }}
                  >
                    {row.value}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${row.status === 'success' ? 'green' : row.status === 'warning' ? 'yellow' : row.status === 'danger' ? 'red' : 'blue'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Dynamic PDF Generation Feedback Toast ─────────────────── */}
      {reportSuccessMsg && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            background: 'linear-gradient(135deg, rgba(24, 24, 24, 0.96) 0%, rgba(12, 12, 12, 0.98) 100%)',
            border: '1px solid var(--gold-luxury)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8), 0 0 24px rgba(212, 175, 55, 0.35)',
            borderRadius: 14,
            padding: '12px 20px',
            color: '#FFFFFF',
            fontFamily: 'Sora, sans-serif',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 9999,
            backdropFilter: 'blur(20px)',
            animation: 'pageFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <CheckCircle size={18} color="var(--gold-bright)" />
          <span>{reportSuccessMsg}</span>
        </div>
      )}
    </>
  );
}
