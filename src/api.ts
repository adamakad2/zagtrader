import type { Holding, Transaction, Portfolio, AllocationSlice, PortfolioValuePoint } from "./types";

// Change this to your backend's URL. When running the frontend locally
// (npm run dev) alongside XAMPP on the same machine, localhost works.
// The DEPLOYED Vercel site cannot reach a localhost backend — this only
// works for local development until the backend is deployed too.
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost/backend/api";

export const PORTFOLIO_ID = 1; // single hardcoded portfolio for now — no real auth/login yet

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export interface InstrumentListItem {
  InstrumentID: number;
  Symbol: string;
  InstrumentName: string;
  Sector: string;
  CurrentPrice: number;
}

export interface PortfolioBundle {
  portfolio: Portfolio;
  holdings: Holding[];
  allocation: AllocationSlice[];
}

export async function fetchPortfolioBundle(portfolioId: number = PORTFOLIO_ID): Promise<PortfolioBundle> {
  const data = await get<{
    portfolio: { PortfolioName: string; CashBalance: number; TotalValue: number };
    holdings: Holding[];
    allocation: AllocationSlice[];
  }>(`portfolio.php?portfolio_id=${portfolioId}`);

  return {
    portfolio: {
      PortfolioName: data.portfolio.PortfolioName,
      CashBalance: Number(data.portfolio.CashBalance),
      TotalValue: Number(data.portfolio.TotalValue),
    },
    holdings: data.holdings.map((h) => ({
      ...h,
      Quantity: Number(h.Quantity),
      AvgCostPrice: Number(h.AvgCostPrice),
      CurrentPrice: Number(h.CurrentPrice),
      MarketValue: Number(h.MarketValue),
      GainLoss: Number(h.GainLoss),
      GainLossPct: Number(h.GainLossPct),
    })),
    allocation: data.allocation.map((a) => ({
      Symbol: a.Symbol,
      MarketValue: Number(a.MarketValue),
      Pct: Number(a.Pct),
    })),
  };
}

export async function fetchPortfolioHistory(portfolioId: number = PORTFOLIO_ID): Promise<PortfolioValuePoint[]> {
  const data = await get<{ history: { PriceDate: string; PortfolioValue: number }[] }>(
    `history.php?portfolio_id=${portfolioId}`
  );
  return data.history.map((h) => ({ date: h.PriceDate, value: Number(h.PortfolioValue) }));
}

export async function fetchTransactions(portfolioId: number = PORTFOLIO_ID): Promise<Transaction[]> {
  const data = await get<{ transactions: Transaction[] }>(`transactions.php?portfolio_id=${portfolioId}`);
  return data.transactions.map((t) => ({
    ...t,
    id: String(t.id),
    Quantity: t.Quantity !== null ? Number(t.Quantity) : null,
    PricePerUnit: t.PricePerUnit !== null ? Number(t.PricePerUnit) : null,
    TotalAmount: Number(t.TotalAmount),
  }));
}

export async function fetchInstruments(): Promise<InstrumentListItem[]> {
  const data = await get<{ instruments: InstrumentListItem[] }>("instruments.php");
  return data.instruments.map((i) => ({ ...i, CurrentPrice: Number(i.CurrentPrice) }));
}

// Deposits now go through real Stripe Checkout (test mode) instead of
// crediting the account directly. This creates a Checkout Session and
// redirects the whole browser to Stripe's hosted payment page — your
// account is only actually credited later, by the webhook, once Stripe
// confirms the card payment succeeded.
export async function startDeposit(amount: number, portfolioId: number = PORTFOLIO_ID) {
  const data = await post<{ checkout_url: string }>("create_deposit_session.php", {
    portfolio_id: portfolioId,
    amount,
  });
  window.location.href = data.checkout_url; // hands off to Stripe's page
}

export async function withdraw(amount: number, portfolioId: number = PORTFOLIO_ID) {
  return post("withdraw.php", { portfolio_id: portfolioId, amount });
}

export async function buyInstrument(
  instrumentId: number,
  quantity: number,
  pricePerUnit: number,
  portfolioId: number = PORTFOLIO_ID
) {
  return post("buy.php", { portfolio_id: portfolioId, instrument_id: instrumentId, quantity, price_per_unit: pricePerUnit });
}

export async function sellInstrument(
  instrumentId: number,
  quantity: number,
  pricePerUnit: number,
  portfolioId: number = PORTFOLIO_ID
) {
  return post("sell.php", { portfolio_id: portfolioId, instrument_id: instrumentId, quantity, price_per_unit: pricePerUnit });
}
