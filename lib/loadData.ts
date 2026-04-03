/**
 * Server-side data loader.
 *
 * Priority:
 *   1. Hetzner backend API  (when BACKEND_URL env var is set)
 *   2. data/demo/*          (local demo data, no backend required)
 *
 * The `server-only` import prevents this module from being accidentally
 * bundled into client-side code.
 */

import "server-only";
import { CardColor, CreditCard, Statement, StatementStatus } from "@/types";
import { isDemoMode, backendFetch } from "./api";
import { CARDS as DEMO_CARDS } from "@/data/demo/cards";
import { STATEMENTS as DEMO_STATEMENTS } from "@/data/demo/statements";

// ─── Backend → frontend mappers (snake_case → camelCase) ─────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCard(r: any): CreditCard {
  return {
    id: r.id,
    name: r.name,
    issuer: r.issuer,
    last4: r.last4,
    color: r.color as CardColor,
    creditLimit: Number(r.credit_limit ?? 0),
    currentBalance: Number(r.current_balance ?? 0),
    availableCredit: Number(r.available_credit ?? 0),
    utilization: Number(r.utilization ?? 0),
    statementCloseDay: Number(r.statement_close_day ?? 0),
    dueDay: Number(r.due_day ?? 0),
    postingBufferDays: Number(r.posting_buffer_days ?? 0),
    nextCloseDate: r.next_close_date ?? "",
    nextDueDate: r.next_due_date ?? "",
    recommendedPayByDate: r.recommended_pay_by_date ?? "",
    minimumPayment: Number(r.minimum_payment ?? 0),
    apr: Number(r.apr ?? 0),
    rewards: r.rewards ?? undefined,
    autoPay: r.auto_pay ?? undefined,
    activeSince: r.active_since ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStatement(r: any): Statement {
  return {
    id: r.id,
    cardId: r.card_id,
    statementMonth: r.statement_month ?? "",
    closingDate: r.closing_date ?? "",
    dueDate: r.due_date ?? "",
    statementBalance: Number(r.statement_balance ?? 0),
    minimumPayment: Number(r.minimum_payment ?? 0),
    paidAmount: Number(r.paid_amount ?? 0),
    paidDate: r.paid_date ?? undefined,
    remainingAmount: Number(r.remaining_amount ?? 0),
    status: (r.status ?? "unpaid") as StatementStatus,
    isProjected: r.is_projected ?? undefined,
  };
}

// ─── Public loaders ───────────────────────────────────────────────────────────

export async function getCards(): Promise<CreditCard[]> {
  if (isDemoMode()) {
    return DEMO_CARDS;
  }
  const data = (await backendFetch("/cards", {
    next: {
      revalidate: 300,
      tags: ["cards"],
    },
  })) as { cards: unknown[] };
  return data.cards.map(mapCard);
}

export async function getStatements(): Promise<Statement[]> {
  if (isDemoMode()) {
    return DEMO_STATEMENTS;
  }
  const data = (await backendFetch("/statements", {
    next: {
      revalidate: 300,
      tags: ["statements"],
    },
  })) as { statements: unknown[] };
  return data.statements.map(mapStatement);
}

// ─── Query helpers (operate on already-loaded arrays) ─────────────────────────

export function getCardById(
  cards: CreditCard[],
  id: string
): CreditCard | undefined {
  return cards.find((c) => c.id === id);
}

export function getStatementsByCardId(
  statements: Statement[],
  cardId: string
): Statement[] {
  return statements
    .filter((s) => s.cardId === cardId)
    .sort((a, b) => b.statementMonth.localeCompare(a.statementMonth));
}

export function getStatementsByDueMonth(
  statements: Statement[],
  month: string // "YYYY-MM"
): Statement[] {
  return statements.filter((s) => s.dueDate?.startsWith(month));
}
