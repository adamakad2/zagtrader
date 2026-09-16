/**
 * Account.jsx — User profile and settings page
 *
 * Sections:
 *  • Hero strip (avatar + name + email)
 *  • Profile — editable username, email, portfolio name (inline edit mode)
 *  • Cash Balance — read-only display
 *  • Security — 2FA status, password change (visual only for the demo)
 *  • Danger Zone — logout / delete account
 *
 * Props:
 *   portfolio     — { PortfolioName, CashBalance, TotalValue }
 *   userProfile   — { Username, Email, CreatedAt }
 *   onUpdateProfile — fn(username, email)
 *   onUpdatePortfolioName — fn(name)
 *   onNavigate    — fn(screen)
 *   onLogout      — fn()
 */
import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { fmtCurrency, fmtDateLong } from '../data';
import './Account.css';

export default function Account({
  portfolio, userProfile,
  onUpdateProfile, onUpdatePortfolioName,
  onNavigate, onLogout,
}) {
  // Local edit state — mirrors the real values until the user saves
  const [editingProfile,   setEditingProfile]   = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(false);

  const [draftUsername,  setDraftUsername]  = useState(userProfile.Username);
  const [draftEmail,     setDraftEmail]     = useState(userProfile.Email);
  const [draftPortfolio, setDraftPortfolio] = useState(portfolio.PortfolioName);

  // Show a brief success toast after saving
  const [toast, setToast] = useState(null);

  // Keep drafts in sync if parent data changes (e.g. after a save propagates back)
  useEffect(() => { setDraftUsername(userProfile.Username); }, [userProfile.Username]);
  useEffect(() => { setDraftEmail(userProfile.Email);       }, [userProfile.Email]);
  useEffect(() => { setDraftPortfolio(portfolio.PortfolioName); }, [portfolio.PortfolioName]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function saveProfile() {
    onUpdateProfile(draftUsername.trim(), draftEmail.trim());
    setEditingProfile(false);
    showToast('Profile updated');
  }

  function savePortfolio() {
    onUpdatePortfolioName(draftPortfolio.trim());
    setEditingPortfolio(false);
    showToast('Portfolio name updated');
  }

  // Initials for the avatar circle
  const initials = (userProfile.Username || 'U').slice(0,2).toUpperCase();

  return (
    <div className="acct">
      <NavBar activeScreen="account" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="acct__main">
        {/* ── Hero strip ── */}
        <div className="acct__hero">
          <div className="acct__avatar">{initials}</div>
          <div>
            <p className="acct__hero-name">@{userProfile.Username}</p>
            <p className="acct__hero-email">{userProfile.Email}</p>
            <p className="acct__hero-since">Member since {fmtDateLong(userProfile.CreatedAt)}</p>
          </div>
        </div>

        {/* ── Profile section ── */}
        <div className="card acct__section">
          <div className="acct__section-head">
            <p className="acct__section-title">
              <span className="acct__section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </span>
              Profile
            </p>

            {editingProfile ? (
              <div className="acct__edit-toggle">
                <button className="btn btn--ghost btn--sm" onClick={() => { setEditingProfile(false); setDraftUsername(userProfile.Username); setDraftEmail(userProfile.Email); }}>
                  Cancel
                </button>
                <button className="btn btn--navy btn--sm" onClick={saveProfile}>Save changes</button>
              </div>
            ) : (
              <button className="btn btn--ghost btn--sm" onClick={() => setEditingProfile(true)}>Edit</button>
            )}
          </div>

          <div className="acct__field">
            <label className="field-label">Username</label>
            {editingProfile
              ? <input className="field-input" value={draftUsername} onChange={e => setDraftUsername(e.target.value)} />
              : <p style={{ fontSize:'var(--text-base)', fontWeight:600, color:'var(--text-primary)' }}>@{userProfile.Username}</p>
            }
          </div>

          <div className="acct__field">
            <label className="field-label">Email address</label>
            {editingProfile
              ? <input className="field-input" type="email" value={draftEmail} onChange={e => setDraftEmail(e.target.value)} />
              : <p style={{ fontSize:'var(--text-base)', fontWeight:500, color:'var(--text-secondary)' }}>{userProfile.Email}</p>
            }
          </div>
        </div>

        {/* ── Portfolio name section ── */}
        <div className="card acct__section">
          <div className="acct__section-head">
            <p className="acct__section-title">
              <span className="acct__section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/>
                </svg>
              </span>
              Portfolio
            </p>

            {editingPortfolio ? (
              <div className="acct__edit-toggle">
                <button className="btn btn--ghost btn--sm" onClick={() => { setEditingPortfolio(false); setDraftPortfolio(portfolio.PortfolioName); }}>Cancel</button>
                <button className="btn btn--navy btn--sm" onClick={savePortfolio}>Save</button>
              </div>
            ) : (
              <button className="btn btn--ghost btn--sm" onClick={() => setEditingPortfolio(true)}>Edit</button>
            )}
          </div>

          <div className="acct__field">
            <label className="field-label">Portfolio name</label>
            {editingPortfolio
              ? <input className="field-input" value={draftPortfolio} onChange={e => setDraftPortfolio(e.target.value)} />
              : <p style={{ fontSize:'var(--text-base)', fontWeight:600, color:'var(--text-primary)' }}>{portfolio.PortfolioName}</p>
            }
          </div>

          {/* Read-only cash balance */}
          <div className="acct__cash" style={{ marginTop: 16 }}>
            <div>
              <p className="acct__cash-label">Available Cash Balance</p>
              <p style={{ fontSize:'var(--text-xs)', color:'var(--text-subtle)', marginTop:3 }}>Read-only — use Deposit / Withdraw to change</p>
            </div>
            <p className="acct__cash-val">{fmtCurrency(portfolio.CashBalance)}</p>
          </div>
        </div>

        {/* ── Security section ── */}
        <div className="card acct__section">
          <div className="acct__section-head">
            <p className="acct__section-title">
              <span className="acct__section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </span>
              Security
            </p>
          </div>

          {[
            { label:'Two-factor authentication', sub:'Authenticator app enabled', on:true },
            { label:'Email notifications',       sub:'Login alerts and summaries',  on:true },
            { label:'Biometric login',            sub:'Touch ID / Face ID',          on:false },
          ].map(row => (
            <div key={row.label} className="acct__security-row">
              <div className="acct__security-info">
                <div className={`acct__security-dot ${row.on ? 'acct__security-dot--on' : 'acct__security-dot--off'}`} />
                <div>
                  <p className="acct__security-label">{row.label}</p>
                  <p className="acct__security-sub">{row.sub}</p>
                </div>
              </div>
              <button className="btn btn--ghost btn--xs">{row.on ? 'Manage' : 'Enable'}</button>
            </div>
          ))}

          <div className="acct__divider" />
          <button className="btn btn--ghost btn--sm" style={{ width:'100%' }}>
            Change password
          </button>
        </div>

        {/* ── Danger Zone ── */}
        <div className="card acct__section acct__danger" style={{ border:'1.5px solid var(--loss-border)' }}>
          <div className="acct__section-head">
            <p className="acct__section-title acct__danger-section-title" style={{ color:'var(--loss)' }}>
              <span className="acct__section-icon" style={{ background:'var(--loss-bg)', color:'var(--loss)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
              Danger Zone
            </p>
          </div>

          <div className="acct__danger-row" style={{ marginBottom:14 }}>
            <div className="acct__danger-info">
              <p>Sign out of all devices</p>
              <span>Revokes all active sessions</span>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={onLogout}>Sign out</button>
          </div>

          <div className="acct__danger-row">
            <div className="acct__danger-info">
              <p>Delete account</p>
              <span>Permanently removes your portfolio data</span>
            </div>
            <button className="btn btn--danger btn--sm">Delete account</button>
          </div>
        </div>
      </main>

      {/* Success toast */}
      {toast && (
        <div className="acct__toast">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
