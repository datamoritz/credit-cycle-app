import { CreditCard, TimelineEvent } from "@/types";
import { TODAY } from "@/lib/utils";

/**
 * Computes recurrent timeline events from card data.
 * Generates statement_close, recommended_pay_by, and payment_due events
 * for a window of months around today.
 */
export function computeTimelineEvents(cards: CreditCard[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  const [todayYear, todayMonth] = TODAY.split("-").map(Number);

  // Generate events for months: -2 to +4 relative to current month
  for (let offset = -2; offset <= 4; offset++) {
    let year = todayYear;
    let month = todayMonth + offset; // 1-indexed

    // Normalize month overflow
    while (month > 12) { month -= 12; year += 1; }
    while (month < 1)  { month += 12; year -= 1; }

    const monthStr = `${year}-${String(month).padStart(2, "0")}`;

    // Next month for payment_due
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) { nextMonth = 1; nextYear += 1; }
    const nextMonthStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

    for (const card of cards) {
      const { statementCloseDay, dueDay, postingBufferDays } = card;

      // 1. Statement close
      const closeDay = Math.min(statementCloseDay, daysInMonth(year, month));
      const closeDate = `${monthStr}-${String(closeDay).padStart(2, "0")}`;

      events.push({
        id: `${card.id}-close-${monthStr}`,
        cardId: card.id,
        date: closeDate,
        type: "statement_close",
        label: `${card.issuer} statement closes`,
      });

      // 2. Reduce By (recommended_pay_by) — bufferDays before close
      let reduceDay = closeDay - postingBufferDays;
      let reduceMonth = month;
      let reduceYear = year;
      if (reduceDay < 1) {
        // Spills into previous month
        reduceMonth -= 1;
        if (reduceMonth < 1) { reduceMonth = 12; reduceYear -= 1; }
        const prevDays = daysInMonth(reduceYear, reduceMonth);
        reduceDay = prevDays + reduceDay;
      }
      const reduceMonthStr = `${reduceYear}-${String(reduceMonth).padStart(2, "0")}`;
      const reduceDate = `${reduceMonthStr}-${String(reduceDay).padStart(2, "0")}`;

      events.push({
        id: `${card.id}-reduceby-${monthStr}`,
        cardId: card.id,
        date: reduceDate,
        type: "recommended_pay_by",
        label: `${card.issuer} reduce by`,
      });

      // 3. Payment due — dueDay of next month
      const payDay = Math.min(dueDay, daysInMonth(nextYear, nextMonth));
      const dueDate = `${nextMonthStr}-${String(payDay).padStart(2, "0")}`;

      events.push({
        id: `${card.id}-due-${monthStr}`,
        cardId: card.id,
        date: dueDate,
        type: "payment_due",
        label: `${card.issuer} payment due`,
      });
    }
  }

  // Deduplicate by id (shouldn't be needed, but safe)
  const seen = new Set<string>();
  return events.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate(); // month is 1-indexed here
}
