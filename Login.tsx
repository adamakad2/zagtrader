import { useState } from "react";

interface LoginProps {
  onLogin: () => void;
}

/**
 * Login — the sign-in / sign-up screen, shown before any portfolio data
 * loads. Toggles between two modes ('login' and 'signup') using the same
 * form, showing extra fields (name, terms checkbox) only in signup mode.
 *
 * Note: this doesn't call a real authentication endpoint yet — it just
 * simulates a network delay and then calls onLogin(). Wiring this up to
 * a real register.php/login.php endpoint is a natural next step.
 */
export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * handleSubmit — runs when the form is submitted (either mode).
   * Shows a brief loading spinner, then calls onLogin() to hand control
   * back to App.tsx, which switches to the Dashboard and fetches real data.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 700);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #1F3864 0%, #2a4a7f 50%, #1a3055 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#4472C4" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 7 22 7 22 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Zagtrader</span>
        </div>
        <div className="text-sm text-blue-200">
          {mode === "login" ? (
            <span>New to Zagtrader?{" "}
              <button onClick={() => setMode("signup")} className="text-white font-semibold underline underline-offset-2 hover:no-underline">
                Create an account
              </button>
            </span>
          ) : (
            <span>Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-white font-semibold underline underline-offset-2 hover:no-underline">
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-gray-500">
                {mode === "login"
                  ? "Sign in to your Zagtrader portfolio"
                  : "Start tracking your investments today"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                    onFocus={(e) => { e.target.style.borderColor = "#4472C4"; e.target.style.boxShadow = "0 0 0 3px rgba(68,114,196,0.12)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                  onFocus={(e) => { e.target.style.borderColor = "#4472C4"; e.target.style.boxShadow = "0 0 0 3px rgba(68,114,196,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  {mode === "login" && (
                    <button type="button" className="text-xs font-medium" style={{ color: "#4472C4" }}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                  onFocus={(e) => { e.target.style.borderColor = "#4472C4"; e.target.style.boxShadow = "0 0 0 3px rgba(68,114,196,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {mode === "signup" && (
                <div className="flex items-start gap-2.5 pt-1">
                  <input type="checkbox" id="terms" className="mt-0.5 rounded" style={{ accentColor: "#4472C4" }} />
                  <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                    I agree to the{" "}
                    <span className="font-medium" style={{ color: "#4472C4" }}>Terms of Service</span>{" "}
                    and{" "}
                    <span className="font-medium" style={{ color: "#4472C4" }}>Privacy Policy</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white mt-2 flex items-center justify-center gap-2"
                style={{ background: loading ? "#94A3B8" : "#1F3864" }}
                onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = "#2a4a7f"; }}
                onMouseLeave={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = "#1F3864"; }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  mode === "login" ? "Sign in" : "Create account"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t" style={{ borderColor: "#E2E8F0" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
                <span className="text-xs text-gray-400 font-medium">or continue with</span>
                <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["Google", "Apple"].map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50"
                    style={{ borderColor: "#E2E8F0" }}
                  >
                    {provider === "Google" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    )}
                    {provider}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.5)" }}>
            Protected by 256-bit AES encryption · SIPC insured up to $500,000
          </p>
        </div>
      </div>
    </div>
  );
}
