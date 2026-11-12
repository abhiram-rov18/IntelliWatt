// ─── Firebase Realtime Database Service ──────────────────────────────────────
// Reusable service that listens continuously to Firebase Realtime Database
// on the path: IntelliWatt
// ESP32 writes: Sensor (Voltage, Current, etc.), System (WiFi, etc.), Controls (Relay1, Relay2)

import {
  ref,
  onValue,
  off,
  set,
  update,
  push,
  query,
  limitToLast,
  type DataSnapshot,
} from 'firebase/database';
import { rtdb, DEFAULT_DEVICE_ID } from './firebase';
import type { SensorReading, DeviceStatus, RelayState } from './firebase';

// ─── IntelliWattData Interface ────────────────────────────────────────────────
export interface IntelliWattData {
  voltage:      number;
  current:      number;
  power:        number;
  energy:       number;
  frequency:    number;
  powerFactor:  number;

  wifiStatus:   boolean;
  monitoring:   boolean;
  warning:      boolean;
  sdCard?:      boolean;

  deviceStatus: string;

  // Real-time ESP32 Heartbeat & Status
  lastSeen?:            number | string;
  prototypeOnline?:     boolean;
  wifiConnected?:       boolean;
  firebaseConnected?:   boolean;

  relay1:       boolean;
  relay2:       boolean;
  relay3?:      boolean;
  relay4?:      boolean;

  date:         string;
  time:         string;

  estimatedBill?: number;
}

export type DeviceEvent = {
  type:      'power_reading' | 'relay_toggle' | 'alert' | 'reconnect' | 'boot' | 'offline';
  message:   string;
  device:    string;
  value?:    string;
  severity:  'info' | 'success' | 'warning' | 'danger';
  timestamp: number;
};

export type HourlyAggregate = {
  hour:         number;   // 0–23
  avgPower:     number;   // W
  totalEnergy:  number;   // kWh
  peakPower:    number;   // W
  avgVoltage:   number;   // V
  timestamp:    number;
};

export type DailyAggregate = {
  date:          string;   // ISO date "YYYY-MM-DD"
  totalEnergy:   number;   // kWh
  peakPower:     number;   // W
  avgPower:      number;   // W
  estimatedCost: number;   // ₹
  timestamp:     number;
};

// ─── Default Fallback Values ──────────────────────────────────────────────────
export const DEFAULT_INTELLIWATT_DATA: IntelliWattData = {
  voltage:      0,
  current:      0,
  power:        0,
  energy:       0,
  frequency:    50.0,
  powerFactor:  1.0,

  wifiStatus:   false,
  monitoring:   false,
  warning:      false,
  sdCard:       false,

  deviceStatus: 'Offline',

  lastSeen:          undefined,
  prototypeOnline:   false,
  wifiConnected:     false,
  firebaseConnected: false,

  relay1:       false,
  relay2:       false,
  relay3:       false,
  relay4:       false,

  date:         new Date().toLocaleDateString('en-CA'),
  time:         new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),

  estimatedBill: 0,
};

// ─── Parsing Helpers ──────────────────────────────────────────────────────────
function parseNum(val: unknown, fallback: number): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (typeof val === 'string' && val.trim() !== '') {
    const parsed = Number(val);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function parseBool(val: unknown, fallback: boolean): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (['true', '1', 'on', 'connected', 'active', 'ok', 'yes', 'nominal'].includes(s)) return true;
    if (['false', '0', 'off', 'disconnected', 'standby', 'idle', 'no', 'halt'].includes(s)) return false;
  }
  return fallback;
}

function parseStr(val: unknown, fallback: string): string {
  if (val === undefined || val === null || val === '') return fallback;
  return String(val);
}

