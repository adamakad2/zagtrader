/**
 * Dashboard.jsx — Main portfolio overview screen
 *
 * Sections (top to bottom):
 *  1. NavBar
 *  2. Hero card — portfolio name, total value, cash balance, quick actions
 *  3. 4-stat summary row
 *  4. Charts row — allocation donut + portfolio value over time
 *  5. Holdings table — clickable rows → Instrument Detail
 *  6. Footer note
 */
import React from 'react';
import NavBar from './NavBar';
import { AllocationDonut, PortfolioLineChart } from './Charts';
import { fmtCurrency, computeAllocation } from '../data';
import './Dashboard.css';

export default function Dashboard({
  portfolio,    // { PortfolioName, CashBalance, TotalValue }
  holdings,     // array of Holding objects
  onOpenModal,  // fn(modalType) — opens the correct modal
  onNavigate,   // fn(screen) — changes top-level screen
  onViewInstrument, // fn(symbol) — navigates to instrument detail
  onLogout,
}) {
  // Compute totals from the holdings array
  const totalGain = holdings.reduce((sum, h) => sum + h.GainLoss, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.Quantity * h.AvgCostPrice, 0);
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  // Best and worst performers by GainLossPct
  const sorted   = [...holdings].sort((a, b) => b.GainLossPct - a.GainLossPct);
  const best     = sorted[0]  ?? null;
  const worst    = sorted[sorted.length - 1] ?? null;

  // Allocation slices for the donut chart (including Cash)
  const allocationSlices = computeAllocation(holdings, portfolio.CashBalance, portfolio.TotalValue);

  return (
    <div className="dashboard">
      <NavBar activeScreen="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="dashboard__main">
        {/* ── 1. Hero card ── */}
        <div className="hero-card">
          <div className="dashboard__hero-inner">
            {/* Left: name, total value, unrealised G/L badge */}
            <div className="dashboard__hero-left">
              <p className="dashboard__portfolio-label">{portfolio.PortfolioName}</p>
              <p className="dashboard__total-value">{fmtCurrency(portfolio.TotalValue)}</p>
              {/* Gain/loss badge */}
              <GainLossRow value={totalGain} pct={totalGainPct} light />
            </div>

            {/* Right: cash balance + quick-action buttons */}
            <div className="dashboard__hero-right">
              <div>
                <p className="dashboard__cash-label">Cash Balance</p>
                <p className="dashboard__cash-value">{fmtCurrency(portfolio.CashBalance)}</p>
              </div>
              <div className="dashboard__actions">
                <button className="dashboard__action-btn dashboard__action-btn--deposit"  onClick={() => onOpenModal('deposit')}>Deposit</button>
                <button className="dashboard__action-btn dashboard__action-btn--withdraw" onClick={() => onOpenModal('withdraw')}>Withdraw</button>
                <button className="dashboard__action-btn dashboard__action-btn--buy"      onClick={() => onOpenModal('buy')}>Buy</button>
                <button className="dashboard__action-btn dashboard__action-btn--sell"     onClick={() => onOpenModal('sell')}>Sell</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Summary stats ── */}
        <div className="dashboard__stats">
          <div className="stat-card">
            <p className="stat-card__label">Holdings Value</p>
            <p className="stat-card__value mono">{fmtCurrency(holdings.reduce((s, h) => s + h.MarketValue, 0))}</p>
            <p className="stat-card__sub">{holdings.length} position{holdings.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="stat-card">
            <p className="stat-card__label">Total Gain / Loss</p>
            <p className="stat-card__value mono" style={{ color: totalGain >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
              {totalGain >= 0 ? '+' : ''}{fmtCurrency(totalGain)}
            </p>
            <p className="stat-card__sub" style={{ color: totalGain >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
              {totalGainPct >= 0 ? '+' : ''}{totalGainPct.toFixed(2)}% all-time
            </p>
          </div>

          {/* Best performer — clicking navigates to Instrument Detail */}
          <div
            className={`stat-card${best ? ' stat-card--link' : ''}`}
            onClick={() => best && onViewInstrument(best.Symbol)}
          >
            <p className="stat-card__label">Best Performer</p>
            <p className="stat-card__value mono" style={{ color: 'var(--gain)' }}>{best ? best.Symbol : '—'}</p>
            <p className="stat-card__sub" style={{ color: 'var(--gain)' }}>
              {best ? `+${best.GainLossPct.toFixed(1)}% · +${fmtCurrency(best.GainLoss)}` : 'No holdings'}
            </p>
          </div>

          {/* Worst performer */}
          <div
            className={`stat-card${worst && worst !== best ? ' stat-card--link' : ''}`}
            onClick={() => worst && worst !== best && onViewInstrument(worst.Symbol)}
          >
            <p className="stat-card__label">Worst Performer</p>
            <p className="stat-card__value mono" style={{ color: worst && worst !== best ? 'var(--loss)' : 'var(--text-primary)' }}>
              {worst && worst !== best ? worst.Symbol : '—'}
            </p>
            <p className="stat-card__sub" style={{ color: worst && worst !== best ? 'var(--loss)' : 'var(--text-subtle)' }}>
              {worst && worst !== best ? `${worst.GainLossPct.toFixed(1)}% · ${fmtCurrency(worst.GainLoss)}` : 'No holdings'}
            </p>
          </div>
        </div>

        {/* ── 3. Charts ── */}
        <div className="dashboard__charts">
          {/* Allocation donut */}
          <div className="card dashboard__chart-card">
            <h3 className="section-title">Portfolio Allocation</h3>
            <AllocationDonut slices={allocationSlices} totalValue={portfolio.TotalValue} />
          </div>

          {/* Value-over-time line chart */}
          <div className="card dashboard__chart-card">
            <h3 className="section-title">Portfolio Value Over Time</h3>
            <PortfolioLineChart height={220} />
          </div>
        </div>

        {/* ── 4. Holdings table ── */}
        <div className="card dashboard__holdings">
          <div className="dashboard__holdings-header">
            <h3 className="section-title">Holdings</h3>
            <div className="dashboard__holdings-actions">
              <button className="btn btn--ghost btn--sm" onClick={() => onNavigate('performance')}>
                {/* Trend icon */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                Performance
              </button>
              <button className="btn btn--navy btn--sm" onClick={() => onOpenModal('buy')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                Add Position
              </button>
            </div>
          </div>

          {holdings.length === 0 ? (
            /* Empty state when no holdings exist */
            <div className="empty-state">
              <div className="empty-state__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/>
                </svg>
              </div>
              <p className="empty-state__title">No holdings yet</p>
              <p className="empty-state__body">Click "Buy" to purchase your first stock</p>
              <button className="btn btn--navy" style={{ marginTop:16 }} onClick={() => onOpenModal('buy')}>
                Buy your first stock
              </button>
            </div>
          ) : (
            <div className="dashboard__holdings-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="align-left">Symbol</th>
                    <th className="align-left">Company</th>
                    <th className="align-right">Qty</th>
                    <th className="align-right">Avg Cost</th>
                    <th className="align-right">Current Price</th>
                    <th className="align-right">Market Value</th>
                    <th className="align-right">Gain / Loss</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map(h => {
                    const pos = h.GainLoss >= 0;
                    return (
                      /* Clicking a row opens the instrument detail page */
                      <tr
                        key={h.Symbol}
                        style={{ cursor:'pointer' }}
                        onClick={() => onViewInstrument(h.Symbol)}
                      >
                        <td className="align-left">
                          <div className="holding-symbol">
                            <div className="holding-symbol__icon">{h.Symbol.slice(0,2)}</div>
                            <div>
                              <div className="holding-symbol__ticker">{h.Symbol}</div>
                              <div className="holding-symbol__sector">{h.Sector}</div>
                            </div>
                          </div>
                        </td>
                        <td className="align-left" style={{ fontWeight:500, fontSize:'var(--text-base)' }}>{h.InstrumentName}</td>
                        <td className="align-right mono" style={{ fontWeight:600 }}>{h.Quantity}</td>
                        <td className="align-right mono" style={{ color:'var(--text-muted)' }}>{fmtCurrency(h.AvgCostPrice)}</td>
                        <td className="align-right mono" style={{ fontWeight:600 }}>{fmtCurrency(h.CurrentPrice)}</td>
                        <td className="align-right mono" style={{ fontWeight:700 }}>{fmtCurrency(h.MarketValue)}</td>
                        <td className="align-right">
                          <div className="holding-gl">
                            <span className="holding-gl__value" style={{ color: pos ? 'var(--gain)' : 'var(--loss)' }}>
                              {pos ? '+' : ''}{fmtCurrency(h.GainLoss)}
                            </span>
                            <span className={`perf-badge ${pos ? 'perf-badge--gain' : 'perf-badge--loss'}`}>
                              {pos ? '▲' : '▼'} {Math.abs(h.GainLossPct).toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        {/* Stop propagation so row click doesn't also fire when clicking buttons */}
                        <td onClick={e => e.stopPropagation()}>
                          <div className="holding-row-btns">
                            <button className="btn btn--success btn--xs" onClick={() => onOpenModal('buy')}>Buy</button>
                            <button className="btn btn--danger  btn--xs" onClick={() => onOpenModal('sell')}>Sell</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Totals footer row */}
                <tfoot className="dashboard__holdings-footer">
                  <tr>
                    <td colSpan={2}>Total Holdings</td>
                    <td className="align-right mono">{holdings.reduce((s, h) => s + h.Quantity, 0)} shares</td>
                    <td colSpan={2}></td>
                    <td className="align-right mono">{fmtCurrency(holdings.reduce((s, h) => s + h.MarketValue, 0))}</td>
                    <td className="align-right">
                      <div className="holding-gl">
                        <span className="holding-gl__value mono" style={{ color: totalGain >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                          {totalGain >= 0 ? '+' : ''}{fmtCurrency(totalGain)}
                        </span>
                        <span className={`perf-badge ${totalGain >= 0 ? 'perf-badge--gain' : 'perf-badge--loss'}`}>
                          {totalGain >= 0 ? '▲' : '▼'} {Math.abs(totalGainPct).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8, paddingBottom:16 }}>
          <p style={{ fontSize:'var(--text-xs)', color:'var(--text-subtle)' }}>
            Last updated: {new Date().toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
          </p>
          <p style={{ fontSize:'var(--text-xs)', color:'var(--text-subtle)' }}>
            Prices delayed ~15 min · Not financial advice · Zagtrader Inc. © 2025
          </p>
        </div>
      </main>
    </div>
  );
}

/**
 * GainLossRow — small inline component showing monetary change + badge.
 * Props:
 *   value — number (positive = gain, negative = loss)
 *   pct   — number (percentage)
 *   light — bool, uses lighter colours for dark-background contexts
 */
function GainLossRow({ value, pct, light }) {
  const pos = value >= 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span
        className="mono"
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: light
            ? (pos ? '#4ADE80' : '#F87171')
            : (pos ? 'var(--gain)' : 'var(--loss)'),
        }}
      >
        {pos ? '+' : ''}{fmtCurrency(value)}
      </span>
      <span
        className="perf-badge"
        style={{
          background: light
            ? (pos ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)')
            : (pos ? 'var(--gain-bg)' : 'var(--loss-bg)'),
          color: light
            ? (pos ? '#4ADE80' : '#F87171')
            : (pos ? 'var(--gain)' : 'var(--loss)'),
        }}
      >
        {pos ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
      </span>
    </div>
  );
}
