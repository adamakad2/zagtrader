/**
 * data.js — Zagtrader sample data
 *
 * This module exports all the static sample data used throughout the app.
 * In a real app these values would come from API responses. The field names
 * intentionally match the backend schema (Portfolio, Holding, Transaction).
 */

// ─── Portfolio ────────────────────────────────────────────────────────────────
// Single portfolio object (one per logged-in user in our demo)
export const initialPortfolio = {
  PortfolioName: 'Growth Portfolio',
  CashBalance:   8432.50,
  TotalValue:    53922.50,
};

// ─── User profile ─────────────────────────────────────────────────────────────
export const initialUserProfile = {
  Username:  'alexjohnson',
  Email:     'alex.johnson@example.com',
  CreatedAt: '2024-01-08',
};

// ─── Holdings ─────────────────────────────────────────────────────────────────
// One row per stock currently owned in the portfolio.
// GainLoss = (CurrentPrice - AvgCostPrice) * Quantity
// GainLossPct = GainLoss / (AvgCostPrice * Quantity) * 100
export const initialHoldings = [
  {
    Symbol:        'AAPL',
    InstrumentName:'Apple Inc.',
    Sector:        'Technology',
    Quantity:       50,
    AvgCostPrice:   155.20,
    CurrentPrice:   191.45,
    MarketValue:    9572.50,
    GainLoss:       1812.50,
    GainLossPct:    23.35,
  },
  {
    Symbol:        'MSFT',
    InstrumentName:'Microsoft Corp.',
    Sector:        'Technology',
    Quantity:       30,
    AvgCostPrice:   310.50,
    CurrentPrice:   378.90,
    MarketValue:    11367.00,
    GainLoss:       2052.00,
    GainLossPct:    22.10,
  },
  {
    Symbol:        'NVDA',
    InstrumentName:'NVIDIA Corp.',
    Sector:        'Semiconductors',
    Quantity:       15,
    AvgCostPrice:   450.00,
    CurrentPrice:   875.20,
    MarketValue:    13128.00,
    GainLoss:       6378.00,
    GainLossPct:    94.40,
  },
  {
    Symbol:        'TSLA',
    InstrumentName:'Tesla, Inc.',
    Sector:        'Consumer Discretionary',
    Quantity:       40,
    AvgCostPrice:   248.30,
    CurrentPrice:   178.50,
    MarketValue:    7140.00,
    GainLoss:      -2792.00,
    GainLossPct:   -28.06,
  },
  {
    Symbol:        'GOOGL',
    InstrumentName:'Alphabet Inc.',
    Sector:        'Communication Services',
    Quantity:       25,
    AvgCostPrice:   140.20,
    CurrentPrice:   171.30,
    MarketValue:    4282.50,
    GainLoss:        777.50,
    GainLossPct:    22.18,
  },
];

// ─── Instrument Catalogue ─────────────────────────────────────────────────────
// Master list of tradeable instruments (superset of holdings).
// Used by the Buy modal search and the Instrument Detail page.
export const instrumentCatalog = [
  {
    Symbol:         'AAPL',
    InstrumentName: 'Apple Inc.',
    Sector:         'Technology',
    CurrentPrice:    191.45,
    PreviousClose:   189.30,
    DayChange:         2.15,
    DayChangePct:      1.14,
    MarketCap:      '$2.94T',
    PERatio:        '31.2x',
    WeekHigh52:      199.62,
    WeekLow52:       164.08,
  },
  {
    Symbol:         'MSFT',
    InstrumentName: 'Microsoft Corp.',
    Sector:         'Technology',
    CurrentPrice:    378.90,
    PreviousClose:   380.20,
    DayChange:        -1.30,
    DayChangePct:     -0.34,
    MarketCap:      '$2.81T',
    PERatio:        '36.8x',
    WeekHigh52:      430.82,
    WeekLow52:       309.45,
  },
  {
    Symbol:         'NVDA',
    InstrumentName: 'NVIDIA Corp.',
    Sector:         'Semiconductors',
    CurrentPrice:    875.20,
    PreviousClose:   857.40,
    DayChange:        17.80,
    DayChangePct:      2.08,
    MarketCap:      '$2.16T',
    PERatio:        '68.4x',
    WeekHigh52:      974.00,
    WeekLow52:       402.50,
  },
  {
    Symbol:         'TSLA',
    InstrumentName: 'Tesla, Inc.',
    Sector:         'Consumer Discretionary',
    CurrentPrice:    178.50,
    PreviousClose:   182.10,
    DayChange:        -3.60,
    DayChangePct:     -1.98,
    MarketCap:      '$568B',
    PERatio:        '52.1x',
    WeekHigh52:      278.98,
    WeekLow52:       138.80,
  },
  {
    Symbol:         'GOOGL',
    InstrumentName: 'Alphabet Inc.',
    Sector:         'Communication Services',
    CurrentPrice:    171.30,
    PreviousClose:   169.80,
    DayChange:         1.50,
    DayChangePct:      0.88,
    MarketCap:      '$2.12T',
    PERatio:        '23.4x',
    WeekHigh52:      193.31,
    WeekLow52:       130.67,
  },
  {
    Symbol:         'AMZN',
    InstrumentName: 'Amazon.com Inc.',
    Sector:         'Consumer Discretionary',
    CurrentPrice:    192.35,
    PreviousClose:   190.00,
    DayChange:         2.35,
    DayChangePct:      1.24,
    MarketCap:      '$2.02T',
    PERatio:        '44.2x',
    WeekHigh52:      201.20,
    WeekLow52:       118.35,
  },
  {
    Symbol:         'META',
    InstrumentName: 'Meta Platforms Inc.',
    Sector:         'Communication Services',
    CurrentPrice:    522.80,
    PreviousClose:   518.50,
    DayChange:         4.30,
    DayChangePct:      0.83,
    MarketCap:      '$1.32T',
    PERatio:        '28.6x',
    WeekHigh52:      531.49,
    WeekLow52:       274.38,
  },
  {
    Symbol:         'JPM',
    InstrumentName: 'JPMorgan Chase & Co.',
    Sector:         'Financials',
    CurrentPrice:    218.40,
    PreviousClose:   216.90,
    DayChange:         1.50,
    DayChangePct:      0.69,
    MarketCap:      '$628B',
    PERatio:        '12.1x',
    WeekHigh52:      225.48,
    WeekLow52:       135.19,
  },
];

