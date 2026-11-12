'use client';

// ─── React Hooks — Firebase Live Data ─────────────────────────────────────────
// Connects to Firebase Realtime Database.
// - Real-time listeners automatically update UI state when database values change.
// - Loading indicators are exposed via `isLoading`.
// - Disconnected devices are handled gracefully: preserves last-known values,
//   exposes connection flags, and auto-detects offline heartbeat timeouts.

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  subscribeToConnectionState,
  subscribeToSensorReading,
  subscribeToDeviceStatus,
  subscribeToRelays,
  writeRelayState,
  subscribeToIntelliWatt,
  subscribeToSystemHeartbeat,
  type SystemHeartbeatData,
  updateIntelliWattRelay,
  updateAllIntelliWattRelays,
} from './realtimeDb';
import { DEFAULT_DEVICE_ID } from './firebase';
import type { SensorReading, DeviceStatus, RelayState } from './firebase';

// ─── Fallback / skeleton data used while loading ───────────────────────────────
export const SKELETON_READING: SensorReading = {
  voltage:     0,
  current:     0,
  power:       0,
  energy:      0,
  frequency:   0,
  powerFactor: 0,
  timestamp:   0,
};

export const SKELETON_STATUS: DeviceStatus = {
  online:    false,
  rssi:      -100,
  ip:        '—',
  firmware:  '—',
  uptime:    0,
  lastSeen:  0,
};

export const INITIAL_RELAYS: RelayState[] = [
  { id: 'relay1', name: 'Main Load',    state: false, updatedAt: 0 },
  { id: 'relay2', name: 'AC Unit',      state: false, updatedAt: 0 },
  { id: 'relay3', name: 'Water Pump',   state: false, updatedAt: 0 },
  { id: 'relay4', name: 'LED Lighting', state: false, updatedAt: 0 },
];

// Helper to normalize deviceId argument whether passed as string, number, or object
function resolveDeviceId(input?: unknown): string {
  if (typeof input === 'string' && input.length > 0) return input;
  if (typeof input === 'object' && input !== null && 'deviceId' in input) {
    const candidate = (input as { deviceId?: unknown }).deviceId;
    if (typeof candidate === 'string' && candidate.length > 0) return candidate;
  }
  return DEFAULT_DEVICE_ID;
}

// ─── Helper: parseTimestampMs ─────────────────────────────────────────────────
export function parseTimestampMs(val: unknown): number | null {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') {
    if (val > 1e11) return val; // Milliseconds (e.g. 1731428500000)
    if (val > 1e8) return val * 1000; // Seconds (e.g. 1731428500)
    return null; // Small counter / millis()
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const num = Number(trimmed);
    if (!isNaN(num)) {
      if (num > 1e11) return num;
      if (num > 1e8) return num * 1000;
    }
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) return parsed;
  }
  return null;
}

export interface SystemHeartbeatState {
  hasHeartbeat: boolean;
  prototypeOnline: boolean;
  wifiOnline: boolean;
  firebaseOnline: boolean;
  lastSeen: number | string | null;
  rawWifiConnected: boolean;
  rawFirebaseConnected: boolean;
  rawPrototypeOnline: boolean;
  isLoading: boolean;
  timeSinceLastHeartbeatMs: number | null;
}

/**
 * Subscribes in real time to the ESP32 heartbeat at IntelliWatt/System.
 *
 * Requirements:
 * - If lastSeen heartbeat update is missing for > 5 seconds:
 *     🔴 Prototype OFF
 *     🔴 Wi-Fi OFF
 *     🔴 Firebase OFF
 * - If lastSeen heartbeat update is received within the last 5 seconds:
 *     🟢 Prototype ON
 *     wifiConnected == true -> 🟢 Wi-Fi ON, else 🔴 Wi-Fi OFF
 *     firebaseConnected == true -> 🟢 Firebase Connected, else 🔴 Firebase Disconnected
 */