// ─── Snapshot Mapper ──────────────────────────────────────────────────────────
export function mapSnapshotToIntelliWattData(raw: unknown): IntelliWattData {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_INTELLIWATT_DATA };
  }

  const data = raw as Record<string, unknown>;
  const sensor = (data.Sensor || data.sensor || {}) as Record<string, unknown>;
  const system = (data.System || data.system || {}) as Record<string, unknown>;
  const controls = (data.Controls || data.controls || {}) as Record<string, unknown>;

  // Sensor mappings
  const voltage = parseNum(sensor.Voltage ?? sensor.voltage ?? data.Voltage ?? data.voltage, 0);
  const current = parseNum(sensor.Current ?? sensor.current ?? data.Current ?? data.current, 0);
  const power = parseNum(sensor.Power ?? sensor.power ?? data.Power ?? data.power, 0);
  const energy = parseNum(sensor.Energy ?? sensor.energy ?? data.Energy ?? data.energy, 0);
  const frequency = parseNum(sensor.Frequency ?? sensor.frequency ?? data.Frequency ?? data.frequency, 50.0);
  const powerFactor = parseNum(sensor.PowerFactor ?? sensor.powerFactor ?? data.PowerFactor ?? data.powerFactor, 1.0);

  // System mappings
  const rawLastSeen = system.lastSeen ?? data.lastSeen;
  const lastSeen = typeof rawLastSeen === 'number' || typeof rawLastSeen === 'string' ? rawLastSeen : undefined;

  const rawProto = system.prototypeOnline ?? system.prototype ?? data.prototypeOnline;
  const prototypeOnline = rawProto !== undefined ? parseBool(rawProto, false) : undefined;

  const rawWifi = system.wifiConnected ?? system.wifi ?? system.WiFi ?? system.wifiStatus ?? data.wifiConnected ?? data.wifiStatus;
  const wifiConnected = rawWifi !== undefined ? parseBool(rawWifi, false) : undefined;

  const rawFb = system.firebaseConnected ?? system.firebase ?? data.firebaseConnected;
  const firebaseConnected = rawFb !== undefined ? parseBool(rawFb, false) : undefined;

  const wifiStatus = wifiConnected !== undefined
    ? wifiConnected
    : parseBool(system.WiFi ?? system.wifi ?? system.wifiStatus ?? data.WiFi ?? data.wifiStatus, false);
  const monitoring = parseBool(system.Monitoring ?? system.monitoring, false);
  const warning = parseBool(system.Warning ?? system.warning, false);
  const sdCard = parseBool(system.SDCard ?? system.sdCard ?? system.sdcard, false);

  const deviceStatus = parseStr(
    system.ESP32Status ?? system.esp32Status ?? system.deviceStatus ?? data.ESP32Status ?? data.deviceStatus,
    'Active'
  );

  // Controls mappings
  const relay1 = parseBool(controls.Relay1 ?? controls.relay1 ?? data.relay1, false);
  const relay2 = parseBool(controls.Relay2 ?? controls.relay2 ?? data.relay2, false);
  const relay3 = parseBool(controls.Relay3 ?? controls.relay3 ?? data.relay3, false);
  const relay4 = parseBool(controls.Relay4 ?? controls.relay4 ?? data.relay4, false);

  // Date and Time
  const date = parseStr(
    system.Date ?? system.date ?? data.Date ?? data.date,
    new Date().toLocaleDateString('en-CA')
  );
  const time = parseStr(
    system.Time ?? system.time ?? data.Time ?? data.time,
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );

  // Estimated Bill calculation
  const estimatedBill = parseNum(data.estimatedBill ?? (energy * 8.5), +(energy * 8.5).toFixed(2));

  return {
    voltage,
    current,
    power,
    energy,
    frequency,
    powerFactor,

    wifiStatus,
    monitoring,
    warning,
    sdCard,

    deviceStatus,

    lastSeen,
    prototypeOnline,
    wifiConnected,
    firebaseConnected,

    relay1,
    relay2,
    relay3,
    relay4,

    date,
    time,

    estimatedBill,
  };
}

// ─── Primary Service: subscribeToIntelliWatt ──────────────────────────────────
/**
 * Continuously listens to Firebase Realtime Database on the path: IntelliWatt
 * Maps the raw ESP32 Sensor, System, and Controls trees into the IntelliWattData interface.
 * Returns an unsubscribe cleanup function that detaches the listener with off().
 */
export function subscribeToIntelliWatt(
  onData:  (data: IntelliWattData) => void,
  onError?: (err: Error) => void,
): () => void {
  try {
    const targetRef = ref(rtdb, 'IntelliWatt');

    const listener = (snapshot: DataSnapshot) => {
      try {
        if (snapshot.exists()) {
          const mapped = mapSnapshotToIntelliWattData(snapshot.val());
          onData(mapped);
        } else {
          onData({ ...DEFAULT_INTELLIWATT_DATA });
        }
      } catch (err) {
        console.warn('[RTDB] Error mapping IntelliWatt snapshot:', err);
        onError?.(err as Error);
      }
    };

    const errorListener = (error: Error) => {
      console.warn('[RTDB] IntelliWatt listener error:', error.message);
      onError?.(error);
    };

    const unsub = onValue(targetRef, listener, errorListener);

    return () => {
      unsub();
      off(targetRef, 'value', listener);
    };
  } catch (err) {
    console.warn('[RTDB] Failed to bind IntelliWatt listener:', err);
    onError?.(err as Error);
    return () => {};
  }
}

