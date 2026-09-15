import { useState } from "react";
import NavBar from "./NavBar";
import type { Transaction, TxFilter, SortDir, Screen } from "../types";

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const TX_FILTERS: TxFilter[] = ["ALL", "BUY", "SELL", "DEPOSIT", "WITHDRAWAL"];

const TYPE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  BUY:        { bg: "#F0FDF4", color: "#16A34A", label: "BUY" },
  SELL:       { bg: "#FEF2F2", color: "#DC2626", label: "SELL" },
  DEPOSIT:    { bg: "#EFF6FF", color: "#3B82F6", label: "DEP" },
  WITHDRAWAL: { bg: "#FFF7ED", color: "#EA580C", label: "WITH" },
};

interface Props {
  transactions: Transaction[];
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

export default function TransactionHistory({ transactions, onNavigate, onLogout }: Props) {
  const [filter, setFilter] = useState<TxFilter>("ALL");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");

  const filtered = transactions
    .filter((t) => filter === "ALL" || t.TransactionType === filter)
    .filter((t) =>
      search === "" ||
      t.Symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.TransactionType.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const diff = new Date(a.TransactionDate).getTime() - new Date(b.TransactionDate).getTime();
      return sortDir === "desc" ? -diff : diff;
    });

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <NavBar activeScreen="history" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Page header + controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-sm text-gray-500 mt-0.5">Complete ledger of all portfolio activity</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search symbol..."
                className="pl-8 pr-4 py-2 rounded-lg border text-sm outline-none w-40"
                style={{ borderColor: "#E2E8F0", background: "white" }}
                onFocus={(e) => { e.target.style.borderColor = "#4472C4"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; }}
              />
            </div>
            <button
              onClick={() => setSortDir((d) => d === "desc" ? "asc" : "desc")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              style={{ borderColor: "#E2E8F0", background: "white" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sortDir === "desc"
                  ? <><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></>
                  : <><path d="M10 6h4"/><path d="M7 12h10"/><path d="M3 18h18"/></>}
              </svg>
              {sortDir === "desc" ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Deposits", value: transactions.filter((t) => t.TransactionType === "DEPOSIT").reduce((s, t) => s + t.TotalAmount, 0), color: "#3B82F6" },
            { label: "Total Withdrawals", value: transactions.filter((t) => t.TransactionType === "WITHDRAWAL").reduce((s, t) => s + t.TotalAmount, 0), color: "#EA580C" },
            { label: "Total Bought", value: transactions.filter((t) => t.TransactionType === "BUY").reduce((s, t) => s + t.TotalAmount, 0), color: "#16A34A" },
            { label: "Total Sold", value: transactions.filter((t) => t.TransactionType === "SELL").reduce((s, t) => s + t.TotalAmount, 0), color: "#DC2626" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #E2E8F0" }}>
              <div className="text-xs text-gray-500 font-medium mb-1">{stat.label}</div>
              <div className="font-mono-data text-lg font-bold" style={{ color: stat.color }}>{fmt(stat.value)}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "#F1F5F9" }}>
          {TX_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={filter === f
                ? { background: "white", color: "#1F3864", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { color: "#64748B" }
              }
            >
              {f === "ALL" ? "All" : f === "WITHDRAWAL" ? "Withdrawals" : f.charAt(0) + f.slice(1).toLowerCase() + "s"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#F1F5F9" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>
              </div>
              <p className="font-medium text-gray-500 text-sm">No transactions found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  {["Type", "Symbol", "Quantity", "Price / Unit", "Total Amount", "Date"].map((h, i) => (
                    <th
                      key={h}
                      className={`py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i < 2 ? "text-left px-5" : "text-right px-5"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => {
                  const style = TYPE_STYLES[tx.TransactionType];
                  return (
                    <tr
                      key={tx.id}
                      className="tx-row"
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}
                    >
                      <td className="px-5 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold tracking-wide" style={{ background: style.bg, color: style.color }}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {tx.Symbol
                          ? <span className="font-mono-data font-semibold text-sm text-gray-900">{tx.Symbol}</span>
                          : <span className="text-sm text-gray-400">—</span>
                        }
                      </td>
                      <td className="px-5 py-4 text-right">
                        {tx.Quantity !== null
                          ? <span className="font-mono-data text-sm text-gray-900">{tx.Quantity.toLocaleString()}</span>
                          : <span className="text-sm text-gray-400">—</span>
                        }
                      </td>
                      <td className="px-5 py-4 text-right">
                        {tx.PricePerUnit !== null
                          ? <span className="font-mono-data text-sm text-gray-900">{fmt(tx.PricePerUnit)}</span>
                          : <span className="text-sm text-gray-400">—</span>
                        }
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className="font-mono-data text-sm font-semibold"
                          style={{ color: tx.TransactionType === "BUY" || tx.TransactionType === "WITHDRAWAL" ? "#DC2626" : "#16A34A" }}
                        >
                          {tx.TransactionType === "BUY" || tx.TransactionType === "WITHDRAWAL" ? "-" : "+"}{fmt(tx.TotalAmount)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-gray-500 font-medium">{fmtDate(tx.TransactionDate)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-center pb-4" style={{ color: "#94A3B8" }}>
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} · Prices shown are historical execution prices
        </p>
      </main>
    </div>
  );
}
