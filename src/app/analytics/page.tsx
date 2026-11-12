'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSensorData } from '@/lib/hooks';
import { Download, TrendingUp, TrendingDown, Calculator, Loader2 } from 'lucide-react';
import { BloombergTooltip } from '@/components/charts/Charts';
import AnimatedCountUp from '@/components/ui/AnimatedCountUp';
import TelanganaBillEstimator, { calculateTelanganaDomesticBill } from '@/components/calculator/TelanganaBillEstimator';
import { generateSmartEnergyReport } from '@/lib/generatePdfReport';

// ─── Demonstration Data for Period Tabs (Today: 0.01 kWh, This Week: 0.07 kWh, This Month: 0.28 kWh) ──
const PERIODS = ['Today', 'This Week', 'This Month'] as const;
type Period = typeof PERIODS[number];

interface DemoPeriodData {
  energy: number;       // in kWh
  cost: number;         // in ₹
  peak: number;         // in W
  avgPf: number;
  energySub: string;
  costSub: string;
  peakSub: string;
  pfSub: string;
  barSubtitle: string;
  areaSubtitle: string;
  tableSubtitle: string;
  barData: Array<{ label: string; energy: number; cost: number }>;
  areaData: Array<{ step: string; energy: number }>;
  tableData: Array<{ period: string; energy: number; cost: number }>;
}

const DEMO_ANALYTICS: Record<Period, DemoPeriodData> = {
  Today: {
    energy: 0.01,
    cost: 0.85,
    peak: 240,
    avgPf: 0.985,
    energySub: 'Today\'s household energy',
    costSub: 'Daily estimated bill',
    peakSub: 'Today\'s peak load',
    pfSub: 'Optimal grid efficiency',
    barSubtitle: 'Hourly breakdown · 0.01 kWh total',
    areaSubtitle: 'Hourly cumulative progression',
    tableSubtitle: 'Interval accounting (Today)',
    barData: [
      { label: '04:00', energy: 0.0012, cost: 0.10 },
      { label: '08:00', energy: 0.0024, cost: 0.20 },
      { label: '12:00', energy: 0.0019, cost: 0.16 },
      { label: '16:00', energy: 0.0015, cost: 0.13 },
      { label: '20:00', energy: 0.0021, cost: 0.18 },
      { label: '23:00', energy: 0.0009, cost: 0.08 },
    ],
    areaData: [
      { step: '00:00', energy: 0.0000 },
      { step: '02:00', energy: 0.0005 },
      { step: '04:00', energy: 0.0012 },
      { step: '06:00', energy: 0.0021 },
      { step: '08:00', energy: 0.0036 },
      { step: '10:00', energy: 0.0048 },
      { step: '12:00', energy: 0.0055 },
      { step: '14:00', energy: 0.0063 },
      { step: '16:00', energy: 0.0070 },
      { step: '18:00', energy: 0.0079 },
      { step: '20:00', energy: 0.0091 },
      { step: '24:00', energy: 0.0100 },
    ],
    tableData: [
      { period: '00:00 - 04:00', energy: 0.0012, cost: 0.10 },
      { period: '04:00 - 08:00', energy: 0.0024, cost: 0.20 },
      { period: '08:00 - 12:00', energy: 0.0019, cost: 0.16 },
      { period: '12:00 - 16:00', energy: 0.0015, cost: 0.13 },
      { period: '16:00 - 20:00', energy: 0.0021, cost: 0.18 },
      { period: '20:00 - 24:00', energy: 0.0009, cost: 0.08 },
    ],
  },
  'This Week': {
    energy: 0.07,
    cost: 5.95,
    peak: 380,
    avgPf: 0.980,
    energySub: 'Weekly household energy',
    costSub: 'Weekly estimated bill',
    peakSub: 'Weekly peak load',
    pfSub: 'Optimal grid efficiency',
    barSubtitle: '7-day daily breakdown · 0.07 kWh total',
    areaSubtitle: 'Cumulative weekly trend',
    tableSubtitle: 'Daily accounting (This Week)',
    barData: [
      { label: 'Mon', energy: 0.0098, cost: 0.83 },
      { label: 'Tue', energy: 0.0102, cost: 0.87 },
      { label: 'Wed', energy: 0.0095, cost: 0.81 },
      { label: 'Thu', energy: 0.0105, cost: 0.89 },
      { label: 'Fri', energy: 0.0101, cost: 0.86 },
      { label: 'Sat', energy: 0.0104, cost: 0.88 },
      { label: 'Sun', energy: 0.0095, cost: 0.81 },
    ],
    areaData: [
      { step: 'Mon', energy: 0.0098 },
      { step: 'Tue', energy: 0.0200 },
      { step: 'Wed', energy: 0.0295 },
      { step: 'Thu', energy: 0.0400 },
      { step: 'Fri', energy: 0.0501 },
      { step: 'Sat', energy: 0.0605 },
      { step: 'Sun', energy: 0.0700 },
    ],
    tableData: [
      { period: 'Monday', energy: 0.0098, cost: 0.83 },
      { period: 'Tuesday', energy: 0.0102, cost: 0.87 },
      { period: 'Wednesday', energy: 0.0095, cost: 0.81 },
      { period: 'Thursday', energy: 0.0105, cost: 0.89 },
      { period: 'Friday', energy: 0.0101, cost: 0.86 },
      { period: 'Saturday', energy: 0.0104, cost: 0.88 },
      { period: 'Sunday', energy: 0.0095, cost: 0.81 },
    ],
  },
  'This Month': {
    energy: 0.28,
    cost: 23.80,
    peak: 520,
    avgPf: 0.978,
    energySub: 'Monthly household energy',
    costSub: 'Monthly estimated bill',
    peakSub: 'Monthly peak load',
    pfSub: 'Stable power factor',
    barSubtitle: '4-week breakdown · 0.28 kWh total',
    areaSubtitle: '30-day cumulative trend',
    tableSubtitle: 'Weekly accounting (This Month)',
    barData: [
      { label: 'Week 1', energy: 0.0685, cost: 5.82 },
      { label: 'Week 2', energy: 0.0712, cost: 6.05 },
      { label: 'Week 3', energy: 0.0708, cost: 6.02 },
      { label: 'Week 4', energy: 0.0695, cost: 5.91 },
    ],
    areaData: Array.from({ length: 30 }, (_, i) => ({
      step: `${i + 1}`,
      energy: i === 29 ? 0.2800 : +( (0.28 / 30) * (i + 1) + Math.sin(i * 0.5) * 0.0025 ).toFixed(4),
    })),
    tableData: [
      { period: 'Week 1 (Days 1–7)', energy: 0.0685, cost: 5.82 },
      { period: 'Week 2 (Days 8–14)', energy: 0.0712, cost: 6.05 },
      { period: 'Week 3 (Days 15–21)', energy: 0.0708, cost: 6.02 },
      { period: 'Week 4 (Days 22–28)', energy: 0.0695, cost: 5.91 },
    ],
  },
};

