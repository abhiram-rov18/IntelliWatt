'use client';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * IntelliWatt Unified Global Brand Logo Animation Controller
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements a SINGLE shared master animation controller for EVERY IntelliWatt
 * logo throughout the entire application (Hero, Sidebar, Topbar, Footer,
 * Loading Screen, Modals, Cards).
 *
 * Guarantees:
 * 1. Synchronized Phase: If one logo is at 127.4°, EVERY logo is at 127.4°.
 * 2. Shared Master Timeline: Navigation across routes never resets or restarts the angle.
 * 3. Page Refresh Continuity: Computes rotation deterministically from wall-clock time
 *    (Date.now() % 24000), so reloads initialize seamlessly without jumps or re-zeroing.
 * 4. Zero React Re-renders: Mutates a single CSS variable (--global-logo-rotation) on :root.
 * 5. High Performance: Only ONE requestAnimationFrame loop globally, automatically paused
 *    when the browser tab is hidden to conserve 100% GPU/CPU power.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ROTATION_PERIOD_MS = 24000; // 24.0s per 360° revolution (15° / second)

let isRunning = false;
let rafId: number | null = null;

/**
 * Computes the exact deterministic rotation angle (0° to 360°)
 * based on wall-clock time.
 */
export function getSynchronizedLogoAngle(): number {
  if (typeof window === 'undefined') return 0;
  const elapsed = Date.now() % ROTATION_PERIOD_MS;
  return (elapsed / ROTATION_PERIOD_MS) * 360;
}

/**
 * Single shared frame update: writes rotation angle to CSS custom property.
 */
function tick() {
  const angle = getSynchronizedLogoAngle();
  document.documentElement.style.setProperty('--global-logo-rotation', `${angle.toFixed(2)}deg`);
  rafId = requestAnimationFrame(tick);
}

/**
 * Starts the global logo synchronization loop (singleton).
 */
export function startGlobalLogoSync(): () => void {
  if (typeof window === 'undefined') return () => {};

  if (!isRunning) {
    isRunning = true;
    // Set initial angle immediately to eliminate start-up flash
    const initialAngle = getSynchronizedLogoAngle();
    document.documentElement.style.setProperty('--global-logo-rotation', `${initialAngle.toFixed(2)}deg`);
    rafId = requestAnimationFrame(tick);
  }

  // Handle tab visibility to pause when hidden and resume instantly
  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else {
      if (isRunning && rafId === null) {
        // Immediately sync angle on tab restore
        const currentAngle = getSynchronizedLogoAngle();
        document.documentElement.style.setProperty('--global-logo-rotation', `${currentAngle.toFixed(2)}deg`);
        rafId = requestAnimationFrame(tick);
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    // Keep running globally across route changes; cleanup provided if needed
  };
}

