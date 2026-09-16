/**
 * BuySellModal.jsx — Place a market Buy or Sell order
 *
 * Flow:
 *  1. User searches for an instrument (or a pre-filled symbol is shown)
 *  2. User selects an instrument from the results list
 *  3. User enters a quantity
 *  4. Total cost / proceeds is calculated live
 *  5. User clicks Confirm — parent callback fires, modal closes
 *
 * Props:
 *   mode            — 'buy' | 'sell'
 *   holdings        — current holdings array (to show owned qty + sell validation)
 *   prefilledSymbol — optional symbol string (set when opening from Instrument Detail)
 *   onClose         — fn() — close the modal
 *   onConfirm       — fn(symbol, qty, price, type) — execute the trade
 */
import React, { useState } from 'react';
import { instrumentCatalog, fmtCurrency } from '../data';
import './BuySellModal.css';

export default function BuySellModal({ mode, holdings, prefilledSymbol, onClose, onConfirm }) {
  const isBuy = mode === 'buy';

  // Find the pre-filled instrument from the catalog (if any)
  const prefilledInst = prefilledSymbol
    ? instrumentCatalog.find(i => i.Symbol === prefilledSymbol) ?? null
    : null;

  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(prefilledInst); // currently chosen instrument
  const [quantity, setQuantity] = useState('');            // qty string from input
  const [loading,  setLoading]  = useState(false);         // submit spinner

  // Filter catalog by the search string
  const results = instrumentCatalog.filter(i =>
    i.Symbol.toLowerCase().includes(search.toLowerCase()) ||
    i.InstrumentName.toLowerCase().includes(search.toLowerCase())
  );

  // In Sell mode only show instruments the user actually owns
  const displayResults = isBuy ? results : results.filter(i => holdings.some(h => h.Symbol === i.Symbol));

  // How many shares of the selected instrument does the user own?
  const ownedHolding = selected ? holdings.find(h => h.Symbol === selected.Symbol) : null;
  const ownedQty     = ownedHolding?.Quantity ?? 0;

  // Numeric quantity and validation
  const qty      = parseFloat(quantity) || 0;
  const totalAmt = selected ? qty * selected.CurrentPrice : 0;

  // Validate: qty > 0 and, for sells, qty ≤ owned quantity
  const isValid = selected && qty > 0 && (isBuy || qty <= ownedQty);

  /** Handle the Confirm button click */
  function handleConfirm() {
    if (!isValid) return;
    setLoading(true);
    setTimeout(() => {
      onConfirm(selected.Symbol, qty, selected.CurrentPrice, isBuy ? 'BUY' : 'SELL');
      onClose();
    }, 600);
  }

  const accentColor = isBuy ? 'var(--gain)' : 'var(--loss)';

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box bsm">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__info">
            <div className="bsm-header-icon" style={{ background: accentColor }}>
              {isBuy ? 'B' : 'S'}
            </div>
            <div>
              <p className="modal-header__title">{isBuy ? 'Buy Stock' : 'Sell Stock'}</p>
              <p className="modal-header__sub">Place a market order</p>
            </div>
          </div>
          <button className="modal-header__close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* ── Instrument selector ── */}
          <div>
            <label className="field-label">{isBuy ? 'Search instrument' : 'Select position to sell'}</label>

            {selected ? (
              /* Show selected instrument row — clicking it clears the selection */
              <button className="bsm-selected" onClick={() => { setSelected(null); setQuantity(''); }}>
                <div>
                  <div className="bsm-result__symbol">{selected.Symbol}</div>
                  <div className="bsm-result__name">{selected.InstrumentName}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div className="bsm-result__right">
                    <div className="bsm-result__price">{fmtCurrency(selected.CurrentPrice)}</div>
                    {ownedHolding && <div className="bsm-result__owned">{ownedQty} owned</div>}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </div>
              </button>
            ) : (
              /* Show search input and results list */
              <>
                <div style={{ position:'relative' }}>
                  <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-subtle)', pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input
                    autoFocus
                    className="field-input"
                    style={{ paddingLeft: 34 }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={isBuy ? 'e.g. AAPL or Apple' : 'Search your positions…'}
                  />
                </div>

                <div className="bsm-results">
                  {displayResults.length === 0 ? (
                    <div style={{ padding:'24px', textAlign:'center', color:'var(--text-subtle)', fontSize:'var(--text-sm)' }}>
                      No instruments found
                    </div>
                  ) : (
                    displayResults.map(inst => {
                      const pos = holdings.find(h => h.Symbol === inst.Symbol);
                      return (
                        <button
                          key={inst.Symbol}
                          className="bsm-result"
                          onClick={() => { setSelected(inst); setSearch(''); }}
                        >
                          <div className="bsm-result__left">
                            <div className="bsm-result__symbol">{inst.Symbol}</div>
                            <div className="bsm-result__name">{inst.InstrumentName}</div>
                          </div>
                          <div className="bsm-result__right">
                            <div className="bsm-result__price">{fmtCurrency(inst.CurrentPrice)}</div>
                            {pos && <div className="bsm-result__owned">{pos.Quantity} owned</div>}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Quantity + price (only shown after instrument selected) ── */}
          {selected && (
            <>
              {/* Quantity input */}
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <label className="field-label" style={{ marginBottom:0 }}>Quantity (shares)</label>
                  {/* "Sell all" shortcut in sell mode */}
                  {!isBuy && ownedQty > 0 && (
                    <button className="bsm-sell-all" onClick={() => setQuantity(String(ownedQty))}>
                      Sell all {ownedQty}
                    </button>
                  )}
                </div>
                <input
                  className={`field-input field-input--mono${!isBuy && qty > ownedQty ? ' field-input--error' : ''}`}
                  type="number"
                  min="1"
                  max={!isBuy ? ownedQty : undefined}
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="0"
                />
                {/* Warning when trying to sell more than owned */}
                {!isBuy && qty > ownedQty && (
                  <p style={{ marginTop:6, fontSize:'var(--text-xs)', color:'var(--loss)', fontWeight:500 }}>
                    You only own {ownedQty} shares of {selected.Symbol}
                  </p>
                )}
              </div>

              {/* Market price display */}
              <div>
                <label className="field-label">Price per share</label>
                <div
                  className="field-input field-input--mono"
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', color:'var(--text-muted)' }}
                >
                  <span>{fmtCurrency(selected.CurrentPrice)}</span>
                  <span style={{ fontSize:'var(--text-xs)', fontWeight:600, background:'var(--blue-tint-2)', color:'var(--blue-accent)', padding:'2px 8px', borderRadius:'var(--radius-full)' }}>
                    Market
                  </span>
                </div>
              </div>

              {/* Live total calculation */}
              <div
                className="bsm-total"
                style={{
                  background: isBuy ? 'var(--gain-bg)'  : 'var(--loss-bg)',
                  border: `1px solid ${isBuy ? 'var(--gain-border)' : 'var(--loss-border)'}`,
                }}
              >
                <span className="bsm-total__label" style={{ color: isBuy ? 'var(--gain)' : 'var(--loss)' }}>
                  {isBuy ? 'Total cost' : 'Total proceeds'}
                </span>
                <span className="bsm-total__amount" style={{ color: isBuy ? 'var(--gain)' : 'var(--loss)' }}>
                  {qty > 0 ? fmtCurrency(totalAmt) : '—'}
                </span>
              </div>

              {/* Confirm button */}
              <button
                className="btn"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: !isValid || loading ? 'var(--text-placeholder)' : accentColor,
                  color: 'white',
                  cursor: !isValid ? 'not-allowed' : 'pointer',
                  fontSize: 'var(--text-base)',
                  fontWeight: 700,
                }}
                disabled={!isValid || loading}
                onClick={handleConfirm}
              >
                {loading
                  ? <><span className="spinner" /> Processing…</>
                  : `Confirm ${isBuy ? 'Purchase' : 'Sale'}${qty > 0 ? ` · ${fmtCurrency(totalAmt)}` : ''}`
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