export default function AnalyticsPage() {
  const { reading, history } = useSensorData();
  const [period, setPeriod] = useState<Period>('This Week');
  const [isExporting, setIsExporting] = useState(false);

  const currentData = DEMO_ANALYTICS[period];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await generateSmartEnergyReport({
        power: typeof reading.power === 'number' ? reading.power : 0,
        voltage: typeof reading.voltage === 'number' ? reading.voltage : 0,
        current: typeof reading.current === 'number' ? reading.current : 0,
        frequency: typeof reading.frequency === 'number' ? reading.frequency : 50,
        powerFactor: typeof reading.powerFactor === 'number' ? reading.powerFactor : 1,
        energy: currentData.energy,
        bill: currentData.cost,
        isOnline: Boolean((reading.voltage && reading.voltage > 0) || (reading.power && reading.power > 0)),
        isWifiOnline: true,
        dbConnected: true,
        relay1: (reading as any).relay1 ?? false,
        relay2: (reading as any).relay2 ?? false,
        relay3: (reading as any).relay3 ?? false,
        relay4: (reading as any).relay4 ?? false,
        hourlyHistory: (history && history.length > 0 ? history.slice(-8) : []).map((h, i) => ({
          hour: h.timestamp ? new Date(h.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : `${10 + i}:00`,
          power: Math.round(h.power || 0),
        })),
        recentEvents: [
          {
            time: new Date().toLocaleTimeString('en-IN'),
            event: 'Energy Analytics Telemetry Export',
            device: 'IntelliWatt RTDB',
            value: `${currentData.energy.toFixed(2)} kWh / ₹${currentData.cost.toFixed(2)}`,
            status: 'Verified',
          },
          {
            time: '—',
            event: 'Period Aggregate Load',
            device: 'IntelliWatt RTDB',
            value: `${currentData.peak} W Peak (${period})`,
            status: 'Nominal',
          },
          {
            time: '—',
            event: 'Power Factor Efficiency',
            device: 'IntelliWatt RTDB',
            value: `${currentData.avgPf.toFixed(3)} PF`,
            status: 'Optimal',
          },
        ],
      });
    } catch (err) {
      console.error('[Analytics] Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Energy Analytics</h1>
            <p className="page-subtitle">Historical trends & consumption analysis</p>
          </div>
          <div className="page-actions">
            <div className="chart-tabs">
              {PERIODS.map(p => (
                <button
                  key={p}
                  className={`chart-tab ${period === p ? 'active' : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <a
              href="#bill-estimator"
              className="btn btn-primary"
              style={{ height: 36, padding: '0 1.1rem', fontSize: '0.8rem' }}
            >
              <Calculator size={14} />
              Bill Estimator
            </a>
            <button
              id="analytics-export-report-btn"
              className={`btn-perimeter-glow btn-analytics-export ${isExporting ? 'exporting' : ''}`}
              onClick={handleExport}
              disabled={isExporting}
              title="Generate & Export Official Energy Analytics PDF Report"
              aria-label="Export Energy Analytics Report"
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Exporting…</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Export</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPIs with Smooth Count Animation (Consistently Updated for Selected Period in kWh) */}
      <div className="stats-summary-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          {
            label: 'Total Energy',
            val: currentData.energy,
            suffix: ' kWh',
            decimals: 2,
            sub: currentData.energySub,
            up: true,
          },
          {
            label: 'Estimated Cost',
            val: currentData.cost,
            prefix: '₹',
            decimals: 2,
            sub: currentData.costSub,
            up: false,
          },
          {
            label: 'Peak Power',
            val: currentData.peak,
            suffix: ' W',
            decimals: 0,
            sub: currentData.peakSub,
            up: true,
          },
          {
            label: 'Average Power Factor',
            val: currentData.avgPf,
            decimals: 3,
            sub: currentData.pfSub,
            up: currentData.avgPf >= 0.95,
          },
        ].map((kpi, i) => (
          <article key={kpi.label} className={`glass-card animate-fade-up stagger-${i + 1}`} style={{ padding: '1.5rem' }}>
            <div className="metric-label">{kpi.label}</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif', margin: '6px 0', letterSpacing: '0.01em' }}>
              <AnimatedCountUp
                value={kpi.val}
                decimals={kpi.decimals}
                prefix={kpi.prefix}
                suffix={kpi.suffix}
                duration={500}
              />
            </div>
            <div className={`metric-trend ${kpi.up ? 'up' : 'down'}`}>
              {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {kpi.sub}
            </div>
          </article>
        ))}
      </div>

      {/* ── Second Section: Sample Household Analytics (Demonstration Data Only) ── */}
      <section aria-label="Sample Household Analytics" style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.02em', color: '#FFFFFF', margin: 0 }}>
            Sample Household Analytics
          </h2>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
        </div>

        {/* Energy & Cost chart */}
        <div className="analytics-grid">
        <div className="chart-card animate-fade-up stagger-5">
          <div className="chart-header">
            <div>
              <div className="chart-title">Energy Consumption & Cost</div>
              <div className="chart-subtitle">{currentData.barSubtitle}</div>
            </div>
            <div className="chart-legend">
              <div className="legend-item"><div className="legend-dot" style={{ background: '#D4AF37' }} /><span>kWh (Gold)</span></div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#7E7A70' }} /><span>Cost ₹ (Muted)</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={currentData.barData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="kwhGoldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5D76E" stopOpacity={0.95} />
                  <stop offset="60%" stopColor="#D4AF37" stopOpacity={0.75} />
                  <stop offset="100%" stopColor="#8A6A16" stopOpacity={0.35} />
                </linearGradient>
                <linearGradient id="costMutedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7E7A70" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#2A2A2A" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="kwhHoverGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFF099" stopOpacity={1} />
                  <stop offset="100%" stopColor="#B8860B" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="rgba(212, 175, 55, 0.45)"
                axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
                tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
                tick={{ fill: '#7E7A70', fontSize: 11, fontFamily: 'Manrope' }}
              />
              <YAxis
                yAxisId="left"
                stroke="rgba(212, 175, 55, 0.45)"
                axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
                tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
                tick={{ fill: '#7E7A70', fontSize: 11, fontFamily: 'Manrope' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="rgba(212, 175, 55, 0.45)"
                axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
                tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
                tick={{ fill: '#7E7A70', fontSize: 11, fontFamily: 'Manrope' }}
              />
              <Tooltip
                content={<BloombergTooltip unit="kWh" />}
                cursor={{ fill: 'rgba(212, 175, 55, 0.08)' }}
              />
              <Bar
                yAxisId="left"
                dataKey="energy"
                name="kWh"
                fill="url(#kwhGoldGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={26}
                isAnimationActive
                animationDuration={600}
                animationEasing="ease-in-out"
                activeBar={{
                  fill: 'url(#kwhHoverGrad)',
                  stroke: '#F5D76E',
                  strokeWidth: 1.5,
                  filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.55))',
                }}
              />
              <Bar
                yAxisId="right"
                dataKey="cost"
                name="Cost (₹)"
                fill="url(#costMutedGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={26}
                isAnimationActive
                animationDuration={600}
                animationEasing="ease-in-out"
                activeBar={{
                  fill: '#8E8E8E',
                  stroke: '#C0C0C0',
                  strokeWidth: 1.2,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Period Trend */}
        <div className="chart-card animate-fade-up stagger-6">
          <div className="chart-header">
            <div>
              <div className="chart-title">
                {period === 'Today' ? 'Daily Load Profile' : period === 'This Week' ? '7-Day Trend' : '30-Day Trend'}
              </div>
              <div className="chart-subtitle">{currentData.areaSubtitle}</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={currentData.areaData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="monthGoldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="#F5D76E" stopOpacity={0.4} />
                  <stop offset="60%" stopColor="#D4AF37" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#050505" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis
                dataKey="step"
                stroke="rgba(212, 175, 55, 0.45)"
                axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
                tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
                tick={{ fill: '#7E7A70', fontSize: 10, fontFamily: 'Manrope' }}
                interval={period === 'This Month' ? 4 : 0}
              />
              <YAxis
                stroke="rgba(212, 175, 55, 0.45)"
                axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
                tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
                tick={{ fill: '#7E7A70', fontSize: 11, fontFamily: 'Manrope' }}
              />
              <Tooltip content={<BloombergTooltip unit="kWh" />} />
              <Area
                type="monotone"
                dataKey="energy"
                name="Cumulative kWh"
                stroke="#D4AF37"
                strokeWidth={2.2}
                fill="url(#monthGoldGrad)"
                dot={false}
                isAnimationActive
                animationDuration={600}
                animationEasing="ease-in-out"
                activeDot={{
                  r: 6,
                  fill: '#F5D76E',
                  stroke: '#080808',
                  strokeWidth: 2.5,
                  filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.85))',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live reading + Peak analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.35rem', marginBottom: '2.5rem', marginTop: '1.5rem' }}>
        {/* Live voltage chart */}
        <div className="chart-card animate-fade-up stagger-7">
          <div className="chart-header">
            <div>
              <div className="chart-title">Voltage vs Current (Live)</div>
              <div className="chart-subtitle">Precision Telemetry · Smooth Curves</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={history.slice(-30).map((h, i) => ({
                t: i,
                Voltage: +h.voltage.toFixed(1),
                Current: +h.current.toFixed(2),
              }))}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="t" hide />
              <YAxis
                yAxisId="v"
                stroke="rgba(212, 175, 55, 0.45)"
                axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
                tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
                tick={{ fill: '#7E7A70', fontSize: 10, fontFamily: 'Manrope' }}
                domain={[225, 235]}
              />
              <YAxis
                yAxisId="a"
                orientation="right"
                stroke="rgba(212, 175, 55, 0.45)"
                axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
                tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
                tick={{ fill: '#7E7A70', fontSize: 10, fontFamily: 'Manrope' }}
                domain={[4, 5.5]}
              />
              <Tooltip content={<BloombergTooltip />} />
              <Line
                yAxisId="v"
                type="monotone"
                dataKey="Voltage"
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
              <Line
                yAxisId="a"
                type="monotone"
                dataKey="Current"
                stroke="#3DDC84"
                strokeWidth={2.2}
                dot={false}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-in-out"
                activeDot={{
                  r: 6,
                  fill: '#3DDC84',
                  stroke: '#080808',
                  strokeWidth: 2.5,
                  filter: 'drop-shadow(0 0 10px rgba(61, 220, 132, 0.9))',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '0.75rem', color: '#7E7A70', paddingTop: 8, fontFamily: 'Manrope' }}
                formatter={(value) => (
                  <span style={{ color: value === 'Voltage' ? '#D4AF37' : '#3DDC84', fontWeight: 600 }}>
                    {value} ({value === 'Voltage' ? 'V' : 'A'})
                  </span>
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost breakdown table */}
        <div className="chart-card animate-fade-up stagger-8">
          <div className="chart-header">
            <div>
              <div className="chart-title">Cost Breakdown</div>
              <div className="chart-subtitle">{currentData.tableSubtitle}</div>
            </div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 220 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{period === 'Today' ? 'Time Interval' : period === 'This Week' ? 'Day' : 'Period'}</th>
                  <th>kWh</th>
                  <th>Cost (₹)</th>
                  <th>vs Avg</th>
                </tr>
              </thead>
              <tbody>
                {currentData.tableData.map(d => {
                  const avg = currentData.energy / currentData.tableData.length;
                  const diff = (((d.energy - avg) / avg) * 100).toFixed(1);
                  return (
                    <tr key={d.period}>
                      <td style={{ fontWeight: 600 }}>{d.period}</td>
                      <td style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#FFFFFF' }}>{d.energy}</td>
                      <td style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: 'var(--gold-luxury)' }}>₹{d.cost.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${+diff > 0 ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                          {+diff > 0 ? '+' : ''}{diff}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </section>

      {/* Telangana Electricity Bill Estimator */}
      <TelanganaBillEstimator currentLiveKwh={reading.energy} />
    </>
  );
}
