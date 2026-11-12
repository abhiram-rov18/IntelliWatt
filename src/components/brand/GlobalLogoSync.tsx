'use client';

import { useEffect } from 'react';
import { startGlobalLogoSync } from '@/lib/globalLogoSync';

/**
 * Mounts once in RootLayout to activate the single shared master timeline
 * for all IntelliWatt logos across the application.
 */
export default function GlobalLogoSync() {
  useEffect(() => {
    const cleanup = startGlobalLogoSync();
    return () => {
      cleanup();
    };
  }, []);

  return null;
}

