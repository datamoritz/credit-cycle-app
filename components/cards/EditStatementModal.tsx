"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CreditCard, Statement } from "@/types";
import { formatCurrency, CARD_COLOR_MAP, TODAY } from "@/lib/utils";

interface EditStatementModalProps {
  statement: Statement;
  card: CreditCard;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditStatementModal({
  statement,
  card,
  onClose,
  onSuccess,
}: EditStatementModalProps) {
  const [payment, setPayment] = useState("");
  const [paidDate, setPaidDate] = useState(TODAY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = CARD_COLOR_MAP[card.color];
  const remaining = statement.remainingAmount;
  const paymentNum = parseFloat(payment) || 0;
  const newRemaining = Math.max(0, remaining - paymentNum);

  function handlePaidInFull() {
    setPayment(remaining.toFixed(2));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (paymentNum <= 0) { setError("Please enter a payment amount."); return; }
    if (paymentNum > remaining + 0.005) {
      setError(`Payment exceeds the remaining balance of ${formatCurrency(remaining)}.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/statements/${statement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additionalPayment: paymentNum, paidDate }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      onSuccess();
    } catch (e) {
      setError(String(e));
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: colors.hex }}
            />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 leading-tight">{card.issuer}</h2>
              <p className="text-xs text-slate-400 leading-tight">{statement.statementMonth}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance summary */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50">
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Balance</p>
            <p className="text-sm font-semibold text-slate-900 tabular-nums">
              {formatCurrency(statement.statementBalance)}
            </p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Paid</p>
            <p className="text-sm font-semibold text-slate-900 tabular-nums">
              {formatCurrency(statement.paidAmount)}
            </p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Remaining</p>
            <p className={`text-sm font-semibold tabular-nums ${remaining > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {remaining > 0 ? formatCurrency(remaining) : "Paid"}
            </p>
          </div>
        </div>

        {remaining <= 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-emerald-600 font-medium">This statement is fully paid.</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

            {/* Paid in full shortcut */}
            <button
              type="button"
              onClick={handlePaidInFull}
              className="w-full py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Paid in Full — {formatCurrency(remaining)}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="flex-1 border-t border-slate-200" />
              <span>or enter amount</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Payment amount */}
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Payment Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  min="0.01"
                  max={remaining}
                  step="0.01"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  className="w-full text-sm border border-slate-200 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              {paymentNum > 0 && paymentNum <= remaining && (
                <p className="text-xs text-slate-400 mt-1.5">
                  Remaining after payment:{" "}
                  <span className={`font-medium ${newRemaining === 0 ? "text-emerald-600" : "text-slate-700"}`}>
                    {newRemaining === 0 ? "Paid in full" : formatCurrency(newRemaining)}
                  </span>
                </p>
              )}
            </div>

            {/* Payment date */}
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Payment Date</label>
              <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || paymentNum <= 0}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Record Payment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
