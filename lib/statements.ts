import { Statement } from "@/types";

function byNewestStatement(a: Statement, b: Statement): number {
  if (a.closingDate !== b.closingDate) {
    return b.closingDate.localeCompare(a.closingDate);
  }

  return b.statementMonth.localeCompare(a.statementMonth);
}

export function getLatestPostedStatement(
  statements: Statement[],
  cardId: string
): Statement | undefined {
  return statements
    .filter((s) => s.cardId === cardId && !s.isProjected && s.status !== "pending")
    .sort(byNewestStatement)[0];
}

export function getLatestOpenStatement(
  statements: Statement[],
  cardId: string
): Statement | undefined {
  return statements
    .filter((s) => s.cardId === cardId && s.remainingAmount > 0)
    .sort(byNewestStatement)[0];
}
