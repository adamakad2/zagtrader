/**
 * TransactionHistory.jsx — Ledger of all portfolio activity
 *
 * Features:
 *  • Filter by transaction type (All / Buys / Sells / Deposits / Withdrawals)
 *  • Sort ascending or descending by TransactionDate
 *  • Free-text search by Symbol
 *  • Empty state when no results match the current filter/search
 *
 * Props:
 *   transactions — full transactions array
 *   onNavigate   — fn(screen) — for NavBar links
 *   onLogout     — fn()
 */
import React, { useState } from 'react';
import NavBar from './NavBar';
import { fmtCurrency, fmtDate } from '../data';
import './TransactionHistory.css';

// All filter options
const FILTERS = ['ALL', 'BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL'];

// Mapping from TransactionType → badge CSS class and display label
const BADGE_INFO = {
  BUY:        { cls: 'tx-badge--buy',        label: 'BUY'  },
  SELL:       { cls: 'tx-badge--sell',       label: 'SELL' },
  DEPOSIT:    { cls: 'tx-badge--deposit',    label: 'DEP'  },
  WITHDRAWAL: { cls: 'tx-badge--withdrawal', label: 'WITH' },
};

// Human-readable filter tab labels
const FILTER_LABELS = {
  ALL: 'All', BUY: 'Buys', SELL: 'Sells',
  DEPOSIT: 'Deposits', WITHDRAWAL: 'Withdrawals',
};

export default function TransactionHistory({ transactions, onNavigate, onLogout }) {
  const [filter,  setFilter]  = useState('ALL');   // active type filter
  const [sortDir, setSortDir] = useState('desc');  // 'asc' or 'desc'
  const [search,  setSearch]  = useState('');      // symbol search string

  // Build the filtered + sorted list
  const displayed = transactions
    .filter(t => filter === 'ALL' || t.TransactionType === filter)
    .filter(t =>
      search === '' ||
      (t.Symbol && t.Symbol.toLowerCase().includes(search.toLowerCase())) ||
      t.TransactionType.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const diff = new Date(a.TransactionDate) - new Date(b.TransactionDate);
      return sortDir === 'desc' ? -diff : diff;
    });

  // Pre-compute summary totals for the stat cards
  const sumByType = type => transactions.filter(t => t.TransactionType === type).reduce((s, t) => s + t.TotalAmount, 0);

  return (
    <div className="txh">
      <NavBar activeScreen="history" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="txh__main">
        {/* Page header */}
        <div className="txh__header">
          <div>
            <h1 className="txh__title">Transaction History</h1>
            <p className="txh__sub">Complete ledger of all portfolio activity</p>
          </div>

          <div className="txh__controls">
            {/* Symbol search */}
            <div className="txh__search">
              <svg className="txh__search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                className="field-input txh__search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search symbol…"
              />
            </div>

            {/* Date sort toggle */}
            <button className="txh__sort" onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sortDir === 'desc'
                  ? <><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></>
                  : <><path d="M10 6h4"/><path d="M7 12h10"/><path d="M3 18h18"/></>
                }
              </svg>
              {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
            </button>
          </div>
        </div>

        {/* Summary stat cards */}
        <div className="txh__stats">
          <div className="stat-card">
            <p className="stat-card__label">Total Deposits</p>
            <p className="stat-card__value mono" style={{ color:'var(--info)' }}>{fmtCurrency(sumByType('DEPOSIT'))}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">Total Withdrawals</p>
            <p className="stat-card__value mono" style={{ color:'var(--orange)' }}>{fmtCurrency(sumByType('WITHDRAWAL'))}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">Total Bought</p>
            <p className="stat-card__value mono" style={{ color:'var(--gain)' }}>{fmtCurrency(sumByType('BUY'))}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">Total Sold</p>
            <p className="stat-card__value mono" style={{ color:'var(--loss)' }}>{fmtCurrency(sumByType('SELL'))}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="txh__filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`txh__filter${filter === f ? ' txh__filter--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card txh__table">
          {displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                </svg>
              </div>
              <p className="empty-state__title">No transactions found</p>
              <p className="empty-state__body">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="txh__scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="align-left">Type</th>
                    <th className="align-left">Symbol</th>
                    <th className="align-right">Quantity</th>
                    <th className="align-right">Price / Unit</th>
                    <th className="align-right">Total Amount</th>
                    <th className="align-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(tx => {
                    const badge = BADGE_INFO[tx.TransactionType];
                    // For cash flows: positive (green) for deposits/sells, negative (red) for buys/withdrawals
                    const amtColor = (tx.TransactionType === 'DEPOSIT' || tx.TransactionType === 'SELL')
                      ? 'var(--gain)' : 'var(--loss)';
                    const amtPrefix = (tx.TransactionType === 'DEPOSIT' || tx.TransactionType === 'SELL') ? '+' : '-';

                    return (
                      <tr key={tx.id}>
                        <td className="align-left">
                          <span className={`tx-badge ${badge.cls}`}>{badge.label}</span>
                        </td>
                        <td className="align-left">
                          {tx.Symbol
                            ? <span className="mono" style={{ fontWeight:700, fontSize:'var(--text-base)' }}>{tx.Symbol}</span>
                            : <span style={{ color:'var(--text-subtle)' }}>—</span>
                          }
                        </td>
                        <td className="align-right">
                          {tx.Quantity !== null
                            ? <span className="mono" style={{ fontWeight:600 }}>{tx.Quantity.toLocaleString()}</span>
                            : <span style={{ color:'var(--text-subtle)' }}>—</span>
                          }
                        </td>
                        <td className="align-right">
                          {tx.PricePerUnit !== null
                            ? <span className="mono">{fmtCurrency(tx.PricePerUnit)}</span>
                            : <span style={{ color:'var(--text-subtle)' }}>—</span>
                          }
                        </td>
                        <td className="align-right">
                          <span className="mono" style={{ fontWeight:700, color: amtColor }}>
                            {amtPrefix}{fmtCurrency(tx.TotalAmount)}
                          </span>
                        </td>
                        <td className="align-right">
                          <span style={{ fontSize:'var(--text-sm)', fontWeight:500, color:'var(--text-muted)' }}>
                            {fmtDate(tx.TransactionDate)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="txh__footer">
          {displayed.length} transaction{displayed.length !== 1 ? 's' : ''} ·
          Prices shown are historical execution prices
        </p>
      </main>
    </div>
  );
}
