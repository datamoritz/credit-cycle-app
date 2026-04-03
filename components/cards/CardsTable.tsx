"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { CreditCard, Statement } from "@/types";
import {
  formatCurrency,
  formatDate,
  daysUntil,
  utilizationColor,
  CARD_COLOR_MAP,
} from "@/lib/utils";

interface CardsTableProps {
  cards: CreditCard[];
  statements: Statement[];
  onEdit: (stmt: Statement, card: CreditCard) => void;
}

function getOpenStatement(statements: Statement[], cardId: string): Statement | undefined {
  return statements
    .filter((s) => s.cardId === cardId && s.remainingAmount > 0)
    .sort((a, b) => b.statementMonth.localeCompare(a.statementMonth))[0];
}

function dueDateClass(daysFromNow: number | null): string {
  if (daysFromNow === null || daysFromNow < 0) return "text-slate-400";
  if (daysFromNow < 7)
    return "text-red-700 font-semibold bg-red-100 px-2 py-0.5 rounded-full";
  return "text-slate-800";
}

function closeDateClass(daysFromNow: number): string {
  if (daysFromNow < 0) return "text-slate-400";
  return "text-slate-800";
}

function reduceDateClass(daysFromNow: number): string {
  if (daysFromNow < 0) return "text-slate-400";
  if (daysFromNow < 7)
    return "text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full";
  return "text-slate-800";
}

const TH = "pb-3 font-medium text-center";

export default function CardsTable({ cards, statements, onEdit }: CardsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-200">
            <th className="pb-3 font-medium text-left">Card</th>
            <th className={TH}>Statement</th>
            <th className={TH}>Due Date</th>
            <th className={`${TH} hidden sm:table-cell`}>Utilization</th>
            <th className={`${TH} hidden lg:table-cell`}>Closes</th>
            <th className={TH}>Reduce By</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => {
            const colors = CARD_COLOR_MAP[card.color];
            const openStmt = getOpenStatement(statements, card.id);

            const stmtUtil =
              openStmt && card.creditLimit > 0
                ? (openStmt.statementBalance / card.creditLimit) * 100
                : 0;

            const barColor = utilizationColor(stmtUtil);
            const closeIn = daysUntil(card.nextCloseDate);
            const reduceIn = daysUntil(card.recommendedPayByDate);
            const dueIn = openStmt ? daysUntil(openStmt.dueDate) : null;

            return (
              <tr
                key={card.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
              >
                {/* Card + AutoPay — left aligned */}
                <td className="py-3">
                  <Link href={`/cards/${card.id}`} className="flex items-center gap-2.5 group">
                    <div
                      className={`w-7 h-7 rounded-lg ${colors.accent} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-white text-xs font-bold">
                        {card.issuer.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 group-hover:text-slate-900 leading-tight">
                        {card.issuer}
                      </p>
                      {card.autoPay === true ? (
                        <span className="text-xs font-medium text-emerald-600">Auto Pay</span>
                      ) : card.autoPay === false ? (
                        <span className="text-xs font-bold text-red-600">No Auto Pay !</span>
                      ) : (
                        <span className="text-xs text-slate-400">Auto Pay?</span>
                      )}
                    </div>
                  </Link>
                </td>

                {/* Statement balance + edit */}
                <td className="py-3 text-center">
                  {openStmt ? (
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-semibold tabular-nums text-slate-900">
                        {formatCurrency(openStmt.statementBalance)}
                      </span>
                      <button
                        onClick={(e) => { e.preventDefault(); onEdit(openStmt, card); }}
                        className="text-slate-300 hover:text-slate-500 transition-colors"
                        title="Record payment"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold tabular-nums text-slate-400">
                      {formatCurrency(0)}
                    </span>
                  )}
                </td>

                {/* Due Date */}
                <td className="py-3 text-center">
                  {openStmt ? (
                    <span className={`tabular-nums ${dueDateClass(dueIn)}`}>
                      {formatDate(openStmt.dueDate)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* Utilization — limit + % above bar */}
                <td className="py-3 hidden sm:table-cell">
                  <div className="mx-auto w-36">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs text-slate-400 tabular-nums">
                        {formatCurrency(card.creditLimit)}
                      </span>
                      <span className="text-xs text-slate-700 tabular-nums font-medium">
                        {stmtUtil.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${barColor}`}
                        style={{ width: `${Math.min(stmtUtil, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Closes */}
                <td className="py-3 text-center hidden lg:table-cell">
                  <span className={`tabular-nums ${closeDateClass(closeIn)}`}>
                    {formatDate(card.nextCloseDate)}
                  </span>
                </td>

                {/* Reduce By */}
                <td className="py-3 text-center">
                  <span className={`tabular-nums ${reduceDateClass(reduceIn)}`}>
                    {formatDate(card.recommendedPayByDate)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
