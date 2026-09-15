import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import TransactionHistory from "./components/TransactionHistory";
import BuySellModal from "./components/BuySellModal";
import DepositWithdrawModal from "./components/DepositWithdrawModal";
import InstrumentDetail from "./components/InstrumentDetail";
import Account from "./components/Account";
import Performance from "./components/Performance";
import {
  portfolio as initialPortfolio,
  holdings as initialHoldings,
  transactions as initialTransactions,
  userProfile as initialUserProfile,
} from "./data";
import type { Screen, ModalType, Holding, Transaction, UserProfile } from "./types";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [modal, setModal] = useState<ModalType>(null);
  const [prefilledSymbol, setPrefilledSymbol] = useState<string | undefined>();
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);

  function navigate(s: Screen) {
    setScreen(s);
  }

  function viewInstrument(symbol: string) {
    setSelectedSymbol(symbol);
    setScreen("instrument");
  }

  function openModal(type: ModalType, symbol?: string) {
    setPrefilledSymbol(symbol);
    setModal(type);
  }

  function handleBuySell(symbol: string, qty: number, price: number, type: "BUY" | "SELL") {
    const totalAmount = qty * price;
    const today = new Date().toISOString().slice(0, 10);

    const newTx: Transaction = {
      id: `t${Date.now()}`,
      TransactionType: type,
      Symbol: symbol,
      Quantity: qty,
      PricePerUnit: price,
      TotalAmount: totalAmount,
      TransactionDate: today,
    };
    setTransactions((prev) => [newTx, ...prev]);

    setHoldings((prev) => {
      if (type === "BUY") {
        const existing = prev.find((h) => h.Symbol === symbol);
        if (existing) {
          return prev.map((h) => {
            if (h.Symbol !== symbol) return h;
            const newQty = h.Quantity + qty;
            const newAvg = (h.Quantity * h.AvgCostPrice + qty * price) / newQty;
            const newMV = newQty * h.CurrentPrice;
            const newGL = newMV - newQty * newAvg;
            return { ...h, Quantity: newQty, AvgCostPrice: newAvg, MarketValue: newMV, GainLoss: newGL, GainLossPct: (newGL / (newQty * newAvg)) * 100 };
          });
        }
        return [...prev, {
          Symbol: symbol, InstrumentName: symbol, Sector: "—",
          Quantity: qty, AvgCostPrice: price, CurrentPrice: price,
          MarketValue: qty * price, GainLoss: 0, GainLossPct: 0,
        }];
      } else {
        return prev.map((h) => {
          if (h.Symbol !== symbol) return h;
          const newQty = h.Quantity - qty;
          if (newQty <= 0) return null;
          const newMV = newQty * h.CurrentPrice;
          const newGL = newMV - newQty * h.AvgCostPrice;
          return { ...h, Quantity: newQty, MarketValue: newMV, GainLoss: newGL, GainLossPct: (newGL / (newQty * h.AvgCostPrice)) * 100 };
        }).filter(Boolean) as Holding[];
      }
    });

    setPortfolio((p) => {
      const newCash = type === "BUY" ? p.CashBalance - totalAmount : p.CashBalance + totalAmount;
      return { ...p, CashBalance: Math.max(0, newCash), TotalValue: Math.max(0, newCash) + holdings.reduce((s, h) => s + h.MarketValue, 0) };
    });
  }

  function handleDepositWithdraw(amount: number, type: "DEPOSIT" | "WITHDRAWAL") {
    const today = new Date().toISOString().slice(0, 10);
    setTransactions((prev) => [{
      id: `t${Date.now()}`, TransactionType: type, Symbol: "",
      Quantity: null, PricePerUnit: null, TotalAmount: amount, TransactionDate: today,
    }, ...prev]);
    setPortfolio((p) => {
      const delta = type === "DEPOSIT" ? amount : -amount;
      return { ...p, CashBalance: Math.max(0, p.CashBalance + delta), TotalValue: p.TotalValue + delta };
    });
  }

  function handleUpdateProfile(updated: UserProfile) {
    setUserProfile(updated);
  }

  function handleUpdatePortfolioName(name: string) {
    setPortfolio((p) => ({ ...p, PortfolioName: name }));
  }

  if (screen === "login") {
    return <Login onLogin={() => setScreen("dashboard")} />;
  }

  const modals = (
    <>
      {(modal === "buy" || modal === "sell") && (
        <BuySellModal
          mode={modal}
          holdings={holdings}
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

  if (screen === "dashboard") {
    return (
      <>
        <Dashboard
          portfolioName={portfolio.PortfolioName}
          totalValue={portfolio.TotalValue}
          cashBalance={portfolio.CashBalance}
          holdings={holdings}
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
    return <TransactionHistory transactions={transactions} onNavigate={navigate} onLogout={() => setScreen("login")} />;
  }

  if (screen === "instrument" && selectedSymbol) {
    return (
      <>
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
