/**
 * Authenticated fetch helper for the Hetzner backend.
 *
 * Import this only in server-side code (server components, API routes, loadData).
 * The API_SECRET must never be exposed to the browser — it lives only in
 * server-side environment variables (Vercel: server-only env var).
 *
 * If BACKEND_URL is not set, the app runs in demo mode using local mock data.
 */

import "server-only";

const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "");
const API_SECRET = process.env.API_SECRET;

/** True when no backend is configured — app runs on local demo data. */
export function isDemoMode(): boolean {
  return !BACKEND_URL;
}

/**
 * Fetches from the Hetzner backend with the shared API_SECRET.
 * Throws on non-2xx responses with a descriptive error.
 */
export async function backendFetch(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  if (!BACKEND_URL) {
    throw new Error(
      "[api] backendFetch called but BACKEND_URL is not set. " +
        "Set BACKEND_URL in your environment or check isDemoMode() first."
    );
  }

  const url = `${BACKEND_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(API_SECRET ? { Authorization: `Bearer ${API_SECRET}` } : {}),
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`[api] Backend responded ${res.status} for ${path}: ${body}`);
  }

  return res.json();
}
