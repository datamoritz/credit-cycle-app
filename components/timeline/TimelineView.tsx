"use client";

import { Fragment } from "react";
import { CreditCard, TimelineEvent } from "@/types";
import { CARD_COLOR_MAP, TODAY, daysUntil, getDaysLabel } from "@/lib/utils";
import EventIcon from "@/components/ui/EventIcon";

const SHORT_LABEL: Record<string, string> = {
  statement_close: "Close",
  payment_due: "Due",
  recommended_pay_by: "Reduce",
  planned_payment: "Payment",
  reminder: "Reminder",
};

interface TimelineViewProps {
  events: TimelineEvent[];
  cards: CreditCard[];
}

function groupByDate(events: TimelineEvent[]) {
  const map = new Map<string, TimelineEvent[]>();
  for (const evt of events) {
    const existing = map.get(evt.date) ?? [];
    map.set(evt.date, [...existing, evt]);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function TimelineView({ events, cards }: TimelineViewProps) {
  const upcomingEvents = events.filter((e) => daysUntil(e.date) >= 0);
  const grouped = groupByDate(upcomingEvents);

  if (grouped.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">No upcoming events</p>
    );
  }

  const cols = cards.length;

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `76px repeat(${cols}, 1fr)` }}
    >
      {/* ── Sticky header row ── */}
      {/* Date header cell */}
      <div className="sticky top-0 bg-white z-10 px-2 py-2.5 border-b border-slate-200" />

      {/* Card header cells */}
      {cards.map((card) => {
        const colors = CARD_COLOR_MAP[card.color];
        return (
          <div
            key={card.id}
            className="sticky top-0 bg-white z-10 px-2 py-2.5 border-b border-slate-200"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: colors.hex }}
              />
              <span className="text-xs font-semibold text-slate-700 truncate">
                {card.issuer}
              </span>
            </div>
          </div>
        );
      })}

      {/* ── Date rows ── */}
      {grouped.map(([date, dayEvents]) => {
        const daysFromNow = daysUntil(date);
        const isToday = date === TODAY;
        const rowBg = isToday ? "bg-blue-50/50" : "";

        return (
          <Fragment key={date}>
            {/* Date cell */}
            <div className={`px-2 py-2.5 border-b border-slate-100 ${rowBg}`}>
              <p
                className={`text-xs font-bold leading-tight ${
                  isToday ? "text-blue-600" : "text-slate-700"
                }`}
              >
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-slate-400 leading-tight mt-0.5">
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </p>
              {daysFromNow >= 0 && daysFromNow <= 7 && (
                <p className="text-xs font-medium text-amber-500 mt-0.5 leading-tight">
                  {getDaysLabel(daysFromNow)}
                </p>
              )}
            </div>

            {/* Card event cells */}
            {cards.map((card) => {
              const cardEvents = dayEvents.filter((e) => e.cardId === card.id);
              const colors = CARD_COLOR_MAP[card.color];
              return (
                <div
                  key={card.id}
                  className={`px-2 py-2.5 border-b border-slate-100 space-y-1 ${rowBg}`}
                >
                  {cardEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-center gap-1 px-1.5 py-1 rounded-sm"
                      style={{
                        backgroundColor: `${colors.hex}1a`,
                        borderLeft: `2px solid ${colors.hex}`,
                      }}
                    >
                      <EventIcon
                        type={evt.type}
                        size={10}
                        colorClass="text-slate-400"
                        className="shrink-0"
                      />
                      <span
                        className="text-xs font-semibold truncate"
                        style={{ color: colors.hex }}
                      >
                        {SHORT_LABEL[evt.type] ?? evt.type}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}
