'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator, Zap, ShieldAlert, Sparkles, CheckCircle2,
  TrendingUp, Info, RotateCcw, Home, Building2, Flame,
  FileCheck, HelpCircle
} from 'lucide-react';

interface SlabBreakdown {
  slab: string;
  units: number;
  rate: number;
  cost: number;
}

interface TelanganaTariffResult {
  group: 'LT-I(A)' | 'LT-I(B)' | 'LT-I(C)';
  groupLabel: string;
  groupDesc: string;
  energyCharges: number;
  fixedCharges: number;
  electricityDuty: number;
  customerCharges: number;
  totalBill: number;
  avgPerUnit: number;
  dailyCost: number;
  slabs: SlabBreakdown[];
}

export function calculateTelanganaDomesticBill(
  units: number,
  contractedLoadKw: number = 2
): TelanganaTariffResult {
  const safeUnits = Math.max(0, Math.round(units));
  const safeLoad = Math.max(1, Math.round(contractedLoadKw));

  let group: 'LT-I(A)' | 'LT-I(B)' | 'LT-I(C)' = 'LT-I(B)';
  let groupLabel = 'Group B (51 - 200 kWh)';
  let groupDesc = 'Standard domestic household tariff';
  let energyCharges = 0;
  const slabs: SlabBreakdown[] = [];
  let customerCharges = 0;
  let fixedCharges = 0;

  // Telangana Discoms (TGSPDCL / TSSPDCL / TSNPDCL) LT-I Domestic Schedule
  if (safeUnits <= 50) {
    // ── Group A: 0 - 50 units (Lifeline / Low consumption) ──
    group = 'LT-I(A)';
    groupLabel = 'Group A (0 - 50 kWh)';
    groupDesc = 'Subsidized Lifeline consumption tier';
    const rate = 1.95;
    const cost = safeUnits * rate;
    energyCharges = cost;
    customerCharges = 20;
    fixedCharges = 10 * safeLoad;
    slabs.push({ slab: '0 - 50 units', units: safeUnits, rate, cost });
  } else if (safeUnits <= 200) {
    // ── Group B: 51 - 200 units (Regular domestic) ──
    group = 'LT-I(B)';
    groupLabel = 'Group B (51 - 200 kWh)';
    groupDesc = 'Standard domestic consumption category';
    customerCharges = 40;
    fixedCharges = 25 * safeLoad;

    // First 100 units @ 3.40
    const u1 = Math.min(safeUnits, 100);
    const c1 = u1 * 3.40;
    slabs.push({ slab: '0 - 100 units', units: u1, rate: 3.40, cost: c1 });

    // 101 - 200 units @ 4.80
    if (safeUnits > 100) {
      const u2 = safeUnits - 100;
      const c2 = u2 * 4.80;
      slabs.push({ slab: '101 - 200 units', units: u2, rate: 4.80, cost: c2 });
    }
    energyCharges = slabs.reduce((sum, s) => sum + s.cost, 0);
  } else {
    // ── Group C: > 200 units (Higher domestic tier with telescopic slabs) ──
    group = 'LT-I(C)';
    groupLabel = 'Group C (> 200 kWh)';
    groupDesc = 'Upper-tier domestic with high-usage slab rates';
    customerCharges = 60;
    fixedCharges = 35 * safeLoad;

    const slabRanges: [number, number, number, string][] = [
      [0, 200, 5.10, '0 - 200 units'],
      [200, 300, 7.70, '201 - 300 units'],
      [300, 400, 9.00, '301 - 400 units'],
      [400, 800, 9.50, '401 - 800 units'],
      [800, Infinity, 10.00, 'Above 800 units'],
    ];

    let remaining = safeUnits;
    for (const [start, end, rate, label] of slabRanges) {
      const capacity = end - start;
      if (remaining > 0) {
        const slabUnits = Math.min(remaining, capacity);
        const slabCost = slabUnits * rate;
        slabs.push({ slab: label, units: slabUnits, rate, cost: slabCost });
        remaining -= slabUnits;
      }
    }
    energyCharges = slabs.reduce((sum, s) => sum + s.cost, 0);
  }

  // Electricity Duty (ED) @ 6 paise per unit (₹0.06/kWh) in Telangana
  const electricityDuty = safeUnits * 0.06;

  const totalBill = energyCharges + fixedCharges + customerCharges + electricityDuty;
  const avgPerUnit = safeUnits > 0 ? totalBill / safeUnits : 0;
  const dailyCost = totalBill / 30;

  return {
    group,
    groupLabel,
    groupDesc,
    energyCharges: Math.round(energyCharges * 100) / 100,
    fixedCharges: Math.round(fixedCharges * 100) / 100,
    electricityDuty: Math.round(electricityDuty * 100) / 100,
    customerCharges: Math.round(customerCharges * 100) / 100,
    totalBill: Math.round(totalBill * 100) / 100,
    avgPerUnit: Math.round(avgPerUnit * 100) / 100,
    dailyCost: Math.round(dailyCost * 100) / 100,
    slabs,
  };
}

