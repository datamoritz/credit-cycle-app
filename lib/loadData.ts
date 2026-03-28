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
import { CreditCard, Statement } from "@/types";
import { isDemoMode, backendFetch } from "./api";
import { CARDS as DEMO_CARDS } from "@/data/demo/cards";
import { STATEMENTS as DEMO_STATEMENTS } from "@/data/demo/statements";

// ─── Public loaders ───────────────────────────────────────────────────────────

export async function getCards(): Promise<CreditCard[]> {
  if (isDemoMode()) {
    return DEMO_CARDS;
  }
  const data = (await backendFetch("/cards")) as { cards: CreditCard[] };
  return data.cards;
}

export async function getStatements(): Promise<Statement[]> {
  if (isDemoMode()) {
    return DEMO_STATEMENTS;
  }
  const data = (await backendFetch("/statements")) as {
    statements: Statement[];
  };
  return data.statements;
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