// ─── Transaction history ──────────────────────────────────────────────────────
// Ordered newest-first in the real app; here chronologically for clarity.
export const initialTransactions = [
  { id:'t1',  TransactionType:'DEPOSIT',    Symbol:'',     Quantity:null, PricePerUnit:null,  TotalAmount:25000.00, TransactionDate:'2024-01-10' },
  { id:'t2',  TransactionType:'DEPOSIT',    Symbol:'',     Quantity:null, PricePerUnit:null,  TotalAmount:15000.00, TransactionDate:'2024-01-12' },
  { id:'t3',  TransactionType:'BUY',        Symbol:'AAPL', Quantity:50,   PricePerUnit:155.20, TotalAmount: 7760.00, TransactionDate:'2024-01-15' },
  { id:'t4',  TransactionType:'BUY',        Symbol:'MSFT', Quantity:30,   PricePerUnit:310.50, TotalAmount: 9315.00, TransactionDate:'2024-02-20' },
  { id:'t5',  TransactionType:'BUY',        Symbol:'GOOGL',Quantity:25,   PricePerUnit:140.20, TotalAmount: 3505.00, TransactionDate:'2024-03-10' },
  { id:'t6',  TransactionType:'BUY',        Symbol:'TSLA', Quantity:40,   PricePerUnit:248.30, TotalAmount: 9932.00, TransactionDate:'2024-04-05' },
  { id:'t7',  TransactionType:'BUY',        Symbol:'NVDA', Quantity:15,   PricePerUnit:450.00, TotalAmount: 6750.00, TransactionDate:'2024-05-12' },
  { id:'t8',  TransactionType:'SELL',       Symbol:'TSLA', Quantity:10,   PricePerUnit:195.00, TotalAmount: 1950.00, TransactionDate:'2024-06-15' },
  { id:'t9',  TransactionType:'WITHDRAWAL', Symbol:'',     Quantity:null, PricePerUnit:null,  TotalAmount: 2500.00, TransactionDate:'2024-07-01' },
  { id:'t10', TransactionType:'BUY',        Symbol:'AAPL', Quantity:10,   PricePerUnit:182.50, TotalAmount: 1825.00, TransactionDate:'2024-08-14' },
  { id:'t11', TransactionType:'DEPOSIT',    Symbol:'',     Quantity:null, PricePerUnit:null,  TotalAmount: 5000.00, TransactionDate:'2024-09-01' },
  { id:'t12', TransactionType:'BUY',        Symbol:'NVDA', Quantity:5,    PricePerUnit:490.00, TotalAmount: 2450.00, TransactionDate:'2024-09-18' },
];