// ─── Real-Time System Heartbeat Listener: IntelliWatt/System ──────────────────
export interface SystemHeartbeatData {
  lastSeen?:          number | string;
  prototypeOnline?:   boolean;
  wifiConnected?:     boolean;
  firebaseConnected?: boolean;
}

export function subscribeToSystemHeartbeat(
  onData:   (data: SystemHeartbeatData) => void,
  onError?: (err: Error) => void,
): () => void {
  try {
    const targetRef = ref(rtdb, 'IntelliWatt/System');

    const listener = (snapshot: DataSnapshot) => {
      try {
        if (snapshot.exists()) {
          const val = snapshot.val() as Record<string, unknown> | null;
          if (val && typeof val === 'object') {
            const rawLastSeen = val.lastSeen;
            const lastSeen = typeof rawLastSeen === 'number' || typeof rawLastSeen === 'string' ? rawLastSeen : undefined;
            const prototypeOnline = val.prototypeOnline !== undefined ? parseBool(val.prototypeOnline, false) : undefined;
            const wifiConnected = (val.wifiConnected !== undefined ? parseBool(val.wifiConnected, false) : undefined)
              ?? (val.WiFi !== undefined ? parseBool(val.WiFi, false) : undefined)
              ?? (val.wifi !== undefined ? parseBool(val.wifi, false) : undefined);
            const firebaseConnected = val.firebaseConnected !== undefined ? parseBool(val.firebaseConnected, false) : undefined;

            onData({ lastSeen, prototypeOnline, wifiConnected, firebaseConnected });
            return;
          }
        }
        onData({});
      } catch (err) {
        console.warn('[RTDB] Error in SystemHeartbeat listener:', err);
        onError?.(err as Error);
      }
    };

    const errorListener = (error: Error) => {
      console.warn('[RTDB] SystemHeartbeat listener error:', error.message);
      onError?.(error);
    };

    const unsub = onValue(targetRef, listener, errorListener);

    return () => {
      unsub();
      off(targetRef, 'value', listener);
    };
  } catch (err) {
    console.warn('[RTDB] Failed to bind SystemHeartbeat listener:', err);
    onError?.(err as Error);
    return () => {};
  }
}

// ─── Connection Sentinel (.info/connected) ────────────────────────────────────
export function subscribeToConnectionState(
  onChange: (connected: boolean) => void,
): () => void {
  try {
    const connRef = ref(rtdb, '.info/connected');
    const listener = (snap: DataSnapshot) => {
      onChange(snap.val() === true);
    };
    const unsub = onValue(connRef, listener, (err) => {
      console.warn('[RTDB] Connection state listener warning:', err.message);
      onChange(false);
    });

    return () => {
      unsub();
      off(connRef, 'value', listener);
    };
  } catch (err) {
    console.warn('[RTDB] Failed to bind connection listener:', err);
    onChange(false);
    return () => {};
  }
}

// ─── Write: Update Relays in IntelliWatt/Controls ─────────────────────────────
export async function updateIntelliWattRelay(
  relayId: string,
  state: boolean,
): Promise<void> {
  const key = relayId.toLowerCase().startsWith('relay')
    ? 'Relay' + relayId.slice(5)
    : relayId;
  const targetRef = ref(rtdb, `IntelliWatt/Controls/${key}`);
  await set(targetRef, state);
}

export async function updateAllIntelliWattRelays(
  state: boolean,
): Promise<void> {
  const targetRef = ref(rtdb, 'IntelliWatt/Controls');
  await update(targetRef, {
    Relay1: state,
    Relay2: state,
    Relay3: state,
    Relay4: state,
  });
}

// ─── Additional Realtime Database Helpers ─────────────────────────────────────
export function subscribeToSensorReading(
  onChange:  (reading: SensorReading) => void,
  onError?:  (err: Error) => void,
  deviceId = DEFAULT_DEVICE_ID,
): () => void {
  try {
    const dataRef = ref(rtdb, `devices/${deviceId}/readings/latest`);
    const listener = (snap: DataSnapshot) => {
      const val = snap.val() as SensorReading | null;
      if (val) onChange(val);
    };
    const unsub = onValue(dataRef, listener, (err) => onError?.(err));
    return () => {
      unsub();
      off(dataRef, 'value', listener);
    };
  } catch (err) {
    onError?.(err as Error);
    return () => {};
  }
}

export function subscribeToDeviceStatus(
  onChange:  (status: DeviceStatus) => void,
  onError?:  (err: Error) => void,
  deviceId = DEFAULT_DEVICE_ID,
): () => void {
  try {
    const dataRef = ref(rtdb, `devices/${deviceId}/status`);
    const listener = (snap: DataSnapshot) => {
      const val = snap.val() as DeviceStatus | null;
      if (val) onChange(val);
    };
    const unsub = onValue(dataRef, listener, (err) => onError?.(err));
    return () => {
      unsub();
      off(dataRef, 'value', listener);
    };
  } catch (err) {
    onError?.(err as Error);
    return () => {};
  }
}

