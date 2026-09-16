/**
 * DepositWithdrawModal.jsx — Add or remove cash from the portfolio
 *
 * Shows the current cash balance, an amount input, and quick-select chips.
 * In Withdraw mode the Confirm button is disabled when the amount exceeds
 * the available cash balance.
 *
 * Props:
 *   mode        — 'deposit' | 'withdraw'
 *   cashBalance — current CashBalance (number)
 *   onClose     — fn() — close the modal
 *   onConfirm   — fn(amount, type) — type is 'DEPOSIT' or 'WITHDRAWAL'
 */
import React, { useState } from 'react';
import { fmtCurrency } from '../data';
import './DepositWithdrawModal.css';

// Quick-select preset amounts
const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

export default function DepositWithdrawModal({ mode, cashBalance, onClose, onConfirm }) {
  const isWithdraw = mode === 'withdraw';

  const [amount,  setAmount]  = useState('');
  const [loading, setLoading] = useState(false);

  const numAmount = parseFloat(amount) || 0;

  // A withdrawal is invalid if it would exceed the available balance
  const exceedsBalance = isWithdraw && numAmount > cashBalance;
  const isValid = numAmount > 0 && !exceedsBalance;

  function handleConfirm() {
    if (!isValid) return;
    setLoading(true);
    setTimeout(() => {
      onConfirm(numAmount, isWithdraw ? 'WITHDRAWAL' : 'DEPOSIT');
      onClose();
    }, 600);
  }

  // Header icon colour: navy for withdraw, blue-accent for deposit
  const iconBg = isWithdraw ? 'var(--navy)' : 'var(--blue-accent)';

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box dwm">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__info">
            <div className="bsm-header-icon" style={{ background: iconBg }}>
              {/* Upload/download arrow icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isWithdraw
                  ? <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>
                  : <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>
                }
              </svg>
            </div>
            <div>
              <p className="modal-header__title">{isWithdraw ? 'Withdraw Cash' : 'Deposit Cash'}</p>
              <p className="modal-header__sub">ACH transfer · 1–3 business days</p>
            </div>
          </div>
          <button className="modal-header__close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Current balance display */}
          <div className="dwm-balance">
            <p className="dwm-balance__label">Available Cash Balance</p>
            <p className="dwm-balance__amount">{fmtCurrency(cashBalance)}</p>

            {/* "After withdrawal" preview */}
            {isWithdraw && numAmount > 0 && !exceedsBalance && (
              <p className="dwm-balance__after">
                After withdrawal:
                <span className="dwm-balance__after-val">{fmtCurrency(cashBalance - numAmount)}</span>
              </p>
            )}
          </div>

          {/* Amount input */}
          <div>
            <label className="field-label">Amount (USD)</label>
            <div className="dwm-amount-wrap">
              <span className="dwm-amount-prefix">$</span>
              <input
                autoFocus
                className={`field-input dwm-amount-input${exceedsBalance ? ' field-input--error' : ''}`}
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {exceedsBalance && (
              <p style={{ marginTop:6, fontSize:'var(--text-xs)', color:'var(--loss)', fontWeight:500, display:'flex', alignItems:'center', gap:5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Amount exceeds available cash balance
              </p>
            )}
          </div>

          {/* Quick amount chips */}
          <div>
            <p className="field-label">Quick amounts</p>
            <div className="dwm-quick">
              {QUICK_AMOUNTS.map(a => (
                <button
                  key={a}
                  className={`dwm-quick__btn${amount === String(a) ? ' dwm-quick__btn--active' : ''}`}
                  onClick={() => setAmount(String(a))}
                >
                  ${a >= 1000 ? `${a / 1000}k` : a}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm button */}
          <button
            className="btn"
            style={{
              width: '100%',
              padding: '14px',
              background: !isValid || loading ? 'var(--text-placeholder)' : iconBg,
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
              : `Confirm ${isWithdraw ? 'Withdrawal' : 'Deposit'}${numAmount > 0 ? ` · ${fmtCurrency(numAmount)}` : ''}`
            }
          </button>
        </div>
      </div>
    </div>
  );
}
