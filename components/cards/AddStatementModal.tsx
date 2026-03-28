"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CreditCard } from "@/types";
import { CARD_COLOR_MAP, TODAY } from "@/lib/utils";

interface AddStatementModalProps {
  cards: CreditCard[];
  onClose: () => void;
  onSuccess: () => void;
}

function computeDueDate(card: CreditCard, closingDateStr: string): string {
  const closeDate = new Date(closingDateStr + "T00:00:00");
  // Minimum 21 days after close
  const minDue = new Date(closeDate.getTime() + 21 * 24 * 60 * 60 * 1000);

  let y = minDue.getFullYear();
  let m = minDue.getMonth(); // 0-indexed
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const clampedDay = Math.min(card.dueDay, daysInMonth);
  let due = new Date(y, m, clampedDay);

  if (due < minDue) {
    m++;
    if (m > 11) { m = 0; y++; }
    const din = new Date(y, m + 1, 0).getDate();
    due = new Date(y, m, Math.min(card.dueDay, din));
  }

  return due.toISOString().split("T")[0];
}

export default function AddStatementModal({ cards, onClose, onSuccess }: AddStatementModalProps) {
  const [cardId, setCardId] = useState<string | null>(null);
  const [closingDate, setClosingDate] = useState(TODAY);
  const [dueDate, setDueDate] = useState("");
  const [balance, setBalance] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [paidInFull, setPaidInFull] = useState(false);
  const [paidDate, setPaidDate] = useState(TODAY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCard = cards.find((c) => c.id === cardId) ?? null;

  function handleCardSelect(id: string) {
    setCardId(id);
    const card = cards.find((c) => c.id === id);
    if (card) setDueDate(computeDueDate(card, closingDate));
  }

  function handleClosingChange(val: string) {
    setClosingDate(val);
    if (selectedCard) setDueDate(computeDueDate(selectedCard, val));
  }

  const statementMonth = closingDate.substring(0, 7);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cardId) { setError("Please select a card."); return; }
    if (!balance || parseFloat(balance) <= 0) { setError("Please enter the statement balance."); return; }
    if (!dueDate) { setError("Please set a due date."); return; }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          statementMonth,
          closingDate,
          dueDate,
          statementBalance: parseFloat(balance),
          minimumPayment: parseFloat(minPayment) || 0,
          paidInFull,
          paidDate: paidInFull ? paidDate : null,
        }),
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Add Statement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

          {/* Card selector */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-2">Card</label>
            <div className="flex flex-wrap gap-2">
              {cards.map((card) => {
                const colors = CARD_COLOR_MAP[card.color];
                const isSelected = cardId === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleCardSelect(card.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
                      isSelected
                        ? `${colors.bg} ${colors.text} ${colors.border}`
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: colors.hex }}
                    />
                    {card.issuer}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Closing Date</label>
              <input
                type="date"
                value={closingDate}
                onChange={(e) => handleClosingChange(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Statement Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-sm border border-slate-200 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Min. Payment <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minPayment}
                  onChange={(e) => setMinPayment(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-sm border border-slate-200 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Paid in full */}
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={paidInFull}
                onChange={(e) => setPaidInFull(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-slate-900"
              />
              <span className="text-sm font-medium text-slate-700">Already paid in full</span>
            </label>
            {paidInFull && (
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Date Paid</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add Statement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
