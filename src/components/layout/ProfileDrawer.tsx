'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  LayoutDashboard,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Cpu,
  ToggleRight,
  Layers,
  Sparkles,
  Cloud,
  Code2,
  Tag,
  Radio,
  ChevronRight,
  ShieldCheck,
  Building2,
  GraduationCap
} from 'lucide-react';
import { GoldLightningEmblem } from '@/components/brand/IntelliWattLogo';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [logoutFeedback, setLogoutFeedback] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const handleLogout = () => {
    setLogoutFeedback(true);
    setTimeout(() => {
      setLogoutFeedback(false);
      onClose();
    }, 1200);
  };

  const drawerContent = (
    <div
      className={`profile-drawer-root ${isOpen ? 'is-open' : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Executive Profile Drawer"
    >
      {/* Backdrop */}
      <div
        className="profile-drawer-backdrop"
        onClick={onClose}
        aria-label="Close profile drawer"
      />

      {/* Drawer Panel */}
      <aside className="profile-drawer-panel">
        {/* Top Header / Bar */}
        <div className="profile-drawer-topbar">
          <div className="profile-drawer-eyebrow">
            <Sparkles size={14} color="var(--gold-bright)" />
            <span>Executive Dossier</span>
          </div>
          <button
            onClick={onClose}
            className="profile-drawer-close-btn"
            aria-label="Close profile drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="profile-drawer-content">
          {/* Profile Header */}
          <section className="profile-drawer-hero">
            <div className="profile-drawer-avatar-wrap">
              <div className="profile-drawer-avatar-ring">
                <Image
                  src="/profile.jpg"
                  alt="K. Abhiram"
                  width={88}
                  height={88}
                  className="profile-drawer-avatar-img"
                  priority
                  unoptimized
                />
              </div>
              <span className="profile-drawer-online-badge" title="Online">
                <span className="profile-drawer-online-dot" />
              </span>
            </div>

            <h2 className="profile-drawer-name">K. Abhiram</h2>
            <div className="profile-drawer-role-pill">
              <ShieldCheck size={13} color="var(--gold-bright)" />
              <span>Project Lead</span>
            </div>

            <div className="profile-drawer-affiliation">
              <div className="profile-drawer-dept">
                <GraduationCap size={15} color="var(--gold-luxury)" />
                <span>Electrical &amp; Electronics Engineering</span>
              </div>
              <div className="profile-drawer-college">
                <Building2 size={14} color="var(--gold-luxury)" />
                <span>HITAM</span>
              </div>
            </div>

            {/* Status indicator pill */}
            <div className="profile-drawer-status-pill">
              <span className="profile-drawer-status-dot-animated" />
              <span className="profile-drawer-status-text">Status: <strong>🟢 Online</strong></span>
            </div>
          </section>

          {/* PROJECT INFORMATION CARD */}
          <section className="profile-drawer-card">
            <div className="profile-drawer-card-header">
              <div className="profile-drawer-card-title">
                <Cpu size={16} color="var(--gold-luxury)" />
                <span>Project Information</span>
              </div>
              <span className="profile-drawer-card-tag">v2.4</span>
            </div>

            <div className="profile-drawer-info-grid">
              {/* Project Name */}
              <div className="profile-info-item">
                <span className="profile-info-label">Project</span>
                <span className="profile-info-val-strong" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <GoldLightningEmblem size={18} glow={false} />
                  IntelliWatt
                </span>
              </div>

              {/* Research Title */}
              <div className="profile-info-item full-width">
                <span className="profile-info-label">Research Title</span>
                <p className="profile-info-research-title">
                  IoT-Based Intelligent Household Energy Monitoring and Optimization System
                </p>
              </div>

              {/* Hardware */}
              <div className="profile-info-item full-width">
                <span className="profile-info-label">Hardware Architecture</span>
                <div className="profile-hardware-chips">
                  {['ESP32', 'PZEM-004T', 'Relay Module', 'LCD Display'].map((hw) => (
                    <span key={hw} className="profile-hw-chip">
                      <Cpu size={12} color="var(--gold-bright)" />
                      {hw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cloud */}
              <div className="profile-info-item">
                <span className="profile-info-label">Cloud</span>
                <div className="profile-info-pill-val">
                  <Cloud size={13} color="var(--gold-luxury)" />
                  <span>Firebase</span>
                </div>
              </div>

              {/* Framework */}
              <div className="profile-info-item">
                <span className="profile-info-label">Framework</span>
                <div className="profile-info-pill-val">
                  <Code2 size={13} color="var(--gold-luxury)" />
                  <span>Next.js</span>
                </div>
              </div>

              {/* Version */}
              <div className="profile-info-item">
                <span className="profile-info-label">Version</span>
                <span className="profile-info-val-mono">v2.4</span>
              </div>

              {/* System Status */}
              <div className="profile-info-item">
                <span className="profile-info-label">System Status</span>
                <div className="profile-status-mode-pill">
                  <span className="profile-mode-indicator" />
                  <span>Development Mode</span>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS CARD */}
          <section className="profile-drawer-card">
            <div className="profile-drawer-card-header">
              <div className="profile-drawer-card-title">
                <Layers size={16} color="var(--gold-luxury)" />
                <span>Quick Actions</span>
              </div>
            </div>

            <div className="profile-actions-list">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="profile-action-btn"
              >
                <div className="profile-action-icon">
                  <LayoutDashboard size={18} color="var(--gold-luxury)" />
                </div>
                <div className="profile-action-text">
                  <span className="profile-action-label">Overview</span>
                  <span className="profile-action-desc">Live telemetry &amp; power metrics</span>
                </div>
                <ChevronRight size={16} className="profile-action-arrow" />
              </Link>

              <Link
                href="/analytics"
                onClick={onClose}
                className="profile-action-btn"
              >
                <div className="profile-action-icon">
                  <BarChart3 size={18} color="var(--gold-luxury)" />
                </div>
                <div className="profile-action-text">
                  <span className="profile-action-label">Energy Analytics</span>
                  <span className="profile-action-desc">Consumption trends &amp; analytics</span>
                </div>
                <ChevronRight size={16} className="profile-action-arrow" />
              </Link>

              <Link
                href="/devices"
                onClick={onClose}
                className="profile-action-btn"
              >
                <div className="profile-action-icon">
                  <Cpu size={18} color="var(--gold-luxury)" />
                </div>
                <div className="profile-action-text">
                  <span className="profile-action-label">Connected Devices</span>
                  <span className="profile-action-desc">Sensors &amp; microcontrollers</span>
                </div>
                <ChevronRight size={16} className="profile-action-arrow" />
              </Link>

              <Link
                href="/relay"
                onClick={onClose}
                className="profile-action-btn"
              >
                <div className="profile-action-icon">
                  <ToggleRight size={18} color="var(--gold-luxury)" />
                </div>
                <div className="profile-action-text">
                  <span className="profile-action-label">Control Center</span>
                  <span className="profile-action-desc">4-channel appliance switching</span>
                </div>
                <ChevronRight size={16} className="profile-action-arrow" />
              </Link>

              <Link
                href="/about"
                onClick={onClose}
                className="profile-action-btn"
              >
                <div className="profile-action-icon">
                  <FileText size={18} color="var(--gold-luxury)" />
                </div>
                <div className="profile-action-text">
                  <span className="profile-action-label">About IntelliWatt</span>
                  <span className="profile-action-desc">System specifications &amp; guides</span>
                </div>
                <ChevronRight size={16} className="profile-action-arrow" />
              </Link>

              <Link
                href="/settings"
                onClick={onClose}
                className="profile-action-btn"
              >
                <div className="profile-action-icon">
                  <Settings size={18} color="var(--gold-luxury)" />
                </div>
                <div className="profile-action-text">
                  <span className="profile-action-label">Settings</span>
                  <span className="profile-action-desc">Preferences &amp; sensor calibration</span>
                </div>
                <ChevronRight size={16} className="profile-action-arrow" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className={`profile-action-btn logout-action ${logoutFeedback ? 'is-logging-out' : ''}`}
              >
                <div className="profile-action-icon logout-icon">
                  <LogOut size={18} />
                </div>
                <div className="profile-action-text">
                  <span className="profile-action-label">
                    {logoutFeedback ? 'Session Locked' : 'Logout'}
                  </span>
                  <span className="profile-action-desc">
                    {logoutFeedback ? 'Executive profile secured' : 'Lock session &amp; sign out'}
                  </span>
                </div>
                <span className="profile-action-tag">
                  {logoutFeedback ? 'Locked' : 'Action'}
                </span>
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
