import { TimelineEvent, Reminder } from "@/types";

export const TIMELINE_EVENTS: TimelineEvent[] = [
  // ─── March 2026 ──────────────────────────────────────────────────────────

  {
    id: "evt-amex-pay-by-mar",
    cardId: "amex",
    date: "2026-03-25",
    type: "recommended_pay_by",
    label: "Reduce balance before close",
    amount: 2340,
    note: "Pay before Mar 28 close to reduce FICO reported utilization",
    urgent: true,
  },
  {
    id: "evt-amex-close-mar",
    cardId: "amex",
    date: "2026-03-28",
    type: "statement_close",
    label: "Statement closes",
    amount: 2340,
    note: "Balance reported to credit bureaus",
  },
  {
    id: "evt-discover-pay-by-mar",
    cardId: "discover",
    date: "2026-03-28",
    type: "recommended_pay_by",
    label: "Reduce balance before close",
    amount: 1150,
    note: "Pay down before Mar 30 statement close",
    urgent: true,
  },
  {
    id: "evt-discover-close-mar",
    cardId: "discover",
    date: "2026-03-30",
    type: "statement_close",
    label: "Statement closes",
    amount: 1150,
  },

  // ─── April 2026 ──────────────────────────────────────────────────────────

  {
    id: "evt-walgreens-pay-by-apr",
    cardId: "walgreens",
    date: "2026-04-03",
    type: "recommended_pay_by",
    label: "Pay before statement closes",
    amount: 180,
  },
  {
    id: "evt-walgreens-close-apr",
    cardId: "walgreens",
    date: "2026-04-05",
    type: "statement_close",
    label: "Statement closes",
    amount: 180,
  },
  {
    id: "evt-chase-due-apr",
    cardId: "chase",
    date: "2026-04-13",
    type: "payment_due",
    label: "Payment due",
    amount: 3420,
    note: "March statement balance due",
    urgent: true,
  },
  {
    id: "evt-chase-pay-by-apr",
    cardId: "chase",
    date: "2026-04-15",
    type: "recommended_pay_by",
    label: "Reduce balance before close",
    amount: 3420,
    note: "Chase closes Apr 18 — pay down early to reduce utilization",
  },
  {
    id: "evt-chase-close-apr",
    cardId: "chase",
    date: "2026-04-18",
    type: "statement_close",
    label: "Statement closes",
    amount: 3420,
  },
  {
    id: "evt-amex-due-apr",
    cardId: "amex",
    date: "2026-04-25",
    type: "payment_due",
    label: "Payment due",
    amount: 2340,
    note: "March statement balance due",
  },
  {
    id: "evt-discover-due-apr",
    cardId: "discover",
    date: "2026-04-27",
    type: "payment_due",
    label: "Payment due",
    amount: 1150,
  },
  {
    id: "evt-amex-close-apr",
    cardId: "amex",
    date: "2026-04-28",
    type: "statement_close",
    label: "Statement closes",
    amount: 1800,
    isProjected: true,
  } as TimelineEvent & { isProjected?: boolean },
  {
    id: "evt-discover-close-apr",
    cardId: "discover",
    date: "2026-04-30",
    type: "statement_close",
    label: "Statement closes",
    amount: 950,
    isProjected: true,
  } as TimelineEvent & { isProjected?: boolean },

  // ─── May 2026 ────────────────────────────────────────────────────────────

  {
    id: "evt-walgreens-due-may",
    cardId: "walgreens",
    date: "2026-05-02",
    type: "payment_due",
    label: "Payment due",
    amount: 180,
  },
  {
    id: "evt-chase-due-may",
    cardId: "chase",
    date: "2026-05-13",
    type: "payment_due",
    label: "Payment due",
    amount: 3420,
  },
  {
    id: "evt-amex-due-may",
    cardId: "amex",
    date: "2026-05-25",
    type: "payment_due",
    label: "Payment due",
    amount: 1800,
    isProjected: true,
  } as TimelineEvent & { isProjected?: boolean },
  {
    id: "evt-discover-due-may",
    cardId: "discover",
    date: "2026-05-27",
    type: "payment_due",
    label: "Payment due",
    amount: 950,
    isProjected: true,
  } as TimelineEvent & { isProjected?: boolean },
];

export const REMINDERS: Reminder[] = [
  {
    id: "rem-1",
    cardId: "amex",
    date: "2026-03-25",
    title: "Amex — reduce open balance before statement closes",
    note: "Statement closes Mar 28. Pay down now so less reports to FICO. Current balance: $2,340.",
    type: "recommended_pay_by",
    priority: "high",
    amount: 2340,
    actionRequired: true,
  },
  {
    id: "rem-2",
    cardId: "discover",
    date: "2026-03-28",
    title: "Discover — reduce balance before statement closes",
    note: "Statement closes Mar 30. Pay down to lower reported utilization. Current balance: $1,150.",
    type: "recommended_pay_by",
    priority: "high",
    amount: 1150,
    actionRequired: true,
  },
  {
    id: "rem-3",
    cardId: "amex",
    date: "2026-03-28",
    title: "Amex — statement closes today",
    note: "Your March statement is closing. Balance of $2,340 will be reported.",
    type: "statement_close",
    priority: "medium",
    amount: 2340,
    actionRequired: false,
  },
  {
    id: "rem-4",
    cardId: "discover",
    date: "2026-03-30",
    title: "Discover — statement closes Mar 30",
    note: "March statement will close. $1,150 will be reported to bureaus.",
    type: "statement_close",
    priority: "medium",
    amount: 1150,
    actionRequired: false,
  },
  {
    id: "rem-5",
    cardId: "chase",
    date: "2026-04-13",
    title: "Chase — payment due Apr 13",
    note: "March statement balance of $3,420 due. Don't miss this.",
    type: "payment_due",
    priority: "high",
    amount: 3420,
    actionRequired: true,
  },
  {
    id: "rem-6",
    cardId: "amex",
    date: "2026-04-25",
    title: "Amex — payment due Apr 25",
    note: "March statement balance of $2,340 due.",
    type: "payment_due",
    priority: "medium",
    amount: 2340,
    actionRequired: true,
  },
  {
    id: "rem-7",
    cardId: "discover",
    date: "2026-04-27",
    title: "Discover — payment due Apr 27",
    note: "March statement balance of $1,150 due.",
    type: "payment_due",
    priority: "medium",
    amount: 1150,
    actionRequired: true,
  },
  {
    id: "rem-8",
    cardId: "chase",
    date: "2026-04-15",
    title: "Chase — reduce balance before Apr 18 close",
    note: "Chase statement closes Apr 18. Pay down now to reduce utilization. Current: $3,420 (28.5%).",
    type: "recommended_pay_by",
    priority: "medium",
    amount: 3420,
    actionRequired: true,
  },
];

export const getEventsByCardId = (cardId: string): TimelineEvent[] =>
  TIMELINE_EVENTS.filter((e) => e.cardId === cardId).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

export const getUpcomingEvents = (days: number = 30): TimelineEvent[] => {
  const today = new Date("2026-03-26");
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  return TIMELINE_EVENTS.filter((e) => {
    const d = new Date(e.date);
    return d >= today && d <= limit;
  }).sort((a, b) => a.date.localeCompare(b.date));
};
