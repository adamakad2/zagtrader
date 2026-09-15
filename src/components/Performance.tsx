import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import NavBar from "./NavBar";
import type { Holding, Transaction, Screen } from "../types";

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
}
function fmtFull(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);
}

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#1F3864",
  Semiconductors: "#4472C4",
  "Consumer Discretionary": "#7B9FD4",
  "Communication Services": "#2D5AA0",
  Financials: "#A8C1E8",
  Cash: "#CBD5E1",
};
const FALLBACK_COLORS = ["#1F3864", "#4472C4", "#7B9FD4", "#2D5AA0", "#A8C1E8", "#64748B"];

interface Props {
  holdings: Holding[];
  transactions: Transaction[];
  totalValue: number;
  cashBalance: number;
  onNavigate: (screen: Screen) => void;
  onViewInstrument: (symbol: string) => void;
  onLogout: () => void;
}

export default function Performance({ holdings, transactions, totalValue, cashBalance, onNavigate, onViewInstrument, onLogout }: Props) {
  // Best / worst performers
  const sorted = [...holdings].sort((a, b) => b.GainLossPct - a.GainLossPct);
  const best = sorted[0] ?? null;
  const worst = sorted[sorted.length - 1] ?? null;

  // Sector allocation
  const sectorMap: Record<string, number> = {};
  holdings.forEach((h) => {
    sectorMap[h.Sector] = (sectorMap[h.Sector] ?? 0) + h.MarketValue;
  });
  sectorMap["Cash"] = cashBalance;
  const sectorTotal = Object.values(sectorMap).reduce((s, v) => s + v, 0);
  const sectorData = Object.entries(sectorMap)
    .map(([name, value], i) => ({
      name,
      value,
      pct: parseFloat(((value / sectorTotal) * 100).toFixed(1)),
      color: SECTOR_COLORS[name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  // Stats from transactions
  const totalDeposited = transactions.filter((t) => t.TransactionType === "DEPOSIT").reduce((s, t) => s + t.TotalAmount, 0);
  const totalWithdrawn = transactions.filter((t) => t.TransactionType === "WITHDRAWAL").reduce((s, t) => s + t.TotalAmount, 0);
  const totalInvested = transactions.filter((t) => t.TransactionType === "BUY").reduce((s, t) => s + t.TotalAmount, 0);
  const netDeposited = totalDeposited - totalWithdrawn;
  const overallGain = totalValue - netDeposited;
  const overallGainPct = netDeposited > 0 ? (overallGain / netDeposited) * 100 : 0;

  const hasData = holdings.length > 0;

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <NavBar activeScreen="performance" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Performance & Insights</h1>
            <p className="text-sm text-gray-500 mt-0.5">Analytics derived from your holdings and transaction history</p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: "#EEF3FB", color: "#1F3864" }}>
            Read-only · no new data
          </span>
        </div>

        {/* Top stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Deposited", value: fmt(totalDeposited), sub: "All-time cash in", color: "#4472C4", icon: "↑" },
            { label: "Total Withdrawn", value: fmt(totalWithdrawn), sub: "All-time cash out", color: "#64748B", icon: "↓" },
            { label: "Total Invested", value: fmt(totalInvested), sub: "Sum of all buys", color: "#1F3864", icon: "▸" },
            {
              label: "Overall Return",
              value: `${overallGain >= 0 ? "+" : ""}${fmt(overallGain)}`,
              sub: `${overallGainPct >= 0 ? "+" : ""}${overallGainPct.toFixed(2)}% on net deposits`,
              color: overallGain >= 0 ? "#16A34A" : "#DC2626",
              icon: overallGain >= 0 ? "▲" : "▼",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E2E8F0" }}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium leading-snug">{stat.label}</span>
                <span className="text-base font-bold" style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <p className="font-mono-data text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {hasData ? (
          <>
            {/* Best / Worst performer cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Best Performer", holding: best, positive: true },
                { label: "Worst Performer", holding: worst, positive: false },
              ].map(({ label, holding: h }) => {
                if (!h) return null;
                const isPos = h.GainLoss >= 0;
                return (
                  <button
                    key={label}
                    onClick={() => onViewInstrument(h.Symbol)}
                    className="bg-white rounded-2xl p-6 text-left transition-all hover:shadow-md"
                    style={{ border: `1px solid ${isPos ? "#BBF7D0" : "#FECACA"}` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: isPos ? "#15803D" : "#B91C1C" }}>
                        {label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#F1F5F9", color: "#64748B" }}>
                        {h.Sector}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: isPos ? "#16A34A" : "#DC2626" }}
                      >
                        {h.Symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-mono-data font-bold text-gray-900">{h.Symbol}</p>
                        <p className="text-xs text-gray-500">{h.InstrumentName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg p-3" style={{ background: isPos ? "#F0FDF4" : "#FEF2F2" }}>
                        <p className="text-xs mb-0.5" style={{ color: isPos ? "#15803D" : "#B91C1C" }}>Return</p>
                        <p className="font-mono-data text-base font-bold" style={{ color: isPos ? "#16A34A" : "#DC2626" }}>
                          {isPos ? "+" : ""}{h.GainLossPct.toFixed(1)}%
                        </p>
                      </div>
                      <div className="rounded-lg p-3" style={{ background: "#F8FAFC" }}>
                        <p className="text-xs text-gray-500 mb-0.5">Gain / Loss</p>
                        <p className="font-mono-data text-sm font-bold" style={{ color: isPos ? "#16A34A" : "#DC2626" }}>
                          {isPos ? "+" : ""}{fmt(h.GainLoss)}
                        </p>
                      </div>
                      <div className="rounded-lg p-3" style={{ background: "#F8FAFC" }}>
                        <p className="text-xs text-gray-500 mb-0.5">Mkt Value</p>
                        <p className="font-mono-data text-sm font-bold text-gray-900">{fmt(h.MarketValue)}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: "#4472C4" }}>
                      View instrument detail
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sector allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar chart */}
              <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E2E8F0" }}>
                <h3 className="font-semibold text-gray-900 text-sm mb-5">Allocation by Sector</h3>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sectorData}
                      layout="vertical"
                      margin={{ top: 0, right: 60, left: 8, bottom: 0 }}
                      barSize={18}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#374151", fontFamily: "Inter" }}
                        axisLine={false}
                        tickLine={false}
                        width={140}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: 8,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          fontSize: 12,
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                        formatter={(value) => [`${value}%`, "Allocation"]}
                      />
                      <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                        {sectorData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                        <LabelList
                          dataKey="pct"
                          position="right"
                          formatter={(v: unknown) => `${v}%`}
                          style={{ fontSize: 11, fill: "#64748B", fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sector donut + legend */}
              <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E2E8F0" }}>
                <h3 className="font-semibold text-gray-900 text-sm mb-4">Sector Donut</h3>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={54}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="pct"
                      >
                        {sectorData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: 8,
                          fontSize: 12,
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                        formatter={(value) => [`${value}%`, "Allocation"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 space-y-2">
                  {sectorData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-data text-xs text-gray-500">{fmtFull(item.value)}</span>
                        <span className="font-mono-data text-xs font-semibold text-gray-700 w-10 text-right">{item.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Holdings performance table */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid #E2E8F0" }}>
                <h3 className="font-semibold text-gray-900">All Positions — Performance Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {["Symbol", "Sector", "Qty × Avg Cost", "Current Price", "Market Value", "Unrealized G/L", "Return"].map((h) => (
                        <th
                          key={h}
                          className={`py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${h === "Symbol" || h === "Sector" ? "text-left px-5" : "text-right px-5"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...holdings].sort((a, b) => b.GainLossPct - a.GainLossPct).map((h, i, arr) => {
                      const pos = h.GainLoss >= 0;
                      return (
                        <tr
                          key={h.Symbol}
                          className="cursor-pointer transition-colors"
                          style={{ borderTop: "1px solid #F1F5F9" }}
                          onClick={() => onViewInstrument(h.Symbol)}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#F8FAFC"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#1F3864" }}>
                                {h.Symbol.slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-mono-data font-bold text-sm text-gray-900">{h.Symbol}</p>
                                <p className="text-xs text-gray-400">{h.InstrumentName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#F1F5F9", color: "#64748B" }}>
                              {h.Sector}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="font-mono-data text-sm text-gray-600">
                              {h.Quantity} × {fmtFull(h.AvgCostPrice)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="font-mono-data text-sm font-semibold text-gray-900">{fmtFull(h.CurrentPrice)}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="font-mono-data text-sm font-bold text-gray-900">{fmtFull(h.MarketValue)}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="font-mono-data text-sm font-semibold" style={{ color: pos ? "#16A34A" : "#DC2626" }}>
                              {pos ? "+" : ""}{fmtFull(h.GainLoss)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span
                              className="font-mono-data text-sm font-bold px-2 py-1 rounded-lg"
                              style={{ background: pos ? "#F0FDF4" : "#FEF2F2", color: pos ? "#16A34A" : "#DC2626" }}
                            >
                              {pos ? "▲ +" : "▼ "}{Math.abs(h.GainLossPct).toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-2xl py-20 text-center" style={{ border: "1px solid #E2E8F0" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#F1F5F9" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                <polyline points="16 7 22 7 22 13"/>
              </svg>
            </div>
            <p className="font-semibold text-gray-500 text-base">No holdings to analyze yet</p>
            <p className="text-sm text-gray-400 mt-1.5 max-w-sm mx-auto">
              Performance insights will appear once you add positions to your portfolio
            </p>
            <button
              onClick={() => onNavigate("dashboard")}
              className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#1F3864" }}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        <div className="pb-4 text-center">
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            Performance data is indicative only · All figures in USD · Not financial advice
          </p>
        </div>
      </main>
    </div>
  );
}
