/**
 * Performance.jsx — Portfolio insights and analytics page
 *
 * Sections:
 *  • 4 summary stats: Total Deposited, Withdrawn, Invested, Overall Return
 *  • Best / Worst performer cards (highlight the top gain and top loss)
 *  • Sector allocation bar chart + donut chart side-by-side
 *  • Full holdings performance table (sorted by GainLossPct desc)
 *
 * Props:
 *   holdings     — current holdings array
 *   transactions — all transactions
 *   onNavigate   — fn(screen)
 *   onViewInstrument — fn(symbol) — navigate to InstrumentDetail
 *   onLogout     — fn()
 */
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, LabelList,
} from 'recharts';
import NavBar from './NavBar';
import { fmtCurrency } from '../data';
import './Performance.css';

// Palette for sector charts — matches Charts.jsx donut colours
const SECTOR_COLORS = ['#4472C4', '#1F3864', '#7B9FD4', '#2D5AA0', '#A8C1E8', '#64748B'];

// Compute total portfolio gain (sum of all GainLoss values)
function totalGainLoss(holdings) {
  return holdings.reduce((s, h) => s + h.GainLoss, 0);
}

// Roll up holdings into sector-level allocation
function bySector(holdings) {
  const map = {};
  holdings.forEach(h => {
    map[h.Sector] = (map[h.Sector] || 0) + h.MarketValue;
  });
  const total = Object.values(map).reduce((s, v) => s + v, 0);
  return Object.entries(map)
    .map(([name, value]) => ({ name, value, pct: total ? (value / total * 100) : 0 }))
    .sort((a, b) => b.value - a.value);
}

// Filter transactions by type and sum TotalAmount
function sumByType(transactions, type) {
  return transactions.filter(t => t.TransactionType === type).reduce((s, t) => s + t.TotalAmount, 0);
}

