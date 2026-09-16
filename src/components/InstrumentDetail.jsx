/**
 * InstrumentDetail.jsx — Single instrument view
 *
 * Opened when a user clicks a holding row or a performance card.
 * Shows:
 *  • Hero header with symbol, name, sector, live price, and day change
 *  • A price history chart (data from getPriceHistory)
 *  • A "Your Position" card (only if the user owns this instrument)
 *  • Buy / Sell action buttons
 *  • 52-week high/low range bar
 *
 * Props:
 *   symbol       — ticker string (e.g. 'AAPL')
 *   holdings     — current holdings array
 *   onNavigate   — fn(screen)
 *   onOpenModal  — fn(type, symbol) — opens buy/sell modal pre-filled
 *   onLogout     — fn()
 */
import React, { useState } from 'react';
import NavBar from './NavBar';
import { InstrumentLineChart } from './Charts';
import { instrumentCatalog, getPriceHistory, fmtCurrency } from '../data';
import './InstrumentDetail.css';

export default function InstrumentDetail({ symbol, holdings, onNavigate, onOpenModal, onLogout }) {
  const [range, setRange] = useState('3M'); // date range for the price chart

  // Look up this instrument in the catalog
  const info = instrumentCatalog.find(i => i.Symbol === symbol);

  // Check if the user has a position in this instrument
  const holding = holdings.find(h => h.Symbol === symbol);

  // Filter price history to the selected range
  const allHistory = getPriceHistory(symbol);
  const last    = allHistory.length ? new Date(allHistory[allHistory.length - 1].PriceDate) : new Date();
  const dayMap  = { '1W':7, '1M':30, '3M':90, '1Y':365, ALL:99999 };
  const cutoff  = new Date(last);
  cutoff.setDate(cutoff.getDate() - dayMap[range]);
  const filteredHistory = allHistory.filter(p => new Date(p.PriceDate) >= cutoff);

  // "Not found" fallback
  if (!info) {
    return (
      <div className="instr">
        <NavBar activeScreen="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
        <div style={{ textAlign:'center', padding:'80px 24px' }}>
          <p style={{ color:'var(--text-muted)', fontWeight:500 }}>Instrument "{symbol}" not found</p>
          <button className="btn btn--navy" style={{ marginTop:16 }} onClick={() => onNavigate('dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const dayPos = info.DayChange >= 0;

  // Compute 52-week position as a percentage (for the progress bar)
  const pctOf52w = ((info.CurrentPrice - info.WeekLow52) / (info.WeekHigh52 - info.WeekLow52) * 100).toFixed(1);

  return (
    <div className="instr">
      <NavBar activeScreen="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="instr__main">
        {/* Breadcrumb */}
        <button className="back-btn" onClick={() => onNavigate('dashboard')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
          Back to Dashboard
        </button>

        {/* ── Hero card ── */}
        <div className="hero-card">
          <div className="instr__hero-top">
            {/* Left: icon + symbol + name */}
            <div className="instr__hero-left">
              <div className="instr__hero-icon">{info.Symbol.slice(0,2)}</div>
              <div>
                <div>
                  <span className="instr__symbol">{info.Symbol}</span>
                  <span className="instr__sector-tag">{info.Sector}</span>
                </div>
                <p className="instr__name">{info.InstrumentName}</p>
              </div>
            </div>

            {/* Right: current price + day change */}
            <div>
              <p className="instr__price">{fmtCurrency(info.CurrentPrice)}</p>
              <div className="instr__day-change">
                <span
                  className="instr__day-amount"
                  style={{ color: dayPos ? '#4ADE80' : '#F87171' }}
                >
                  {dayPos ? '+' : ''}{fmtCurrency(info.DayChange)}
                </span>
                <span
                  className="perf-badge"
                  style={{
                    background: dayPos ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                    color: dayPos ? '#4ADE80' : '#F87171',
                  }}
                >
                  {dayPos ? '▲' : '▼'} {Math.abs(info.DayChangePct).toFixed(2)}%
                </span>
                <span className="instr__today-label">today</span>
              </div>
            </div>
          </div>

          {/* Stat pills */}
          <div className="instr__hero-stats">
            {[
              { label:'Market Cap',  val:info.MarketCap   },
              { label:'P/E Ratio',   val:info.PERatio      },
              { label:'52W High',    val:fmtCurrency(info.WeekHigh52) },
              { label:'52W Low',     val:fmtCurrency(info.WeekLow52)  },
            ].map(s => (
              <div key={s.label} className="instr__hero-stat">
                <p className="instr__hero-stat-label">{s.label}</p>
                <p className="instr__hero-stat-val">{s.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Chart + sidebar ── */}
        <div className="instr__body">
          {/* Price history chart */}
          <div className="card instr__chart">
            <h3 className="section-title">Price History</h3>
            <InstrumentLineChart
              data={filteredHistory}
              range={range}
              onRange={setRange}
              height={260}
            />
          </div>

          {/* Sidebar */}
          <div className="instr__sidebar">
            {/* Position card */}
            <div className="card instr__position">
              <h3 className="section-title">Your Position</h3>

              {holding ? (
                <>
                  <div className="instr__pos-grid">
                    <div className="instr__pos-cell">
                      <p className="instr__pos-cell-label">Shares owned</p>
                      <p className="instr__pos-cell-val">{holding.Quantity}</p>
                    </div>
                    <div className="instr__pos-cell">
                      <p className="instr__pos-cell-label">Avg cost</p>
                      <p className="instr__pos-cell-val">{fmtCurrency(holding.AvgCostPrice)}</p>
                    </div>
                  </div>

                  <div className="instr__mktval">
                    <p className="instr__mktval-label">Market Value</p>
                    <p className="instr__mktval-val">{fmtCurrency(holding.MarketValue)}</p>
                  </div>

                  {/* Unrealised gain/loss */}
                  <div
                    className="instr__gl-box"
                    style={{
                      background:   holding.GainLoss >= 0 ? 'var(--gain-bg)'     : 'var(--loss-bg)',
                      border: `1px solid ${holding.GainLoss >= 0 ? 'var(--gain-border)' : 'var(--loss-border)'}`,
                    }}
                  >
                    <p className="instr__gl-label" style={{ color: holding.GainLoss >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                      Unrealised Gain / Loss
                    </p>
                    <div className="instr__gl-row">
                      <span className="instr__gl-main" style={{ color: holding.GainLoss >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                        {holding.GainLoss >= 0 ? '+' : ''}{fmtCurrency(holding.GainLoss)}
                      </span>
                      <span className="instr__gl-pct" style={{ color: holding.GainLoss >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                        ({holding.GainLoss >= 0 ? '▲ +' : '▼ '}{Math.abs(holding.GainLossPct).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty state when user doesn't own this instrument */
                <div className="empty-state" style={{ padding:'32px 0' }}>
                  <div className="empty-state__icon" style={{ margin:'0 auto 10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/>
                    </svg>
                  </div>
                  <p className="empty-state__title" style={{ fontSize:'var(--text-sm)' }}>You don&apos;t own this yet</p>
                  <p className="empty-state__body">Buy shares to start tracking your position</p>
                </div>
              )}

              {/* Buy / Sell buttons */}
              <div className="instr__btn-row">
                <button
                  className="btn btn--success"
                  onClick={() => onOpenModal('buy', info.Symbol)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                  Buy
                </button>
                <button
                  className="btn btn--danger"
                  disabled={!holding}
                  onClick={() => holding && onOpenModal('sell', info.Symbol)}
                  style={!holding ? { opacity:0.4, cursor:'not-allowed' } : {}}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/></svg>
                  Sell
                </button>
              </div>
              {!holding && (
                <p className="instr__no-sell">Sell unavailable — you don&apos;t own {info.Symbol}</p>
              )}
            </div>

            {/* 52-week range card */}
            <div className="card instr__52w">
              <p className="instr__52w-title">vs. Previous Close</p>

              <div className="instr__52w-row">
                <span className="instr__52w-lbl">Prev close</span>
                <span className="instr__52w-val">{fmtCurrency(info.PreviousClose)}</span>
              </div>
              <div className="instr__52w-row" style={{ marginBottom:14 }}>
                <span className="instr__52w-lbl">Current</span>
                <span className="instr__52w-val" style={{ color:'var(--text-primary)', fontWeight:700 }}>{fmtCurrency(info.CurrentPrice)}</span>
              </div>

              {/* 52W range bar */}
              <div className="instr__52w-bar">
                <div
                  className="instr__52w-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, pctOf52w))}%`,
                    background: dayPos ? 'var(--gain)' : 'var(--loss)',
                  }}
                />
              </div>
              <div className="instr__52w-range">
                <span>52W Low {fmtCurrency(info.WeekLow52)}</span>
                <span>High {fmtCurrency(info.WeekHigh52)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
