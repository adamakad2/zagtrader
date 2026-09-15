import { useState } from "react";
import NavBar from "./NavBar";
import type { Screen, Portfolio, UserProfile } from "../types";

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

interface Props {
  user: UserProfile;
  portfolio: Portfolio;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  onUpdateProfile: (user: UserProfile) => void;
  onUpdatePortfolioName: (name: string) => void;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  type?: string;
  hint?: string;
}

function EditableField({ label, value, onChange, readOnly = false, type = "text", hint }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className="w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all"
        style={{
          borderColor: readOnly ? "#E2E8F0" : focused ? "#4472C4" : "#E2E8F0",
          background: readOnly ? "#F8FAFC" : "white",
          color: readOnly ? "#94A3B8" : "#0F172A",
          boxShadow: focused && !readOnly ? "0 0 0 3px rgba(68,114,196,0.12)" : "none",
          cursor: readOnly ? "default" : "text",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {hint && <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>{hint}</p>}
    </div>
  );
}

export default function Account({ user, portfolio, onNavigate, onLogout, onUpdateProfile, onUpdatePortfolioName }: Props) {
  const [username, setUsername] = useState(user.Username);
  const [email, setEmail] = useState(user.Email);
  const [portfolioName, setPortfolioName] = useState(portfolio.PortfolioName);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onUpdateProfile({ ...user, Username: username, Email: email });
    onUpdatePortfolioName(portfolioName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <NavBar activeScreen="account" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your profile and portfolio preferences</p>
        </div>

        {/* Profile section */}
        <form onSubmit={handleSave}>
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #E2E8F0" }}>
              <h2 className="font-semibold text-gray-900">Profile Information</h2>
              <p className="text-xs text-gray-500 mt-0.5">Your personal account details</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Avatar row */}
              <div className="flex items-center gap-4 pb-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #1F3864, #4472C4)" }}
                >
                  {username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{username || "—"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Member since {fmtDate(user.CreatedAt)}</p>
                </div>
              </div>

              <EditableField label="Username" value={username} onChange={setUsername} hint="Used for login and display" />
              <EditableField label="Email Address" value={email} onChange={setEmail} type="email" hint="We send trade confirmations here" />
            </div>
          </div>

          {/* Portfolio settings */}
          <div className="bg-white rounded-2xl overflow-hidden mt-6" style={{ border: "1px solid #E2E8F0" }}>
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #E2E8F0" }}>
              <h2 className="font-semibold text-gray-900">Portfolio Settings</h2>
              <p className="text-xs text-gray-500 mt-0.5">Customize how your portfolio appears</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <EditableField label="Portfolio Name" value={portfolioName} onChange={setPortfolioName} hint='Shown on the main dashboard header (e.g. "Growth Portfolio")' />
              <EditableField
                label="Member Since"
                value={fmtDate(user.CreatedAt)}
                onChange={() => {}}
                readOnly
                hint="Account creation date — cannot be changed"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => { setUsername(user.Username); setEmail(user.Email); setPortfolioName(portfolio.PortfolioName); }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
              style={{ borderColor: "#E2E8F0", color: "#64748B" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              Discard changes
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all"
              style={{ background: saved ? "#16A34A" : "#1F3864" }}
            >
              {saved ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  Saved!
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>

        {/* Cash balance card */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #E2E8F0" }}>
            <h2 className="font-semibold text-gray-900">Account Summary</h2>
            <p className="text-xs text-gray-500 mt-0.5">Read-only snapshot of your current balances</p>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Cash Balance", value: fmt(portfolio.CashBalance), sub: "Available to invest", color: "#4472C4" },
                { label: "Portfolio Value", value: fmt(portfolio.TotalValue), sub: "Holdings + cash", color: "#1F3864" },
                { label: "Account Status", value: "Active", sub: "SIPC protected · $500k", color: "#16A34A" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <p className="text-xs text-gray-500 font-medium mb-1">{item.label}</p>
                  <p className="font-mono-data text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security section */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #E2E8F0" }}>
            <h2 className="font-semibold text-gray-900">Security</h2>
          </div>
          <div className="px-6 py-4 space-y-1">
            {[
              { label: "Change password", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
              { label: "Two-factor authentication", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, badge: "Disabled" },
              { label: "Active sessions", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{item.icon}</span>
                  {item.label}
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#FEF3C7", color: "#D97706" }}>
                      {item.badge}
                    </span>
                  )}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #FECACA" }}>
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #FECACA", background: "#FEF2F2" }}>
            <h2 className="font-semibold" style={{ color: "#B91C1C" }}>Danger Zone</h2>
            <p className="text-xs mt-0.5" style={{ color: "#DC2626", opacity: 0.75 }}>
              Irreversible and destructive actions — proceed with caution
            </p>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl p-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div>
                <p className="text-sm font-semibold text-gray-800">Sign out of all devices</p>
                <p className="text-xs text-gray-400 mt-0.5">Revokes all active sessions immediately</p>
              </div>
              <button
                onClick={onLogout}
                type="button"
                className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors"
                style={{ borderColor: "#E2E8F0", color: "#64748B" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#DC2626"; (e.currentTarget as HTMLButtonElement).style.color = "#DC2626"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; }}
              >
                Sign out
              </button>
            </div>

            <div className="rounded-xl p-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#B91C1C" }}>Delete account</p>
                  <p className="text-xs mt-0.5" style={{ color: "#DC2626", opacity: 0.7 }}>
                    Permanently deletes all data, holdings, and history
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#DC2626" }}
                >
                  Delete
                </button>
              </div>

              {showDeleteConfirm && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid #FECACA" }}>
                  <p className="text-sm font-semibold mb-3" style={{ color: "#B91C1C" }}>
                    Are you absolutely sure? This cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold border"
                      style={{ borderColor: "#E2E8F0", color: "#64748B" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "#B91C1C" }}
                    >
                      Yes, delete everything
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pb-4 text-center">
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            Zagtrader Inc. © 2025 · <span style={{ color: "#4472C4" }}>Privacy Policy</span> · <span style={{ color: "#4472C4" }}>Terms of Service</span>
          </p>
        </div>
      </main>
    </div>
  );
}