interface TelanganaBillEstimatorProps {
  currentLiveKwh?: number;
}

export default function TelanganaBillEstimator({ currentLiveKwh }: TelanganaBillEstimatorProps) {
  const [units, setUnits] = useState<number>(240);
  const [loadKw, setLoadKw] = useState<number>(2);
  const [phase, setPhase] = useState<'1-Phase' | '3-Phase'>('1-Phase');

  const result = useMemo(() => {
    return calculateTelanganaDomesticBill(units, loadKw);
  }, [units, loadKw]);

  const presets = [
    { label: '1 BHK Basic', kwh: 90, load: 1, icon: Home },
    { label: '2 BHK Regular', kwh: 220, load: 2, icon: Building2 },
    { label: '3 BHK w/ AC', kwh: 450, load: 3, icon: Sparkles },
    { label: 'Villa / High Load', kwh: 850, load: 5, icon: Flame },
  ];

  const handleLiveSync = () => {
    if (typeof currentLiveKwh === 'number' && !isNaN(currentLiveKwh) && currentLiveKwh > 0) {
      // Scale daily accumulated telemetry to estimated monthly (30 days)
      const estimatedMonth = Math.round(currentLiveKwh * 30);
      setUnits(estimatedMonth);
    } else {
      setUnits(240);
    }
  };

  return (
    <section
      id="bill-estimator"
      className="glass-card animate-fade-up"
      style={{
        marginTop: '2.5rem',
        marginBottom: '2.5rem',
        padding: '2.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="Telangana Electricity Bill Estimator"
    >
      {/* Decorative Refraction Specular Arc */}
      <div
        style={{
          position: 'absolute',
          top: '-40%',
          right: '-10%',
          width: 500,
          height: 380,
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(245, 215, 110, 0.04) 40%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)',
        }}
      />

      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(245,215,110,0.06) 100%)',
                border: '1px solid rgba(212,175,55,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-bright)',
                boxShadow: '0 4px 12px rgba(212,175,55,0.15)',
              }}
            >
              <Calculator size={18} />
            </span>
            <span
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'var(--gold-bright)',
              }}
            >
              Telangana State DISCOM Tariff Model
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0 6px', color: '#FFFFFF' }}>
            Electricity Bill Estimator
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: 640, margin: 0 }}>
            Configurable slab calculations for domestic households (LT-I Category) served by TGSPDCL, TSSPDCL &amp; TSNPDCL in Telangana, India.
          </p>
        </div>

        {/* Status Verification Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(46, 204, 113, 0.08)',
              border: '1px solid rgba(46, 204, 113, 0.3)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.74rem',
              color: 'var(--accent-green)',
              fontWeight: 600,
            }}
          >
            <FileCheck size={14} />
            Verified TGERC LT-I Domestic Schedule
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            Demonstration Mode · Fuel adjustment (FPPCA) not included
          </span>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.5px' }}>
          QUICK HOUSEHOLD PRESETS
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {presets.map((p) => {
            const Icon = p.icon;
            const isSelected = units === p.kwh && loadKw === p.load;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setUnits(p.kwh);
                  setLoadKw(p.load);
                }}
                className="btn btn-ghost"
                style={{
                  height: 38,
                  padding: '0 1rem',
                  fontSize: '0.8rem',
                  borderColor: isSelected ? 'var(--gold-luxury)' : 'rgba(255,255,255,0.12)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(20,20,26,0.85) 100%)'
                    : undefined,
                  color: isSelected ? 'var(--gold-bright)' : 'var(--text-primary)',
                  boxShadow: isSelected ? '0 0 16px rgba(212,175,55,0.22)' : undefined,
                }}
              >
                <Icon size={14} />
                {p.label} ({p.kwh} kWh)
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleLiveSync}
            className="btn btn-ghost"
            title="Auto-estimate monthly total based on live telemetry"
            style={{
              height: 38,
              padding: '0 1rem',
              fontSize: '0.8rem',
              borderColor: 'rgba(212, 175, 55, 0.4)',
              color: 'var(--gold-bright)',
              background: 'rgba(212, 175, 55, 0.08)',
            }}
          >
            <Zap size={14} color="var(--gold-bright)" />
            Sync ESP32 Telemetry
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Bill Result on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Interactive Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Monthly Consumption Slider & Input */}
          <div
            style={{
              padding: '1.4rem',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label htmlFor="consumption-input" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                Monthly Consumption
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  id="consumption-input"
                  type="number"
                  min="0"
                  max="2000"
                  value={units}
                  onChange={(e) => setUnits(Math.max(0, Number(e.target.value) || 0))}
                  style={{
                    width: 90,
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: 'rgba(10, 10, 14, 0.9)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    color: 'var(--gold-bright)',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textAlign: 'right',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>kWh</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="1200"
              step="5"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              aria-label="Monthly consumption slider"
              style={{
                width: '100%',
                accentColor: 'var(--gold-luxury)',
                cursor: 'pointer',
                margin: '8px 0',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>0 (Subsidized)</span>
              <span>200 (Group B Limit)</span>
              <span>500 (AC Usage)</span>
              <span>1200+ (Villa)</span>
            </div>
          </div>

          {/* Connected Load & Phase */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div
              style={{
                padding: '1.2rem',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <label htmlFor="load-select" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF', marginBottom: 8 }}>
                Contracted Load
              </label>
              <select
                id="load-select"
                value={loadKw}
                onChange={(e) => setLoadKw(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(10, 10, 14, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-primary)',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value={1}>1 kW (Standard)</option>
                <option value={2}>2 kW (Recommended)</option>
                <option value={3}>3 kW (Medium)</option>
                <option value={5}>5 kW (Heavy Load)</option>
                <option value={10}>10 kW (Commercial/High)</option>
              </select>
            </div>

            <div
              style={{
                padding: '1.2rem',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <label htmlFor="phase-select" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF', marginBottom: 8 }}>
                Supply Phase
              </label>
              <select
                id="phase-select"
                value={phase}
                onChange={(e) => setPhase(e.target.value as '1-Phase' | '3-Phase')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(10, 10, 14, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-primary)',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="1-Phase">Single Phase (1-Phase)</option>
                <option value="3-Phase">Three Phase (3-Phase)</option>
              </select>
            </div>
          </div>

          {/* Active Slab Category Info Box */}
          <div
            style={{
              padding: '1.2rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(20,20,26,0.6) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <Info size={18} color="var(--gold-bright)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--gold-bright)', marginBottom: 2 }}>
                {result.groupLabel}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {result.groupDesc}. Telescopic tariff structure applies.
                {units > 200 && ' High consumption (>200 kWh) triggers higher slab brackets under Telangana ER Order.'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Liquid Glass Bill Total & Breakdown */}
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(18, 18, 24, 0.85) 30%, rgba(10, 10, 14, 0.95) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '20px',
            padding: '1.75rem',
            boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.22), 0 0 24px rgba(212, 175, 55, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            position: 'relative',
          }}
        >
          {/* Subtle Top Specular highlight */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(245, 215, 110, 0.8), transparent)',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              ESTIMATED MONTHLY BILL
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 12,
                background: 'rgba(212, 175, 55, 0.15)',
                color: 'var(--gold-bright)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
              }}
            >
              {result.group}
            </span>
          </div>

          {/* Large Total Amount */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'Sora, sans-serif', color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1 }}>
              ₹{result.totalBill.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ month</span>
          </div>

          {/* Secondary Stats Row: Avg/kWh & Daily Cost */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              padding: '0.9rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Effective Rate</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-bright)', marginTop: 2 }}>
                ₹{result.avgPerUnit.toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ kWh</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Daily Run Rate</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>
                ₹{result.dailyCost.toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ day</span>
              </div>
            </div>
          </div>

          {/* Slab Breakdown Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.5px' }}>
              SLAB COST BREAKDOWN
            </div>
            <div
              style={{
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                overflow: 'hidden',
              }}
            >
              {result.slabs.map((s, idx) => (
                <div
                  key={s.slab}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    borderBottom: idx < result.slabs.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{s.slab}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {s.units} kWh × ₹{s.rate.toFixed(2)}
                  </span>
                  <span style={{ fontWeight: 600, color: '#FFFFFF' }}>₹{s.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Charges Itemization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.77rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Energy Charges:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>₹{result.energyCharges.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Fixed Charges ({loadKw} kW):</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>₹{result.fixedCharges.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Customer Charges:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>₹{result.customerCharges.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Electricity Duty (6 paise/kWh):</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>₹{result.electricityDuty.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
