'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Cpu,
  Cloud,
  Code2,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Radio,
  Share2,
  Linkedin,
  Github,
  Mail,
  FileCode2,
  Activity,
  Gauge,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { GoldLightningEmblem } from '@/components/brand/IntelliWattLogo';

// Skills requested by user:
// ESP32, Firebase, React, Next.js, TypeScript, IoT, Energy Monitoring
const SKILLS = [
  { name: 'ESP32', category: 'Embedded Systems', icon: Cpu, desc: 'Dual-core 32-bit MCU, RTOS & UART communication' },
  { name: 'Firebase', category: 'Cloud Infrastructure', icon: Cloud, desc: 'Realtime Database WebSocket synchronization' },
  { name: 'React', category: 'Frontend Architecture', icon: Code2, desc: 'Component lifecycle, hooks & state management' },
  { name: 'Next.js', category: 'Web Application', icon: Layers, desc: 'App Router architecture, SSR & route handlers' },
  { name: 'TypeScript', category: 'Language', icon: FileCode2, desc: 'Strict static typing & robust IoT contracts' },
  { name: 'IoT', category: 'Hardware Networking', icon: Radio, desc: 'Sensor interfacing, Modbus & telemetry streaming' },
  { name: 'Energy Monitoring', category: 'Power Analytics', icon: Gauge, desc: 'AC voltage, current, active power & power factor' },
];

