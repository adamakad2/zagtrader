import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import NavBar from "./NavBar";
import type { Holding, ModalType, Screen, DateRange } from "../types";
import { instrumentCatalog, getPriceHistory } from "../data";

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);
}
function fmtCompact(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
}

const DATE_RANGES: DateRange[] = ["1W", "1M", "3M", "1Y", "ALL"];

function filterHistory(symbol: string, range: DateRange) {
  const all = getPriceHistory(symbol);
  if (!all.length) return all;
  const last = new Date(all[all.length - 1].PriceDate);
  const days: Record<DateRange, number> = { "1W": 7, "1M": 30, "3M": 90, "1Y": 365, ALL: 99999 };
  const cutoff = new Date(last);
  cutoff.setDate(cutoff.getDate() - days[range]);
  return all.filter((p) => new Date(p.PriceDate) >= cutoff);
}

function formatLabel(dateStr: string, range: DateRange) {
  const d = new Date(dateStr);
  if (range === "1W" || range === "1M") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

interface Props {
  symbol: string;
  holdings: Holding[];
  onNavigate: (screen: Screen) => void;
  onOpenModal: (type: ModalType, prefilledSymbol?: string) => void;
  onLogout: () => void;
}

export default function InstrumentDetail({ symbol, holdings, onNavigate, onOpenModal, onLogout }: Props) {
  const [range, setRange] = useState<DateRange>("3M");

  const info = instrumentCatalog.find((i) => i.Symbol === symbol);
  const holding = holdings.find((h) => h.Symbol === symbol);
  const history = filterHistory(symbol, range);

  const positive = (info?.DayChange ?? 0) >= 0;

  const minVal = history.length ? Math.min(...history.map((d) => d.ClosePrice)) : 0;
  const maxVal = history.length ? Math.max(...history.map((d) => d.ClosePrice)) : 0;
  const firstVal = history[0]?.ClosePrice ?? 0;
  const lastVal = history[history.length - 1]?.ClosePrice ?? 0;
  const rangeChange = lastVal - firstVal;
  const rangeChangePct = firstVal > 0 ? (rangeChange / firstVal) * 100 : 0;
  const rangePositive = rangeChange >= 0;

  const yMin = Math.floor(minVal * 0.996 * 100) / 100;
  const yMax = Math.ceil(maxVal * 1.004 * 100) / 100;

  if (!info) {
    return (
      <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
        <NavBar activeScreen="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-400 font-medium">Instrument not found</p>
            <button onClick={() => onNavigate("dashboard")} className="mt-4 text-sm font-semibold" style={{ color: "#4472C4" }}>
              ← Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <NavBar activeScreen="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Breadcrumb */}
        <button
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "#94A3B8" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#1F3864"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
          Back to Dashboard
        </button>

        {/* Header card */}
        <div
          className="rounded-2xl px-8 py-6"
          style={{ background: "linear-gradient(135deg, #1F3864 0%, #2a4a7f 60%, #1a3055 100%)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                {info.Symbol.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="font-bold text-white text-2xl font-mono-data">{info.Symbol}</h1>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
                    {info.Sector}
                  </span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.65)" }} className="text-sm">{info.InstrumentName}</p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <span className="font-mono-data text-4xl font-bold text-white">{fmt(info.CurrentPrice)}</span>
              <div className="flex items-center gap-2">
                <span
                  className="font-mono-data text-base font-semibold"
                  style={{ color: positive ? "#4ADE80" : "#F87171" }}
                >
                  {positive ? "+" : ""}{fmt(info.DayChange)}
                </span>
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: positive ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
                    color: positive ? "#4ADE80" : "#F87171",
                  }}
                >
                  {positive ? "▲" : "▼"} {Math.abs(info.DayChangePct).toFixed(2)}%
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>today</span>
              </div>
            </div>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Market Cap", value: info.MarketCap },
              { label: "P/E Ratio", value: info.PERatio },
              { label: "52W High", value: fmt(info.WeekHigh52) },
              { label: "52W Low", value: fmt(info.WeekLow52) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{stat.label}</p>
                <p className="font-mono-data text-sm font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart + Position grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ border: "1px solid #E2E8F0" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Price History</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="font-mono-data text-sm font-semibold"
                    style={{ color: rangePositive ? "#16A34A" : "#DC2626" }}
                  >
                    {rangePositive ? "+" : ""}{fmt(rangeChange)}
                  </span>
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: rangePositive ? "#F0FDF4" : "#FEF2F2", color: rangePositive ? "#16A34A" : "#DC2626" }}
                  >
                    {rangePositive ? "▲" : "▼"} {Math.abs(rangeChangePct).toFixed(2)}%
                  </span>
                </div>
              </div>
              {/* Range selector */}
              <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: "#F1F5F9" }}>
                {DATE_RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                    style={range === r
                      ? { background: "white", color: "#1F3864", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }
                      : { color: "#64748B" }
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 260 }}>
              {history.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No price data available for this range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={rangePositive ? "#16A34A" : "#DC2626"} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={rangePositive ? "#16A34A" : "#DC2626"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="PriceDate"
                      tickFormatter={(v) => formatLabel(v, range)}
                      tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[yMin, yMax]}
                      tickFormatter={(v) => fmtCompact(v)}
                      tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }}
                      axisLine={false}
                      tickLine={false}
                      width={52}
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
                      labelStyle={{ color: "#64748B", marginBottom: 4, fontFamily: "Inter" }}
                      formatter={(value) => [fmt(Number(value)), info.Symbol]}
                      labelFormatter={(label) =>
                        typeof label === "string"
                          ? new Date(label).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                          : String(label)
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="ClosePrice"
                      stroke={rangePositive ? "#16A34A" : "#DC2626"}
                      strokeWidth={2}
                      fill={`url(#grad-${symbol})`}
                      dot={false}
                      activeDot={{ r: 4, fill: rangePositive ? "#16A34A" : "#DC2626", stroke: "white", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right column: position + actions */}
          <div className="flex flex-col gap-4">
            {/* Your position */}
            <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E2E8F0" }}>
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Your Position</h3>

              {holding ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Shares owned", value: holding.Quantity.toString() },
                      { label: "Avg cost", value: fmt(holding.AvgCostPrice) },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl p-3" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                        <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                        <p className="font-mono-data text-sm font-bold text-gray-900">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <p className="text-xs text-gray-500 mb-1">Market Value</p>
                    <p className="font-mono-data text-xl font-bold text-gray-900">{fmt(holding.MarketValue)}</p>
                  </div>

                  <div
                    className="rounded-xl p-4"
                    style={{ background: holding.GainLoss >= 0 ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${holding.GainLoss >= 0 ? "#BBF7D0" : "#FECACA"}` }}
                  >
                    <p className="text-xs font-medium mb-1" style={{ color: holding.GainLoss >= 0 ? "#15803D" : "#B91C1C" }}>
                      Unrealized Gain / Loss
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono-data text-xl font-bold" style={{ color: holding.GainLoss >= 0 ? "#16A34A" : "#DC2626" }}>
                        {holding.GainLoss >= 0 ? "+" : ""}{fmt(holding.GainLoss)}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: holding.GainLoss >= 0 ? "#16A34A" : "#DC2626" }}>
                        ({holding.GainLoss >= 0 ? "▲" : "▼"} {Math.abs(holding.GainLossPct).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#F1F5F9" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                      <rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-500">You don&apos;t own this yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">Buy shares to start tracking your position</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onOpenModal("buy", info.Symbol)}
                className="py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: "#16A34A" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                Buy
              </button>
              <button
                onClick={() => onOpenModal("sell", info.Symbol)}
                disabled={!holding}
                className="py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: holding ? "#DC2626" : "#CBD5E1", cursor: holding ? "pointer" : "not-allowed" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/></svg>
                Sell
              </button>
            </div>

            {!holding && (
              <p className="text-xs text-center" style={{ color: "#94A3B8" }}>Sell is unavailable — you don&apos;t own {info.Symbol}</p>
            )}

            {/* Previous close comparison */}
            <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E2E8F0" }}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">vs. Previous Close</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Prev close</span>
                <span className="font-mono-data text-sm font-medium text-gray-700">{fmt(info.PreviousClose)}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Current</span>
                <span className="font-mono-data text-sm font-bold text-gray-900">{fmt(info.CurrentPrice)}</span>
              </div>
              {/* Bar */}
              <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, ((info.CurrentPrice - info.WeekLow52) / (info.WeekHigh52 - info.WeekLow52)) * 100).toFixed(1)}%`,
                    background: positive ? "#16A34A" : "#DC2626",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs" style={{ color: "#94A3B8" }}>52W Low {fmt(info.WeekLow52)}</span>
                <span className="text-xs" style={{ color: "#94A3B8" }}>High {fmt(info.WeekHigh52)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
