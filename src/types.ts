export interface Holding {
  Symbol: string;
  InstrumentName: string;
  Sector: string;
  Quantity: number;
  AvgCostPrice: number;
  CurrentPrice: number;
  MarketValue: number;
  GainLoss: number;
  GainLossPct: number;
}

export interface Transaction {
  id: string;
  TransactionType: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAWAL";
  Symbol: string;
  Quantity: number | null;
  PricePerUnit: number | null;
  TotalAmount: number;
  TransactionDate: string;
}

export interface PortfolioValuePoint {
  date: string;
  value: number;
}

export interface PriceHistoryPoint {
  PriceDate: string;
  ClosePrice: number;
}

export interface InstrumentInfo {
  Symbol: string;
  InstrumentName: string;
  Sector: string;
  CurrentPrice: number;
  PreviousClose: number;
  DayChange: number;
  DayChangePct: number;
  MarketCap: string;
  PERatio: string;
  WeekHigh52: number;
  WeekLow52: number;
}

export interface AllocationSlice {
  Symbol: string;
  MarketValue: number;
  Pct: number;
}

export interface Portfolio {
  PortfolioName: string;
  CashBalance: number;
  TotalValue: number;
}

export interface UserProfile {
  Username: string;
  Email: string;
  CreatedAt: string;
}

export type Screen = "login" | "dashboard" | "history" | "instrument" | "account" | "performance";
export type ModalType = "buy" | "sell" | "deposit" | "withdraw" | null;
export type DateRange = "1W" | "1M" | "3M" | "1Y" | "ALL";
export type TxFilter = "ALL" | "BUY" | "SELL" | "DEPOSIT" | "WITHDRAWAL";
export type SortDir = "asc" | "desc";
