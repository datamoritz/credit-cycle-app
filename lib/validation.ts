import { CardColor } from "@/types";

const CARD_COLORS = new Set<CardColor>([
  "blue",
  "orange",
  "teal",
  "red",
  "purple",
  "green",
]);

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readJsonObject(
  request: Request
): Promise<Record<string, unknown>> {
  const body = await request.json();

  if (!isRecord(body)) {
    throw new Error("Request body must be a JSON object.");
  }

  return body;
}

export function isCardColor(value: unknown): value is CardColor {
  return typeof value === "string" && CARD_COLORS.has(value as CardColor);
}

export function isYearMonthString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}$/.test(value) &&
    (() => {
      const [year, month] = value.split("-").map(Number);
      return month >= 1 && month <= 12 && year >= 1900;
    })()
  );
}

export function isIsoDateString(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function asInteger(value: unknown): number | undefined {
  const num = asNumber(value);
  return Number.isInteger(num) ? num : undefined;
}

export function badRequest(message: string, details?: unknown): Response {
  return Response.json(
    { ok: false, error: message, ...(details ? { details } : {}) },
    { status: 400 }
  );
}

export function serverError(message: string, error: unknown): Response {
  const detail = error instanceof Error ? error.message : String(error);
  return Response.json({ ok: false, error: message, details: detail }, { status: 500 });
}
