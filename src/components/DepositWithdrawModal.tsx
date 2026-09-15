import { useState } from "react";
import type { ModalType } from "../types";

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);
}

interface Props {
  mode: ModalType;
  cashBalance: number;
  onClose: () => void;
  onConfirm: (amount: number, type: "DEPOSIT" | "WITHDRAWAL") => void;
}

const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

export default function DepositWithdrawModal({ mode, cashBalance, onClose, onConfirm }: Props) {
  const [amount, setAmount] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const isWithdraw = mode === "withdraw";
  const exceedsBalance = isWithdraw && numAmount > cashBalance;
  const valid = numAmount > 0 && !exceedsBalance;

  function handleConfirm() {
    if (!valid) return;
    setConfirmed(true);
    setTimeout(() => {
      onConfirm(numAmount, isWithdraw ? "WITHDRAWAL" : "DEPOSIT");
      onClose();
    }, 600);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid #E2E8F0" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: isWithdraw ? "#1F3864" : "#4472C4" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isWithdraw
                  ? <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>
                  : <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>
                }
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">{isWithdraw ? "Withdraw Cash" : "Deposit Cash"}</h2>
              <p className="text-xs text-gray-400">ACH transfer · 1–3 business days</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Current cash balance */}
          <div className="rounded-xl p-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <div className="text-xs text-gray-500 font-medium mb-1">Available Cash Balance</div>
            <div className="font-mono-data text-2xl font-bold text-gray-900">{fmt(cashBalance)}</div>
            {isWithdraw && numAmount > 0 && !exceedsBalance && (
              <div className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
                <span>After withdrawal:</span>
                <span className="font-mono-data font-medium text-gray-600">{fmt(cashBalance - numAmount)}</span>
              </div>
            )}
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono-data font-semibold">$</span>
              <input
                autoFocus
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3.5 rounded-xl border text-lg font-mono-data font-semibold outline-none"
                style={{
                  borderColor: exceedsBalance ? "#DC2626" : "#E2E8F0",
                  background: exceedsBalance ? "#FEF2F2" : "#F8FAFC",
                  color: "#0F172A",
                }}
                onFocus={(e) => {
                  if (!exceedsBalance) {
                    e.target.style.borderColor = "#4472C4";
                    e.target.style.boxShadow = "0 0 0 3px rgba(68,114,196,0.12)";
                  }
                }}
                onBlur={(e) => {
                  if (!exceedsBalance) {
                    e.target.style.borderColor = "#E2E8F0";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
            </div>

            {exceedsBalance && (
              <p className="text-xs mt-1.5 font-medium flex items-center gap-1" style={{ color: "#DC2626" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Amount exceeds available cash balance
              </p>
            )}
          </div>

          {/* Quick amounts */}
          <div>
            <div className="text-xs text-gray-400 mb-2">Quick amounts</div>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: amount === String(a) ? "#EEF3FB" : "#F1F5F9",
                    color: amount === String(a) ? "#4472C4" : "#64748B",
                    border: amount === String(a) ? "1px solid #4472C4" : "1px solid transparent",
                  }}
                >
                  ${a >= 1000 ? `${a / 1000}k` : a}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!valid || confirmed}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{
              background: !valid || confirmed ? "#94A3B8" : (isWithdraw ? "#1F3864" : "#4472C4"),
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
              `Confirm ${isWithdraw ? "Withdrawal" : "Deposit"}${numAmount > 0 ? ` · ${fmt(numAmount)}` : ""}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
