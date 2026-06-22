"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

/**
 * Global error boundary (App Router convention). Catches unhandled runtime
 * errors anywhere in the route tree and shows a recoverable fallback instead
 * of a blank screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where you'd forward to Sentry / your logger.
    console.error("LUMEN route error:", error);
  }, [error]);

  return (
    <div className="container-edge flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="eyebrow mb-4">Something went wrong</p>
      <h1 className="text-display-lg font-bold tracking-tight">Hit a snag.</h1>
      <p className="mt-4 max-w-md text-ink-muted dark:text-paper/60">
        An unexpected error occurred while rendering this page. You can try
        again, or head back to safety.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink-muted dark:text-paper/40">
          Ref: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="btn-primary">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <Link href="/" className="btn-ghost">
          <Home className="h-4 w-4" /> Home
        </Link>
      </div>
    </div>
  );
}
