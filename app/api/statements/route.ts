import { revalidateTag } from "next/cache";
import { isDemoMode, backendFetch } from "@/lib/api";
import {
  asNumber,
  badRequest,
  isIsoDateString,
  isYearMonthString,
  readJsonObject,
  serverError,
} from "@/lib/validation";

export async function POST(request: Request) {
  if (isDemoMode()) {
    return Response.json({ ok: true, demo: true });
  }

  try {
    const body = await readJsonObject(request);
    const {
      cardId,
      statementMonth,
      closingDate,
      dueDate,
      statementBalance,
      minimumPayment,
      paidInFull,
      paidDate,
    } = body;

    if (typeof cardId !== "string" || !cardId.trim()) {
      return badRequest("`cardId` is required.");
    }

    if (!isYearMonthString(statementMonth)) {
      return badRequest("`statementMonth` must be in YYYY-MM format.");
    }

    if (!isIsoDateString(closingDate) || !isIsoDateString(dueDate)) {
      return badRequest("`closingDate` and `dueDate` must be valid ISO dates.");
    }

    const normalizedBalance = asNumber(statementBalance);
    if (normalizedBalance === undefined || normalizedBalance <= 0) {
      return badRequest("`statementBalance` must be a number greater than 0.");
    }

    const normalizedMinimumPayment = asNumber(minimumPayment);
    if (
      normalizedMinimumPayment === undefined ||
      normalizedMinimumPayment < 0 ||
      normalizedMinimumPayment > normalizedBalance
    ) {
      return badRequest(
        "`minimumPayment` must be a number between 0 and `statementBalance`."
      );
    }

    if (typeof paidInFull !== "boolean") {
      return badRequest("`paidInFull` must be true or false.");
    }

    if (paidInFull && !isIsoDateString(paidDate)) {
      return badRequest("`paidDate` is required when `paidInFull` is true.");
    }

    if (!paidInFull && paidDate !== null && paidDate !== undefined) {
      return badRequest("`paidDate` must be omitted unless `paidInFull` is true.");
    }

    const data = await backendFetch("/statements", {
      method: "POST",
      body: JSON.stringify({
        card_id: cardId.trim(),
        statement_month: statementMonth,
        closing_date: closingDate,
        due_date: dueDate,
        statement_balance: normalizedBalance,
        minimum_payment: normalizedMinimumPayment,
        paid_in_full: paidInFull,
        paid_date: paidInFull ? paidDate : null,
      }),
    });
    revalidateTag("cards", "max");
    revalidateTag("statements", "max");
    return Response.json(data);
  } catch (e) {
    return serverError("Failed to create statement.", e);
  }
}
