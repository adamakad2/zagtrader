/**
 * NavBar.jsx — Shared top navigation bar
 *
 * Renders the sticky header used by every authenticated page.
 * Accepts the current activeScreen so it can highlight the
 * matching link. Calls onNavigate(screen) when a link is clicked.
 */
import React from 'react';
import ThemeToggle from './ThemeToggle';
import './NavBar.css';

// Navigation items shown in the left section of the bar.
// 'screen' maps to the App-level screen state value.
const NAV_LINKS = [
  {
    screen: 'dashboard',
    label:  'Dashboard',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    screen: 'performance',
    label:  'Performance',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    screen: 'history',
    label:  'History',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M8 2v4M16 2v4M3 10h18"/>
      </svg>
    ),
  },
];

export default function NavBar({ activeScreen, onNavigate, onLogout }) {
  // The instrument detail page is logically under Dashboard,
  // so highlight Dashboard when on that screen.
  const effectiveActive = activeScreen === 'instrument' ? 'dashboard' : activeScreen;

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Left: logo */}
        <button className="navbar__logo" onClick={() => onNavigate('dashboard')}>
          <div className="navbar__logo-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 7 22 7 22 13"               stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="navbar__logo-name">Zagtrader</span>
        </button>

        {/* Centre: primary nav links */}
        <div className="navbar__links">
          {NAV_LINKS.map(({ screen, label, icon }) => (
            <button
              key={screen}
              className={`navbar__link${effectiveActive === screen ? ' navbar__link--active' : ''}`}
              onClick={() => onNavigate(screen)}
            >
              {icon}
              <span className="navbar__link-label">{label}</span>
            </button>
          ))}
        </div>

        {/* Right: theme toggle + account avatar + sign out */}
        <div className="navbar__right">
          <ThemeToggle />
          <button
            className={`navbar__account${activeScreen === 'account' ? ' navbar__account--active' : ''}`}
            onClick={() => onNavigate('account')}
          >
            <div className="navbar__avatar">AJ</div>
            <span className="navbar__username">Alex J.</span>
          </button>
          <div className="navbar__divider" />
          <button className="navbar__signout" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
