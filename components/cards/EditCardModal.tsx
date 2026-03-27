"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CreditCard, CardColor } from "@/types";
import { CARD_COLOR_MAP } from "@/lib/utils";

interface EditCardModalProps {
  card: CreditCard;
  onClose: () => void;
  onSuccess: () => void;
}

const COLOR_OPTIONS: { value: CardColor; label: string }[] = [
  { value: "orange", label: "Orange" },
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
  { value: "teal", label: "Navy" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 block mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT =
  "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300";

export default function EditCardModal({
  card,
  onClose,
  onSuccess,
}: EditCardModalProps) {
  const [form, setForm] = useState({
    issuer: card.issuer,
    name: card.name,
    last4: card.last4,
    color: card.color as CardColor,
    creditLimit: String(card.creditLimit),
    apr: String(card.apr),
    autoPay:
      card.autoPay === true ? "true" : card.autoPay === false ? "false" : "",
    statementCloseDay: String(card.statementCloseDay),
    dueDay: String(card.dueDay),
    postingBufferDays: String(card.postingBufferDays),
    nextCloseDate: card.nextCloseDate,
    nextDueDate: card.nextDueDate,
    recommendedPayByDate: card.recommendedPayByDate,
    rewards: card.rewards ?? "",
    activeSince: card.activeSince ?? "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: Partial<CreditCard> = {
        issuer: form.issuer,
        name: form.name,
        last4: form.last4,
        color: form.color,
        creditLimit: parseFloat(form.creditLimit),
        apr: parseFloat(form.apr),
        autoPay:
          form.autoPay === "true"
            ? true
            : form.autoPay === "false"
            ? false
            : undefined,
        statementCloseDay: parseInt(form.statementCloseDay),
        dueDay: parseInt(form.dueDay),
        postingBufferDays: parseInt(form.postingBufferDays),
        nextCloseDate: form.nextCloseDate,
        nextDueDate: form.nextDueDate,
        recommendedPayByDate: form.recommendedPayByDate,
        rewards: form.rewards || undefined,
        activeSince: form.activeSince || undefined,
      };

      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-sm font-semibold text-slate-900">Edit Card</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
          {/* Basic info */}
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Basic Info
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Issuer">
                <input
                  type="text"
                  value={form.issuer}
                  onChange={(e) => set("issuer", e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Card Name">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Last 4 Digits">
                <input
                  type="text"
                  maxLength={4}
                  value={form.last4}
                  onChange={(e) => set("last4", e.target.value.replace(/\D/g, ""))}
                  className={INPUT}
                />
              </Field>
              <Field label="Active Since">
                <input
                  type="date"
                  value={form.activeSince}
                  onChange={(e) => set("activeSince", e.target.value)}
                  className={INPUT}
                />
              </Field>
            </div>

            {/* Color picker */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-500 block mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((opt) => {
                  const colors = CARD_COLOR_MAP[opt.value];
                  const isSelected = form.color === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("color", opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                        isSelected
                          ? `${colors.bg} ${colors.text} ${colors.border}`
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: colors.hex }}
                      />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Financial */}
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Financial
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Credit Limit ($)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.creditLimit}
                  onChange={(e) => set("creditLimit", e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="APR (%)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.apr}
                  onChange={(e) => set("apr", e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Auto Pay">
                <select
                  value={form.autoPay}
                  onChange={(e) => set("autoPay", e.target.value)}
                  className={INPUT}
                >
                  <option value="">Unknown</option>
                  <option value="true">Yes — Auto Pay ON</option>
                  <option value="false">No — Manual Pay</option>
                </select>
              </Field>
              <Field label="Rewards / Cashback">
                <input
                  type="text"
                  value={form.rewards}
                  onChange={(e) => set("rewards", e.target.value)}
                  placeholder="e.g. 1% base, 5% rotating"
                  className={INPUT}
                />
              </Field>
            </div>
          </section>

          {/* Billing cycle */}
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Billing Cycle
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Statement Close Day">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={form.statementCloseDay}
                  onChange={(e) => set("statementCloseDay", e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Payment Due Day">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={form.dueDay}
                  onChange={(e) => set("dueDay", e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Posting Buffer (days)">
                <input
                  type="number"
                  min="0"
                  max="14"
                  value={form.postingBufferDays}
                  onChange={(e) => set("postingBufferDays", e.target.value)}
                  className={INPUT}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <Field label="Next Close Date">
                <input
                  type="date"
                  value={form.nextCloseDate}
                  onChange={(e) => set("nextCloseDate", e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Next Due Date">
                <input
                  type="date"
                  value={form.nextDueDate}
                  onChange={(e) => set("nextDueDate", e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Reduce By Date">
                <input
                  type="date"
                  value={form.recommendedPayByDate}
                  onChange={(e) => set("recommendedPayByDate", e.target.value)}
                  className={INPUT}
                />
              </Field>
            </div>
          </section>

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
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
