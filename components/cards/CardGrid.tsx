import Link from "next/link";
import { CreditCard, Statement } from "@/types";
import {
  formatCurrency,
  formatDate,
  daysUntil,
  getDaysLabel,
  CARD_COLOR_MAP,
  utilizationColor,
} from "@/lib/utils";

interface CardGridProps {
  cards: CreditCard[];
  statements: Statement[];
}

function getOpenStatement(statements: Statement[], cardId: string): Statement | undefined {
  return statements
    .filter((s) => s.cardId === cardId && s.remainingAmount > 0)
    .sort((a, b) => b.statementMonth.localeCompare(a.statementMonth))[0];
}

function AutoPayBadge({ autoPay }: { autoPay: boolean | undefined }) {
  if (autoPay === true) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 leading-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        Autopay ON
      </span>
    );
  }
  if (autoPay === false) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 leading-none">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
        Manual Pay
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 leading-none">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
      Autopay?
    </span>
  );
}

export default function CardGrid({ cards, statements }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      {cards.map((card) => {
        const colors = CARD_COLOR_MAP[card.color];
        const openStmt = getOpenStatement(statements, card.id);

        const stmtUtil = openStmt && card.creditLimit > 0
          ? (openStmt.statementBalance / card.creditLimit) * 100
          : 0;

        const dueIn = openStmt ? daysUntil(openStmt.dueDate) : null;
        const reduceIn = daysUntil(card.recommendedPayByDate);

        // Urgency: only show sub-label if strictly < 7 days (and non-negative)
        const dueUrgent  = dueIn    !== null && dueIn    >= 0 && dueIn    < 7;
        const reduceNear = reduceIn >= 0 && reduceIn < 7;

        const barColor = utilizationColor(stmtUtil);

        return (
          <Link key={card.id} href={`/cards/${card.id}`} className="flex">
            <div className="flex flex-col w-full bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">

              {/* Header — issuer + statement only */}
              <div className={`${colors.accent} px-4 pt-2.5 pb-2.5`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-white leading-none">
                    {card.issuer}
                  </p>
                  {openStmt && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-white/55 leading-none mb-0.5">Statement</p>
                      <p className="text-base font-bold text-white tabular-nums leading-none">
                        {formatCurrency(openStmt.statementBalance)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 px-4 pt-3 pb-3 space-y-3">

                {/* Utilization */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-400">Utilization</span>
                    <span className="text-xs tabular-nums text-slate-600 font-medium">
                      {stmtUtil.toFixed(1)}%
                      <span className="text-slate-400 font-normal ml-1">
                        of {formatCurrency(card.creditLimit)}
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.min(stmtUtil, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* Dates — fixed-height slots for uniform card size */}
                <div className="grid grid-cols-3 gap-3">

                  {/* Due */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Due</p>
                    <div className="h-9">
                      {openStmt ? (
                        <>
                          <p className={`text-sm font-semibold leading-tight ${dueUrgent ? "text-red-600" : "text-slate-800"}`}>
                            {formatDate(openStmt.dueDate)}
                          </p>
                          {dueUrgent && dueIn !== null && (
                            <p className="text-xs text-red-500 mt-0.5">
                              {getDaysLabel(dueIn)}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-slate-300">—</p>
                      )}
                    </div>
                  </div>

                  {/* Closes — date only, no sub-label ever */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Closes</p>
                    <div className="h-9">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">
                        {formatDate(card.nextCloseDate)}
                      </p>
                    </div>
                  </div>

                  {/* Reduce By */}
                  <div>
                    <p className="text-xs text-emerald-600 mb-1">Reduce By</p>
                    <div className="h-9">
                      <p className="text-sm font-semibold text-emerald-600 leading-tight">
                        {formatDate(card.recommendedPayByDate)}
                      </p>
                      {reduceNear && (
                        <p className="text-xs text-emerald-500 mt-0.5">
                          {getDaysLabel(reduceIn)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer row: AutoPay left, rewards right */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <AutoPayBadge autoPay={card.autoPay} />
                  <p className="text-xs text-slate-500 leading-relaxed text-right flex-1 min-w-0">
                    {card.rewards ?? ""}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
