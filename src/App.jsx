/**
 * App.jsx — Root application shell
 *
 * Owns all shared state:
 *   • Which screen is active (simple string-based router, no React Router)
 *   • Portfolio, holdings, and transactions data
 *   • Modal open/close state
 *   • User profile (username, email)
 *
 * All child pages receive the data they need plus callback functions.
 */
import React, { useState } from 'react';

// ── Pages ──────────────────────────────────────────────────────────────
import Login              from './components/Login';
import Dashboard          from './components/Dashboard';
import TransactionHistory from './components/TransactionHistory';
import InstrumentDetail   from './components/InstrumentDetail';
import Account            from './components/Account';
import Performance        from './components/Performance';
import Watchlist          from './components/Watchlist';

// ── Modals ─────────────────────────────────────────────────────────────
import BuySellModal          from './components/BuySellModal';
import DepositWithdrawModal  from './components/DepositWithdrawModal';

// ── Sample data ────────────────────────────────────────────────────────
import {
  initialPortfolio,
  initialUserProfile,
  initialHoldings,
  initialTransactions,
  initialWatchlist,
  instrumentCatalog,
} from './data';

// A simple counter used to give each new transaction a unique id
let txIdCounter = initialTransactions.length + 1;

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────────
  const [loggedIn, setLoggedIn] = useState(false);

  // ── Screen routing ────────────────────────────────────────────────────
  // Possible values: 'dashboard' | 'history' | 'performance' | 'account' | 'instrument'
  const [screen,           setScreen]          = useState('dashboard');
  const [instrumentSymbol, setInstrumentSymbol] = useState(null); // active symbol for InstrumentDetail

  // ── Core data ─────────────────────────────────────────────────────────
  const [portfolio,     setPortfolio]     = useState({ ...initialPortfolio });
  const [holdings,      setHoldings]      = useState([...initialHoldings]);
  const [transactions,  setTransactions]  = useState([...initialTransactions]);
  const [userProfile,   setUserProfile]   = useState({ ...initialUserProfile });
  const [watchlist,     setWatchlist]     = useState([...initialWatchlist]);

  // ── Modal state ───────────────────────────────────────────────────────
  // modalType: null | 'buy' | 'sell' | 'deposit' | 'withdraw'
  const [modalType,     setModalType]     = useState(null);
  const [modalSymbol,   setModalSymbol]   = useState(null); // pre-fill symbol for buy/sell

  // ─────────────────────────────────────────────────────────────────────
  // Navigation helpers
  // ─────────────────────────────────────────────────────────────────────

  function navigate(target) {
    setScreen(target);
    if (target !== 'instrument') setInstrumentSymbol(null);
  }

  function viewInstrument(symbol) {
    setInstrumentSymbol(symbol);
    setScreen('instrument');
  }

  // ─────────────────────────────────────────────────────────────────────
  // Modal helpers
  // ─────────────────────────────────────────────────────────────────────

  // type = 'buy' | 'sell' | 'deposit' | 'withdraw'
  function openModal(type, symbol = null) {
    setModalType(type);
    setModalSymbol(symbol);
  }

  function closeModal() {
    setModalType(null);
    setModalSymbol(null);
  }

  // ─────────────────────────────────────────────────────────────────────
  // Business logic: Buy / Sell
  // ─────────────────────────────────────────────────────────────────────

  /**
   * handleBuySell — called by BuySellModal on confirm
   *
   * @param {string} mode      — 'buy' | 'sell'
   * @param {object} instrument — full instrument object (Symbol, CurrentPrice, etc.)
   * @param {number} quantity   — number of shares
   */
  function handleBuySell(mode, instrument, quantity) {
    const price     = instrument.CurrentPrice;
    const totalAmt  = price * quantity;
    const isBuy     = mode === 'buy';

    // Update holdings
    setHoldings(prev => {
      const existing = prev.find(h => h.Symbol === instrument.Symbol);

      if (isBuy) {
        if (existing) {
          // Average down / up the cost basis
          const newQty  = existing.Quantity + quantity;
          const newCost = (existing.AvgCostPrice * existing.Quantity + price * quantity) / newQty;
          return prev.map(h => h.Symbol !== instrument.Symbol ? h : {
            ...h,
            Quantity:     newQty,
            AvgCostPrice: parseFloat(newCost.toFixed(4)),
            MarketValue:  parseFloat((newQty * price).toFixed(2)),
            GainLoss:     parseFloat(((price - newCost) * newQty).toFixed(2)),
            GainLossPct:  parseFloat(((price - newCost) / newCost * 100).toFixed(2)),
          });
        } else {
          // New holding
          return [...prev, {
            Symbol:         instrument.Symbol,
            InstrumentName: instrument.InstrumentName,
            Sector:         instrument.Sector,
            Quantity:        quantity,
            AvgCostPrice:    price,
            CurrentPrice:    price,
            MarketValue:     parseFloat((quantity * price).toFixed(2)),
            GainLoss:        0,
            GainLossPct:     0,
          }];
        }
      } else {
        // Sell
        if (!existing) return prev;
        const newQty = existing.Quantity - quantity;
        if (newQty <= 0) {
          // Sold out — remove from holdings
          return prev.filter(h => h.Symbol !== instrument.Symbol);
        }
        return prev.map(h => h.Symbol !== instrument.Symbol ? h : {
          ...h,
          Quantity:    newQty,
          MarketValue: parseFloat((newQty * price).toFixed(2)),
          GainLoss:    parseFloat(((price - h.AvgCostPrice) * newQty).toFixed(2)),
          GainLossPct: parseFloat(((price - h.AvgCostPrice) / h.AvgCostPrice * 100).toFixed(2)),
        });
      }
    });

    // Update cash balance
    setPortfolio(prev => ({
      ...prev,
      CashBalance: parseFloat((prev.CashBalance + (isBuy ? -totalAmt : totalAmt)).toFixed(2)),
      TotalValue:  parseFloat((prev.TotalValue  + (isBuy ? 0 : -totalAmt)).toFixed(2)),
    }));

    // Record the transaction
    const tx = {
      id:              txIdCounter++,
      TransactionType: isBuy ? 'BUY' : 'SELL',
      Symbol:          instrument.Symbol,
      Quantity:        quantity,
      PricePerUnit:    price,
      TotalAmount:     parseFloat(totalAmt.toFixed(2)),
      TransactionDate: new Date().toISOString().slice(0,10),
    };
    setTransactions(prev => [tx, ...prev]);
  }

  // ─────────────────────────────────────────────────────────────────────
  // Business logic: Deposit / Withdraw
  // ─────────────────────────────────────────────────────────────────────

  /**
   * handleDepositWithdraw — called by DepositWithdrawModal on confirm
   *
   * @param {number} amount — dollar amount (positive)
   * @param {string} type   — 'DEPOSIT' | 'WITHDRAWAL'
   */
  function handleDepositWithdraw(amount, type) {
    const delta = type === 'DEPOSIT' ? amount : -amount;
    setPortfolio(prev => ({
      ...prev,
      CashBalance: parseFloat((prev.CashBalance + delta).toFixed(2)),
      TotalValue:  parseFloat((prev.TotalValue  + delta).toFixed(2)),
    }));

    const tx = {
      id:              txIdCounter++,
      TransactionType: type,
      Symbol:          null,
      Quantity:        null,
      PricePerUnit:    null,
      TotalAmount:     parseFloat(amount.toFixed(2)),
      TransactionDate: new Date().toISOString().slice(0,10),
    };
    setTransactions(prev => [tx, ...prev]);
  }

  // ─────────────────────────────────────────────────────────────────────
  // Business logic: Profile / Portfolio name updates
  // ─────────────────────────────────────────────────────────────────────

  function handleUpdateProfile(username, email) {
    setUserProfile(prev => ({ ...prev, Username: username, Email: email }));
  }

  function handleUpdatePortfolioName(name) {
    setPortfolio(prev => ({ ...prev, PortfolioName: name }));
  }

  // ─────────────────────────────────────────────────────────────────────
  // Business logic: Watchlist
  // ─────────────────────────────────────────────────────────────────────

  /** Adds a symbol if it's not already watched, removes it if it is */
  function handleToggleWatchlist(symbol) {
    setWatchlist(prev =>
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────

  // Show the login page until the user authenticates
  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  // Common props passed to every page
  const navProps = {
    onNavigate: navigate,
    onLogout:   () => setLoggedIn(false),
  };

  return (
    <>
      {/* ── Active screen ── */}
      {screen === 'dashboard' && (
        <Dashboard
          portfolio={portfolio}
          holdings={holdings}
          onOpenModal={openModal}
          onViewInstrument={viewInstrument}
          {...navProps}
        />
      )}

      {screen === 'history' && (
        <TransactionHistory
          transactions={transactions}
          {...navProps}
        />
      )}

      {screen === 'performance' && (
        <Performance
          holdings={holdings}
          transactions={transactions}
          onViewInstrument={viewInstrument}
          {...navProps}
        />
      )}

      {screen === 'account' && (
        <Account
          portfolio={portfolio}
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
          onUpdatePortfolioName={handleUpdatePortfolioName}
          {...navProps}
        />
      )}

      {screen === 'instrument' && instrumentSymbol && (
        <InstrumentDetail
          symbol={instrumentSymbol}
          holdings={holdings}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          onOpenModal={openModal}
          {...navProps}
        />
      )}

      {screen === 'watchlist' && (
        <Watchlist
          watchlist={watchlist}
          holdings={holdings}
          onToggleWatchlist={handleToggleWatchlist}
          onViewInstrument={viewInstrument}
          {...navProps}
        />
      )}

      {/* ── Modals — rendered on top of any screen ── */}
      {(modalType === 'buy' || modalType === 'sell') && (
        <BuySellModal
          mode={modalType}
          holdings={holdings}
          prefilledSymbol={modalSymbol}
          onClose={closeModal}
          onConfirm={(symbol, qty) => {
            // BuySellModal calls onConfirm(symbol, qty, price, type)
            // Look up the full instrument object so handleBuySell has InstrumentName, Sector, etc.
            const inst = instrumentCatalog.find(i => i.Symbol === symbol);
            if (inst) handleBuySell(modalType, inst, qty);
          }}
        />
      )}

      {(modalType === 'deposit' || modalType === 'withdraw') && (
        <DepositWithdrawModal
          mode={modalType}
          cashBalance={portfolio.CashBalance}
          onClose={closeModal}
          onConfirm={handleDepositWithdraw}
        />
      )}
    </>
  );
}
