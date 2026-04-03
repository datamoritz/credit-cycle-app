"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-700">Something went wrong</p>
        <p className="mt-2 text-sm text-slate-600">
          The app hit an unexpected error while loading this view. You can retry,
          and if it keeps happening, check the server logs for the matching digest.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-slate-400">Digest: {error.digest}</p>
        )}
        <button
          onClick={() => unstable_retry()}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
