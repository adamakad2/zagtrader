import { useState, useCallback, useEffect } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import TransactionHistory from "./components/TransactionHistory";
import BuySellModal from "./components/BuySellModal";
import DepositWithdrawModal from "./components/DepositWithdrawModal";
import InstrumentDetail from "./components/InstrumentDetail";
import Account from "./components/Account";
import Performance from "./components/Performance";
import { userProfile as initialUserProfile } from "./data";
import type { Screen, ModalType, Holding, Transaction, UserProfile, Portfolio, AllocationSlice } from "./types";
import {
  fetchPortfolioBundle,
  fetchPortfolioHistory,
  fetchTransactions,
  fetchInstruments,
  startDeposit,
  withdraw as apiWithdraw,
  buyInstrument,
  sellInstrument,
  type InstrumentListItem,
} from "./api";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [modal, setModal] = useState<ModalType>(null);
  const [prefilledSymbol, setPrefilledSymbol] = useState<string | undefined>();
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  const [portfolio, setPortfolio] = useState<Portfolio>({ PortfolioName: "", CashBalance: 0, TotalValue: 0 });
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [allocation, setAllocation] = useState<AllocationSlice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [instruments, setInstruments] = useState<InstrumentListItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [depositNotice, setDepositNotice] = useState<string | null>(null);

  // Handles coming back from Stripe's checkout page. The webhook is what
  // actually credits the account (asynchronously, usually within a
  // second or two) — this just shows a message and re-fetches data so
  // the new balance shows up once the webhook has had a moment to run.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const depositResult = params.get("deposit");
    if (!depositResult) return;

    // Clean the URL so refreshing doesn't re-trigger this
    window.history.replaceState({}, "", window.location.pathname);

    if (depositResult === "success") {
      setDepositNotice("Payment received — crediting your account…");
      setTimeout(() => {
        loadAllData();
        setDepositNotice(null);
      }, 2000); // small buffer for the webhook to land
    } else if (depositResult === "cancelled") {
      setDepositNotice("Deposit cancelled — no charge was made.");
      setTimeout(() => setDepositNotice(null), 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loads everything the dashboard needs from the real backend.
  // Called on login, and again after any buy/sell/deposit/withdraw so
  // the UI reflects what actually happened in the database.
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bundle, history, txs, instr] = await Promise.all([
        fetchPortfolioBundle(),
        fetchPortfolioHistory(),
        fetchTransactions(),
        fetchInstruments(),
      ]);
      setPortfolio(bundle.portfolio);
      setHoldings(bundle.holdings);
      setAllocation(bundle.allocation);
      setTransactions(txs);
      setInstruments(instr);
      // portfolioHistory (line chart) currently unused directly here —
      // Charts.tsx still reads the static sample series; wiring it to
      // `history` is a follow-up step alongside per-instrument price history.
      void history;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  }, []);

  function navigate(s: Screen) {
    setScreen(s);
  }

  function viewInstrument(symbol: string) {
    setSelectedSymbol(symbol);
    setScreen("instrument");
  }

  function openModal(type: ModalType, symbol?: string) {
    setActionError(null);
    setPrefilledSymbol(symbol);
    setModal(type);
  }

  async function handleBuySell(symbol: string, qty: number, price: number, type: "BUY" | "SELL") {
    const instrument = instruments.find((i) => i.Symbol === symbol);
    if (!instrument) {
      setActionError(`Unknown instrument: ${symbol}`);
      return;
    }
    try {
      if (type === "BUY") {
        await buyInstrument(instrument.InstrumentID, qty, price);
      } else {
        await sellInstrument(instrument.InstrumentID, qty, price);
      }
      await loadAllData();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Transaction failed");
    }
  }

  async function handleDepositWithdraw(amount: number, type: "DEPOSIT" | "WITHDRAWAL") {
    try {
      if (type === "DEPOSIT") {
        // This redirects the whole browser to Stripe — the account isn't
        // credited yet, so there's no loadAllData() to run here. The user
        // comes back to the app after paying (or cancelling) on Stripe's page.
        await startDeposit(amount);
        return;
      }
      await apiWithdraw(amount);
      await loadAllData();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Transaction failed");
    }
  }

  function handleUpdateProfile(updated: UserProfile) {
    // No backend endpoint for profile edits yet — kept local-only for now.
    setUserProfile(updated);
  }

  function handleUpdatePortfolioName(name: string) {
    // No backend endpoint for renaming a portfolio yet — kept local-only for now.
    setPortfolio((p) => ({ ...p, PortfolioName: name }));
  }

  function handleLogin() {
    setScreen("dashboard");
    loadAllData();
  }

  if (screen === "login") {
    return <Login onLogin={handleLogin} />;
  }

  if (loading && holdings.length === 0 && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-sm">
        Loading your portfolio…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-center px-4">
        <p className="text-sm font-semibold text-red-600">Couldn't load portfolio data</p>
        <p className="text-xs text-gray-500 max-w-sm">{error}</p>
        <p className="text-xs text-gray-400 max-w-sm">
          Make sure XAMPP's Apache is running and your PHP backend is reachable at the API_BASE set in src/api.ts.
        </p>
        <button
          onClick={loadAllData}
          className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold text-white"
          style={{ background: "#1F3864" }}
        >
          Retry
        </button>
      </div>
    );
  }

  const modals = (
    <>
      {(modal === "buy" || modal === "sell") && (
        <BuySellModal
          mode={modal}
          holdings={holdings}
          instruments={instruments}
          prefilledSymbol={prefilledSymbol}
          onClose={() => { setModal(null); setPrefilledSymbol(undefined); }}
          onConfirm={handleBuySell}
        />
      )}
      {(modal === "deposit" || modal === "withdraw") && (
        <DepositWithdrawModal
          mode={modal}
          cashBalance={portfolio.CashBalance}
          onClose={() => setModal(null)}
          onConfirm={handleDepositWithdraw}
        />
      )}
    </>
  );

  const actionErrorBanner = actionError ? (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-lg"
      style={{ background: "#DC2626" }}
      onClick={() => setActionError(null)}
    >
      {actionError} (click to dismiss)
    </div>
  ) : null;

  const depositNoticeBanner = depositNotice ? (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-lg"
      style={{ background: "#1F3864" }}
    >
      {depositNotice}
    </div>
  ) : null;

  if (screen === "dashboard") {
    return (
      <>
        {actionErrorBanner}
        {depositNoticeBanner}
        <Dashboard
          portfolioName={portfolio.PortfolioName}
          totalValue={portfolio.TotalValue}
          cashBalance={portfolio.CashBalance}
          holdings={holdings}
          allocation={allocation}
          onOpenModal={(type) => openModal(type)}
          onNavigate={navigate}
          onViewInstrument={viewInstrument}
          onLogout={() => setScreen("login")}
        />
        {modals}
      </>
    );
  }

  if (screen === "history") {
    return (
      <>
        {actionErrorBanner}
        <TransactionHistory transactions={transactions} onNavigate={navigate} onLogout={() => setScreen("login")} />
      </>
    );
  }

  if (screen === "instrument" && selectedSymbol) {
    return (
      <>
        {actionErrorBanner}
        <InstrumentDetail
          symbol={selectedSymbol}
          holdings={holdings}
          onNavigate={navigate}
          onOpenModal={openModal}
          onLogout={() => setScreen("login")}
        />
        {modals}
      </>
    );
  }

  if (screen === "account") {
    return (
      <Account
        user={userProfile}
        portfolio={portfolio}
        onNavigate={navigate}
        onLogout={() => setScreen("login")}
        onUpdateProfile={handleUpdateProfile}
        onUpdatePortfolioName={handleUpdatePortfolioName}
      />
    );
  }

  if (screen === "performance") {
    return (
      <Performance
        holdings={holdings}
        transactions={transactions}
        totalValue={portfolio.TotalValue}
        cashBalance={portfolio.CashBalance}
        onNavigate={navigate}
        onViewInstrument={viewInstrument}
        onLogout={() => setScreen("login")}
      />
    );
  }

  return null;
}
