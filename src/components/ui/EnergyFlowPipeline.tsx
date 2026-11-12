'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Cloud, LayoutDashboard, BarChart3, ArrowDown, ArrowRight, Zap } from 'lucide-react';

interface EnergyFlowPipelineProps {
  initialOrientation?: 'horizontal' | 'vertical';
  className?: string;
}

const NODES = [
  {
    id: 'esp32',
    name: 'ESP32',
    role: 'Sensor Node',
    spec: 'PZEM-004T v3.0',
    icon: Cpu,
    status: 'ACTIVE',
  },
  {
    id: 'cloud',
    name: 'Cloud',
    role: 'Telemetry Sync',
    spec: 'RTDB Stream',
    icon: Cloud,
    status: 'SYNC',
  },
  {
    id: 'dashboard',
    name: 'Overview',
    role: 'Live Cockpit',
    spec: 'Sub-400ms Easing',
    icon: LayoutDashboard,
    status: 'STREAM',
  },
  {
    id: 'analytics',
    name: 'Energy Analytics',
    role: 'Intelligence',
    spec: 'Historical Patterns',
    icon: BarChart3,
    status: 'LOGGING',
  },
];

export default function EnergyFlowPipeline({
  initialOrientation = 'horizontal',
  className = '',
}: EnergyFlowPipelineProps) {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(initialOrientation);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 680) {
      setOrientation('vertical');
    }
  }, []);

  return (
    <div
      className={`energy-conduit-card ${className}`}
      style={{
        position: 'relative',
        background: 'linear-gradient(160deg, rgba(16, 16, 16, 0.72) 0%, rgba(9, 9, 9, 0.88) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.22)',
        borderRadius: 'var(--card-radius, 18px)',
        padding: '1.25rem 1.65rem',
        overflow: 'hidden',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.65), 0 0 12px rgba(212, 175, 55, 0.05)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        marginBottom: '1.5rem',
        userSelect: 'none',
      }}
      aria-label="System Energy Flow Pipeline"
    >
      {/* Subtle Top Gold Hairline Highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '12%',
          right: '12%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.45), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.2rem',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-bright)',
            }}
          >
            <Zap size={14} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '0.01em',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Energy Flow Pipeline</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  padding: '2px 7px',
                  borderRadius: 9999,
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.28)',
                  color: 'var(--gold-bright)',
                  fontWeight: 600,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}
              >
                6s Pulse
              </span>
            </div>
            <div
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                marginTop: 2,
              }}
            >
              ESP32 &nbsp;↓&nbsp; Cloud &nbsp;↓&nbsp; Overview &nbsp;↓&nbsp; Energy Analytics
            </div>
          </div>
        </div>

        {/* View Mode Switcher (Horizontal vs Vertical) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(12, 12, 12, 0.8)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: 9999,
            padding: 3,
          }}
        >
          <button
            type="button"
            onClick={() => setOrientation('horizontal')}
            style={{
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: '0.68rem',
              fontWeight: 600,
              fontFamily: 'Manrope, sans-serif',
              border: 'none',
              cursor: 'pointer',
              background: orientation === 'horizontal' ? 'rgba(212, 175, 55, 0.22)' : 'transparent',
              color: orientation === 'horizontal' ? 'var(--gold-bright)' : 'var(--text-muted)',
              transition: 'all 200ms ease',
            }}
          >
            Horizontal
          </button>
          <button
            type="button"
            onClick={() => setOrientation('vertical')}
            style={{
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: '0.68rem',
              fontWeight: 600,
              fontFamily: 'Manrope, sans-serif',
              border: 'none',
              cursor: 'pointer',
              background: orientation === 'vertical' ? 'rgba(212, 175, 55, 0.22)' : 'transparent',
              color: orientation === 'vertical' ? 'var(--gold-bright)' : 'var(--text-muted)',
              transition: 'all 200ms ease',
            }}
          >
            Vertical (↓)
          </button>
        </div>
      </div>

      {/* ─── Pipeline Body ────────────────────────────────────────── */}
      {orientation === 'horizontal' ? (
        /* ── Horizontal Conduit ── */
        <div style={{ position: 'relative', padding: '10px 10px 6px' }}>
          {/* SVG Conduit Track & Animated Energy Particle */}
          <div
            style={{
              position: 'absolute',
              top: 36,
              left: 48,
              right: 48,
              height: 24,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1000 24"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Subtle Conduit Track Line Gradient */}
                <linearGradient id="horizontalConduitTrack" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.12" />
                  <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.12" />
                </linearGradient>

                {/* Particle Glow Filter */}
                <filter id="goldParticleGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#F5D76E" floodOpacity="0.8" />
                  <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#D4AF37" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Underlying Micro Conduit Wire */}
              <line
                x1="0"
                y1="12"
                x2="1000"
                y2="12"
                stroke="url(#horizontalConduitTrack)"
                strokeWidth="1.2"
                strokeDasharray="4 6"
              />

              {/* ── Primary Tiny Gold Particle (Moves every 6 seconds) ── */}
              <circle r="2.5" fill="#FFF9D2" filter="url(#goldParticleGlow)">
                <animateMotion
                  path="M 0,12 L 1000,12"
                  dur="6s"
                  repeatCount="indefinite"
                  keyPoints="0; 0.33; 0.66; 1; 1"
                  keyTimes="0; 0.22; 0.44; 0.66; 1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0 0 1 1"
                />
                <animate
                  attributeName="opacity"
                  values="0; 0.9; 0.9; 0.85; 0; 0"
                  keyTimes="0; 0.05; 0.6; 0.66; 0.72; 1"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* ── Trailing Subtle Micro-Spark 1 ── */}
              <circle r="1.8" fill="#F5D76E" opacity="0.45" filter="url(#goldParticleGlow)">
                <animateMotion
                  path="M -15,12 L 985,12"
                  dur="6s"
                  repeatCount="indefinite"
                  keyPoints="0; 0.33; 0.66; 1; 1"
                  keyTimes="0; 0.22; 0.44; 0.66; 1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0 0 1 1"
                />
                <animate
                  attributeName="opacity"
                  values="0; 0.55; 0.55; 0.45; 0; 0"
                  keyTimes="0; 0.05; 0.6; 0.66; 0.72; 1"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* ── Trailing Subtle Micro-Spark 2 ── */}
              <circle r="1.2" fill="#D4AF37" opacity="0.25">
                <animateMotion
                  path="M -30,12 L 970,12"
                  dur="6s"
                  repeatCount="indefinite"
                  keyPoints="0; 0.33; 0.66; 1; 1"
                  keyTimes="0; 0.22; 0.44; 0.66; 1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0 0 1 1"
                />
                <animate
                  attributeName="opacity"
                  values="0; 0.3; 0.3; 0.2; 0; 0"
                  keyTimes="0; 0.05; 0.6; 0.66; 0.72; 1"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>

          {/* 4 Connected System Nodes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {NODES.map((node, i) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.id}
                  className={`pipeline-node-station station-${node.id}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  {/* Node Capsule Icon */}
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: 'linear-gradient(145deg, #181818 0%, #0D0D0D 100%)',
                      border: '1px solid rgba(212, 175, 55, 0.32)',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6), 0 0 10px rgba(212, 175, 55, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold-bright)',
                      marginBottom: 8,
                      position: 'relative',
                    }}
                  >
                    <Icon size={20} />
                    {/* Step indicator arrow */}
                    {i < 3 && (
                      <div
                        style={{
                          position: 'absolute',
                          right: -16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'rgba(212, 175, 55, 0.45)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Energy direction: ESP32 ↓ Cloud ↓ Overview ↓ Energy Analytics"
                      >
                        <ArrowRight size={13} />
                      </div>
                    )}
                  </div>

                  {/* Node Name */}
                  <div
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      lineHeight: 1.2,
                    }}
                  >
                    {node.name}
                  </div>

                  {/* Role & Spec */}
                  <div
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '0.68rem',
                      color: 'var(--gold-luxury)',
                      marginTop: 2,
                    }}
                  >
                    {node.role}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Manrope, monospace, sans-serif',
                      fontSize: '0.62rem',
                      color: '#7E7A70',
                      marginTop: 1,
                    }}
                  >
                    {node.spec}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Vertical Pipeline (ESP32 ↓ Cloud ↓ Dashboard ↓ Analytics) ── */
        <div
          style={{
            position: 'relative',
            padding: '8px 16px',
            maxWidth: 420,
            margin: '0 auto',
          }}
        >
          {/* Vertical Conduit SVG & Particle */}
          <div
            style={{
              position: 'absolute',
              top: 36,
              bottom: 36,
              left: 39,
              width: 24,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 300"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="verticalConduitTrack" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.12" />
                  <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.12" />
                </linearGradient>
              </defs>

              <line
                x1="12"
                y1="0"
                x2="12"
                y2="300"
                stroke="url(#verticalConduitTrack)"
                strokeWidth="1.2"
                strokeDasharray="4 6"
              />

              {/* Vertical Animated Particle (Downward ↓ every 6s) */}
              <circle r="2.5" fill="#FFF9D2" filter="url(#goldParticleGlow)">
                <animateMotion
                  path="M 12,0 L 12,300"
                  dur="6s"
                  repeatCount="indefinite"
                  keyPoints="0; 0.33; 0.66; 1; 1"
                  keyTimes="0; 0.22; 0.44; 0.66; 1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0 0 1 1"
                />
                <animate
                  attributeName="opacity"
                  values="0; 0.9; 0.9; 0.85; 0; 0"
                  keyTimes="0; 0.05; 0.6; 0.66; 0.72; 1"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Vertical Trailing Spark 1 */}
              <circle r="1.8" fill="#F5D76E" opacity="0.45">
                <animateMotion
                  path="M 12,-15 L 12,285"
                  dur="6s"
                  repeatCount="indefinite"
                  keyPoints="0; 0.33; 0.66; 1; 1"
                  keyTimes="0; 0.22; 0.44; 0.66; 1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0 0 1 1"
                />
                <animate
                  attributeName="opacity"
                  values="0; 0.55; 0.55; 0.45; 0; 0"
                  keyTimes="0; 0.05; 0.6; 0.66; 0.72; 1"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>

          {/* Vertical Stack List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26, position: 'relative', zIndex: 2 }}>
            {NODES.map((node, i) => {
              const Icon = node.icon;
              return (
                <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  {/* Circle Node */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      background: 'linear-gradient(145deg, #181818 0%, #0D0D0D 100%)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold-bright)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Info Box */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontFamily: 'Sora, sans-serif',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                        }}
                      >
                        {node.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: 'rgba(212, 175, 55, 0.08)',
                          color: 'var(--gold-bright)',
                          fontFamily: 'Manrope, sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        {node.status}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginTop: 2,
                      }}
                    >
                      {node.role} · <span style={{ color: '#7E7A70' }}>{node.spec}</span>
                    </div>
                  </div>

                  {/* Downward indicator */}
                  {i < 3 && (
                    <div
                      style={{
                        color: 'rgba(212, 175, 55, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      <ArrowDown size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtle Node Receptive Glow Easing */}
      <style jsx>{`
        /* Every 6s cycle, nodes pulse softly in sequence */
        .station-esp32 {
          animation: nodeSubtlePulse 6s infinite 0s;
        }
        .station-cloud {
          animation: nodeSubtlePulse 6s infinite 1.32s;
        }
        .station-dashboard {
          animation: nodeSubtlePulse 6s infinite 2.64s;
        }
        .station-analytics {
          animation: nodeSubtlePulse 6s infinite 3.96s;
        }

        @keyframes nodeSubtlePulse {
          0%, 20%, 100% {
            filter: drop-shadow(0 0 0 rgba(212, 175, 55, 0));
          }
          10% {
            filter: drop-shadow(0 0 8px rgba(245, 215, 110, 0.28));
          }
        }
      `}</style>
    </div>
  );
}
