'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import IntelliWattLogo from '@/components/brand/IntelliWattLogo';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '2.75rem 2.25rem',
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Centered Brand Stack */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <IntelliWattLogo size="lg" align="center" glow={true} showSubtitle={true} />
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <h1
            style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: '#FFFFFF',
              marginBottom: 4,
            }}
          >
            Executive Access Portal
          </h1>
          <p
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            Authenticate with verified IoT monitoring credentials
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--gold-luxury)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="operator@intelliwatt.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 12,
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-default)',
                  color: '#FFFFFF',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Security Key / Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--gold-luxury)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 12,
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-default)',
                  color: '#FFFFFF',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <Link
            href="/dashboard"
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '13px',
              marginTop: '0.5rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              fontFamily: 'Manrope, sans-serif',
              textDecoration: 'none',
            }}
          >
            <span>Proceed to Overview</span>
            <ArrowRight size={15} />
          </Link>
        </form>

        {/* Security Footnote */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontFamily: 'Manrope, sans-serif',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
          }}
        >
          <ShieldCheck size={14} color="var(--accent-green)" />
          <span>Encrypted Industrial TLS 1.3 · Firebase Protected</span>
        </div>
      </div>
    </div>
  );
}
