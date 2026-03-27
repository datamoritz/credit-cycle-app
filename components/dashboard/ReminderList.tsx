import { CreditCard, Reminder } from "@/types";
import { formatDate, formatCurrency, daysUntil, getDaysLabel, CARD_COLOR_MAP } from "@/lib/utils";
import EventIcon from "@/components/ui/EventIcon";

interface ReminderListProps {
  reminders: Reminder[];
  cards: CreditCard[];
}

export default function ReminderList({ reminders, cards }: ReminderListProps) {
  if (reminders.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4 text-center">
        No upcoming reminders
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {reminders.map((rem) => {
        const card = cards.find((c) => c.id === rem.cardId);
        const colors = card ? CARD_COLOR_MAP[card.color] : CARD_COLOR_MAP.blue;
        const days = daysUntil(rem.date);
        const overdue = days < 0;

        return (
          <div
            key={rem.id}
            className={`flex gap-3 p-3 rounded-lg border ${
              rem.priority === "high" && !overdue
                ? "border-amber-200 bg-amber-50"
                : overdue
                ? "border-red-200 bg-red-50"
                : "border-slate-100 bg-slate-50"
            }`}
          >
            {/* Left: event icon */}
            <div className="mt-0.5">
              <EventIcon type={rem.type} size={15} />
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-800 leading-snug">
                  {rem.title}
                </p>
                {rem.amount && (
                  <span className="text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                    {formatCurrency(rem.amount)}
                  </span>
                )}
              </div>

              {rem.note && (
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {rem.note}
                </p>
              )}

              <div className="flex items-center gap-2 mt-1.5">
                {/* Card chip */}
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  {card?.issuer ?? rem.cardId}
                </span>
                {/* Date */}
                <span className="text-xs text-slate-400">
                  {formatDate(rem.date)}
                </span>
                {/* Days label */}
                <span
                  className={`text-xs font-medium ${
                    overdue
                      ? "text-red-600"
                      : days <= 3
                      ? "text-amber-600"
                      : "text-slate-400"
                  }`}
                >
                  {getDaysLabel(days)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
