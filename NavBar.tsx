import type { Screen } from "../types";

interface NavBarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

// The links shown in the top nav bar, in order. Each maps to one of the
// `screen` values in types.ts — adding a new page means adding an entry
// here too, or it won't be reachable from the nav.
const NAV_LINKS: { label: string; screen: Screen; icon: React.ReactNode }[] = [
  {
    label: "Dashboard",
    screen: "dashboard",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: "Performance",
    screen: "performance",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    label: "History",
    screen: "history",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M8 2v4M16 2v4M3 10h18"/>
      </svg>
    ),
  },
];

/**
 * NavBar — the top navigation bar shown on every logged-in page
 * (Dashboard, Performance, History, Instrument Detail, Account).
 * Highlights whichever link matches `activeScreen`.
 */
export default function NavBar({ activeScreen, onNavigate, onLogout }: NavBarProps) {
  return (
    <nav className="bg-white border-b sticky top-0 z-20" style={{ borderColor: "#E2E8F0" }}>
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Left: logo + nav links */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#1F3864" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16 7 22 7 22 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: "#1F3864" }}>Zagtrader</span>
          </button>

          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ label, screen, icon }) => {
              const isActive = activeScreen === screen || (screen === "dashboard" && activeScreen === "instrument");
              return (
                <button
                  key={screen}
                  onClick={() => onNavigate(screen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={
                    isActive
                      ? { background: "#EEF3FB", color: "#1F3864" }
                      : { color: "#64748B" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: account + logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("account")}
            className="flex items-center gap-2 rounded-full transition-all px-2 py-1"
            style={activeScreen === "account" ? { background: "#EEF3FB" } : {}}
            onMouseEnter={(e) => { if (activeScreen !== "account") (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC"; }}
            onMouseLeave={(e) => { if (activeScreen !== "account") (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: "#4472C4" }}
            >
              AJ
            </div>
            <span className="hidden sm:block text-sm font-medium" style={{ color: activeScreen === "account" ? "#1F3864" : "#374151" }}>
              Alex J.
            </span>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <button
            onClick={onLogout}
            className="text-xs font-medium transition-colors"
            style={{ color: "#94A3B8" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8"; }}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
