'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Zap, Lightbulb, Droplets, Wind, Power,
  ShieldCheck, CheckCircle2, AlertTriangle, X,
  RotateCcw, Sparkles, Moon, Sun, Leaf, Flame,
  Activity, Clock, Wifi, Info,
} from 'lucide-react';
import { useRelayControl, useSensorData } from '@/lib/hooks';
import {
  updateIntelliWattRelay,
  updateAllIntelliWattRelays,
  logEvent,
  writeRelayState,
} from '@/lib/realtimeDb';
import { DEFAULT_DEVICE_ID } from '@/lib/firebase';

// ─── Smart Home Relay Definitions ─────────────────────────────────────────────
interface SmartApplianceMeta {
  id:          string;
  channel:     string;
  name:        string;
  room:        string;
  watts:       number;
  icon:        React.ElementType;
  color:       string;
  glowColor:   string;
  description: string;
  category:    'climate' | 'heavy' | 'outdoor' | 'lighting';
  schedule:    string;
  disabled?:   boolean;
}

const APPLIANCES: SmartApplianceMeta[] = [
  {
    id:          'relay2',
    channel:     'CH1',
    name:        'Test Load Bulb',
    room:        'Prototype Bench · Load Circuit',
    watts:       100,
    icon:        Lightbulb,
    color:       '#F5D76E',
    glowColor:   'rgba(245, 215, 110, 0.4)',
    description: 'Hardware test load bulb circuit with live switching and real-time power monitoring.',
    category:    'lighting',
    schedule:    'Active / Manual Control',
    disabled:    false,
  },
  {
    id:          'relay1',
    channel:     'CH2',
    name:        'Disabled',
    room:        'Auxiliary · Unassigned',
    watts:       0,
    icon:        Power,
    color:       '#666666',
    glowColor:   'rgba(255, 255, 255, 0.05)',
    description: 'This relay channel is currently disabled and disconnected from hardware loads.',
    category:    'climate',
    schedule:    'Channel Inactive',
    disabled:    true,
  },
  {
    id:          'relay3',
    channel:     'CH3',
    name:        'Disabled',
    room:        'Auxiliary · Unassigned',
    watts:       0,
    icon:        Power,
    color:       '#666666',
    glowColor:   'rgba(255, 255, 255, 0.05)',
    description: 'This relay channel is currently disabled and disconnected from hardware loads.',
    category:    'outdoor',
    schedule:    'Channel Inactive',
    disabled:    true,
  },
  {
    id:          'relay4',
    channel:     'CH4',
    name:        'Disabled',
    room:        'Auxiliary · Unassigned',
    watts:       0,
    icon:        Power,
    color:       '#666666',
    glowColor:   'rgba(255, 255, 255, 0.05)',
    description: 'This relay channel is currently disabled and disconnected from hardware loads.',
    category:    'lighting',
    schedule:    'Channel Inactive',
    disabled:    true,
  },
];

// ─── Toast Notification Type ──────────────────────────────────────────────────
interface ToastMessage {
  id:        string;
  title:     string;
  subtitle:  string;
  type:      'success' | 'warning' | 'info';
  timestamp: string;
  relayId?:  string;
  previousState?: boolean;
}

