/**
 * Charts.jsx — Recharts-based chart components
 *
 * Exports two reusable components:
 *  • AllocationDonut  — pie/donut showing portfolio allocation by symbol
 *  • PortfolioLineChart — area chart of portfolio value over time
 *
 * Both receive their data through props so they can be reused on
 * the Dashboard (portfolio-level) and the Instrument Detail page.
 */
import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { portfolioHistory } from '../data';
import { fmtCurrency, fmtCompact } from '../data';
import './Charts.css';

// Colour palette for the donut slices — navy through lighter blues
const DONUT_COLORS = ['#4472C4', '#1F3864', '#7B9FD4', '#2D5AA0', '#A8C1E8', '#64748B'];

// ─── AllocationDonut ──────────────────────────────────────────────────────────
/**
 * AllocationDonut
 * Props:
 *   slices     — array of { Symbol, MarketValue, Pct }
 *   totalValue — number, shown in the donut centre when nothing is hovered
 */
export function AllocationDonut({ slices, totalValue }) {
  // Track which slice index is hovered (null = none)
  const [activeIdx, setActiveIdx] = useState(null);

  // The currently hovered slice (or null)
  const active = activeIdx !== null ? slices[activeIdx] : null;

  return (
    <div className="donut-chart">
      <div className="donut-chart__area">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              cx="50%"
              cy="50%"
              innerRadius={66}
              outerRadius={94}
              paddingAngle={2}
              dataKey="MarketValue"
              onMouseEnter={(_, idx) => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
            >
              {slices.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={DONUT_COLORS[idx % DONUT_COLORS.length]}
                  opacity={activeIdx === null || activeIdx === idx ? 1 : 0.35}
                  stroke="none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centre label — shows hovered slice detail or total value */}
        <div className="donut-chart__center">
          {active ? (
            <>
              <span className="donut-chart__center-label">{active.Symbol}</span>
              <span className="donut-chart__center-value">{active.Pct}%</span>
              <span className="donut-chart__center-sub">{fmtCurrency(active.MarketValue)}</span>
            </>
          ) : (
            <>
              <span className="donut-chart__center-label">Total Value</span>
              <span className="donut-chart__center-value">{fmtCurrency(totalValue)}</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="donut-chart__legend">
        {slices.map((item, idx) => (
          <div
            key={item.Symbol}
            className="donut-chart__legend-item"
            onMouseEnter={() => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            <div
              className="donut-chart__legend-dot"
              style={{ background: DONUT_COLORS[idx % DONUT_COLORS.length] }}
            />
            <span className="donut-chart__legend-name">{item.Symbol}</span>
            <span className="donut-chart__legend-pct">{item.Pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PortfolioLineChart ───────────────────────────────────────────────────────
// Available date-range options for the selector strip
const RANGES = ['1W', '1M', '3M', '1Y', 'ALL'];

/**
 * Filter the portfolioHistory array to only include points within
 * the selected date range (relative to the most recent data point).
 */
function filterPortfolioHistory(range) {
  const all = portfolioHistory;
  const last = new Date(all[all.length - 1].date);
  const days = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365, ALL: 99999 };
  const cutoff = new Date(last);
  cutoff.setDate(cutoff.getDate() - days[range]);
  return all.filter(p => new Date(p.date) >= cutoff);
}

/** Format a date string for the X-axis tick labels */
function fmtXAxis(dateStr, range) {
  const d = new Date(dateStr);
  if (range === '1W' || range === '1M') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

/**
 * PortfolioLineChart
 * Props:
 *   height — number (default 240), controls the chart area height in px
 */
export function PortfolioLineChart({ height = 240 }) {
  const [range, setRange] = useState('3M');
  const data = filterPortfolioHistory(range);

  // Compute the visible price change over the selected range
  const first = data[0]?.value ?? 0;
  const last  = data[data.length - 1]?.value ?? 0;
  const change    = last - first;
  const changePct = first > 0 ? (change / first) * 100 : 0;
  const positive  = change >= 0;

  // Give the Y axis a bit of padding above and below
  const minVal = Math.min(...data.map(d => d.value));
  const maxVal = Math.max(...data.map(d => d.value));
  const yMin = Math.floor(minVal * 0.995 / 1000) * 1000;
  const yMax = Math.ceil (maxVal * 1.005 / 1000) * 1000;

  return (
    <div className="line-chart">
      {/* Header: change amount + range tabs */}
      <div className="line-chart__header">
        <div className="line-chart__change">
          <span
            className="line-chart__change-amount"
            style={{ color: positive ? 'var(--gain)' : 'var(--loss)' }}
          >
            {positive ? '+' : ''}{fmtCurrency(change)}
          </span>
          <span className={`perf-badge ${positive ? 'perf-badge--gain' : 'perf-badge--loss'}`}>
            {positive ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
          </span>
        </div>

        {/* Date range selector tabs */}
        <div className="range-tabs">
          {RANGES.map(r => (
            <button
              key={r}
              className={`range-tab${range === r ? ' range-tab--active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Area chart */}
      <div className="line-chart__area" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <defs>
              {/* Gradient fill under the line */}
              <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#4472C4" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#4472C4" stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />

            <XAxis
              dataKey="date"
              tickFormatter={v => fmtXAxis(v, range)}
              tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={fmtCompact}
              tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              width={52}
            />

            {/* Custom tooltip */}
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              labelStyle={{ color: '#64748B', marginBottom: 4, fontFamily: 'Inter' }}
              formatter={v => [fmtCurrency(v), 'Portfolio Value']}
              labelFormatter={label =>
                new Date(label).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })
              }
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#4472C4"
              strokeWidth={2}
              fill="url(#pgGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#4472C4', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── InstrumentLineChart ──────────────────────────────────────────────────────
/**
 * InstrumentLineChart
 * Used on the Instrument Detail page.
 * Props:
 *   data      — array of { PriceDate, ClosePrice }
 *   range     — current range string ('1W'/'1M' etc.)
 *   onRange   — callback(rangeStr) when user changes range
 *   height    — chart height in px
 */
export function InstrumentLineChart({ data, range, onRange, height = 260 }) {
  const first    = data[0]?.ClosePrice ?? 0;
  const last     = data[data.length - 1]?.ClosePrice ?? 0;
  const change   = last - first;
  const changePct = first > 0 ? (change / first) * 100 : 0;
  const positive  = change >= 0;

  const minVal = data.length ? Math.min(...data.map(d => d.ClosePrice)) : 0;
  const maxVal = data.length ? Math.max(...data.map(d => d.ClosePrice)) : 1;
  const yMin = Math.floor(minVal * 0.996 * 100) / 100;
  const yMax = Math.ceil (maxVal * 1.004 * 100) / 100;

  const color = positive ? 'var(--gain)' : 'var(--loss)';
  const gradId = `instrGrad-${range}`;

  return (
    <div className="line-chart">
      <div className="line-chart__header">
        <div className="line-chart__change">
          <span className="line-chart__change-amount" style={{ color }}>
            {positive ? '+' : ''}{fmtCurrency(change)}
          </span>
          <span className={`perf-badge ${positive ? 'perf-badge--gain' : 'perf-badge--loss'}`}>
            {positive ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
          </span>
        </div>
        <div className="range-tabs">
          {RANGES.map(r => (
            <button
              key={r}
              className={`range-tab${range === r ? ' range-tab--active' : ''}`}
              onClick={() => onRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height }}>
        {data.length === 0 ? (
          <p style={{ textAlign:'center', paddingTop:40, color:'var(--text-subtle)', fontSize:'var(--text-sm)' }}>
            No data for this range
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={positive ? '#16A34A' : '#DC2626'} stopOpacity={0.14} />
                  <stop offset="100%" stopColor={positive ? '#16A34A' : '#DC2626'} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="PriceDate"
                tickFormatter={v => fmtXAxis(v, range)}
                tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Inter' }}
                axisLine={false} tickLine={false} interval="preserveStartEnd"
              />
              <YAxis
                domain={[yMin, yMax]}
                tickFormatter={fmtCompact}
                tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Inter' }}
                axisLine={false} tickLine={false} width={52}
              />
              <Tooltip
                contentStyle={{ background:'white', border:'1px solid #E2E8F0', borderRadius:8, boxShadow:'0 4px 12px rgba(0,0,0,0.08)', fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}
                labelStyle={{ color:'#64748B', marginBottom:4, fontFamily:'Inter' }}
                formatter={v => [fmtCurrency(v), 'Close Price']}
                labelFormatter={label => new Date(label).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
              />
              <Area
                type="monotone" dataKey="ClosePrice"
                stroke={positive ? '#16A34A' : '#DC2626'} strokeWidth={2}
                fill={`url(#${gradId})`} dot={false}
                activeDot={{ r:4, fill: positive ? '#16A34A' : '#DC2626', stroke:'white', strokeWidth:2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
