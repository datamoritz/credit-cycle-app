import { isDemoMode, backendFetch } from "@/lib/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isDemoMode()) {
    return Response.json({ ok: true, demo: true });
  }

  try {
    const body = await request.json();
    const data = await backendFetch(`/statements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return Response.json(data);
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
