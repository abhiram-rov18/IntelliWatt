'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // If arriving with a hash, smoothly scroll to target with offset
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const timer = setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <div key={pathname} className="page-fade-container">
      {children}
      <style jsx>{`
        .page-fade-container {
          animation: pageTransitionFade 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          width: 100%;
          will-change: opacity, transform;
        }

        @keyframes pageTransitionFade {
          0% {
            opacity: 0;
            transform: translateY(3px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