export default function Performance({ holdings, transactions, onNavigate, onViewInstrument, onLogout }) {
  const sectors  = bySector(holdings);
  const totalGL  = totalGainLoss(holdings);
  const totalCost = holdings.reduce((s, h) => s + h.AvgCostPrice * h.Quantity, 0);
  const totalGLPct = totalCost ? (totalGL / totalCost * 100) : 0;

  const deposited   = sumByType(transactions, 'DEPOSIT');
  const withdrawn   = sumByType(transactions, 'WITHDRAWAL');
  const invested    = sumByType(transactions, 'BUY');
  const proceeds    = sumByType(transactions, 'SELL');

  // Sort holdings by % gain desc for the table
  const ranked = [...holdings].sort((a, b) => b.GainLossPct - a.GainLossPct);
  const best   = ranked[0];
  const worst  = ranked[ranked.length - 1];

  // Max abs gain for the GL bar scale
  const maxGL = Math.max(...holdings.map(h => Math.abs(h.GainLoss)), 1);

  return (
    <div className="perf">
      <NavBar activeScreen="performance" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="perf__main">
        {/* Page header */}
        <div className="perf__header">
          <h1 className="perf__title">Performance &amp; Insights</h1>
          <p className="perf__sub">A summary of your portfolio returns and sector exposure</p>
        </div>

        {/* ── 4 summary stats ── */}
        <div className="perf__stats">
          <div className="stat-card">
            <p className="stat-card__label">Total Deposited</p>
            <p className="stat-card__value mono" style={{ color:'var(--info)' }}>{fmtCurrency(deposited)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">Total Withdrawn</p>
            <p className="stat-card__value mono" style={{ color:'var(--orange)' }}>{fmtCurrency(withdrawn)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">Total Invested</p>
            <p className="stat-card__value mono" style={{ color:'var(--blue-accent)' }}>{fmtCurrency(invested - proceeds)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">Overall Return</p>
            <p className="stat-card__value mono" style={{ color: totalGL >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
              {totalGL >= 0 ? '+' : ''}{fmtCurrency(totalGL)}
              <span style={{ fontSize:'var(--text-sm)', fontWeight:500, marginLeft:6 }}>
                ({totalGL >= 0 ? '+' : ''}{totalGLPct.toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>

        {/* ── Best / Worst performer cards ── */}
        {best && worst && (
          <div className="perf__performers">
            {/* Best */}
            <div className="card perf__performer" style={{ borderLeft:'4px solid var(--gain)' }}>
              <p className="perf__performer-label">Best Performer</p>
              <p className="perf__performer-symbol">{best.Symbol}</p>
              <p className="perf__performer-name">{best.InstrumentName}</p>
              <p className="perf__performer-pct" style={{ color:'var(--gain)' }}>+{best.GainLossPct.toFixed(2)}%</p>
              <p className="perf__performer-abs" style={{ color:'var(--gain)' }}>+{fmtCurrency(best.GainLoss)}</p>
              <div className="perf__performer-watermark">▲</div>
              <button
                className="btn btn--success btn--sm"
                style={{ marginTop:14 }}
                onClick={() => onViewInstrument(best.Symbol)}
              >
                View {best.Symbol}
              </button>
            </div>

            {/* Worst */}
            <div className="card perf__performer" style={{ borderLeft:`4px solid ${worst.GainLoss < 0 ? 'var(--loss)' : 'var(--gain)'}` }}>
              <p className="perf__performer-label">Worst Performer</p>
              <p className="perf__performer-symbol">{worst.Symbol}</p>
              <p className="perf__performer-name">{worst.InstrumentName}</p>
              <p className="perf__performer-pct" style={{ color: worst.GainLoss < 0 ? 'var(--loss)' : 'var(--gain)' }}>
                {worst.GainLossPct >= 0 ? '+' : ''}{worst.GainLossPct.toFixed(2)}%
              </p>
              <p className="perf__performer-abs" style={{ color: worst.GainLoss < 0 ? 'var(--loss)' : 'var(--gain)' }}>
                {worst.GainLoss >= 0 ? '+' : ''}{fmtCurrency(worst.GainLoss)}
              </p>
              <div className="perf__performer-watermark">▼</div>
              <button
                className="btn btn--ghost btn--sm"
                style={{ marginTop:14 }}
                onClick={() => onViewInstrument(worst.Symbol)}
              >
                View {worst.Symbol}
              </button>
            </div>
          </div>
        )}

        {/* ── Sector charts ── */}
        <div className="perf__charts">
          {/* Bar chart: sector by market value */}
          <div className="card perf__chart-card">
            <h3 className="section-title">Sector Allocation</h3>
            <div className="perf__bar-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectors} layout="vertical" margin={{ top:0, right:16, bottom:0, left:20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis
                    type="number"
                    tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
                    tick={{ fontSize:11, fill:'#94A3B8' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize:11, fill:'#64748B', fontWeight:500 }}
                    axisLine={false} tickLine={false} width={90}
                  />
                  <Tooltip
                    formatter={v => [fmtCurrency(v), 'Market Value']}
                    contentStyle={{ fontSize:12, borderRadius:8, border:'1px solid #E2E8F0', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="value" radius={[0,6,6,0]}>
                    {sectors.map((s, i) => (
                      <Cell key={s.name} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                    ))}
                    <LabelList
                      dataKey="pct"
                      position="right"
                      formatter={v => `${v.toFixed(1)}%`}
                      style={{ fontSize:11, fill:'#64748B', fontWeight:600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut chart: sector breakdown */}
          <div className="card perf__chart-card">
            <h3 className="section-title">Sector Breakdown</h3>
            <div className="perf__donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectors}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sectors.map((s, i) => (
                      <Cell key={s.name} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={v => [fmtCurrency(v), 'Market Value']}
                    contentStyle={{ fontSize:12, borderRadius:8, border:'1px solid #E2E8F0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="perf__sector-legend">
              {sectors.map((s, i) => (
                <div key={s.name} className="perf__sector-legend-item">
                  <div className="perf__sector-dot" style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                  <span>{s.name}</span>
                  <span style={{ marginLeft:'auto', fontWeight:600, color:'var(--text-secondary)' }}>
                    {s.pct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Holdings performance table ── */}
        <div className="card perf__table-card">
          <div className="perf__table-head">
            <h3 className="section-title">Holdings Performance</h3>
          </div>
          <div className="perf__table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="align-left">Symbol</th>
                  <th className="align-left">Name</th>
                  <th className="align-right">Shares</th>
                  <th className="align-right">Avg Cost</th>
                  <th className="align-right">Current</th>
                  <th className="align-right">Market Value</th>
                  <th className="align-right">Gain / Loss</th>
                  <th className="align-right">Return</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ranked.map(h => {
                  const pos = h.GainLoss >= 0;
                  const barPct = Math.round(Math.abs(h.GainLoss) / maxGL * 100);
                  return (
                    <tr key={h.Symbol} style={{ cursor:'pointer' }} onClick={() => onViewInstrument(h.Symbol)}>
                      <td className="align-left">
                        <span className="mono" style={{ fontWeight:800, fontSize:'var(--text-base)', color:'var(--navy)' }}>{h.Symbol}</span>
                      </td>
                      <td className="align-left" style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>{h.InstrumentName}</td>
                      <td className="align-right mono" style={{ fontWeight:600 }}>{h.Quantity}</td>
                      <td className="align-right mono">{fmtCurrency(h.AvgCostPrice)}</td>
                      <td className="align-right mono">{fmtCurrency(h.CurrentPrice)}</td>
                      <td className="align-right mono" style={{ fontWeight:700 }}>{fmtCurrency(h.MarketValue)}</td>
                      <td className="align-right">
                        <span className="mono" style={{ fontWeight:700, color: pos ? 'var(--gain)' : 'var(--loss)' }}>
                          {pos ? '+' : ''}{fmtCurrency(h.GainLoss)}
                        </span>
                      </td>
                      <td className="align-right">
                        <span
                          className="perf-badge"
                          style={{
                            background: pos ? 'var(--gain-bg)' : 'var(--loss-bg)',
                            color: pos ? 'var(--gain)' : 'var(--loss)',
                          }}
                        >
                          {pos ? '▲ +' : '▼ '}{Math.abs(h.GainLossPct).toFixed(2)}%
                        </span>
                      </td>
                      <td>
                        {/* Small GL bar for visual scanning */}
                        <div className="perf__gl-bar">
                          <div
                            className="perf__gl-bar-fill"
                            style={{
                              width:`${barPct}%`,
                              background: pos ? 'var(--gain)' : 'var(--loss)',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
