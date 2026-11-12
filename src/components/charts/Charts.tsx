'use client';

import { useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { SensorReading } from '@/lib/firebase';

// ─── Luxury Bloomberg Terminal Tooltip ──────────────────────────────────────
export function BloombergTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { name: string; value: number | string; color?: string; payload?: Record<string, unknown> }[];
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: 'rgba(10, 10, 10, 0.96)',
        border: '1px solid rgba(212, 175, 55, 0.48)',
        borderRadius: 12,
        padding: '10px 15px',
        boxShadow: '0 14px 34px rgba(0, 0, 0, 0.9), 0 0 18px rgba(212, 175, 55, 0.22)',
        fontSize: '0.8rem',
        fontFamily: 'Manrope, monospace, sans-serif',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        minWidth: 130,
        pointerEvents: 'none',
      }}
    >
      {label !== undefined && label !== '' && (
        <div
          style={{
            color: '#7E7A70',
            marginBottom: 6,
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.9px',
            borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            paddingBottom: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{label}</span>
          <span style={{ color: '#D4AF37', fontSize: '0.62rem', fontWeight: 700 }}>TERMINAL</span>
        </div>
      )}
      {payload.map((p, idx) => {
        let valColor = p.color;
        if (!valColor || valColor === '#FFFFFF') {
          valColor = '#D4AF37';
        }
        const formattedVal =
          typeof p.value === 'number'
            ? Number.isInteger(p.value)
              ? p.value
              : p.value.toFixed(2)
            : p.value;

        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              marginTop: 4,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#A3A3A3',
                fontSize: '0.74rem',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: valColor,
                  boxShadow: `0 0 6px ${valColor}`,
                }}
              />
              {p.name}:
            </span>
            <span
              style={{
                color: valColor,
                fontWeight: 700,
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {formattedVal}
              {unit ? ` ${unit}` : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Power & Voltage Area Chart (Bloomberg Luxury) ──────────────────────────
interface LiveChartProps {
  history: SensorReading[];
}

export function LivePowerChart({ history }: LiveChartProps) {
  const [activeTab, setActiveTab] = useState<'power' | 'voltage' | 'current'>('power');

  const data = history.map((h, i) => ({
    t:       i,
    Power:   +h.power.toFixed(1),
    Voltage: +h.voltage.toFixed(1),
    Current: +h.current.toFixed(2),
  }));

  const configs = {
    power:   { key: 'Power',   color: '#D4AF37', unit: 'W',  grad: ['#F5D76E', '#8A6A16'] },
    voltage: { key: 'Voltage', color: '#F5D76E', unit: 'V',  grad: ['#F5D76E', '#B8860B'] },
    current: { key: 'Current', color: '#3DDC84', unit: 'A',  grad: ['#3DDC84', '#155724'] },
  };
  const cfg = configs[activeTab];

  return (
    <div className="chart-card animate-fade-up stagger-1">
      <div className="chart-header">
        <div>
          <div className="chart-title">Live Energy Monitor</div>
          <div className="chart-subtitle">Bloomberg Terminal Telemetry · 60s stream</div>
        </div>
        <div className="chart-tabs">
          {(['power', 'voltage', 'current'] as const).map(tab => (
            <button
              key={tab}
              className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={290}>
        <AreaChart data={data} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="luxuryLiveAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor={cfg.grad[0]} stopOpacity={0.42} />
              <stop offset="60%" stopColor={cfg.grad[1]} stopOpacity={0.12} />
              <stop offset="100%" stopColor="#050505" stopOpacity={0.0} />
            </linearGradient>
            <filter id="areaGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={cfg.color} floodOpacity="0.6" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
          <XAxis
            dataKey="t"
            stroke="rgba(212, 175, 55, 0.45)"
            axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
            tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
            tick={{ fill: '#7E7A70', fontSize: 10, fontFamily: 'Manrope' }}
            hide
          />
          <YAxis
            stroke="rgba(212, 175, 55, 0.45)"
            axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
            tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
            tick={{ fill: '#7E7A70', fontSize: 10, fontFamily: 'Manrope' }}
          />
          <Tooltip content={<BloombergTooltip unit={cfg.unit} />} />
          <Area
            type="monotone"
            dataKey={cfg.key}
            stroke={cfg.color}
            strokeWidth={2.2}
            fill="url(#luxuryLiveAreaGrad)"
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-in-out"
            dot={false}
            activeDot={{
              r: 6,
              fill: cfg.color,
              stroke: '#080808',
              strokeWidth: 2.5,
              filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.85))',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Power Factor Bloomberg Radial Gauge ───────────────────────────────────
export function PowerFactorGauge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const isOptimal = pct >= 90;
  const isNominal = pct >= 80;
  const color = isOptimal ? '#D4AF37' : isNominal ? '#3DDC84' : '#FF5252';

  const data = [
    { name: 'PF Target', value: pct },
    { name: 'Residual',  value: 100 - pct },
  ];

  return (
    <div className="chart-card animate-fade-up stagger-2" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="chart-header">
        <div>
          <div className="chart-title">Power Factor</div>
          <div className="chart-subtitle">Grid Synchrony · Target ≥ 0.90</div>
        </div>
        <div className={`badge ${isOptimal ? 'badge-yellow' : isNominal ? 'badge-green' : 'badge-red'}`}>
          {isOptimal ? 'Optimal' : isNominal ? 'Nominal' : 'Low Efficiency'}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <ResponsiveContainer width="100%" height={220}>
          <RadialBarChart
            innerRadius="68%"
            outerRadius="88%"
            data={data}
            startAngle={225}
            endAngle={-45}
            barSize={16}
          >
            <defs>
              <linearGradient id="pfGaugeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF099" />
                <stop offset="50%" stopColor={color} />
                <stop offset="100%" stopColor="#8A6A16" />
              </linearGradient>
            </defs>
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={index === 0 ? 'url(#pfGaugeGrad)' : '#161616'}
                  stroke={index === 0 ? 'rgba(212, 175, 55, 0.4)' : 'transparent'}
                  strokeWidth={index === 0 ? 1 : 0}
                />
              ))}
            </RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color,
              fontFamily: 'Manrope, sans-serif',
              lineHeight: 1,
              textShadow: `0 0 20px ${color}55`,
            }}
          >
            {value.toFixed(3)}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: '#7E7A70',
              marginTop: 6,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            cos φ · {pct}% Capacity
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hourly Energy Bar Chart (Rounded Corners & Luxury Gradients) ────────────
const HOURLY_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  kWh:  +(0.65 + Math.sin(i * 0.4 + 1) * 0.28 + Math.cos(i * 0.7) * 0.12).toFixed(2),
}));

export function HourlyConsumptionChart() {
  return (
    <div className="chart-card animate-fade-up stagger-3">
      <div className="chart-header">
        <div>
          <div className="chart-title">Hourly Consumption</div>
          <div className="chart-subtitle">24-Hour Cycle · Terminal Breakdown</div>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#D4AF37' }} />
            <span>Energy (kWh)</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={HOURLY_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="luxuryBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#F5D76E" stopOpacity={0.95} />
              <stop offset="60%"  stopColor="#D4AF37" stopOpacity={0.75} />
              <stop offset="100%" stopColor="#8A6A16" stopOpacity={0.35} />
            </linearGradient>
            <linearGradient id="luxuryBarHoverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FFF099" stopOpacity={1} />
              <stop offset="50%"  stopColor="#F5D76E" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#B8860B" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
          <XAxis
            dataKey="hour"
            stroke="rgba(212, 175, 55, 0.45)"
            axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
            tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
            tick={{ fill: '#7E7A70', fontSize: 10, fontFamily: 'Manrope' }}
            interval={3}
          />
          <YAxis
            stroke="rgba(212, 175, 55, 0.45)"
            axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
            tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
            tick={{ fill: '#7E7A70', fontSize: 10, fontFamily: 'Manrope' }}
          />
          <Tooltip
            content={<BloombergTooltip unit="kWh" />}
            cursor={{ fill: 'rgba(212, 175, 55, 0.08)' }}
          />
          <Bar
            dataKey="kWh"
            fill="url(#luxuryBarGrad)"
            radius={[6, 6, 0, 0]}
            maxBarSize={22}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-in-out"
            activeBar={{
              fill: 'url(#luxuryBarHoverGrad)',
              stroke: '#F5D76E',
              strokeWidth: 1.5,
              filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.55))',
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Frequency Line Chart (Smooth Curves & Gold Axis) ───────────────────────
export function FrequencyChart({ history }: LiveChartProps) {
  const data = history.map((h, i) => ({
    t:         i,
    Frequency: +h.frequency.toFixed(3),
  }));

  return (
    <div className="chart-card animate-fade-up stagger-4">
      <div className="chart-header">
        <div>
          <div className="chart-title">Grid Frequency</div>
          <div className="chart-subtitle">Precision Telemetry · Nominal 50.00 Hz</div>
        </div>
        <div className="badge badge-yellow">±0.05 Hz</div>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={data} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
          <XAxis
            dataKey="t"
            stroke="rgba(212, 175, 55, 0.45)"
            axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
            tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
            tick={{ fill: '#7E7A70', fontSize: 10, fontFamily: 'Manrope' }}
            hide
          />
          <YAxis
            domain={[49.85, 50.15]}
            stroke="rgba(212, 175, 55, 0.45)"
            axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
            tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
            tick={{ fill: '#7E7A70', fontSize: 10, fontFamily: 'Manrope' }}
          />
          <Tooltip content={<BloombergTooltip unit="Hz" />} />
          <ReferenceLine
            y={50.0}
            stroke="#3DDC84"
            strokeDasharray="4 4"
            strokeOpacity={0.65}
            label={{ value: '50.00 Hz', fill: '#3DDC84', fontSize: 10, position: 'insideTopLeft' }}
          />
          <Line
            type="monotone"
            dataKey="Frequency"
            stroke="#D4AF37"
            strokeWidth={2.2}
            dot={false}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-in-out"
            activeDot={{
              r: 6,
              fill: '#F5D76E',
              stroke: '#080808',
              strokeWidth: 2.5,
              filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.9))',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Load Distribution Pie Chart (Luxury Gradients & Bloomberg Palette) ───────
// Slices strictly use: Gold, Green, Red, Muted (no other bright colors)
const LOAD_DATA = [
  { name: 'HVAC & AC Unit',  value: 38, gradId: 'pieGoldGrad',  color: '#D4AF37' },
  { name: 'Production Line', value: 25, gradId: 'pieGreenGrad', color: '#3DDC84' },
  { name: 'Peak Heaters',    value: 22, gradId: 'pieRedGrad',   color: '#FF5252' },
  { name: 'Auxiliary Loads', value: 15, gradId: 'pieMutedGrad', color: '#7E7A70' },
];

export function LoadDistributionChart() {
  return (
    <div className="chart-card animate-fade-up stagger-5">
      <div className="chart-header">
        <div>
          <div className="chart-title">Load Distribution</div>
          <div className="chart-subtitle">Phase breakdown · Luxury Gradients</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 165, height: 165, flexShrink: 0, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <defs>
              <linearGradient id="pieGoldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF099" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#8A6A16" />
              </linearGradient>
              <linearGradient id="pieGreenGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="50%" stopColor="#3DDC84" />
                <stop offset="100%" stopColor="#155724" />
              </linearGradient>
              <linearGradient id="pieRedGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFA4A4" />
                <stop offset="50%" stopColor="#FF5252" />
                <stop offset="100%" stopColor="#8B1E1E" />
              </linearGradient>
              <linearGradient id="pieMutedGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#555555" />
                <stop offset="100%" stopColor="#222222" />
              </linearGradient>
            </defs>
            <Pie
              data={LOAD_DATA}
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
              stroke="#080808"
              strokeWidth={2.5}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              {LOAD_DATA.map((entry, i) => (
                <Cell key={i} fill={`url(#${entry.gradId})`} />
              ))}
            </Pie>
            <Tooltip content={<BloombergTooltip unit="%" />} />
          </PieChart>
        </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {LOAD_DATA.map(item => (
            <div key={item.name}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    color: '#A3A3A3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontFamily: 'Manrope',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: item.color,
                      boxShadow: `0 0 6px ${item.color}88`,
                    }}
                  />
                  {item.name}
                </span>
                <span
                  style={{
                    color: item.color,
                    fontWeight: 700,
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  {item.value}%
                </span>
              </div>
              <div className="progress-bar-container" style={{ marginTop: 0, height: 5 }}>
                <div
                  style={{
                    width: `${item.value}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}88 100%)`,
                    borderRadius: 9999,
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