export function useSystemHeartbeat(): SystemHeartbeatState {
  const [hasHeartbeat, setHasHeartbeat] = useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<number | string | null>(null);
  const [rawPrototypeOnline, setRawPrototypeOnline] = useState<boolean>(false);
  const [rawWifiConnected, setRawWifiConnected] = useState<boolean>(false);
  const [rawFirebaseConnected, setRawFirebaseConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeSinceHeartbeatMs, setTimeSinceHeartbeatMs] = useState<number | null>(null);

  const lastValidHeartbeatRef = useRef<number | null>(null);
  const prevLastSeenRef = useRef<number | string | undefined>(undefined);
  const isMountedRef = useRef<boolean>(false);

  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);

    const handleData = (data: {
      lastSeen?: number | string;
      prototypeOnline?: boolean;
      wifiConnected?: boolean;
      firebaseConnected?: boolean;
    }) => {
      if (!isMountedRef.current) return;
      setIsLoading(false);

      if (data.prototypeOnline !== undefined) {
        setRawPrototypeOnline(Boolean(data.prototypeOnline));
      }
      if (data.wifiConnected !== undefined) {
        setRawWifiConnected(Boolean(data.wifiConnected));
      }
      if (data.firebaseConnected !== undefined) {
        setRawFirebaseConnected(Boolean(data.firebaseConnected));
      }

      const rawLastSeen = data.lastSeen;
      if (rawLastSeen !== undefined && rawLastSeen !== null) {
        setLastSeen(rawLastSeen);
        const parsedMs = parseTimestampMs(rawLastSeen);
        const now = Date.now();

        // Check if value of lastSeen changed from previous value
        const valueChanged = prevLastSeenRef.current !== undefined && prevLastSeenRef.current !== rawLastSeen;

        if (valueChanged) {
          // If value of IntelliWatt/System/lastSeen changed, heartbeat is actively pulsing
          lastValidHeartbeatRef.current = now;
          setHasHeartbeat(true);
        } else if (prevLastSeenRef.current === undefined) {
          // Initial mount: verify if lastSeen timestamp was generated within last 5 seconds
          if (parsedMs !== null) {
            const diff = now - parsedMs;
            if (diff >= -5000 && diff <= 5000) {
              lastValidHeartbeatRef.current = now;
              setHasHeartbeat(true);
            }
          }
        }
        prevLastSeenRef.current = rawLastSeen;
      }
    };

    // 1. Subscribe directly to IntelliWatt/System
    const unsubHeartbeat = subscribeToSystemHeartbeat(handleData);

    // 2. Also subscribe to full IntelliWatt tree in case ESP32 updates parent path
    const unsubIntelliWatt = subscribeToIntelliWatt((fullData) => {
      handleData({
        lastSeen: fullData.lastSeen,
        prototypeOnline: fullData.prototypeOnline,
        wifiConnected: fullData.wifiConnected,
        firebaseConnected: fullData.firebaseConnected,
      });
    });

    // 3. Heartbeat expiry tick: checks every 300ms if 5000ms has elapsed
    const ticker = setInterval(() => {
      if (!isMountedRef.current) return;
      const now = Date.now();
      const lastValid = lastValidHeartbeatRef.current;
      if (lastValid === null) {
        setHasHeartbeat(false);
        setTimeSinceHeartbeatMs(null);
      } else {
        const elapsed = now - lastValid;
        setTimeSinceHeartbeatMs(elapsed);
        if (elapsed > 5000) {
          setHasHeartbeat(false);
        } else {
          setHasHeartbeat(true);
        }
      }
    }, 300);

    return () => {
      isMountedRef.current = false;
      unsubHeartbeat();
      unsubIntelliWatt();
      clearInterval(ticker);
    };
  }, []);

  const prototypeOnline = hasHeartbeat;
  const wifiOnline = hasHeartbeat ? (rawWifiConnected === true) : false;
  const firebaseOnline = hasHeartbeat ? (rawFirebaseConnected === true) : false;

  return {
    hasHeartbeat,
    prototypeOnline,
    wifiOnline,
    firebaseOnline,
    lastSeen,
    rawWifiConnected,
    rawFirebaseConnected,
    rawPrototypeOnline,
    isLoading,
    timeSinceLastHeartbeatMs: timeSinceHeartbeatMs,
  };
}

// ─── useFirebaseConnection ─────────────────────────────────────────────────────
/**
 * Tracks whether the browser has an active connection to Firebase Realtime Database
 * and whether the ESP32 heartbeat confirms firebaseConnected within 5 seconds.
 */
export function useFirebaseConnection(): boolean | null {
  const heartbeat = useSystemHeartbeat();
  if (heartbeat.isLoading) return null;
  return heartbeat.firebaseOnline;
}

