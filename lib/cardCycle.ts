import { CreditCard, Statement } from "@/types";
import { formatLocalDateInput } from "@/lib/utils";

function byNewestStatement(a: Statement, b: Statement): number {
  if (a.closingDate !== b.closingDate) {
    return b.closingDate.localeCompare(a.closingDate);
  }

  return b.statementMonth.localeCompare(a.statementMonth);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function computeDueDate(card: CreditCard, closingDateStr: string): string {
  const closeDate = new Date(`${closingDateStr}T00:00:00`);
  const minDue = new Date(closeDate.getTime() + 21 * 24 * 60 * 60 * 1000);

  let year = minDue.getFullYear();
  let monthIndex = minDue.getMonth();
  let due = new Date(
    year,
    monthIndex,
    Math.min(card.dueDay, daysInMonth(year, monthIndex))
  );

  if (due < minDue) {
    monthIndex += 1;
    if (monthIndex > 11) {
      monthIndex = 0;
      year += 1;
    }

    due = new Date(
      year,
      monthIndex,
      Math.min(card.dueDay, daysInMonth(year, monthIndex))
    );
  }

  return formatLocalDateInput(due);
}

function computeNextCloseDate(card: CreditCard, closingDateStr: string): string {
  const closingDate = new Date(`${closingDateStr}T00:00:00`);
  let year = closingDate.getFullYear();
  let monthIndex = closingDate.getMonth() + 1;

  if (monthIndex > 11) {
    monthIndex = 0;
    year += 1;
  }

  const nextClose = new Date(
    year,
    monthIndex,
    Math.min(card.statementCloseDay, daysInMonth(year, monthIndex))
  );

  return formatLocalDateInput(nextClose);
}

function computeReduceByDate(closeDateStr: string, postingBufferDays: number): string {
  const closeDate = new Date(`${closeDateStr}T00:00:00`);
  const reduceBy = new Date(
    closeDate.getTime() - postingBufferDays * 24 * 60 * 60 * 1000
  );
  return formatLocalDateInput(reduceBy);
}

function getLatestRecordedStatement(
  statements: Statement[],
  cardId: string
): Statement | undefined {
  return statements
    .filter((statement) => statement.cardId === cardId && !statement.isProjected)
    .sort(byNewestStatement)[0];
}

export function getNextCycleDates(
  card: CreditCard,
  statements: Statement[]
): {
  nextCloseDate: string;
  nextDueDate: string;
  recommendedPayByDate: string;
} {
  const latestRecorded = getLatestRecordedStatement(statements, card.id);

  if (!latestRecorded) {
    return {
      nextCloseDate: card.nextCloseDate,
      nextDueDate: card.nextDueDate,
      recommendedPayByDate: card.recommendedPayByDate,
    };
  }

  const nextCloseDate = computeNextCloseDate(card, latestRecorded.closingDate);

  return {
    nextCloseDate,
    nextDueDate: computeDueDate(card, nextCloseDate),
    recommendedPayByDate: computeReduceByDate(nextCloseDate, card.postingBufferDays),
  };
}
