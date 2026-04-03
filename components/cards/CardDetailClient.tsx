"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  Pencil,
} from "lucide-react";
import CardShell from "@/components/ui/CardShell";
import Badge from "@/components/ui/Badge";
import EditCardModal from "@/components/cards/EditCardModal";
import { CreditCard, Statement } from "@/types";
import {
  formatCurrency,
  formatDate,
  formatDateFull,
  daysUntil,
  getDaysLabel,
  CARD_COLOR_MAP,
  STATUS_META,
} from "@/lib/utils";
import { getLatestPostedStatement } from "@/lib/statements";

interface CardDetailClientProps {
  card: CreditCard;
  statements: Statement[];
}

function utilizationBarColor(pct: number): string {
  if (pct > 30) return "bg-red-500";
  if (pct > 10) return "bg-yellow-400";
  return "bg-emerald-400";
}

function utilizationTextColor(pct: number): string {
  if (pct > 30) return "text-red-200";
  if (pct > 10) return "text-yellow-200";
  return "text-white";
}

export default function CardDetailClient({
  card,
  statements,
}: CardDetailClientProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const colors = CARD_COLOR_MAP[card.color];

  const postedStmt = getLatestPostedStatement(statements, card.id);

  const stmtBalance = postedStmt?.statementBalance ?? 0;
  const stmtUtil =
    card.creditLimit > 0 ? (stmtBalance / card.creditLimit) * 100 : 0;

  const closeIn = daysUntil(card.nextCloseDate);
  const dueIn = daysUntil(card.nextDueDate);
  const payByIn = daysUntil(card.recommendedPayByDate);

  function handleEditSuccess() {
    setEditOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back link */}
      <Link
        href="/cards"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Cards
      </Link>

      {/* Card hero */}
      <div className={`${colors.accent} rounded-2xl px-6 py-5`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">{card.issuer}</p>
            <p className="text-2xl font-bold text-white mt-0.5">{card.name}</p>
            <p className="text-sm text-white/50 mt-1">···· {card.last4}</p>
            {card.rewards && (
              <p className="text-xs text-white/60 mt-2">{card.rewards}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60 mb-0.5">Statement</p>
            <p className="text-3xl font-bold text-white tabular-nums">
              {formatCurrency(stmtBalance)}
            </p>
            <p className="text-xs text-white/60 mt-1">
              of {formatCurrency(card.creditLimit)} limit
            </p>
          </div>
        </div>

        {/* Utilization bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/60 mb-1.5">
            <span>Utilization</span>
            <span className={`font-medium ${utilizationTextColor(stmtUtil)}`}>
              {stmtUtil.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all ${utilizationBarColor(stmtUtil)}`}
              style={{ width: `${Math.min(stmtUtil, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key dates: Due · Close · Reduce */}
      <div className="grid grid-cols-3 gap-3">
        <CardShell padding="sm">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-medium text-slate-500">Payment Due</span>
          </div>
          <p className={`text-sm font-bold ${dueIn >= 0 && dueIn <= 14 ? "text-red-600" : "text-slate-900"}`}>
            {formatDate(card.nextDueDate)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{getDaysLabel(dueIn)}</p>
        </CardShell>

        <CardShell padding="sm">
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-medium text-slate-500">Statement Closes</span>
          </div>
          <p className={`text-sm font-bold ${closeIn >= 0 && closeIn <= 7 ? "text-amber-600" : "text-slate-900"}`}>
            {formatDate(card.nextCloseDate)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{getDaysLabel(closeIn)}</p>
        </CardShell>

        <CardShell padding="sm">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600">Reduce By</span>
          </div>
          <p className={`text-sm font-bold ${payByIn >= 0 && payByIn <= 5 ? "text-emerald-600" : "text-slate-900"}`}>
            {formatDate(card.recommendedPayByDate)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{getDaysLabel(payByIn)}</p>
        </CardShell>
      </div>

      {/* Card details */}
      <CardShell>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Card Details</h2>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Card
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
          {[
            { label: "Issuer", value: card.issuer },
            { label: "Card Name", value: card.name },
            { label: "Last 4", value: `···· ${card.last4}` },
            { label: "Credit Limit", value: formatCurrency(card.creditLimit) },
            { label: "APR", value: `${card.apr}%` },
            {
              label: "Auto Pay",
              value:
                card.autoPay === true
                  ? "On"
                  : card.autoPay === false
                  ? "Off — Manual"
                  : "Unknown",
            },
            {
              label: "Statement Closes Day",
              value: `Day ${card.statementCloseDay}`,
            },
            { label: "Payment Due Day", value: `Day ${card.dueDay}` },
            {
              label: "Posting Buffer",
              value: `${card.postingBufferDays} days`,
            },
            ...(card.activeSince
              ? [
                  {
                    label: "Active Since",
                    value: formatDateFull(card.activeSince),
                  },
                ]
              : []),
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="font-medium text-slate-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </CardShell>

      {/* Statement history */}
      <CardShell padding="none">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">
            Statement History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <th className="px-5 py-3 font-medium">Statement</th>
                <th className="px-5 py-3 font-medium text-right">Balance</th>
                <th className="px-5 py-3 font-medium text-right hidden sm:table-cell">
                  Paid
                </th>
                <th className="px-5 py-3 font-medium text-right">Remaining</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">
                  Status
                </th>
                <th className="px-5 py-3 font-medium text-right hidden lg:table-cell">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody>
              {statements.map((stmt) => {
                const meta = STATUS_META[stmt.status];
                return (
                  <tr
                    key={stmt.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-5 py-3">
                      <span className="font-medium text-slate-800">
                        {new Date(
                          stmt.statementMonth + "-01T00:00:00"
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      {stmt.isProjected && (
                        <span className="ml-2 text-xs text-slate-400 italic">
                          projected
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">
                      {formatCurrency(stmt.statementBalance)}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-600 tabular-nums hidden sm:table-cell">
                      {formatCurrency(stmt.paidAmount)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span
                        className={
                          stmt.remainingAmount > 0
                            ? "text-red-600 font-medium"
                            : "text-slate-400"
                        }
                      >
                        {formatCurrency(stmt.remainingAmount)}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <Badge
                        variant={
                          stmt.status === "paid_in_full"
                            ? "success"
                            : stmt.status === "unpaid"
                            ? "danger"
                            : stmt.status === "partially_paid"
                            ? "warning"
                            : "muted"
                        }
                      >
                        {meta.label}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400 hidden lg:table-cell">
                      {formatDate(stmt.dueDate)}
                    </td>
                  </tr>
                );
              })}
              {statements.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-6 text-center text-sm text-slate-400"
                  >
                    No statements yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardShell>

      {/* Edit card modal */}
      {editOpen && (
        <EditCardModal
          card={card}
          onClose={() => setEditOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
