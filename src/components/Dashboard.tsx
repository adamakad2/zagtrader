import type { Holding, ModalType, Screen } from "../types";
import { AllocationDonut, PortfolioLineChart } from "./Charts";
import NavBar from "./NavBar";

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);
}

interface Props {
  portfolioName: string;
  totalValue: number;
  cashBalance: number;
  holdings: Holding[];
  onOpenModal: (type: ModalType) => void;
  onNavigate: (screen: Screen) => void;
  onViewInstrument: (symbol: string) => void;
  onLogout: () => void;
}

function GainLossBadge({ value, pct }: { value: number; pct: number }) {
  const pos = value >= 0;
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono-data text-sm font-semibold" style={{ color: pos ? "#16A34A" : "#DC2626" }}>
        {pos ? "+" : ""}{fmt(value)}
      </span>
      <span
        className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
        style={{ background: pos ? "#F0FDF4" : "#FEF2F2", color: pos ? "#16A34A" : "#DC2626" }}
      >
        {pos ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
      </span>
    </div>
  );
}

export default function Dashboard({
  portfolioName,
  totalValue,
  cashBalance,
  holdings,
  onOpenModal,
  onNavigate,
  onViewInstrument,
  onLogout,
}: Props) {
  const totalGain = holdings.reduce((s, h) => s + h.GainLoss, 0);
  const totalCost = holdings.reduce((s, h) => s + h.Quantity * h.AvgCostPrice, 0);
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const bestHolder = [...holdings].sort((a, b) => b.GainLossPct - a.GainLossPct)[0];
  const worstHolder = [...holdings].sort((a, b) => a.GainLossPct - b.GainLossPct)[0];

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <NavBar activeScreen="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Hero top bar */}
        <div
          className="rounded-2xl px-8 py-6"
          style={{ background: "linear-gradient(135deg, #1F3864 0%, #2a4a7f 60%, #1a3055 100%)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>{portfolioName}</p>
              <span className="font-mono-data text-4xl font-bold text-white">{fmt(totalValue)}</span>
              <div className="mt-2">
                <GainLossBadge value={totalGain} pct={totalGainPct} />
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-3">
              <div className="text-right">
                <p className="text-xs font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Cash Balance</p>
                <p className="font-mono-data text-xl font-semibold text-white">{fmt(cashBalance)}</p>
              </div>

              <div className="flex gap-2">
                {[
                  { label: "Deposit", modal: "deposit" as ModalType, style: { background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)" } },
                  { label: "Withdraw", modal: "withdraw" as ModalType, style: { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)" } },
                  { label: "Buy", modal: "buy" as ModalType, style: { background: "#16A34A", color: "white", border: "none" } },
                  { label: "Sell", modal: "sell" as ModalType, style: { background: "#DC2626", color: "white", border: "none" } },
                ].map(({ label, modal, style }) => (
                  <button
                    key={label}
                    onClick={() => onOpenModal(modal)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                    style={style}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Holdings Value", value: fmt(holdings.reduce((s, h) => s + h.MarketValue, 0)), sub: `${holdings.length} position${holdings.length !== 1 ? "s" : ""}` },
            {
              label: "Total Gain / Loss",
              value: `${totalGain >= 0 ? "+" : ""}${fmt(totalGain)}`,
              sub: `${totalGainPct >= 0 ? "+" : ""}${totalGainPct.toFixed(2)}% all-time`,
              color: totalGain >= 0 ? "#16A34A" : "#DC2626",
            },
            bestHolder
              ? { label: "Best Performer", value: bestHolder.Symbol, sub: `+${bestHolder.GainLossPct.toFixed(1)}% · +${fmt(bestHolder.GainLoss)}`, color: "#16A34A", clickable: bestHolder.Symbol }
              : { label: "Best Performer", value: "—", sub: "No holdings" },
            worstHolder && worstHolder !== bestHolder
              ? { label: "Worst Performer", value: worstHolder.Symbol, sub: `${worstHolder.GainLossPct.toFixed(1)}% · ${fmt(worstHolder.GainLoss)}`, color: "#DC2626", clickable: worstHolder.Symbol }
              : { label: "Worst Performer", value: "—", sub: "No holdings" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-white rounded-xl p-4 ${(stat as { clickable?: string }).clickable ? "cursor-pointer hover:shadow-sm transition-shadow" : ""}`}
              style={{ border: "1px solid #E2E8F0" }}
              onClick={() => (stat as { clickable?: string }).clickable && onViewInstrument((stat as { clickable?: string }).clickable!)}
            >
              <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
              <p className="font-mono-data text-lg font-bold" style={{ color: stat.color ?? "#0F172A" }}>{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: stat.color ? stat.color + "99" : "#94A3B8" }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E2E8F0" }}>
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Portfolio Allocation</h3>
            <AllocationDonut totalValue={totalValue} />
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ border: "1px solid #E2E8F0" }}>
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Portfolio Value Over Time</h3>
            <PortfolioLineChart height={220} />
          </div>
        </div>

        {/* Holdings table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #E2E8F0" }}>
            <h3 className="font-semibold text-gray-900">Holdings</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate("performance")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                style={{ borderColor: "#E2E8F0", color: "#64748B" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                Performance
              </button>
              <button
                onClick={() => onOpenModal("buy")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "#1F3864" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                Add Position
              </button>
            </div>
          </div>

          {holdings.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#F1F5F9" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/>
                </svg>
              </div>
              <p className="font-semibold text-gray-500">No holdings yet</p>
              <p className="text-sm text-gray-400 mt-1">Click &quot;Buy&quot; to add your first position</p>
              <button onClick={() => onOpenModal("buy")} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#1F3864" }}>
                Buy your first stock
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["Symbol", "Company", "Qty", "Avg Cost", "Current Price", "Market Value", "Gain / Loss", ""].map((h) => (
                      <th
                        key={h}
                        className={`py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${h === "Symbol" || h === "Company" ? "text-left px-5" : h === "" ? "px-4" : "text-right px-5"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const pos = h.GainLoss >= 0;
                    return (
                      <tr
                        key={h.Symbol}
                        className="holdings-row cursor-pointer"
                        style={{ borderTop: "1px solid #F1F5F9" }}
                        onClick={() => onViewInstrument(h.Symbol)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#1F3864" }}>
                              {h.Symbol.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-mono-data font-bold text-sm text-gray-900">{h.Symbol}</div>
                              <div className="text-xs text-gray-400">{h.Sector}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700 font-medium">{h.InstrumentName}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-mono-data text-sm font-medium text-gray-900">{h.Quantity}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-mono-data text-sm text-gray-600">{fmt(h.AvgCostPrice)}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-mono-data text-sm font-semibold text-gray-900">{fmt(h.CurrentPrice)}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-mono-data text-sm font-bold text-gray-900">{fmt(h.MarketValue)}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="font-mono-data text-sm font-semibold" style={{ color: pos ? "#16A34A" : "#DC2626" }}>
                              {pos ? "+" : ""}{fmt(h.GainLoss)}
                            </span>
                            <span
                              className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ background: pos ? "#F0FDF4" : "#FEF2F2", color: pos ? "#16A34A" : "#DC2626" }}
                            >
                              {pos ? "▲" : "▼"} {Math.abs(h.GainLossPct).toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onOpenModal("buy")}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80"
                              style={{ background: "#16A34A" }}
                            >
                              Buy
                            </button>
                            <button
                              onClick={() => onOpenModal("sell")}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80"
                              style={{ background: "#DC2626" }}
                            >
                              Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#F8FAFC", borderTop: "2px solid #E2E8F0" }}>
                    <td className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider" colSpan={2}>Total Holdings</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-mono-data text-xs font-semibold text-gray-500">{holdings.reduce((s, h) => s + h.Quantity, 0)} shares</span>
                    </td>
                    <td colSpan={2} />
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-mono-data text-sm font-bold text-gray-900">{fmt(holdings.reduce((s, h) => s + h.MarketValue, 0))}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-mono-data text-sm font-bold" style={{ color: totalGain >= 0 ? "#16A34A" : "#DC2626" }}>
                          {totalGain >= 0 ? "+" : ""}{fmt(totalGain)}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: totalGain >= 0 ? "#16A34A" : "#DC2626" }}>
                          {totalGain >= 0 ? "▲" : "▼"} {Math.abs(totalGainPct).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="pb-4 flex items-center justify-between">
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            Last updated: {new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            Prices delayed ~15 min · Not financial advice · Zagtrader Inc. © 2025
          </p>
        </div>
      </main>
    </div>
  );
}
