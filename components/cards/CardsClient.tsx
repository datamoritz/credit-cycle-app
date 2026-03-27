"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Plus } from "lucide-react";
import CardShell from "@/components/ui/CardShell";
import CardGrid from "@/components/cards/CardGrid";
import CardsTable from "@/components/cards/CardsTable";
import AddStatementModal from "@/components/cards/AddStatementModal";
import EditStatementModal from "@/components/cards/EditStatementModal";
import { CreditCard, Statement } from "@/types";
import { formatCurrency, CURRENT_MONTH, NEXT_MONTH } from "@/lib/utils";

interface CardsClientProps {
  cards: CreditCard[];
  statements: Statement[];
}

export default function CardsClient({ cards, statements }: CardsClientProps) {
  const router = useRouter();
  const [view, setView] = useState<"table" | "grid">("table");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ stmt: Statement; card: CreditCard } | null>(null);

  function handleMutationSuccess() {
    setAddOpen(false);
    setEditTarget(null);
    router.refresh();
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────

  const totalDue = statements
    .filter((s) => s.remainingAmount > 0)
    .reduce((sum, s) => sum + s.remainingAmount, 0);

  const thisMonthStmts = statements.filter((s) =>
    s.dueDate.startsWith(CURRENT_MONTH)
  );
  const thisMonthOpen = thisMonthStmts.reduce((sum, s) => sum + s.remainingAmount, 0);
  const thisMonthTotal = thisMonthStmts.reduce((sum, s) => sum + s.statementBalance, 0);

  const nextMonthStmts = statements.filter((s) =>
    s.dueDate.startsWith(NEXT_MONTH)
  );
  const nextMonthOpen = nextMonthStmts.reduce((sum, s) => sum + s.remainingAmount, 0);
  const nextMonthTotal = nextMonthStmts.reduce((sum, s) => sum + s.statementBalance, 0);

  // ─── Bottom strip ──────────────────────────────────────────────────────────

  const totalLimit = cards.reduce((sum, c) => sum + c.creditLimit, 0);

  // Avg utilization based on open statement balances (not running balance)
  const cardUtils = cards.map((c) => {
    const stmt = statements
      .filter((s) => s.cardId === c.id && s.remainingAmount > 0)
      .sort((a, b) => b.statementMonth.localeCompare(a.statementMonth))[0];
    return stmt && c.creditLimit > 0
      ? (stmt.statementBalance / c.creditLimit) * 100
      : 0;
  });
  const avgUtilization =
    cardUtils.length > 0
      ? cardUtils.reduce((s, v) => s + v, 0) / cardUtils.length
      : 0;

  return (
    <div className="space-y-5">
      {/* Desktop header */}
      <div className="hidden lg:flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cards</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {cards.length} cards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Statement
          </button>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "table"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Table
          </button>
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "grid"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
        </div>
        </div>
      </div>

      {/* Mobile header + toggle */}
      <div className="lg:hidden flex items-center justify-between">
        <p className="text-sm text-slate-500">{cards.length} cards</p>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setView("table")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "table"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-400"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "grid"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-400"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        <CardShell padding="sm">
          <p className="text-xs text-slate-400 mb-0.5">Total Due</p>
          <p className={`text-base font-bold tabular-nums ${totalDue > 0 ? "text-slate-900" : "text-emerald-600"}`}>
            {formatCurrency(totalDue)}
          </p>
        </CardShell>
        <CardShell padding="sm">
          <p className="text-xs text-slate-400 mb-0.5">Due This Month</p>
          <p className="text-base font-bold text-slate-900 tabular-nums">
            {formatCurrency(thisMonthOpen)}
          </p>
          {thisMonthTotal > 0 && (
            <p className="text-xs text-slate-400 tabular-nums">
              / {formatCurrency(thisMonthTotal)}
            </p>
          )}
        </CardShell>
        <CardShell padding="sm">
          <p className="text-xs text-slate-400 mb-0.5">Due Next Month</p>
          <p className="text-base font-bold text-slate-900 tabular-nums">
            {formatCurrency(nextMonthOpen)}
          </p>
          {nextMonthTotal > 0 && (
            <p className="text-xs text-slate-400 tabular-nums">
              / {formatCurrency(nextMonthTotal)}
            </p>
          )}
        </CardShell>
      </div>

      {/* Cards view */}
      {view === "table" ? (
        <CardShell padding="none">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">All Cards</h2>
          </div>
          <div className="px-5 py-4">
            <CardsTable
              cards={cards}
              statements={statements}
              onEdit={(stmt, card) => setEditTarget({ stmt, card })}
            />
          </div>
        </CardShell>
      ) : (
        <CardGrid cards={cards} statements={statements} />
      )}

      {/* Bottom strip — less prominent */}
      <div className="grid grid-cols-2 gap-3 opacity-70">
        <CardShell padding="sm">
          <p className="text-xs text-slate-400 mb-0.5">Total Credit Limit</p>
          <p className="text-sm font-semibold text-slate-700 tabular-nums">
            {formatCurrency(totalLimit)}
          </p>
        </CardShell>
        <CardShell padding="sm">
          <p className="text-xs text-slate-400 mb-0.5">Avg Utilization</p>
          <p className={`text-sm font-semibold tabular-nums ${avgUtilization > 30 ? "text-orange-600" : "text-slate-700"}`}>
            {avgUtilization.toFixed(1)}%
          </p>
        </CardShell>
      </div>

      {/* Modals */}
      {addOpen && (
        <AddStatementModal
          cards={cards}
          onClose={() => setAddOpen(false)}
          onSuccess={handleMutationSuccess}
        />
      )}
      {editTarget && (
        <EditStatementModal
          statement={editTarget.stmt}
          card={editTarget.card}
          onClose={() => setEditTarget(null)}
          onSuccess={handleMutationSuccess}
        />
      )}
    </div>
  );
}