// Timeline requested by user:
// Phase 1: Research - Completed
// Phase 2: Prototype - Completed
// Phase 3: Website - Completed
// Phase 4: Integration - In Progress
const TIMELINE_PHASES = [
  {
    phase: 'Phase 1',
    title: 'Research',
    status: 'Completed',
    statusType: 'completed',
    period: 'Q3 2024',
    summary: 'Theoretical formulation, sensor evaluation, and literature review on intelligent power telemetry.',
    milestones: [
      'PZEM-004T AC sensor characterization & calibration tests',
      'Mathematical modeling for apparent power, active power & power factor',
      'Comparative analysis of MQTT vs. Realtime Database websocket streaming',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Prototype',
    status: 'Completed',
    statusType: 'completed',
    period: 'Q4 2024',
    summary: 'Hardware testbed development, breadboard schematics, and sensor interfacing with ESP32.',
    milestones: [
      'ESP32 microcontroller UART serial integration with PZEM-004T',
      '4-channel optocoupled relay safety isolation circuitry',
      'Firmware implementation with automatic WiFi reconnection logic',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Website',
    status: 'Completed',
    statusType: 'completed',
    period: 'Q1 2025',
    summary: 'Luxury industrial web dashboard engineered with Next.js, real-time Firebase sync, and responsive UI.',
    milestones: [
      'Industrial black & gold design system with Sora & Manrope fonts',
      'Real-time Realtime Database listeners for zero-polling telemetry',
      'Historical analytics visualization, relay toggles & PDF export engine',
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Integration',
    status: 'In Progress',
    statusType: 'in_progress',
    period: 'Active Milestone',
    summary: 'Full end-to-end hardware-to-cloud commissioning, autonomous load shedding, and field testing.',
    milestones: [
      'Hardware-to-cloud bidirectional relay feedback loop verification',
      'Automated peak-tariff load shedding algorithm calibration',
      'Final validation demo for engineering exhibitions and investor reviews',
    ],
  },
];

// Social Placeholders requested by user:
// "No social links yet. Leave placeholders."
const SOCIAL_PLACEHOLDERS = [
  { name: 'LinkedIn', icon: Linkedin, note: 'Coming Soon' },
  { name: 'GitHub', icon: Github, note: 'Coming Soon' },
  { name: 'Email', icon: Mail, note: 'Coming Soon' },
  { name: 'ResearchGate', icon: Bookmark, note: 'Coming Soon' },
];

export default function ProfilePage() {
  return (
    <div className="profile-page-root" style={{ paddingBottom: '4.5rem' }}>
      {/* ── Top Header Eyebrow ────────────────────────────────────────── */}
      <div style={{ marginBottom: '2.25rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 24,
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            marginBottom: 12,
          }}
        >
          <Sparkles size={14} color="var(--gold-bright)" />
          <span
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '0.74rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1.4px',
              color: 'var(--gold-bright)',
            }}
          >
            Engineering Leadership Dossier
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '2.2rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            color: '#FFFFFF',
          }}
        >
          Executive Profile
        </h1>
        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '0.94rem',
            color: 'var(--text-secondary)',
            marginTop: 4,
          }}
        >
          Principal investigator, IoT system architect, and project lead credentials.
        </p>
      </div>

      {/* ── Hero Executive Card with Large Professional Photo (Medium Glass) ── */}
      <section
        style={{
          background: 'linear-gradient(145deg, rgba(24, 24, 24, 0.78) 0%, rgba(13, 13, 13, 0.86) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.32)',
          borderRadius: 24,
          padding: '2.5rem',
          boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.10), inset 0 0 24px rgba(212, 175, 55, 0.04), 0 20px 50px rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2.5rem',
        }}
      >
        {/* Subtle Luxury Top Hairline Gold Accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '12%',
            right: '12%',
            height: 2,
            background: 'linear-gradient(90deg, transparent, var(--gold-bright), transparent)',
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 340px) 1fr',
            gap: '2.5rem',
            alignItems: 'center',
          }}
          className="profile-hero-grid"
        >
          {/* 1. Large Professional Photograph - Intelligently Cropped, Maintained Aspect Ratio */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 340, margin: '0 auto' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 4.7',
                borderRadius: 22,
                overflow: 'hidden',
                border: '1.5px solid rgba(212, 175, 55, 0.45)',
                boxShadow: '0 14px 34px rgba(0, 0, 0, 0.7), 0 0 20px rgba(212, 175, 55, 0.1)',
                background: '#111111',
              }}
            >
              <Image
                src="/profile.jpg"
                alt="K. Abhiram - Project Lead"
                fill
                priority
                unoptimized
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center 20%', // Intelligent face crop
                  display: 'block',
                }}
                sizes="(max-width: 768px) 100vw, 340px"
              />

              {/* Subtle luxury vignette gradient overlay at bottom of photo */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(7, 7, 7, 0.6) 0%, transparent 45%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Online indicator badge on photo */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: 'rgba(10, 10, 10, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-green)',
                    boxShadow: '0 0 8px rgba(61, 220, 132, 0.95)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '0.5px',
                  }}
                >
                  Active &amp; Online
                </span>
              </div>
            </div>
          </div>

          {/* 2. Executive Details: Name, Role, Dept, Institute, Project, Socials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Name & Role */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 16,
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    color: 'var(--gold-bright)',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  <ShieldCheck size={14} color="var(--gold-bright)" />
                  Project Lead
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  letterSpacing: '0.015em',
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                  marginBottom: 6,
                }}
              >
                K. Abhiram
              </h2>
            </div>

            {/* Department & Institute Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Department */}
              <div
                style={{
                  background: 'rgba(20, 20, 20, 0.75)',
                  borderRadius: 14,
                  border: '1px solid #262626',
                  padding: '1rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <GraduationCap size={20} color="var(--gold-bright)" />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Department
                  </div>
                  <div
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      marginTop: 2,
                    }}
                  >
                    Electrical &amp; Electronics Engineering
                  </div>
                </div>
              </div>

              {/* Institute */}
              <div
                style={{
                  background: 'rgba(20, 20, 20, 0.75)',
                  borderRadius: 14,
                  border: '1px solid #262626',
                  padding: '1rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Building2 size={20} color="var(--gold-bright)" />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Institute
                  </div>
                  <div
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      marginTop: 2,
                      lineHeight: 1.35,
                    }}
                  >
                    Hyderabad Institute of Technology and Management (HITAM)
                  </div>
                </div>
              </div>
            </div>

            {/* Project Card: IntelliWatt - Smart Energy Intelligence */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(25, 25, 25, 0.8) 0%, rgba(14, 14, 14, 0.95) 100%)',
                borderRadius: 16,
                border: '1px solid rgba(212, 175, 55, 0.28)',
                padding: '1.25rem 1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.25rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <GoldLightningEmblem size={44} glow={true} />
                <div>
                  <div
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Project
                  </div>
                  <div
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      letterSpacing: '0.02em',
                      background: 'linear-gradient(135deg, #FFFFFF 40%, var(--gold-bright) 80%, var(--gold-luxury) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    IntelliWatt
                  </div>
                  <div
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: 'var(--gold-luxury)',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                    }}
                  >
                    Smart Energy Intelligence
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="btn btn-secondary profile-dash-link"
                style={{
                  padding: '7px 18px',
                  fontSize: '0.82rem',
                }}
              >
                <span>Launch Telemetry</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Social Placeholders - "No social links yet. Leave placeholders." */}
            <div>
              <div
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  marginBottom: 8,
                }}
              >
                Network Profiles &amp; Correspondence
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {SOCIAL_PLACEHOLDERS.map((soc) => {
                  const Icon = soc.icon;
                  return (
                    <div
                      key={soc.name}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 14px',
                        borderRadius: 12,
                        background: 'rgba(20, 20, 20, 0.65)',
                        border: '1px solid #2A2A2A',
                        color: 'var(--text-secondary)',
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '0.78rem',
                        userSelect: 'none',
                        cursor: 'default',
                      }}
                      title={`${soc.name} placeholder`}
                    >
                      <Icon size={14} color="var(--gold-luxury)" />
                      <span>{soc.name}</span>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          padding: '1px 6px',
                          borderRadius: 8,
                          background: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          color: 'var(--gold-bright)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                        }}
                      >
                        {soc.note}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Skills Section ───────────────────────────────────────────── */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--gold-bright)',
                textTransform: 'uppercase',
                letterSpacing: '1.4px',
                marginBottom: 4,
              }}
            >
              Technical Competencies
            </div>
            <h2
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              Skills
            </h2>
          </div>
          <span
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              padding: '4px 12px',
              borderRadius: 12,
              background: '#141414',
              border: '1px solid #262626',
            }}
          >
            {SKILLS.length} Core Domains
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
          }}
        >
          {SKILLS.map((skill) => {
            const Icon = skill.icon;
            return (
              <div
                key={skill.name}
                style={{
                  background: 'linear-gradient(145deg, #161616 0%, #101010 100%)',
                  border: '1px solid #262626',
                  borderRadius: 16,
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className="profile-skill-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.28)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} color="var(--gold-luxury)" />
                  </div>
                  <span
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '0.64rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      color: 'var(--gold-bright)',
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                    }}
                  >
                    {skill.category}
                  </span>
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      marginBottom: 4,
                    }}
                  >
                    {skill.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                    }}
                  >
                    {skill.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Below: Timeline Section ──────────────────────────────────── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--gold-bright)',
                textTransform: 'uppercase',
                letterSpacing: '1.4px',
                marginBottom: 4,
              }}
            >
              Development Roadmap
            </div>
            <h2
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              Timeline
            </h2>
          </div>
          <span
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '0.76rem',
              color: 'var(--gold-bright)',
              padding: '4px 12px',
              borderRadius: 12,
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            4 Strategic Phases
          </span>
        </div>

        {/* Modern Timeline Cards */}
        <div
          className="profile-timeline-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            position: 'relative',
          }}
        >
          {TIMELINE_PHASES.map((item, idx) => {
            const isCompleted = item.statusType === 'completed';

            return (
              <div
                key={item.phase}
                style={{
                  background: 'linear-gradient(160deg, #161616 0%, #101010 100%)',
                  border: isCompleted
                    ? '1px solid rgba(212, 175, 55, 0.35)'
                    : '1px solid rgba(212, 175, 55, 0.7)',
                  borderRadius: 20,
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isCompleted
                    ? '0 10px 24px rgba(0, 0, 0, 0.6)'
                    : '0 12px 30px rgba(0, 0, 0, 0.75), 0 0 20px rgba(212, 175, 55, 0.15)',
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="profile-timeline-card"
              >
                {/* Top Phase Header & Status Pill */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--gold-luxury)',
                      }}
                    >
                      {item.phase}
                    </span>
                    <span style={{ color: 'var(--border-default)', fontSize: '0.75rem' }}>•</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.period}</span>
                  </div>

                  {/* Status Badge */}
                  {isCompleted ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px',
                        borderRadius: 16,
                        background: 'rgba(61, 220, 132, 0.12)',
                        border: '1px solid rgba(61, 220, 132, 0.35)',
                        color: 'var(--accent-green)',
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                      }}
                    >
                      <CheckCircle2 size={12} color="var(--accent-green)" />
                      Completed
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px',
                        borderRadius: 16,
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.5)',
                        color: 'var(--gold-bright)',
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                      }}
                    >
                      <Clock size={12} color="var(--gold-bright)" />
                      In Progress
                    </span>
                  )}
                </div>

                {/* Phase Title */}
                <div>
                  <h3
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      letterSpacing: '0.015em',
                      color: '#FFFFFF',
                      marginBottom: 6,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                    }}
                  >
                    {item.summary}
                  </p>
                </div>

                {/* Milestones list */}
                <div
                  style={{
                    background: 'rgba(10, 10, 10, 0.55)',
                    borderRadius: 12,
                    border: '1px solid #202020',
                    padding: '0.85rem 0.95rem',
                    marginTop: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {item.milestones.map((ms, mIdx) => (
                    <div key={mIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? 'var(--gold-luxury)' : 'var(--gold-bright)',
                          marginTop: 6,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '0.74rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.35,
                        }}
                      >
                        {ms}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CSS Micro-Animations ─────────────────────────────────────── */}
      <style jsx global>{`
        .profile-skill-card:hover {
          border-color: rgba(212, 175, 55, 0.45) !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(212, 175, 55, 0.08);
        }

        .profile-timeline-card:hover {
          transform: translateY(-3px);
        }

        .profile-dash-link:hover {
          border-color: rgba(212, 175, 55, 0.8) !important;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.7), 0 0 18px rgba(212, 175, 55, 0.35) !important;
          transform: translateY(-3px) !important;
        }

        @media (min-width: 1100px) {
          .profile-timeline-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }

        @media (max-width: 900px) {
          .profile-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
