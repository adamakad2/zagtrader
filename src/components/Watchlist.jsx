/**
 * Watchlist.jsx — Instruments the user is tracking but may not own
 *
 * Shows two things:
 *  • A search box to add any instrument from the catalog to the watchlist
 *  • A table of currently-watched instruments, with live price/day-change,
 *    a "View" action (opens Instrument Detail), and a remove (star) toggle
 *
 * Props:
 *   watchlist          — array of symbol strings, e.g. ['NVDA', 'AMZN']
 *   holdings           — current holdings array (to show "Owned" tag)
 *   onToggleWatchlist  — fn(symbol) — add or remove a symbol
 *   onViewInstrument   — fn(symbol) — navigate to Instrument Detail
 *   onNavigate         — fn(screen)
 *   onLogout           — fn()
 */
import React, { useState } from 'react';
import NavBar from './NavBar';
import { instrumentCatalog, fmtCurrency } from '../data';
import './Watchlist.css';

export default function Watchlist({ watchlist, holdings, onToggleWatchlist, onViewInstrument, onNavigate, onLogout }) {
  const [search, setSearch] = useState('');

  // Full instrument objects for everything currently on the watchlist
  const watchedInstruments = watchlist
    .map(sym => instrumentCatalog.find(i => i.Symbol === sym))
    .filter(Boolean);

  // Search results for the "add to watchlist" box — excludes symbols
  // already on the watchlist, since those show a remove button instead
  const searchResults = search
    ? instrumentCatalog.filter(i =>
        !watchlist.includes(i.Symbol) &&
        (i.Symbol.toLowerCase().includes(search.toLowerCase()) ||
         i.InstrumentName.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  return (
    <div className="watchlist-page">
      <NavBar activeScreen="watchlist" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="watchlist__main">
        {/* Header */}
        <div className="watchlist__header">
          <div>
            <h1 className="watchlist__title">Watchlist</h1>
            <p className="watchlist__sub">Track instruments you're interested in, without owning them yet</p>
          </div>
        </div>

        {/* Add to watchlist search */}
        <div className="card watchlist__add-card">
          <label className="field-label">Add an instrument to your watchlist</label>
          <div style={{ position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="field-input"
              style={{ paddingLeft: 34 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by symbol or company name…"
            />
          </div>

          {search && (
            <div className="watchlist__search-results">
              {searchResults.length === 0 ? (
                <div className="watchlist__search-empty">
                  {instrumentCatalog.some(i => i.Symbol.toLowerCase() === search.toLowerCase())
                    ? 'Already on your watchlist'
                    : 'No matching instruments found'}
                </div>
              ) : (
                searchResults.map(inst => (
                  <button
                    key={inst.Symbol}
                    className="watchlist__search-result"
                    onClick={() => { onToggleWatchlist(inst.Symbol); setSearch(''); }}
                  >
                    <div>
                      <div className="watchlist__result-symbol">{inst.Symbol}</div>
                      <div className="watchlist__result-name">{inst.InstrumentName}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="watchlist__result-price">{fmtCurrency(inst.CurrentPrice)}</span>
                      <span className="watchlist__add-badge">+ Add</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Watched instruments table */}
        <div className="card watchlist__table-card">
          {watchedInstruments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.6z" />
                </svg>
              </div>
              <p className="empty-state__title">Your watchlist is empty</p>
              <p className="empty-state__body">Search above to start tracking instruments</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="align-left">Instrument</th>
                  <th className="align-left hide-mobile">Sector</th>
                  <th className="align-right">Price</th>
                  <th className="align-right hide-mobile">Today</th>
                  <th className="align-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchedInstruments.map(inst => {
                  const owned = holdings.some(h => h.Symbol === inst.Symbol);
                  const dayPos = inst.DayChange >= 0;
                  return (
                    <tr key={inst.Symbol}>
                      <td className="align-left">
                        <button className="watchlist__row-symbol-btn" onClick={() => onViewInstrument(inst.Symbol)}>
                          <span className="mono" style={{ fontWeight: 700 }}>{inst.Symbol}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{inst.InstrumentName}</span>
                          {owned && <span className="tag" style={{ marginLeft: 6 }}>Owned</span>}
                        </button>
                      </td>
                      <td className="align-left hide-mobile">
                        <span className="tag">{inst.Sector}</span>
                      </td>
                      <td className="align-right mono">{fmtCurrency(inst.CurrentPrice)}</td>
                      <td className="align-right hide-mobile">
                        <span className={`perf-badge ${dayPos ? 'perf-badge--gain' : 'perf-badge--loss'}`}>
                          {dayPos ? '▲' : '▼'} {Math.abs(inst.DayChangePct).toFixed(2)}%
                        </span>
                      </td>
                      <td className="align-right">
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="btn btn--ghost btn--xs" onClick={() => onViewInstrument(inst.Symbol)}>
                            View
                          </button>
                          <button
                            className="watchlist__remove-btn"
                            onClick={() => onToggleWatchlist(inst.Symbol)}
                            title="Remove from watchlist"
                            aria-label={`Remove ${inst.Symbol} from watchlist`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.6z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
