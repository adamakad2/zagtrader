import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { portfolioHistory } from "../data";
import type { DateRange, AllocationSlice } from "../types";

const ALLOCATION_COLORS = [
  "#4472C4",
  "#1F3864",
  "#7B9FD4",
  "#2D5AA0",
  "#A8C1E8",
  "#64748B",
];

function fmt(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`;
}

function fmtFull(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

interface DonutChartProps {
  totalValue: number;
  allocationData: AllocationSlice[];
}

export function AllocationDonut({ totalValue, allocationData }: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const active = activeIndex !== null ? allocationData[activeIndex] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocationData}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={95}
              paddingAngle={2}
              dataKey="MarketValue"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {allocationData.map((_, index) => (
                <Cell
                  key={index}
                  fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                  stroke="none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {active ? (
            <>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{active.Symbol}</span>
              <span className="font-mono-data text-lg font-bold text-gray-900">{active.Pct}%</span>
              <span className="text-xs text-gray-400">{fmtFull(active.MarketValue)}</span>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-400 mb-0.5">Total Value</span>
              <span className="font-mono-data text-lg font-bold text-gray-900">{fmtFull(totalValue)}</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {allocationData.map((item, i) => (
          <div
            key={item.Symbol}
            className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }}
            />
            <span className="text-xs text-gray-600 truncate flex-1">{item.Symbol}</span>
            <span className="font-mono-data text-xs font-medium text-gray-700">{item.Pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const DATE_RANGES: DateRange[] = ["1W", "1M", "3M", "1Y", "ALL"];

function filterData(range: DateRange) {
  const all = portfolioHistory;
  const last = new Date(all[all.length - 1].date);
  const cutoffs: Record<DateRange, number> = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
    ALL: 99999,
  };
  const days = cutoffs[range];
  const cutoff = new Date(last);
  cutoff.setDate(cutoff.getDate() - days);
  return all.filter((p) => new Date(p.date) >= cutoff);
}

function formatXAxis(dateStr: string, range: DateRange) {
  const d = new Date(dateStr);
  if (range === "1W" || range === "1M") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

interface LineChartProps {
  height?: number;
}

export function PortfolioLineChart({ height = 240 }: LineChartProps) {
  const [range, setRange] = useState<DateRange>("3M");
  const data = filterData(range);

  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const firstVal = data[0]?.value ?? 0;
  const lastVal = data[data.length - 1]?.value ?? 0;
  const change = lastVal - firstVal;
  const changePct = ((change / firstVal) * 100).toFixed(2);
  const isPositive = change >= 0;

  const yMin = Math.floor((minVal * 0.995) / 1000) * 1000;
  const yMax = Math.ceil((maxVal * 1.005) / 1000) * 1000;

  return (
    <div className="flex flex-col gap-3">
      {/* Subheader row */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono-data text-sm font-semibold" style={{ color: isPositive ? "#16A34A" : "#DC2626" }}>
            {isPositive ? "+" : ""}{fmtFull(change)}
          </span>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{
            background: isPositive ? "#F0FDF4" : "#FEF2F2",
            color: isPositive ? "#16A34A" : "#DC2626",
          }}>
            {isPositive ? "▲" : "▼"} {Math.abs(parseFloat(changePct))}%
          </span>
        </div>

        {/* Date range selector */}
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

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4472C4" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#4472C4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatXAxis(v, range)}
              tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={(v) => fmt(v)}
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
              labelStyle={{ color: "#64748B", marginBottom: 4 }}
              formatter={(value) => [fmtFull(Number(value)), "Portfolio Value"]}
              labelFormatter={(label) => typeof label === "string" ? new Date(label).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : String(label)}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4472C4"
              strokeWidth={2}
              fill="url(#portfolioGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#4472C4", stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
