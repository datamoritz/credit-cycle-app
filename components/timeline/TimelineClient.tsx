"use client";

import { useState } from "react";
import { List, CalendarDays, ChevronDown } from "lucide-react";
import CardShell from "@/components/ui/CardShell";
import TimelineView from "@/components/timeline/TimelineView";
import CalendarView from "@/components/timeline/CalendarView";
import { CreditCard, TimelineEvent } from "@/types";

type ViewMode = "timeline" | "calendar";

interface TimelineClientProps {
  cards: CreditCard[];
  events: TimelineEvent[];
}

export default function TimelineClient({ cards, events }: TimelineClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [cardFilter, setCardFilter] = useState("all");

  const cardOptions = [
    { id: "all", label: "All Cards" },
    ...cards.map((c) => ({ id: c.id, label: c.issuer })),
  ];

  const filteredEvents =
    cardFilter === "all"
      ? events
      : events.filter((e) => e.cardId === cardFilter);

  const sortedEvents = [...filteredEvents].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="hidden lg:block">
        <h1 className="text-xl font-bold text-slate-900">Timeline</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Statement closes, due dates, and reduce-by dates across all cards
        </p>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === "timeline"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Timeline
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Calendar
          </button>
        </div>

        {/* Card filter dropdown */}
        <div className="relative">
          <select
            value={cardFilter}
            onChange={(e) => setCardFilter(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
          >
            {cardOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

      </div>

      {/* Event count */}
      <p className="text-xs text-slate-400">
        {sortedEvents.length} event{sortedEvents.length !== 1 ? "s" : ""}
        {cardFilter !== "all" &&
          ` · ${cards.find((c) => c.id === cardFilter)?.issuer}`}
      </p>

      {/* View */}
      <CardShell padding={viewMode === "timeline" ? "none" : "md"}>
        {viewMode === "timeline" ? (
          <TimelineView events={sortedEvents} cards={cards} />
        ) : (
          <CalendarView events={sortedEvents} cards={cards} />
        )}
      </CardShell>
    </div>
  );
}
