import { revalidateTag } from "next/cache";
import { isDemoMode, backendFetch } from "@/lib/api";
import {
  asNumber,
  badRequest,
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
    return Response.json({ ok: true, demo: true });
  }

  try {
    const body = await readJsonObject(request);
    const additionalPayment = asNumber(body.additionalPayment);
    if (additionalPayment === undefined || additionalPayment <= 0) {
      return badRequest("`additionalPayment` must be a number greater than 0.");
    }

    if (!isIsoDateString(body.paidDate)) {
      return badRequest("`paidDate` must be a valid ISO date (YYYY-MM-DD).");
    }

    const data = await backendFetch(`/statements/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        additional_payment: additionalPayment,
        paid_date: body.paidDate,
      }),
    });
    revalidateTag("cards", { expire: 0 });
    revalidateTag("statements", { expire: 0 });
    return Response.json(data);
  } catch (e) {
    return serverError("Failed to update statement.", e);
  }
}
