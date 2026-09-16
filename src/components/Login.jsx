/**
 * Login.jsx — Login / Sign-Up screen
 *
 * Shows a centered card on a navy-gradient background.
 * Toggles between "sign in" and "create account" modes.
 * Calls props.onLogin() after a short simulated loading delay.
 */
import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import './Login.css';

export default function Login({ onLogin }) {
  // 'login' or 'signup' — controls which form fields are shown
  const [mode, setMode] = useState('login');

  // Controlled inputs
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Track the submit-button loading state
  const [loading, setLoading]   = useState(false);
  // Inline validation error shown under the date-of-birth field
  const [ageError, setAgeError] = useState('');

  // The latest date someone could pick and still be 18+ today —
  // used as the <input type="date"> max attribute for a nicer picker,
  // but the real enforcement happens in handleSubmit below.
  const latestValidDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  })();

  /** Returns the person's age in whole years for a given YYYY-MM-DD string */
  function calculateAge(dobString) {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  /** Simulate an auth request, then call the parent callback */
  function handleSubmit(e) {
    e.preventDefault();
    setAgeError('');

    if (mode === 'signup') {
      if (!dateOfBirth) {
        setAgeError('Date of birth is required.');
        return;
      }
      const dob = new Date(dateOfBirth);
      if (dob > new Date()) {
        setAgeError('Date of birth cannot be in the future.');
        return;
      }
      if (calculateAge(dateOfBirth) < 18) {
        setAgeError('You must be at least 18 years old to create a Zagtrader account.');
        return;
      }
    }

    setLoading(true);
    // In a real app this would hit an auth API endpoint
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 700);
  }

  return (
    <div className="login-page">
      {/* ── Top bar ── */}
      <header className="login-topbar">
        <div className="login-logo">
          <div className="login-logo__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 7 22 7 22 13"                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="login-logo__name">Zagtrader</span>
        </div>

        {/* Toggle between login and signup */}
        <div className="login-topbar__right">
          <ThemeToggle />
          <p className="login-topbar__toggle">
            {mode === 'login' ? (
              <>New to Zagtrader?{' '}
                <button className="login-topbar__toggle-btn" onClick={() => setMode('signup')}>
                  Create an account
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button className="login-topbar__toggle-btn" onClick={() => setMode('login')}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </header>

      {/* ── Centered form card ── */}
      <main className="login-content">
        <div className="login-wrapper">
          <div className="login-card">
            <h1 className="login-card__heading">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="login-card__sub">
              {mode === 'login'
                ? 'Sign in to your Zagtrader portfolio'
                : 'Start tracking your investments today'}
            </p>

            <form onSubmit={handleSubmit}>
              {/* Full name — signup only */}
              {mode === 'signup' && (
                <div className="login-field">
                  <label className="field-label">Full name</label>
                  <input
                    className="field-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    required
                  />
                </div>
              )}

              {/* Date of birth — signup only. Zagtrader requires account
                  holders to be 18+; enforced in handleSubmit above. */}
              {mode === 'signup' && (
                <div className="login-field">
                  <label className="field-label">Date of birth</label>
                  <input
                    className={`field-input${ageError ? ' field-input--error' : ''}`}
                    type="date"
                    value={dateOfBirth}
                    onChange={e => { setDateOfBirth(e.target.value); setAgeError(''); }}
                    max={latestValidDob}
                    required
                  />
                  <p className="login-field__hint">You must be 18 or older to create an account.</p>
                  {ageError && <p className="login-field__error">{ageError}</p>}
                </div>
              )}

              {/* Email */}
              <div className="login-field">
                <label className="field-label">Email address</label>
                <input
                  className="field-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="login-field">
                <div className="login-field__row">
                  <label className="field-label" style={{ marginBottom: 0 }}>Password</label>
                  {mode === 'login' && (
                    <button type="button" className="login-field__forgot">
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  className="field-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ marginTop: 6 }}
                />
              </div>

              {/* Terms checkbox — signup only */}
              {mode === 'signup' && (
                <div className="login-terms">
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms" className="login-terms__text">
                    I agree to the{' '}
                    <span className="login-terms__link">Terms of Service</span>
                    {' '}and{' '}
                    <span className="login-terms__link">Privacy Policy</span>
                  </label>
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="login-submit" disabled={loading}>
                {loading
                  ? <><span className="spinner" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                  : (mode === 'login' ? 'Sign in' : 'Create account')
                }
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider__line" />
              <span className="login-divider__text">or continue with</span>
              <div className="login-divider__line" />
            </div>

            {/* OAuth buttons */}
            <div className="login-social">
              {/* Google */}
              <button type="button" className="login-social__btn">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              {/* Apple */}
              <button type="button" className="login-social__btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
            </div>
          </div>

          <p className="login-footer">
            Protected by 256-bit AES encryption · SIPC insured up to $500,000
          </p>
        </div>
      </main>
    </div>
  );
}