export default function RelayControlPage() {
  const { relays, isLoading: relaysLoading } = useRelayControl();
  const { reading } = useSensorData();

  // Local state for toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  // Tracking in-flight switch requests for micro-spinners
  const [updatingRelays, setUpdatingRelays] = useState<Record<string, boolean>>({});
  // Master action confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    open: false,
    title: '',
    description: '',
    action: async () => {},
  });

  // Calculate live smart home metrics (only counting enabled channels)
  const activeCount = relays.filter(r => {
    const meta = APPLIANCES.find(a => a.id === r.id);
    return r.state && !meta?.disabled;
  }).length;
  const totalConfiguredLoad = relays.reduce((sum, r) => {
    const meta = APPLIANCES.find(a => a.id === r.id);
    return sum + (r.state && !meta?.disabled ? (meta?.watts ?? 0) : 0);
  }, 0);

  // ─── Add Toast Notification ─────────────────────────────────────────────────
  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setToasts(prev => [newToast, ...prev.slice(0, 3)]); // Keep at most 4 toasts visible

    // Auto dismiss after 4.2 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4200);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ─── Switch Toggle Handler (Direct Realtime Database Update) ───────────────
  const handleToggleSwitch = async (relayId: string, customTargetState?: boolean) => {
    const relay = relays.find(r => r.id === relayId);
    const meta  = APPLIANCES.find(a => a.id === relayId);
    if (!relay || !meta || meta.disabled) return;

    const nextState = customTargetState !== undefined ? customTargetState : !relay.state;

    // Mark switch as updating
    setUpdatingRelays(prev => ({ ...prev, [relayId]: true }));

    try {
      // 1. Immediately update Realtime Database path: /intelliwatt
      await updateIntelliWattRelay(relayId, nextState);

      // 2. Mirror update to channel node and log event in Realtime Database
      await Promise.allSettled([
        writeRelayState(relayId, nextState, meta.name, DEFAULT_DEVICE_ID),
        logEvent({
          type:      'relay_toggle',
          message:   `${meta.name} switched ${nextState ? 'ON' : 'OFF'}`,
          device:    'intelliwatt',
          severity:  nextState ? 'success' : 'warning',
          value:     nextState ? 'ON' : 'OFF',
        }, DEFAULT_DEVICE_ID),
      ]);

      // 3. Show confirmation toast
      addToast({
        title:         `${meta.name} turned ${nextState ? 'ON' : 'OFF'}`,
        subtitle:      `Realtime Database /intelliwatt (${relayId}) updated`,
        type:          nextState ? 'success' : 'warning',
        relayId,
        previousState: relay.state,
      });
    } catch (err) {
      console.error('Failed to update relay in Realtime Database:', err);
      addToast({
        title:    `Failed to update ${meta.name}`,
        subtitle: (err as Error).message || 'Network error updating Realtime Database',
        type:     'warning',
      });
    } finally {
      setUpdatingRelays(prev => ({ ...prev, [relayId]: false }));
    }
  };

  // ─── Undo Action from Toast ─────────────────────────────────────────────────
  const handleUndo = async (toast: ToastMessage) => {
    if (toast.relayId && toast.previousState !== undefined) {
      removeToast(toast.id);
      await handleToggleSwitch(toast.relayId, toast.previousState);
    }
  };

  // ─── Smart Scenes ───────────────────────────────────────────────────────────
  const applyScene = (sceneName: string) => {
    if (sceneName === 'all-off') {
      setConfirmModal({
        open:        true,
        title:       'Turn OFF All Relays?',
        description: 'This will immediately de-energize all 4 load circuits and update their path in Firebase Realtime Database (/intelliwatt).',
        action: async () => {
          await updateAllIntelliWattRelays(false);
          for (const appliance of APPLIANCES) {
            await handleToggleSwitch(appliance.id, false);
          }
          addToast({
            title:    'Goodnight Scene Activated',
            subtitle: 'All 4 smart relays switched OFF in Realtime Database (/intelliwatt)',
            type:     'warning',
          });
        },
      });
    } else if (sceneName === 'all-on') {
      setConfirmModal({
        open:        true,
        title:       'Turn ON All Relays?',
        description: 'This will energize all 4 appliances simultaneously (total load: ~4,870W). Updates Realtime Database path /intelliwatt.',
        action: async () => {
          await updateAllIntelliWattRelays(true);
          for (const appliance of APPLIANCES) {
            await handleToggleSwitch(appliance.id, true);
          }
          addToast({
            title:    'Full Power Scene Activated',
            subtitle: 'All 4 smart relays switched ON in Realtime Database (/intelliwatt)',
            type:     'success',
          });
        },
      });
    } else if (sceneName === 'eco') {
      setConfirmModal({
        open:        true,
        title:       'Activate Eco Saver Mode?',
        description: 'Turns OFF heavy heating and AC units (Geyser & AC) while preserving low-draw lighting and pump controls in Realtime Database.',
        action: async () => {
          await Promise.allSettled([
            updateIntelliWattRelay('relay1', false),
            updateIntelliWattRelay('relay2', false),
            updateIntelliWattRelay('relay4', true),
          ]);
          await handleToggleSwitch('relay1', false); // AC OFF
          await handleToggleSwitch('relay2', false); // Geyser OFF
          await handleToggleSwitch('relay4', true);  // LEDs ON
          addToast({
            title:    'Eco Saver Mode Active',
            subtitle: 'High-draw loads deactivated in Realtime Database (/intelliwatt)',
            type:     'info',
          });
        },
      });
    }
  };

  return (
    <>
      {/* ─── Floating Toast Notifications ───────────────────────────────── */}
      <div className="toast-container" aria-live="polite" role="status">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast-notification ${toast.type}`}
            role="alert"
          >
            <div style={{ marginTop: 2, flexShrink: 0 }}>
              {toast.type === 'success' ? (
                <CheckCircle2 size={18} color="var(--accent-green)" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle size={18} color="var(--accent-warning)" />
              ) : (
                <Info size={18} color="var(--gold-luxury)" />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.85rem',
                color: toast.type === 'success' ? 'var(--accent-green)' : toast.type === 'warning' ? 'var(--accent-warning)' : 'var(--gold-luxury)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span>{toast.title}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'Manrope, sans-serif' }}>
                  {toast.timestamp}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                {toast.subtitle}
              </div>
              {toast.previousState !== undefined && (
                <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleUndo(toast)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'var(--text-primary)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <RotateCcw size={11} />
                    Undo
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 2,
                flexShrink: 0,
              }}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
            <div className="toast-progress" />
          </div>
        ))}
      </div>

      {/* ─── Confirmation Modal ─────────────────────────────────────────── */}
      {confirmModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 8, 23, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fade-in 0.2s ease',
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 440,
              width: '100%',
              padding: '1.75rem',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 212, 255, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(255, 107, 53, 0.15)',
                  border: '1px solid rgba(255, 107, 53, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-orange)',
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{confirmModal.title}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--gold-luxury)', fontFamily: 'Manrope, sans-serif' }}>
                  Firebase Document Sync
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {confirmModal.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  const act = confirmModal.action;
                  setConfirmModal(prev => ({ ...prev, open: false }));
                  await act();
                }}
              >
                Confirm &amp; Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Page Header ────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '3px 10px' }}>
                <Sparkles size={11} /> Smart Home Automation
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target: {DEFAULT_DEVICE_ID}
              </span>
            </div>
            <h1 className="page-title">Control Center</h1>
            <p className="page-subtitle">
              Intelligent 4-channel appliance switching with live Firebase Realtime Database updates
            </p>
          </div>

          <div className="page-actions">
            <button
              className="btn btn-ghost"
              onClick={() => applyScene('all-off')}
              style={{ color: 'var(--accent-red)', borderColor: 'rgba(255, 51, 102, 0.3)' }}
              title="De-energize all circuits"
            >
              <Power size={15} />
              Master All OFF
            </button>
            <button
              className="btn btn-primary"
              onClick={() => applyScene('all-on')}
              title="Energize all circuits"
            >
              <Zap size={15} />
              Power All ON
            </button>
          </div>
        </div>
      </div>

      {/* ─── Smart Home Overview KPI Strip ──────────────────────────────── */}
      <section aria-label="Smart Home Power Overview" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
          {/* Active Relays */}
          <article className="glass-card animate-fade-up stagger-1" style={{ padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="metric-label">Active Switches</span>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: activeCount > 0 ? 'var(--accent-green)' : 'var(--text-muted)',
                  boxShadow: activeCount > 0 ? '0 0 10px #00ff88' : 'none',
                  animation: activeCount > 0 ? 'pulse-dot 1.5s infinite' : 'none',
                }}
              />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
              {activeCount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 4 ON</span>
            </div>
            <div className="progress-bar-container" style={{ marginTop: 10 }}>
              <div
                className="progress-bar-fill green"
                style={{ width: `${(activeCount / 4) * 100}%`, transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
            </div>
          </article>

          {/* Configured Total Load */}
          <article className="glass-card animate-fade-up stagger-2" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="metric-label">Active Appliance Load</span>
              <Zap size={14} color="var(--accent-orange)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--accent-orange)', fontFamily: 'Manrope, sans-serif' }}>
              {totalConfiguredLoad.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>W</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Nominal rating of energized circuits
            </div>
          </article>

          {/* Live Sensor Measured Power */}
          <article className="glass-card animate-fade-up stagger-3" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="metric-label">Live PZEM Reading</span>
              <Activity size={14} color="var(--gold-luxury)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--gold-bright)', fontFamily: 'Manrope, sans-serif' }}>
              {reading.power > 0 ? reading.power.toFixed(0) : totalConfiguredLoad.toFixed(0)}{' '}
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>W</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Current: {(reading.current > 0 ? reading.current : (totalConfiguredLoad / 230)).toFixed(2)} A @ 230V
            </div>
          </article>

          {/* Projected Daily Cost */}
          <article className="glass-card animate-fade-up stagger-4" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="metric-label">Projected Daily Cost</span>
              <Clock size={14} color="var(--gold-luxury)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--gold-bright)', fontFamily: 'Manrope, sans-serif' }}>
              ₹{((totalConfiguredLoad * 24 / 1000) * 8.5).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Tariff rate @ ₹8.50 / kWh
            </div>
          </article>
        </div>
      </section>

      {/* ─── Smart Scenes (One-Touch Presets) ───────────────────────────── */}
      <section aria-label="Smart Home Scenes" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="var(--gold-bright)" />
            Quick Smart Scenes
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            One-touch batch document updates
          </span>
        </div>

        <div className="scene-preset-grid">
          {/* Scene 1: Goodnight */}
          <button
            className="scene-preset-card"
            onClick={() => applyScene('all-off')}
            aria-label="Activate Goodnight scene"
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(212, 175, 55, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-luxury)',
            }}>
              <Moon size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Goodnight</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>De-energize all</div>
            </div>
          </button>

          {/* Scene 2: Full Power */}
          <button
            className="scene-preset-card"
            onClick={() => applyScene('all-on')}
            aria-label="Activate Full Power scene"
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(212, 175, 55, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-bright)',
            }}>
              <Sun size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>All Powered</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Turn on all 4</div>
            </div>
          </button>

          {/* Scene 3: Eco Saver */}
          <button
            className="scene-preset-card"
            onClick={() => applyScene('eco')}
            aria-label="Activate Eco Saver scene"
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(61, 220, 132, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-green)',
            }}>
              <Leaf size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Eco Saver</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cut heavy loads</div>
            </div>
          </button>

          {/* Scene 4: Evening Lights */}
          <button
            className="scene-preset-card"
            onClick={async () => {
              await handleToggleSwitch('relay4', true);
              addToast({
                title:    'Ambient Lighting Activated',
                subtitle: 'Relay CH4 turned ON in Realtime Database',
                type:     'success',
              });
            }}
            aria-label="Activate Evening Ambiance"
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(245, 215, 110, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-luxury)',
            }}>
              <Lightbulb size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Evening Glow</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LED Grid ON</div>
            </div>
          </button>
        </div>
      </section>

      {/* ─── The Four Smart Relay Switch Cards ──────────────────────────── */}
      <section aria-label="Relay Switches Grid" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Appliance Switches (4 Channels)</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Each tactile switch synchronizes directly with Firebase Realtime Database path: <code>/intelliwatt</code>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} />
            Realtime Database Live Sync
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {APPLIANCES.map((appliance, idx) => {
            const currentRelay = relays.find(r => r.id === appliance.id);
            const isOn = !appliance.disabled && Boolean(currentRelay?.state);
            const isUpdating = Boolean(updatingRelays[appliance.id]);
            const Icon = appliance.icon;
            const currentAmps = (appliance.watts / 230).toFixed(1);

            return (
              <article
                key={appliance.id}
                className={`relay-card-smart ${appliance.disabled ? 'is-disabled' : isOn ? 'is-on' : 'is-off'} animate-fade-up stagger-${idx + 5}`}
                aria-label={`${appliance.name} Switch (${appliance.channel}) — ${appliance.disabled ? 'Disabled' : isOn ? 'ON' : 'OFF'}`}
                style={appliance.disabled ? {
                  opacity: 0.72,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  background: 'rgba(15, 23, 42, 0.45)',
                } : undefined}
              >
                {/* Card Top: Avatar, Room Info & Smooth Switch */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Glowing Icon Halo */}
                    <div className={`appliance-icon-halo ${!appliance.disabled && isOn ? 'active' : 'inactive'}`}>
                      <Icon
                        size={24}
                        color={!appliance.disabled && isOn ? appliance.color : 'var(--text-muted)'}
                        style={{
                          transition: 'all 0.35s ease',
                          filter: !appliance.disabled && isOn ? `drop-shadow(0 0 8px ${appliance.glowColor})` : 'none',
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '0.72rem',
                          color: appliance.disabled ? 'var(--text-muted)' : 'var(--gold-bright)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                        }}>
                          {appliance.channel}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>•</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {appliance.room}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>•</span>
                        {appliance.disabled ? (
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.65rem',
                              padding: '1px 7px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              color: 'var(--text-muted)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            Inactive
                          </span>
                        ) : (
                          <span
                            className="badge badge-green"
                            style={{
                              fontSize: '0.65rem',
                              padding: '1px 7px',
                              background: 'rgba(0, 255, 136, 0.12)',
                              color: 'var(--accent-green)',
                              border: '1px solid rgba(0, 255, 136, 0.25)',
                              fontWeight: 700,
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <h3 style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: appliance.disabled ? 'var(--text-muted)' : (isOn ? 'var(--text-primary)' : 'var(--text-secondary)'),
                        marginTop: 2,
                        transition: 'color 0.3s ease',
                      }}>
                        {appliance.name}
                      </h3>
                    </div>
                  </div>

                  {/* ── Smooth Tactile Switch ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <label
                      className="smart-home-switch"
                      aria-label={`Toggle ${appliance.name}`}
                      style={{
                        opacity: appliance.disabled ? 0.35 : (isUpdating ? 0.7 : 1),
                        cursor: appliance.disabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isOn}
                        disabled={appliance.disabled || isUpdating}
                        onChange={() => {
                          if (!appliance.disabled) {
                            handleToggleSwitch(appliance.id);
                          }
                        }}
                        role="switch"
                        aria-checked={isOn}
                        style={{ cursor: appliance.disabled ? 'not-allowed' : 'pointer' }}
                      />
                      <span className="smart-switch-track" style={{ cursor: appliance.disabled ? 'not-allowed' : 'pointer' }}>
                        <span className="smart-switch-thumb" style={{ cursor: appliance.disabled ? 'not-allowed' : 'pointer' }} />
                      </span>
                    </label>

                    <span style={{
                      fontSize: '0.65rem',
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 700,
                      color: appliance.disabled
                        ? 'var(--text-muted)'
                        : isUpdating
                        ? 'var(--gold-luxury)'
                        : (isOn ? 'var(--accent-green)' : 'var(--text-muted)'),
                      letterSpacing: '0.8px',
                      transition: 'color 0.3s ease',
                    }}>
                      {appliance.disabled ? 'DISABLED' : isUpdating ? 'SYNCING…' : (isOn ? 'POWERED ON' : 'OFFLINE')}
                    </span>
                  </div>
                </div>

                {/* State Banner with Animation */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: appliance.disabled
                      ? 'rgba(255, 255, 255, 0.02)'
                      : (isOn ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 255, 255, 0.03)'),
                    border: `1px solid ${appliance.disabled
                      ? 'rgba(255, 255, 255, 0.05)'
                      : (isOn ? 'rgba(0, 255, 136, 0.22)' : 'rgba(255, 255, 255, 0.06)')}`,
                    marginBottom: '1rem',
                    transition: 'all 0.35s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: appliance.disabled
                          ? 'rgba(255, 255, 255, 0.25)'
                          : (isOn ? 'var(--accent-green)' : 'var(--accent-red)'),
                        boxShadow: !appliance.disabled && isOn ? '0 0 8px rgba(0, 255, 136, 0.8)' : 'none',
                        animation: !appliance.disabled && isOn ? 'pulse-dot 1.8s infinite' : 'none',
                      }}
                    />
                    <span style={{
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: appliance.disabled
                        ? 'var(--text-muted)'
                        : (isOn ? 'var(--accent-green)' : 'var(--text-muted)'),
                      letterSpacing: '0.2px',
                    }}>
                      {appliance.disabled
                        ? 'Channel Inactive (Disabled)'
                        : (isOn ? 'Active · Energized & Delivering Power' : 'Active · Standby (OFF)')}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 600,
                    color: !appliance.disabled && isOn ? appliance.color : 'var(--text-muted)',
                  }}>
                    {!appliance.disabled && isOn ? `${appliance.watts} W` : '0 W'}
                  </span>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.55,
                  marginBottom: '1rem',
                  minHeight: '2.5rem',
                }}>
                  {appliance.description}
                </p>

                {/* Technical Specifications Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: 10,
                  padding: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>
                      Draw
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      fontFamily: 'Manrope, sans-serif',
                      color: !appliance.disabled && isOn ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>
                      {!appliance.disabled && isOn ? `${currentAmps} A` : '0.0 A'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>
                      Daily Cost
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      fontFamily: 'Manrope, sans-serif',
                      color: !appliance.disabled && isOn ? 'var(--accent-green)' : 'var(--text-muted)',
                    }}>
                      {!appliance.disabled && isOn ? `₹${((appliance.watts * 24 / 1000) * 8.5).toFixed(1)}` : '₹0'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>
                      Schedule
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: appliance.disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {appliance.schedule}
                    </div>
                  </div>
                </div>

                {/* Realtime Database Sync Footnote */}
                <div style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                }}>
                  <span style={{ fontFamily: 'Manrope, sans-serif' }}>
                    doc: relays/{appliance.id}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={11} color={appliance.disabled ? 'var(--text-muted)' : 'var(--accent-green)'} />
                    {appliance.disabled ? 'Channel Inactive' : 'Active 16A'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ─── Safety & Circuit Protection Indicators ──────────────────────── */}
      <section aria-label="Electrical Protection Status">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} color="var(--accent-green)" />
          Relay Isolation &amp; Safety Diagnostics
        </h2>

        <div className="glass-card animate-fade-up stagger-10">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {[
              {
                title:     'Optocoupler Isolation',
                sub:       'Galvanic isolation between ESP32 3.3V logic and 230V mains',
                status:    'Active & Safe',
                safe:      true,
              },
              {
                title:     'Overcurrent Trip Threshold',
                sub:       'Relays trigger emergency cutoff if load exceeds 16A per channel',
                status:    'Armed (16A)',
                safe:      true,
              },
              {
                title:     'Snubber Circuit Arc Suppression',
                sub:       'RC snubber network dampens inductive kickback on AC compressors',
                status:    'Protected',
                safe:      true,
              },
              {
                title:     'Realtime Database Reconnect',
                sub:       'ESP32 firmware auto-resyncs relay states if power cycles or reboots',
                status:    'Auto-Sync Enabled',
                safe:      true,
              },
            ].map(item => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(0, 255, 136, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-green)',
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                    {item.sub}
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '0.65rem', marginTop: 6, display: 'inline-block' }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