// ─── useSensorData ─────────────────────────────────────────────────────────────
/**
 * Subscribes to live sensor readings from Firebase Realtime Database.
 * Automatically receives real-time updates when new values are pushed.
 * Gracefully handles offline state by preserving the last known values and
 * tracking staleness.
 *
 * Returns:
 *   reading   — latest SensorReading
 *   history   — rolling window of the last 60 readings (for live charts)
 *   isLoading — true until the first live reading arrives
 *   isStale   — true if no update has arrived in the last 20 seconds
 *   error     — any error string, null otherwise
 *   (and spreads reading properties: voltage, current, power, etc.)
 */
export function useSensorData(deviceArg?: unknown) {
  const deviceId = resolveDeviceId(deviceArg);
  const [reading,   setReading]   = useState<SensorReading>(SKELETON_READING);
  const [history,   setHistory]   = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error,     setError]     = useState<string | null>(null);
  const [isStale,   setIsStale]   = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    let receivedData = false;

    // Timeout safety: if RTDB does not respond within 3 seconds, stop initial loading spinner
    const timer = setTimeout(() => {
      if (!receivedData) {
        setIsLoading(false);
      }
    }, 3000);

    const handleUpdate = (newReading: SensorReading) => {
      receivedData = true;
      setReading(newReading);
      setHistory(prev => [...prev.slice(-59), newReading]);
      setIsLoading(false);
      setError(null);
      setIsStale(false);
    };

    const handleError = (err: Error) => {
      setError(err.message);
      setIsLoading(false);
    };

    // 1. Subscribe to RTDB devices/{deviceId}/readings/latest
    const unsubRtdb = subscribeToSensorReading(handleUpdate, handleError, deviceId);

    // 2. Primary Realtime Database path: /intelliwatt
    const unsubIntelliWatt = subscribeToIntelliWatt((data) => {
      if (data) {
        receivedData = true;
        const power       = typeof data.power === 'number' ? data.power : (data.power ? Number(data.power) : 0);
        const voltage     = typeof data.voltage === 'number' ? data.voltage : (data.voltage ? Number(data.voltage) : 0);
        const current     = typeof data.current === 'number' ? data.current : (data.current ? Number(data.current) : 0);
        const energy      = typeof data.energy === 'number' ? data.energy : (data.energy ? Number(data.energy) : 0);
        const frequency   = typeof data.frequency === 'number' ? data.frequency : (data.frequency ? Number(data.frequency) : 50);
        const powerFactor = typeof data.powerFactor === 'number' ? data.powerFactor : (data.powerFactor ? Number(data.powerFactor) : 1);
        handleUpdate({
          voltage,
          current,
          power,
          energy,
          frequency,
          powerFactor,
          timestamp: Date.now(),
        });
      }
    });

    // 3. Listen to manual refresh events for immediate UI update
    const handleManualRefresh = (e: Event) => {
      const customEvent = e as CustomEvent<{ data?: { power?: number; voltage?: number; current?: number; energy?: number; frequency?: number; powerFactor?: number } }>;
      const data = customEvent.detail?.data;
      if (data) {
        const power       = typeof data.power === 'number' ? data.power : 0;
        const voltage     = typeof data.voltage === 'number' ? data.voltage : 0;
        const current     = typeof data.current === 'number' ? data.current : 0;
        const energy      = typeof data.energy === 'number' ? data.energy : 0;
        const frequency   = typeof data.frequency === 'number' ? data.frequency : 50;
        const powerFactor = typeof data.powerFactor === 'number' ? data.powerFactor : 1;
        handleUpdate({
          voltage,
          current,
          power,
          energy,
          frequency,
          powerFactor,
          timestamp: Date.now(),
        });
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('intelliwatt:refresh-data', handleManualRefresh);
    }

    return () => {
      clearTimeout(timer);
      unsubRtdb();
      unsubIntelliWatt();
      if (typeof window !== 'undefined') {
        window.removeEventListener('intelliwatt:refresh-data', handleManualRefresh);
      }
    };
  }, [deviceId]);

  // Staleness checker: checks if last reading timestamp is older than 25 seconds
  useEffect(() => {
    if (!reading.timestamp) return;
    const interval = setInterval(() => {
      const diff = Date.now() - reading.timestamp;
      if (diff > 25000 && !isStale) {
        setIsStale(true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [reading.timestamp, isStale]);

  return {
    reading,
    history,
    isLoading,
    isStale,
    error,
    // Direct access to reading properties
    voltage:     reading.voltage,
    current:     reading.current,
    power:       reading.power,
    energy:      reading.energy,
    frequency:   reading.frequency,
    powerFactor: reading.powerFactor,
    timestamp:   reading.timestamp,
  };
}

// ─── useDeviceStatus ───────────────────────────────────────────────────────────
/**
 * Subscribes to the device heartbeat node in Firebase Realtime Database.
 * When the ESP32 disconnects, the status reflects offline.
 *
 * Supports both destructured access:
 *   const { status, isLoading } = useDeviceStatus();
 * and direct property access:
 *   const status = useDeviceStatus(); status.online
 */
export function useDeviceStatus(deviceArg?: unknown) {
  const deviceId = resolveDeviceId(deviceArg);
  const heartbeat = useSystemHeartbeat();
  const [status, setStatus] = useState<DeviceStatus>(SKELETON_STATUS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = (newStatus: DeviceStatus) => {
      setStatus(newStatus);
      setError(null);
    };

    const handleError = (err: Error) => {
      setError(err.message);
    };

    const unsubRtdb = subscribeToDeviceStatus(handleUpdate, handleError, deviceId);
    return () => {
      unsubRtdb();
    };
  }, [deviceId]);

  return {
    status,
    isLoading: heartbeat.isLoading,
    error,
    wifiStatus: heartbeat.wifiOnline,
    deviceStatus: heartbeat.prototypeOnline ? 'Active' : 'Offline',
    isWifiOnline: heartbeat.wifiOnline,
    hasHeartbeat: heartbeat.hasHeartbeat,
    prototypeOnline: heartbeat.prototypeOnline,
    wifiOnline: heartbeat.wifiOnline,
    firebaseOnline: heartbeat.firebaseOnline,
    // Direct property spreading ensures backward compatibility with `const status = useDeviceStatus()`
    online:   heartbeat.prototypeOnline,
    rssi:     heartbeat.hasHeartbeat ? status.rssi : -100,
    ip:       heartbeat.hasHeartbeat ? status.ip : '—',
    firmware: heartbeat.hasHeartbeat ? status.firmware : '—',
    uptime:   heartbeat.hasHeartbeat ? status.uptime : 0,
    lastSeen: heartbeat.lastSeen ?? status.lastSeen,
  };
}

// ─── useRelayControl ───────────────────────────────────────────────────────────
/**
 * Subscribes to all relay states and provides toggle/set handlers via Realtime Database.
 * Supports optimistic UI updates and write synchronization.
 */
export function useRelayControl(deviceArg?: unknown) {
  const deviceId = resolveDeviceId(deviceArg);
  const [relays,    setRelays]    = useState<RelayState[]>(INITIAL_RELAYS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    let receivedData = false;

    const timer = setTimeout(() => {
      if (!receivedData) setIsLoading(false);
    }, 3000);

    const handleUpdate = (newRelays: RelayState[]) => {
      if (newRelays && newRelays.length > 0) {
        receivedData = true;
        setRelays(newRelays);
        setIsLoading(false);
        setError(null);
      }
    };

    const handleError = (err: Error) => {
      setError(err.message);
      setIsLoading(false);
    };

    const unsubRtdb = subscribeToRelays(handleUpdate, handleError, deviceId);

    // Primary Realtime Database path: /intelliwatt
    const unsubIntelliWatt = subscribeToIntelliWatt((data) => {
      if (data) {
        receivedData = true;
        setRelays((prev) => {
          const parseState = (val: unknown, fallback: boolean) => {
            if (val === undefined || val === null) return fallback;
            if (typeof val === 'boolean') return val;
            if (typeof val === 'string') return ['on', 'active', 'true', '1'].includes(val.toLowerCase().trim());
            if (typeof val === 'number') return val === 1;
            return fallback;
          };

          return prev.map((r) => {
            if (r.id === 'relay1' && data.relay1 !== undefined) return { ...r, state: parseState(data.relay1, r.state) };
            if (r.id === 'relay2' && data.relay2 !== undefined) return { ...r, state: parseState(data.relay2, r.state) };
            if (r.id === 'relay3' && data.relay3 !== undefined) return { ...r, state: parseState(data.relay3, r.state) };
            if (r.id === 'relay4' && data.relay4 !== undefined) return { ...r, state: parseState(data.relay4, r.state) };
            return r;
          });
        });
        setIsLoading(false);
        setError(null);
      }
    });

    const handleManualRefreshRelays = (e: Event) => {
      const customEvent = e as CustomEvent<{ data?: { relay1?: unknown; relay2?: unknown; relay3?: unknown; relay4?: unknown } }>;
      const data = customEvent.detail?.data;
      if (data) {
        setRelays((prev) => {
          const parseState = (val: unknown, fallback: boolean) => {
            if (val === undefined || val === null) return fallback;
            if (typeof val === 'boolean') return val;
            if (typeof val === 'string') return ['on', 'active', 'true', '1'].includes(val.toLowerCase().trim());
            if (typeof val === 'number') return val === 1;
            return fallback;
          };

          return prev.map((r) => {
            if (r.id === 'relay1' && data.relay1 !== undefined) return { ...r, state: parseState(data.relay1, r.state) };
            if (r.id === 'relay2' && data.relay2 !== undefined) return { ...r, state: parseState(data.relay2, r.state) };
            if (r.id === 'relay3' && data.relay3 !== undefined) return { ...r, state: parseState(data.relay3, r.state) };
            if (r.id === 'relay4' && data.relay4 !== undefined) return { ...r, state: parseState(data.relay4, r.state) };
            return r;
          });
        });
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('intelliwatt:refresh-data', handleManualRefreshRelays);
    }

    return () => {
      clearTimeout(timer);
      unsubRtdb();
      unsubIntelliWatt();
      if (typeof window !== 'undefined') {
        window.removeEventListener('intelliwatt:refresh-data', handleManualRefreshRelays);
      }
    };
  }, [deviceId]);

  // Optimistic toggle: update local state immediately, then commit to Realtime Database
  const toggleRelay = useCallback(async (id: string) => {
    const currentRelay = relays.find(r => r.id === id);
    if (!currentRelay) return;

    const targetState = !currentRelay.state;

    setRelays(prev => prev.map(r =>
      r.id === id ? { ...r, state: targetState, updatedAt: Date.now() } : r,
    ));

    try {
      await Promise.allSettled([
        updateIntelliWattRelay(id, targetState),
        writeRelayState(id, targetState, currentRelay.name, deviceId),
      ]);
    } catch (err) {
      // Revert on failure
      setRelays(prev => prev.map(r =>
        r.id === id ? { ...r, state: currentRelay.state } : r,
      ));
      setError((err as Error).message);
    }
  }, [relays, deviceId]);

  const setAllRelays = useCallback(async (state: boolean) => {
    const previous = [...relays];
    setRelays(prev => prev.map(r => ({ ...r, state, updatedAt: Date.now() })));

    try {
      await Promise.allSettled([
        updateAllIntelliWattRelays(state),
        ...relays.map(r => writeRelayState(r.id, state, r.name, deviceId)),
      ]);
    } catch (err) {
      setRelays(previous);
      setError((err as Error).message);
    }
  }, [relays, deviceId]);

  return { relays, toggleRelay, setAllRelays, isLoading, error };
}

// ─── useAnimatedCounter ────────────────────────────────────────────────────────
/** Smoothly animates a numeric value with ease-out cubic easing (Tesla style) */
export function useAnimatedCounter(target: number, decimals = 2, duration = 400): number {
  const [display, setDisplay] = useState(target);
  const currentValRef = useRef<number>(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = currentValRef.current;
    const to = target;
    const precisionThreshold = Math.pow(10, -(decimals + 1));

    if (Math.abs(from - to) < precisionThreshold) {
      currentValRef.current = to;
      setDisplay(+to.toFixed(decimals));
      return;
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // Tesla ease-out cubic
      const current  = from + (to - from) * eased;
      currentValRef.current = current;
      setDisplay(+current.toFixed(decimals));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        currentValRef.current = to;
        setDisplay(+to.toFixed(decimals));
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, decimals, duration]);

  return display;
}

// ─── Utility: Format Uptime ────────────────────────────────────────────────────
export function formatUptime(seconds?: number): string {
  if (!seconds || seconds <= 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── Utility: Estimated Bill ───────────────────────────────────────────────────
export function estimateBill(
  energyKwh: number,
  ratePerKwh = parseFloat(process.env.NEXT_PUBLIC_TARIFF_RATE ?? '8.5'),
): number {
  return +(Number(energyKwh ?? 0) * ratePerKwh).toFixed(2);
}
