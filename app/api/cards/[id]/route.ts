import { revalidateTag } from "next/cache";
import { isDemoMode, backendFetch } from "@/lib/api";
import {
  asInteger,
  asNumber,
  asOptionalString,
  badRequest,
  isCardColor,
  isIsoDateString,
  readJsonObject,
  serverError,
} from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isDemoMode()) {
    // Demo mode: no backend — mutations are no-ops.
    // The client will call router.refresh() which re-fetches demo data unchanged.
    return Response.json({ ok: true, demo: true });
  }

  try {
    const body = await readJsonObject(request);
    const payload: Record<string, unknown> = {};

    if ("issuer" in body) {
      const issuer = asOptionalString(body.issuer);
      if (!issuer) return badRequest("`issuer` must be a non-empty string.");
      payload.issuer = issuer;
    }

    if ("name" in body) {
      const name = asOptionalString(body.name);
      if (!name) return badRequest("`name` must be a non-empty string.");
      payload.name = name;
    }

    if ("last4" in body) {
      const last4 = asOptionalString(body.last4);
      if (!last4 || !/^\d{4}$/.test(last4)) {
        return badRequest("`last4` must be exactly 4 digits.");
      }
      payload.last4 = last4;
    }

    if ("color" in body) {
      if (!isCardColor(body.color)) {
        return badRequest("`color` must be one of the supported card colors.");
      }
      payload.color = body.color;
    }

    if ("creditLimit" in body) {
      const creditLimit = asNumber(body.creditLimit);
      if (creditLimit === undefined || creditLimit < 0) {
        return badRequest("`creditLimit` must be a number greater than or equal to 0.");
      }
      payload.credit_limit = creditLimit;
    }

    if ("apr" in body) {
      const apr = asNumber(body.apr);
      if (apr === undefined || apr < 0) {
        return badRequest("`apr` must be a number greater than or equal to 0.");
      }
      payload.apr = apr;
    }

    if ("autoPay" in body) {
      if (
        body.autoPay !== undefined &&
        body.autoPay !== null &&
        typeof body.autoPay !== "boolean"
      ) {
        return badRequest("`autoPay` must be true, false, or omitted.");
      }
      payload.auto_pay = body.autoPay ?? undefined;
    }

    for (const field of ["statementCloseDay", "dueDay"] as const) {
      if (field in body) {
        const value = asInteger(body[field]);
        if (value === undefined || value < 1 || value > 31) {
          return badRequest(`\`${field}\` must be an integer between 1 and 31.`);
        }
        payload[
          field === "statementCloseDay" ? "statement_close_day" : "due_day"
        ] = value;
      }
    }

    if ("postingBufferDays" in body) {
      const postingBufferDays = asInteger(body.postingBufferDays);
      if (
        postingBufferDays === undefined ||
        postingBufferDays < 0 ||
        postingBufferDays > 31
      ) {
        return badRequest("`postingBufferDays` must be an integer between 0 and 31.");
      }
      payload.posting_buffer_days = postingBufferDays;
    }

    const dateFieldMap = {
      nextCloseDate: "next_close_date",
      nextDueDate: "next_due_date",
      recommendedPayByDate: "recommended_pay_by_date",
      activeSince: "active_since",
    } as const;

    for (const [field, backendField] of Object.entries(dateFieldMap)) {
      if (field in body) {
        const value = body[field];
        if (value !== undefined && value !== null && !isIsoDateString(value)) {
          return badRequest(`\`${field}\` must be a valid ISO date (YYYY-MM-DD).`);
        }
        payload[backendField] = value ?? undefined;
      }
    }

    if ("rewards" in body) {
      payload.rewards = asOptionalString(body.rewards);
    }

    if (Object.keys(payload).length === 0) {
      return badRequest("No valid fields were provided for update.");
    }

    const data = await backendFetch(`/cards/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    revalidateTag("cards", "max");
    revalidateTag("statements", "max");
    return Response.json(data);
  } catch (e) {
    return serverError("Failed to update card.", e);
  }
}
