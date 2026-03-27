"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CreditCard, TimelineEvent } from "@/types";
import { formatCurrency, CARD_COLOR_MAP } from "@/lib/utils";
import EventIcon from "@/components/ui/EventIcon";

interface CalendarViewProps {
  events: TimelineEvent[];
  cards: CreditCard[];
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarView({ events, cards }: CalendarViewProps) {
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(3); // 0-indexed: 3=April

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const monthStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;

  // Map events to day numbers for this month
  const eventsByDay = new Map<number, TimelineEvent[]>();
  for (const evt of events) {
    if (evt.date.startsWith(monthStr)) {
      const day = parseInt(evt.date.split("-")[2]);
      const existing = eventsByDay.get(day) ?? [];
      eventsByDay.set(day, [...existing, evt]);
    }
  }

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const selectedEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : [];

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
    setSelectedDay(null);
  };

  const monthName = new Date(calYear, calMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Build calendar grid cells
  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  return (
    <div className="space-y-4">
      {/* Calendar nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-base font-bold text-slate-900">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {/* Cards */}
        {cards.map((card) => {
          const colors = CARD_COLOR_MAP[card.color];
          return (
            <div key={card.id} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: colors.hex }}
              />
              {card.issuer}
            </div>
          );
        })}
        {/* Event types */}
        <div className="w-px h-3 bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <EventIcon type="statement_close" size={10} colorClass="text-slate-400" /> Close
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <EventIcon type="payment_due" size={10} colorClass="text-slate-400" /> Due
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <EventIcon type="recommended_pay_by" size={10} colorClass="text-slate-400" /> Reduce
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-medium text-slate-400"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            if (!cell.day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-16 border-b border-r border-slate-100 bg-slate-50/50 last:border-r-0"
                />
              );
            }

            const dayEvents = eventsByDay.get(cell.day) ?? [];
            const isSelected = selectedDay === cell.day;
            const isToday = monthStr === "2026-03" && cell.day === 26;

            return (
              <div
                key={cell.day}
                onClick={() => setSelectedDay(isSelected ? null : cell.day)}
                className={`
                  min-h-16 border-b border-r border-slate-100 last:border-r-0 p-1.5 cursor-pointer
                  transition-colors
                  ${isSelected ? "bg-slate-50" : "hover:bg-slate-50/80"}
                  ${Math.floor(idx / 7) === Math.floor((cells.length - 1) / 7) ? "border-b-0" : ""}
                `}
              >
                {/* Day number */}
                <p
                  className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full mb-1
                    ${isToday ? "bg-blue-600 text-white" : "text-slate-600"}
                  `}
                >
                  {cell.day}
                </p>

                {/* Event chips */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((evt) => {
                    const card = cards.find((c) => c.id === evt.cardId);
                    const cardColors = card ? CARD_COLOR_MAP[card.color] : CARD_COLOR_MAP.blue;
                    const SHORT_LABEL: Record<string, string> = {
                      statement_close: "Close",
                      payment_due: "Due",
                      recommended_pay_by: "Reduce",
                      planned_payment: "Payment",
                      reminder: "Reminder",
                    };

                    return (
                      <div
                        key={evt.id}
                        className="flex items-center gap-1 px-1 py-0.5 rounded-sm w-full"
                        style={{
                          backgroundColor: `${cardColors.hex}20`,
                          borderLeft: `2px solid ${cardColors.hex}`,
                        }}
                      >
                        <EventIcon type={evt.type} size={9} colorClass="text-slate-400" className="shrink-0" />
                        <span
                          className="truncate font-semibold"
                          style={{ fontSize: "10px", color: cardColors.hex }}
                        >
                          {SHORT_LABEL[evt.type] ?? evt.type}
                        </span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <p className="text-slate-400" style={{ fontSize: "10px" }}>
                      +{dayEvents.length - 3}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && selectedEvents.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">
            {new Date(calYear, calMonth, selectedDay).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h4>
          <div className="space-y-2">
            {selectedEvents.map((evt) => {
              const card = cards.find((c) => c.id === evt.cardId);
              const cardColors = card ? CARD_COLOR_MAP[card.color] : CARD_COLOR_MAP.blue;
              const SHORT_LABEL: Record<string, string> = {
                statement_close: "Close",
                payment_due: "Due",
                recommended_pay_by: "Reduce",
                planned_payment: "Payment",
                reminder: "Reminder",
              };

              return (
                <div
                  key={evt.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-100 bg-white"
                  style={{ borderLeft: `3px solid ${cardColors.hex}` }}
                >
                  <EventIcon type={evt.type} size={13} colorClass="text-slate-400" className="shrink-0" />
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-800">
                      {card?.issuer ?? evt.cardId}
                    </span>
                    <span className="text-xs text-slate-400">
                      {SHORT_LABEL[evt.type] ?? evt.type}
                    </span>
                    {evt.amount && (
                      <span className="text-xs font-semibold text-slate-700 tabular-nums ml-auto">
                        {formatCurrency(evt.amount)}
                      </span>
                    )}
                  </div>
                  {evt.note && (
                    <p className="text-xs text-slate-500 mt-0.5">{evt.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