// ─── Portfolio value-over-time data ──────────────────────────────────────────
// Weekly data points from Jan → Sep 2024, used for the main portfolio chart.
export const portfolioHistory = [
  { date:'2024-01-10', value:39800 }, { date:'2024-01-15', value:40950 },
  { date:'2024-01-22', value:41200 }, { date:'2024-01-29', value:40600 },
  { date:'2024-02-05', value:42100 }, { date:'2024-02-12', value:43400 },
  { date:'2024-02-20', value:44750 }, { date:'2024-02-26', value:44200 },
  { date:'2024-03-04', value:45600 }, { date:'2024-03-11', value:46300 },
  { date:'2024-03-18', value:47150 }, { date:'2024-03-25', value:46800 },
  { date:'2024-04-01', value:48200 }, { date:'2024-04-08', value:47400 },
  { date:'2024-04-15', value:46900 }, { date:'2024-04-22', value:48500 },
  { date:'2024-04-29', value:49200 }, { date:'2024-05-06', value:50100 },
  { date:'2024-05-13', value:51400 }, { date:'2024-05-20', value:50800 },
  { date:'2024-05-27', value:51900 }, { date:'2024-06-03', value:52600 },
  { date:'2024-06-10', value:51800 }, { date:'2024-06-17', value:52400 },
  { date:'2024-06-24', value:51200 }, { date:'2024-07-01', value:51900 },
  { date:'2024-07-08', value:52700 }, { date:'2024-07-15', value:53100 },
  { date:'2024-07-22', value:52400 }, { date:'2024-07-29', value:53500 },
  { date:'2024-08-05', value:54200 }, { date:'2024-08-12', value:53800 },
  { date:'2024-08-19', value:54600 }, { date:'2024-08-26', value:53200 },
  { date:'2024-09-02', value:54100 }, { date:'2024-09-09', value:53400 },
  { date:'2024-09-16', value:53922 },
];

