import { useState } from "react";
import type { Holding, ModalType } from "../types";
import type { InstrumentListItem } from "../api";

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);
}

interface Props {
  mode: ModalType;
  holdings: Holding[];
  instruments: InstrumentListItem[];
  prefilledSymbol?: string;
  onClose: () => void;
  onConfirm: (symbol: string, qty: number, price: number, type: "BUY" | "SELL") => void;
}

export default function BuySellModal({ mode, holdings, instruments, prefilledSymbol, onClose, onConfirm }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<InstrumentListItem | null>(
    prefilledSymbol ? instruments.find((i) => i.Symbol === prefilledSymbol) ?? null : null
  );
  const [quantity, setQuantity] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const filtered = instruments.filter(
    (i) =>
      i.Symbol.toLowerCase().includes(search.toLowerCase()) ||
      i.InstrumentName.toLowerCase().includes(search.toLowerCase())
  );

  const holding = selected
    ? holdings.find((h) => h.Symbol === selected.Symbol)
    : null;
  const maxQty = mode === "sell" ? holding?.Quantity ?? 0 : null;

  const qty = parseFloat(quantity) || 0;
  const totalCost = selected ? qty * selected.CurrentPrice : 0;
  const valid = selected && qty > 0 && (mode === "buy" || (mode === "sell" && qty <= (maxQty ?? 0)));

  function handleConfirm() {
    if (!selected || !valid) return;
    setConfirmed(true);
    setTimeout(() => {
      onConfirm(selected.Symbol, qty, selected.CurrentPrice, mode === "buy" ? "BUY" : "SELL");
      onClose();
    }, 600);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: mode === "buy" ? "#16A34A" : "#DC2626" }}
            >
              {mode === "buy" ? "B" : "S"}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">{mode === "buy" ? "Buy Stock" : "Sell Stock"}</h2>
              <p className="text-xs text-gray-400">Place a market order</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Instrument search */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {mode === "sell" ? "Select position to sell" : "Search instrument"}
            </label>

            {!selected ? (
              <>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={mode === "sell" ? "Search your positions..." : "e.g. AAPL or Apple"}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}
                    onFocus={(e) => { e.target.style.borderColor = "#4472C4"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; }}
                  />
                </div>
                <div className="mt-2 rounded-xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
                  {(mode === "sell" ? filtered.filter((i) => holdings.some((h) => h.Symbol === i.Symbol)) : filtered).length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">No instruments found</div>
                  ) : (
                    (mode === "sell" ? filtered.filter((i) => holdings.some((h) => h.Symbol === i.Symbol)) : filtered).map((inst, i, arr) => {
                      const pos = holdings.find((h) => h.Symbol === inst.Symbol);
                      return (
                        <button
                          key={inst.Symbol}
                          onClick={() => { setSelected(inst); setSearch(""); }}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-50 transition-colors"
                          style={{ borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none" }}
                        >
                          <div>
                            <div className="font-semibold text-sm text-gray-900">{inst.Symbol}</div>
                            <div className="text-xs text-gray-500">{inst.InstrumentName}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono-data text-sm font-medium text-gray-900">{fmt(inst.CurrentPrice)}</div>
                            {pos && <div className="text-xs text-gray-400">{pos.Quantity} owned</div>}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => { setSelected(null); setQuantity(""); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left"
                style={{ borderColor: "#4472C4", background: "#EEF3FB" }}
              >
                <div>
                  <div className="font-bold text-sm" style={{ color: "#1F3864" }}>{selected.Symbol}</div>
                  <div className="text-xs text-gray-500">{selected.InstrumentName}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono-data text-sm font-semibold text-gray-900">{fmt(selected.CurrentPrice)}</div>
                    {holding && <div className="text-xs text-gray-400">{holding.Quantity} owned</div>}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </div>
              </button>
            )}
          </div>

          {/* Quantity */}
          {selected && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity (shares)</label>
                  {mode === "sell" && maxQty !== null && (
                    <button
                      onClick={() => setQuantity(String(maxQty))}
                      className="text-xs font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: "#FEF2F2", color: "#DC2626" }}
                    >
                      Sell all {maxQty}
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  max={maxQty ?? undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border text-sm font-mono-data outline-none"
                  style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}
                  onFocus={(e) => { e.target.style.borderColor = "#4472C4"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; }}
                />
                {mode === "sell" && maxQty !== null && qty > maxQty && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: "#DC2626" }}>
                    You only own {maxQty} shares of {selected.Symbol}
                  </p>
                )}
              </div>

              {/* Price per unit */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Price per share
                </label>
                <div
                  className="w-full px-4 py-3 rounded-xl border text-sm font-mono-data font-medium flex items-center justify-between"
                  style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#64748B" }}
                >
                  <span>{fmt(selected.CurrentPrice)}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#E0EBF8", color: "#4472C4" }}>Market</span>
                </div>
              </div>

              {/* Total cost */}
              <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ background: mode === "buy" ? "#F0FDF4" : "#FEF2F2" }}
              >
                <span className="text-sm font-semibold" style={{ color: mode === "buy" ? "#15803D" : "#B91C1C" }}>
                  {mode === "buy" ? "Total cost" : "Total proceeds"}
                </span>
                <span
                  className="font-mono-data text-xl font-bold"
                  style={{ color: mode === "buy" ? "#15803D" : "#B91C1C" }}
                >
                  {qty > 0 ? fmt(totalCost) : "—"}
                </span>
              </div>

              {/* Confirm */}
              <button
                onClick={handleConfirm}
                disabled={!valid || confirmed}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                style={{
                  background: !valid || confirmed ? "#94A3B8" : (mode === "buy" ? "#16A34A" : "#DC2626"),
                  cursor: !valid ? "not-allowed" : "pointer",
                }}
              >
                {confirmed ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Confirm ${mode === "buy" ? "Purchase" : "Sale"}${qty > 0 ? ` · ${fmt(totalCost)}` : ""}`
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