export function subscribeToRelays(
  onChange:  (relays: RelayState[]) => void,
  onError?:  (err: Error) => void,
  deviceId = DEFAULT_DEVICE_ID,
): () => void {
  try {
    const dataRef = ref(rtdb, `devices/${deviceId}/relays`);
    const listener = (snap: DataSnapshot) => {
      const raw = snap.val() as Record<string, Omit<RelayState, 'id'>> | null;
      if (raw) {
        const relays: RelayState[] = Object.entries(raw)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => a.id.localeCompare(b.id));
        onChange(relays);
      }
    };
    const unsub = onValue(dataRef, listener, (err) => onError?.(err));
    return () => {
      unsub();
      off(dataRef, 'value', listener);
    };
  } catch (err) {
    onError?.(err as Error);
    return () => {};
  }
}

export async function writeRelayState(
  relayId:  string,
  state:    boolean,
  name:     string,
  deviceId = DEFAULT_DEVICE_ID,
): Promise<void> {
  const dataRef = ref(rtdb, `devices/${deviceId}/relays/${relayId}`);
  await set(dataRef, {
    id:        relayId,
    name,
    state,
    updatedAt: Date.now(),
  } satisfies RelayState);
}

export async function logEvent(
  event:     Omit<DeviceEvent, 'timestamp'>,
  deviceId = DEFAULT_DEVICE_ID,
): Promise<void> {
  try {
    const eventsRef = ref(rtdb, `devices/${deviceId}/events`);
    await push(eventsRef, {
      ...event,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('[RTDB] logEvent error:', err);
  }
}

export function subscribeToRecentEvents(
  onChange:  (events: DeviceEvent[]) => void,
  onError?:  (err: Error) => void,
  deviceId = DEFAULT_DEVICE_ID,
): () => void {
  try {
    const eventsQuery = query(ref(rtdb, `devices/${deviceId}/events`), limitToLast(20));
    const listener = (snap: DataSnapshot) => {
      const val = snap.val() as Record<string, DeviceEvent> | null;
      if (val) {
        const list = Object.values(val).sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
        onChange(list);
      } else {
        onChange([]);
      }
    };
    const unsub = onValue(eventsQuery, listener, (err) => onError?.(err));
    return () => {
      unsub();
      off(eventsQuery, 'value', listener);
    };
  } catch (err) {
    onError?.(err as Error);
    return () => {};
  }
}

export function subscribeToHourlyData(
  onChange:  (data: HourlyAggregate[]) => void,
  onError?:  (err: Error) => void,
  deviceId = DEFAULT_DEVICE_ID,
): () => void {
  try {
    const hourlyQuery = query(ref(rtdb, `devices/${deviceId}/hourly`), limitToLast(24));
    const listener = (snap: DataSnapshot) => {
      const val = snap.val() as Record<string, HourlyAggregate> | null;
      onChange(val ? Object.values(val) : []);
    };
    const unsub = onValue(hourlyQuery, listener, (err) => onError?.(err));
    return () => {
      unsub();
      off(hourlyQuery, 'value', listener);
    };
  } catch (err) {
    onError?.(err as Error);
    return () => {};
  }
}

export function subscribeToMonthlyData(
  onChange:  (data: DailyAggregate[]) => void,
  onError?:  (err: Error) => void,
  deviceId = DEFAULT_DEVICE_ID,
): () => void {
  try {
    const dailyQuery = query(ref(rtdb, `devices/${deviceId}/daily`), limitToLast(30));
    const listener = (snap: DataSnapshot) => {
      const val = snap.val() as Record<string, DailyAggregate> | null;
      onChange(val ? Object.values(val) : []);
    };
    const unsub = onValue(dailyQuery, listener, (err) => onError?.(err));
    return () => {
      unsub();
      off(dailyQuery, 'value', listener);
    };
  } catch (err) {
    onError?.(err as Error);
    return () => {};
  }
}

export const subscribeToLiveReadingFirestore  = subscribeToSensorReading;
export const subscribeToDeviceStatusFirestore = subscribeToDeviceStatus;
export const subscribeToRelaysFirestore       = subscribeToRelays;

export async function writeRelayStateFirestore(
  relayId:  string,
  state:    boolean,
  name?:    string,
  deviceId = DEFAULT_DEVICE_ID,
): Promise<void> {
  return writeRelayState(relayId, state, name ?? relayId, deviceId);
}
