"use client";

import { useState } from "react";
import { CreditCard, Statement } from "@/types";
import {
  formatCurrency,
  formatDate,
  formatDateFull,
  formatMonth,
  CURRENT_MONTH,
  TODAY,
  CARD_COLOR_MAP,
} from "@/lib/utils";

interface MonthlyClientProps {
  cards: CreditCard[];
  statements: Statement[];
}

interface BarDetail {
  card: CreditCard;
  stmt: Statement;
  utilPct: number;
  snapshotBalance: number; // balance at the snapshot date
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getVisibleMonths(currentMonth: string): string[] {
  const [year, month] = currentMonth.split("-").map(Number);
  const result: string[] = [];
  for (let offset = -3; offset <= 1; offset++) {
    let m = month + offset;
    let y = year;
    while (m <= 0) { m += 12; y--; }
    while (m > 12) { m -= 12; y++; }
    result.push(`${y}-${String(m).padStart(2, "0")}`);
  }
  return result;
}

function getDaysInMonth(monthStr: string): number {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function getDefaultDay(monthStr: string, todayStr: string): number {
  const todayMonth = todayStr.substring(0, 7);
  if (monthStr > todayMonth) return 1;
  if (monthStr === todayMonth) return parseInt(todayStr.split("-")[2]);
  return getDaysInMonth(monthStr);
}

function buildSnapshotDate(monthStr: string, day: number): string {
  const d = Math.min(day, getDaysInMonth(monthStr));
  return `${monthStr}-${String(d).padStart(2, "0")}`;
}

/**
 * For each card, find the most recently closed statement as of snapshotDate.
 * Balance = statementBalance if payment hasn't happened yet, else remainingAmount.
 *
 * Note: only a single paidDate per statement is tracked in the data model.
 * The slider reflects a before/after payment change only.
 */
function computeSnapshotBarData(
  cards: CreditCard[],
  allStatements: Statement[],
  snapshotDate: string
): BarDetail[] {
  return cards
    .map((card) => {
      const closed = allStatements
        .filter((s) => s.cardId === card.id && s.closingDate <= snapshotDate)
        .sort((a, b) => b.closingDate.localeCompare(a.closingDate));

      const stmt = closed[0];
      if (!stmt) return null;

      // Reported balance is always the statement balance — payment doesn't change
      // what's reported until the next statement closes.
      const snapshotBalance = stmt.statementBalance;

      const utilPct =
        card.creditLimit > 0 ? (snapshotBalance / card.creditLimit) * 100 : 0;

      return { card, stmt, utilPct, snapshotBalance };
    })
    .filter(Boolean) as BarDetail[];
}

function formatCurrencyCompact(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MonthlyClient({ cards, statements }: MonthlyClientProps) {
  const visibleMonths = getVisibleMonths(CURRENT_MONTH);

  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [sliderDay, setSliderDay] = useState(() => getDefaultDay(CURRENT_MONTH, TODAY));
  const [activeBar, setActiveBar] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(selectedMonth);
  const snapshotDate = buildSnapshotDate(selectedMonth, sliderDay);

  const totalCardLimit = cards.reduce((sum, c) => sum + c.creditLimit, 0);

  // Chart: snapshot utilization at the slider date
  const barData = computeSnapshotBarData(cards, statements, snapshotDate);

  // Total Statements: sum of each card's most recently closed statement balance at the snapshot date
  const totalStatements = barData.reduce((sum, d) => sum + d.snapshotBalance, 0);

  const avgUtil =
    barData.length > 0
      ? barData.reduce((sum, d) => sum + d.utilPct, 0) / barData.length
      : 0;

  const activeDetail = activeBar ? barData.find((d) => d.card.id === activeBar) ?? null : null;

  const monthAbbr = new Date(selectedMonth + "-15T00:00:00").toLocaleDateString("en-US", {
    month: "short",
  });

  const thumbPct = daysInMonth > 1 ? ((sliderDay - 1) / (daysInMonth - 1)) * 100 : 0;

  // Cap chart at 50% if no bar exceeds 50%, otherwise 100%
  const maxUtil = barData.length > 0 ? Math.max(...barData.map((d) => d.utilPct)) : 0;
  const chartMax = maxUtil > 50 ? 100 : 50;

  function handleMonthChange(m: string) {
    setSelectedMonth(m);
    setSliderDay(getDefaultDay(m, TODAY));
    setActiveBar(null);
  }

  return (
    <div className="space-y-6">
      {/* Desktop header */}
      <div className="hidden lg:block">
        <h1 className="text-xl font-bold text-slate-900">Monthly Summary</h1>
        <p className="text-sm text-slate-500 mt-0.5">Reported statement balances by month</p>
      </div>

      {/* Month picker */}
      <div className="flex items-center gap-2 flex-wrap">
        {visibleMonths.map((m) => (
          <button
            key={m}
            onClick={() => handleMonthChange(m)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              selectedMonth === m
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            {formatMonth(m)}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-400 mb-0.5">Total Statements</p>
          <p className="text-lg font-bold tabular-nums text-slate-900">
            {formatCurrency(totalStatements)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">at {formatDate(snapshotDate)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-400 mb-0.5">Total Card Limit</p>
          <p className="text-lg font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalCardLimit)}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-400 mb-0.5">Avg Utilization</p>
          <p className={`text-lg font-bold tabular-nums ${avgUtil > 30 ? "text-orange-600" : "text-slate-900"}`}>
            {avgUtil.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-0.5">at {formatDate(snapshotDate)}</p>
        </div>
      </div>

      {/* Chart card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        {/* Chart title + snapshot label */}
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium text-slate-500">
            Utilization snapshot — click a bar for details
          </p>
          <p className="text-xs font-semibold text-slate-700">{formatDateFull(snapshotDate)}</p>
        </div>

        {/* Date slider */}
        <div className="space-y-1">
          <div className="relative pt-5">
            {/* Day number above thumb */}
            <div
              className="absolute top-0 pointer-events-none"
              style={{ left: `${thumbPct}%`, transform: "translateX(-50%)" }}
            >
              <span className="text-xs font-medium text-slate-500 tabular-nums">{sliderDay}</span>
            </div>
            <input
              type="range"
              min={1}
              max={daysInMonth}
              value={sliderDay}
              onChange={(e) => { setSliderDay(Number(e.target.value)); setActiveBar(null); }}
              className="w-full cursor-pointer appearance-none [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-slate-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:-mt-[5px] [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-slate-200 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-900"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 select-none">
            <span>{monthAbbr} 1</span>
            <span>{monthAbbr} {daysInMonth}</span>
          </div>
        </div>

        {/* Bar chart */}
        {barData.length > 0 ? (
          <div>
            {/* Bar zone */}
            <div className="relative h-40">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((pct) => (
                <div
                  key={pct}
                  className="absolute w-full border-t border-slate-100"
                  style={{ bottom: `${pct}%` }}
                />
              ))}

              {/* 10% threshold */}
              <div
                className="absolute w-full border-t border-dashed border-slate-400 z-10"
                style={{ bottom: `${(10 / chartMax) * 100}%` }}
              >
                <span className="absolute right-0 -top-4 text-xs text-slate-500 font-medium">10%</span>
              </div>
              {/* 30% threshold */}
              <div
                className="absolute w-full border-t border-dashed border-slate-400 z-10"
                style={{ bottom: `${(30 / chartMax) * 100}%` }}
              >
                <span className="absolute right-0 -top-4 text-xs text-slate-500 font-medium">30%</span>
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end gap-4 px-1">
                {barData.map((d) => {
                  const scaledPct = (d.utilPct / chartMax) * 100;
                  const capped = Math.min(scaledPct, 100);
                  const overflow = d.utilPct > chartMax;
                  const colors = CARD_COLOR_MAP[d.card.color];
                  const isActive = activeBar === d.card.id;

                  return (
                    <button
                      key={d.card.id}
                      onClick={() => setActiveBar(isActive ? null : d.card.id)}
                      className="flex-1 relative h-full overflow-visible"
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-md transition-all"
                        style={{
                          height: `${capped}%`,
                          minHeight: "3px",
                          backgroundColor: colors.hex,
                          opacity: isActive ? 1 : 0.78,
                        }}
                      />
                      {/* $ balance label above bar */}
                      <span
                        className="absolute left-1/2 -translate-x-1/2 tabular-nums text-slate-500 pointer-events-none whitespace-nowrap"
                        style={{ bottom: `calc(${capped}% + 3px)`, fontSize: "10px" }}
                      >
                        {formatCurrencyCompact(d.snapshotBalance)}
                      </span>
                      {overflow && (
                        <span
                          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full font-bold tabular-nums"
                          style={{ color: colors.hex, fontSize: "10px" }}
                        >
                          {d.utilPct.toFixed(0)}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Label row — full card names */}
            <div className="flex gap-4 px-1 mt-2">
              {barData.map((d) => {
                const colors = CARD_COLOR_MAP[d.card.color];
                const isActive = activeBar === d.card.id;
                return (
                  <button
                    key={d.card.id}
                    onClick={() => setActiveBar(isActive ? null : d.card.id)}
                    className="flex-1 text-center min-w-0"
                  >
                    <span
                      className={`text-xs font-medium leading-tight block truncate ${colors.text}`}
                    >
                      {d.card.issuer}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-6">
            No closed statements before {formatDate(snapshotDate)}
          </p>
        )}

        {/* Detail panel on bar click */}
        {activeDetail && (
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: CARD_COLOR_MAP[activeDetail.card.color].hex }}
                />
                <span className="text-sm font-semibold text-slate-900">
                  {activeDetail.card.issuer}
                </span>
                <span className="text-xs text-slate-400">
                  {formatMonth(activeDetail.stmt.statementMonth)} statement
                </span>
              </div>
              <span className={`text-sm font-bold tabular-nums ${activeDetail.utilPct > 30 ? "text-orange-600" : "text-slate-900"}`}>
                {activeDetail.utilPct.toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-3 text-xs text-slate-500">
              <div>
                <p>Balance at {formatDate(snapshotDate)}</p>
                <p className="font-semibold text-slate-900 tabular-nums mt-0.5">
                  {formatCurrency(activeDetail.snapshotBalance)}
                </p>
              </div>
              <div>
                <p>Credit Limit</p>
                <p className="font-semibold text-slate-900 tabular-nums mt-0.5">
                  {formatCurrency(activeDetail.card.creditLimit)}
                </p>
              </div>
              <div>
                <p>Statement Total</p>
                <p className="font-semibold text-slate-900 tabular-nums mt-0.5">
                  {formatCurrency(activeDetail.stmt.statementBalance)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
