'use client';

import React, { useState, useEffect } from 'react';

const INTRO_STORAGE_KEY = 'intelliwatt_intro_seen';

export default function PremiumLoader() {
  const [active, setActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem(INTRO_STORAGE_KEY)) {
          return false;
        }
      } catch {
        // ignore
      }
    }
    return true;
  });
  const [phase, setPhase] = useState<'pulse' | 'brand' | 'status' | 'fadeout'>('pulse');

  useEffect(() => {
    let unmounted = false;

    const forceDismiss = () => {
      if (unmounted) return;
      try {
        sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
      document.documentElement.classList.remove('intelliwatt-intro-active');
      if (typeof window !== 'undefined' && (window as any).__intelliwatt_dismiss_loader) {
        (window as any).__intelliwatt_dismiss_loader();
      }
      setActive(false);
    };

    // Determine whether intro should play
    let shouldPlay = true;
    try {
      if (sessionStorage.getItem(INTRO_STORAGE_KEY)) {
        shouldPlay = false;
      }
    } catch {
      shouldPlay = false;
    }

    if (!shouldPlay) {
      forceDismiss();
      return;
    }

    // Absolute hard fail-safe: dismiss after 2000ms max under all conditions
    const failSafeTimer = setTimeout(() => {
      console.warn('[PremiumLoader] Fail-safe maximum timeout reached. Auto-dismissing overlay.');
      forceDismiss();
    }, 2000);

    // Choreographed swift luxury intro sequence
    const tBrand = setTimeout(() => {
      if (!unmounted) setPhase('brand');
    }, 200);

    const tStatus = setTimeout(() => {
      if (!unmounted) setPhase('status');
    }, 450);

    const tFadeOut = setTimeout(() => {
      if (!unmounted) {
        setPhase('fadeout');
        document.documentElement.classList.remove('intelliwatt-intro-active');
      }
    }, 800);

    const tComplete = setTimeout(() => {
      forceDismiss();
    }, 1050);

    return () => {
      unmounted = true;
      clearTimeout(failSafeTimer);
      clearTimeout(tBrand);
      clearTimeout(tStatus);
      clearTimeout(tFadeOut);
      clearTimeout(tComplete);
      forceDismiss();
    };
  }, []);

  // When intro completes, remove overlay completely from DOM so it can never intercept input
  if (!active) return null;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    document.documentElement.classList.remove('intelliwatt-intro-active');
    if (typeof window !== 'undefined' && (window as any).__intelliwatt_dismiss_loader) {
      (window as any).__intelliwatt_dismiss_loader();
    }
    setActive(false);
  };

  const isBrandVisible = phase === 'brand' || phase === 'status' || phase === 'fadeout';
  const isStatusVisible = phase === 'status' || phase === 'fadeout';
  const isFadingOut = phase === 'fadeout';

  return (
    <div
      id="premium-intro-overlay"
      aria-label="Loading IntelliWatt"
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999999,
        background: '#050608',
        backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(212, 175, 55, 0.05) 0%, #050608 65%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.015)' : 'scale(1)',
        transition: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        userSelect: 'none',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 440,
          textAlign: 'center',
          padding: '0 24px',
          pointerEvents: 'none',
        }}
      >
        {/* ─── Center: Gold IntelliWatt Lightning Emblem ──────────────────── */}
        <div
          style={{
            position: 'relative',
            width: 88,
            height: 88,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 22,
          }}
        >
          {/* Subtle Ambient Gold Aura behind Emblem */}
          <div
            style={{
              position: 'absolute',
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)',
              filter: 'blur(14px)',
              opacity: isBrandVisible ? 1 : 0.4,
              transition: 'opacity 500ms ease',
              pointerEvents: 'none',
            }}
          />

          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              overflow: 'visible',
            }}
          >
            <defs>
              <linearGradient id="introElectricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9D2" />
                <stop offset="45%" stopColor="#F5D76E" />
                <stop offset="85%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#B8860B" />
              </linearGradient>

              <linearGradient id="introBoltFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF4C4" />
                <stop offset="35%" stopColor="#F5D76E" />
                <stop offset="75%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#B38F22" />
              </linearGradient>

              <linearGradient id="introBoltShadow" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#A8821B" />
                <stop offset="100%" stopColor="#553F09" />
              </linearGradient>

              <linearGradient id="introSpecular" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#FFF2B2" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
              </linearGradient>

              <linearGradient id="introRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5D76E" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#8A6A16" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Hexagonal Outer Frame */}
            <polygon
              points="50,10 84.6,30 84.6,70 50,90 15.4,70 15.4,30"
              fill="rgba(18, 16, 12, 0.7)"
              stroke="url(#introRingGrad)"
              strokeWidth="1.2"
              style={{
                opacity: isBrandVisible ? 1 : 0.45,
                transition: 'opacity 500ms ease',
              }}
            />

            {/* Inner Golden Ratio Border */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="rgba(212, 175, 55, 0.12)"
              strokeWidth="0.8"
            />

            {/* Faceted Gold Body */}
            <g
              style={{
                opacity: isBrandVisible ? 1 : 0,
                transition: 'opacity 450ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <path
                d="M52 14 L28 52 L47 52 L41 86 L74 44 L54 44 Z"
                fill="url(#introBoltFill)"
              />
              <path
                d="M52 14 L50 44 L47 52 L54 44 L74 44 L58 64 L41 86 L45 57 Z"
                fill="url(#introBoltShadow)"
                opacity="0.85"
              />
              <path
                d="M52 15 L47 51 L53 45 L41 84"
                stroke="url(#introSpecular)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="1.5" fill="#FFF2B2" opacity="0.85" />
            </g>

            {/* Electric Pulse Stroke Drawing */}
            <path
              d="M52 14 L28 52 L47 52 L41 86 L74 44 L54 44 Z"
              fill="none"
              stroke="url(#introElectricGrad)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="intro-electric-pulse"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(245, 215, 110, 0.85)) drop-shadow(0 0 12px rgba(212, 175, 55, 0.5))',
              }}
            />
          </svg>
        </div>

        {/* ─── Brand Name & Subtitle ───────────────────────────────────────── */}
        <div
          style={{
            opacity: isBrandVisible ? 1 : 0,
            transform: isBrandVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 450ms cubic-bezier(0.16, 1, 0.3, 1), transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
            marginBottom: 22,
          }}
        >
          <div
            style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F5E8C7 50%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.15,
            }}
          >
            IntelliWatt
          </div>

          <div
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '0.74rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '2.8px',
              color: 'var(--gold-luxury, #D4AF37)',
              marginTop: 6,
            }}
          >
            Smart Energy Intelligence
          </div>
        </div>

        {/* ─── Status & Pulse Indicator ───────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: isStatusVisible ? 1 : 0,
            transform: isStatusVisible ? 'translateY(0)' : 'translateY(5px)',
            transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 10,
              height: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#F5D76E',
                boxShadow: '0 0 8px rgba(245, 215, 110, 0.95)',
              }}
            />
            <div className="intro-pulse-ring" />
          </div>

          <span
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#8E8A80',
              letterSpacing: '0.6px',
            }}
          >
            Initializing Smart Energy Platform...
          </span>
        </div>
      </div>

      <style jsx>{`
        .intro-electric-pulse {
          stroke-dasharray: 240;
          stroke-dashoffset: 240;
          animation: drawIntroBolt 550ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes drawIntroBolt {
          0% {
            stroke-dashoffset: 240;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.9;
          }
        }

        .intro-pulse-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1px solid rgba(212, 175, 55, 0.65);
          animation: introPulseAnim 1.3s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        @keyframes introPulseAnim {
          0% {
            transform: scale(0.85);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
