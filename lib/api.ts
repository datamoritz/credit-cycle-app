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

type BackendFetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

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
  options: BackendFetchOptions = {}
): Promise<unknown> {
  if (!BACKEND_URL) {
    throw new Error(
      "[api] backendFetch called but BACKEND_URL is not set. " +
        "Set BACKEND_URL in your environment or check isDemoMode() first."
    );
  }

  if (!API_SECRET) {
    throw new Error(
      "[api] API_SECRET env var is not set. Configure it in Vercel environment variables (server-side only)."
    );
  }

  const url = `${BACKEND_URL}${path}`;
  const { headers, next, ...requestInit } = options;

  const res = await fetch(url, {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_SECRET}`,
      ...(headers ?? {}),
    },
    ...(next
      ? { next }
      : {
          next: {
            revalidate: 300,
          },
        }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`[api] Backend responded ${res.status} for ${path}: ${body}`);
  }

  return res.json();
}
