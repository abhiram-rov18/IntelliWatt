import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

export const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY             || "AIzaSyD3K854mRcIU734hDRBDD8aIq8j7Netd8E",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN         || "intelliwatt-63005.firebaseapp.com",
  databaseURL:       process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL        || "https://intelliwatt-63005-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID          || "intelliwatt-63005",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      || "intelliwatt-63005.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "188628699342",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID              || "1:188628699342:web:c8c6552f14fa559adf289f",
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID      || "G-YRKMW8L1N7",
};

/** True when Firebase is initialized with valid credentials */
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
);

// Prevent duplicate initializations during Next.js SSR / hot-reloads (HMR)
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Realtime Database instance
export const rtdb: Database = firebaseConfig.databaseURL ? getDatabase(app, firebaseConfig.databaseURL) : getDatabase(app);

// Shared types used across application
export type SensorReading = {
  voltage:     number;
  current:     number;
  power:       number;
  energy:      number;
  frequency:   number;
  powerFactor: number;
  timestamp:   number;
};

export type DeviceStatus = {
  online:    boolean;
  rssi:      number;
  ip:        string;
  firmware:  string;
  uptime:    number;
  lastSeen?: number;
};

export type RelayState = {
  id:        string;
  name:      string;
  state:     boolean;
  updatedAt: number;
};

export const DB_PATHS = {
  intelliwatt:   'IntelliWatt',
  latestReading: (deviceId: string) => `devices/${deviceId}/readings/latest`,
  deviceStatus:  (deviceId: string) => `devices/${deviceId}/status`,
  relay:         (deviceId: string, relayId: string) => `devices/${deviceId}/relays/${relayId}`,
  allRelays:     (deviceId: string) => `devices/${deviceId}/relays`,
} as const;

export const DEFAULT_DEVICE_ID = process.env.NEXT_PUBLIC_DEVICE_ID ?? 'esp32-001';

export { app };
export default app;
