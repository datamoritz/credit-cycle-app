import { isDemoMode, backendFetch } from "@/lib/api";

export async function POST(request: Request) {
  if (isDemoMode()) {
    return Response.json({ ok: true, demo: true });
  }

  try {
    const body = await request.json();
    const data = await backendFetch("/statements", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return Response.json(data);
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