// ─── Per-instrument price history ─────────────────────────────────────────────
// Weekly close prices per symbol. NVDA prices are post-10:1 split normalised.
const rawPriceHistories = {
  AAPL: [
    ['2024-01-08',185.20],['2024-01-15',182.68],['2024-01-22',193.89],['2024-01-29',184.40],
    ['2024-02-05',187.68],['2024-02-12',184.15],['2024-02-20',182.32],['2024-02-26',180.75],
    ['2024-03-04',169.12],['2024-03-11',172.28],['2024-03-18',173.72],['2024-03-25',171.21],
    ['2024-04-01',170.73],['2024-04-08',168.45],['2024-04-15',165.00],['2024-04-22',166.90],
    ['2024-04-29',170.77],['2024-05-06',181.71],['2024-05-13',189.87],['2024-05-20',191.04],
    ['2024-05-27',189.99],['2024-06-03',194.35],['2024-06-10',207.15],['2024-06-17',216.00],
    ['2024-06-24',210.62],['2024-07-01',220.27],['2024-07-08',227.82],['2024-07-15',234.40],
    ['2024-07-22',218.54],['2024-07-29',218.24],['2024-08-05',209.82],['2024-08-12',217.96],
    ['2024-08-19',226.51],['2024-08-26',227.18],['2024-09-02',222.77],['2024-09-09',220.11],
    ['2024-09-16',191.45],
  ],
  MSFT: [
    ['2024-01-08',374.00],['2024-01-15',388.47],['2024-01-22',404.87],['2024-01-29',397.58],
    ['2024-02-05',404.06],['2024-02-12',408.59],['2024-02-20',415.95],['2024-02-26',411.22],
    ['2024-03-04',415.50],['2024-03-11',420.21],['2024-03-18',422.86],['2024-03-25',420.53],
    ['2024-04-01',421.90],['2024-04-08',420.72],['2024-04-15',399.04],['2024-04-22',406.32],
    ['2024-04-29',390.54],['2024-05-06',406.31],['2024-05-13',420.93],['2024-05-20',430.16],
    ['2024-05-27',432.57],['2024-06-03',424.01],['2024-06-10',441.06],['2024-06-17',447.93],
    ['2024-06-24',445.58],['2024-07-01',446.37],['2024-07-08',466.24],['2024-07-15',474.28],
    ['2024-07-22',444.85],['2024-07-29',422.55],['2024-08-05',404.74],['2024-08-12',423.50],
    ['2024-08-19',426.25],['2024-08-26',431.50],['2024-09-02',411.46],['2024-09-09',407.11],
    ['2024-09-16',378.90],
  ],
  NVDA: [
    // All prices already normalised to post-split (÷10) scale
    ['2024-01-08', 49.52],['2024-01-15', 56.05],['2024-01-22', 61.39],['2024-01-29', 61.30],
    ['2024-02-05', 66.16],['2024-02-12', 72.61],['2024-02-20', 78.82],['2024-02-26', 82.28],
    ['2024-03-04', 82.28],['2024-03-11', 87.54],['2024-03-18', 87.84],['2024-03-25', 90.36],
    ['2024-04-01', 85.91],['2024-04-08', 85.03],['2024-04-15', 76.20],['2024-04-22', 79.52],
    ['2024-04-29', 76.20],['2024-05-06', 82.73],['2024-05-13', 90.50],['2024-05-20',106.47],
    ['2024-05-27',114.83],['2024-06-03',120.89],['2024-06-10',120.89],['2024-06-17',123.54],
    ['2024-06-24',123.54],['2024-07-01',117.66],['2024-07-08',131.38],['2024-07-15',138.85],
    ['2024-07-22',117.93],['2024-07-29',104.75],['2024-08-05',100.45],['2024-08-12',116.78],
    ['2024-08-19',125.61],['2024-08-26',125.61],['2024-09-02',108.11],['2024-09-09',116.00],
    ['2024-09-16',116.00],
  ],
  TSLA: [
    ['2024-01-08',238.45],['2024-01-15',218.89],['2024-01-22',209.98],['2024-01-29',190.93],
    ['2024-02-05',188.13],['2024-02-12',200.45],['2024-02-20',199.95],['2024-02-26',198.22],
    ['2024-03-04',178.65],['2024-03-11',172.82],['2024-03-18',163.57],['2024-03-25',175.21],
    ['2024-04-01',168.68],['2024-04-08',171.83],['2024-04-15',147.05],['2024-04-22',142.05],
    ['2024-04-29',168.29],['2024-05-06',177.36],['2024-05-13',171.57],['2024-05-20',176.75],
    ['2024-05-27',179.24],['2024-06-03',175.22],['2024-06-10',177.48],['2024-06-17',181.06],
    ['2024-06-24',197.88],['2024-07-01',232.98],['2024-07-08',246.38],['2024-07-15',263.26],
    ['2024-07-22',222.95],['2024-07-29',232.54],['2024-08-05',193.66],['2024-08-12',214.14],
    ['2024-08-19',214.14],['2024-08-26',212.03],['2024-09-02',209.97],['2024-09-09',186.92],
    ['2024-09-16',178.50],
  ],
  GOOGL: [
    ['2024-01-08',138.37],['2024-01-15',140.24],['2024-01-22',153.84],['2024-01-29',166.53],
    ['2024-02-05',162.15],['2024-02-12',168.68],['2024-02-20',166.33],['2024-02-26',168.34],
    ['2024-03-04',168.56],['2024-03-11',163.99],['2024-03-18',163.83],['2024-03-25',156.33],
    ['2024-04-01',155.24],['2024-04-08',158.28],['2024-04-15',155.30],['2024-04-22',157.09],
    ['2024-04-29',176.25],['2024-05-06',175.06],['2024-05-13',175.78],['2024-05-20',175.56],
    ['2024-05-27',177.95],['2024-06-03',177.42],['2024-06-10',183.72],['2024-06-17',179.70],
    ['2024-06-24',181.59],['2024-07-01',186.58],['2024-07-08',191.18],['2024-07-15',182.15],
    ['2024-07-22',182.44],['2024-07-29',178.00],['2024-08-05',161.79],['2024-08-12',169.40],
    ['2024-08-19',172.63],['2024-08-26',167.68],['2024-09-02',164.32],['2024-09-09',163.46],
    ['2024-09-16',171.30],
  ],
};

/**
 * getPriceHistory(symbol) → array of { PriceDate, ClosePrice }
 * Returns the weekly price history for a given symbol, or [] if unknown.
 */
export function getPriceHistory(symbol) {
  const raw = rawPriceHistories[symbol];
  if (!raw) return [];
  return raw.map(([PriceDate, ClosePrice]) => ({ PriceDate, ClosePrice }));
}

// ─── Portfolio allocation slices ─────────────────────────────────────────────
// Pre-computed from initialHoldings + initialPortfolio.CashBalance.
// Recalculated dynamically in App whenever holdings change.
export function computeAllocation(holdings, cashBalance, totalValue) {
  const slices = holdings.map(h => ({
    Symbol:      h.Symbol,
    MarketValue: h.MarketValue,
    Pct:         parseFloat(((h.MarketValue / totalValue) * 100).toFixed(1)),
  }));
  slices.push({
    Symbol:      'Cash',
    MarketValue: cashBalance,
    Pct:         parseFloat(((cashBalance / totalValue) * 100).toFixed(1)),
  });
  return slices;
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
// Centralising these keeps number formatting consistent across every component.

/** Format a number as USD currency, e.g. $1,234.56 */
export function fmtCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(value);
}

/** Format a number as compact USD, e.g. $12.4k */
export function fmtCompact(value) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

/** Format a date string as "Jan 15, 2024" */
export function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/** Format a date string as "January 2024" */
export function fmtDateLong(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long',
  });
}
