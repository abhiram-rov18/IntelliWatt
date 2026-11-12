'use client';

import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSensorData } from '@/lib/hooks';
import { Download, TrendingUp, TrendingDown, Calculator, Loader2 } from 'lucide-react';
import { BloombergTooltip } from '@/components/charts/Charts';
import AnimatedCountUp from '@/components/ui/AnimatedCountUp';
import TelanganaBillEstimator from '@/components/calculator/TelanganaBillEstimator';
import { generateSmartEnergyReport } from '@/lib/generatePdfReport';

// ─── Generate deterministic weekly data ─────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weeklyData = DAYS.map((day, i) => ({
  day,
  kWh:   +(14.2 + Math.sin(i * 1.1) * 3.8 + Math.cos(i * 0.8) * 1.5).toFixed(2),
  cost:  +(120.5 + Math.sin(i * 1.1) * 32.4 + Math.cos(i * 0.8) * 12.0).toFixed(2),
  peak:  +(1950 + Math.sin(i * 0.9) * 280).toFixed(0),
}));

const monthlyData = Array.from({ length: 30 }, (_, i) => ({
  day:  `${i + 1}`,
  kWh:  +(10.5 + Math.sin(i * 0.4) * 3.8 + Math.cos(i * 0.25) * 1.4).toFixed(2),
  cost: +(88.0 + Math.sin(i * 0.4) * 31.0 + Math.cos(i * 0.25) * 11.5).toFixed(2),
}));

const PERIODS = ['Today', 'Week', 'Month'] as const;
type Period = typeof PERIODS[number];

export default function AnalyticsPage() {
  const { reading, history } = useSensorData();
  const [period, setPeriod] = useState<Period>('Week');
  const [isExporting, setIsExporting] = useState(false);

  const totalKwh  = weeklyData.reduce((a, d) => a + d.kWh, 0).toFixed(2);
  const totalCost = weeklyData.reduce((a, d) => a + d.cost, 0).toFixed(2);
  const avgPeak   = (weeklyData.reduce((a, d) => a + d.peak, 0) / 7).toFixed(0);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await generateSmartEnergyReport({
        power: typeof reading.power === 'number' ? reading.power : 0,
        voltage: typeof reading.voltage === 'number' ? reading.voltage : 0,
        current: typeof reading.current === 'number' ? reading.current : 0,
        frequency: typeof reading.frequency === 'number' ? reading.frequency : 50,
        powerFactor: typeof reading.powerFactor === 'number' ? reading.powerFactor : 1,
        energy: typeof reading.energy === 'number' ? reading.energy : Number(totalKwh),
        bill: Number(totalCost),
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
            value: `${totalKwh} kWh / ₹${totalCost}`,
            status: 'Verified',
          },
          {
            time: '—',
            event: 'Period Aggregate Load',
            device: 'IntelliWatt RTDB',
            value: `${avgPeak} W Peak (${period})`,
            status: 'Nominal',
          },
          {
            time: '—',
            event: 'Power Factor Efficiency',
            device: 'IntelliWatt RTDB',
            value: `${(reading.powerFactor || 1).toFixed(3)} PF`,
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

      {/* Summary KPIs with Smooth Count Animation */}
      <div className="stats-summary-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Energy',  val: Number(totalKwh), suffix: ' kWh', decimals: 2, sub: '+4.2% vs last week', up: true },
          { label: 'Total Cost',    val: Number(totalCost), prefix: '₹', decimals: 2, sub: '-2.1% vs last week', up: false },
          { label: 'Peak Power',    val: Number(avgPeak), suffix: ' W', decimals: 0, sub: 'Daily average peak',  up: true },
          { label: 'Avg PF',        val: reading.powerFactor, decimals: 3, sub: 'Power factor', up: true },
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

      {/* Energy & Cost chart */}
      <div className="analytics-grid">
        <div className="chart-card animate-fade-up stagger-5">
          <div className="chart-header">
            <div>
              <div className="chart-title">Energy Consumption & Cost</div>
              <div className="chart-subtitle">Weekly breakdown · Rounded bars</div>
            </div>
            <div className="chart-legend">
              <div className="legend-item"><div className="legend-dot" style={{ background: '#D4AF37' }} /><span>kWh (Gold)</span></div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#7E7A70' }} /><span>Cost ₹ (Muted)</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
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
                dataKey="day"
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
                content={<BloombergTooltip />}
                cursor={{ fill: 'rgba(212, 175, 55, 0.08)' }}
              />
              <Bar
                yAxisId="left"
                dataKey="kWh"
                fill="url(#kwhGoldGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={26}
                isAnimationActive
                animationDuration={800}
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
                fill="url(#costMutedGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={26}
                isAnimationActive
                animationDuration={800}
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

        {/* Monthly trend */}
        <div className="chart-card animate-fade-up stagger-6">
          <div className="chart-header">
            <div>
              <div className="chart-title">Monthly Trend</div>
              <div className="chart-subtitle">30-day pattern · Smooth Curves</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="monthGoldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="#F5D76E" stopOpacity={0.4} />
                  <stop offset="60%" stopColor="#D4AF37" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#050505" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="rgba(212, 175, 55, 0.45)"
                axisLine={{ stroke: 'rgba(212, 175, 55, 0.45)', strokeWidth: 1 }}
                tickLine={{ stroke: 'rgba(212, 175, 55, 0.3)' }}
                tick={{ fill: '#7E7A70', fontSize: 10, fontFamily: 'Manrope' }}
                interval={4}
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
                dataKey="kWh"
                stroke="#D4AF37"
                strokeWidth={2.2}
                fill="url(#monthGoldGrad)"
                dot={false}
                isAnimationActive
                animationDuration={800}
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
              <div className="chart-subtitle">Terminal daily accounting</div>
            </div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 220 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>kWh</th>
                  <th>Cost (₹)</th>
                  <th>vs Avg</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.map(d => {
                  const avg = +totalKwh / 7;
                  const diff = (((d.kWh - avg) / avg) * 100).toFixed(1);
                  return (
                    <tr key={d.day}>
                      <td style={{ fontWeight: 600 }}>{d.day}</td>
                      <td style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#FFFFFF' }}>{d.kWh}</td>
                      <td style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: 'var(--gold-luxury)' }}>₹{d.cost}</td>
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

      {/* Telangana Electricity Bill Estimator */}
      <TelanganaBillEstimator currentLiveKwh={reading.energy} />
    </>
  );
}
