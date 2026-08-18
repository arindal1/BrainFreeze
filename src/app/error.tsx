"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CryoFieldBackdrop } from "@/components/three/CryoFieldBackdrop";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grain relative flex min-h-[100svh] flex-col justify-between overflow-hidden border-b border-[color:var(--line-strong)] px-5 pt-32 pb-8 md:px-10">
      <CryoFieldBackdrop heat={2.2} />

      <Link href="/" className="label draw inline-block w-fit text-frost-muted hover:text-frost">
        ← Brain Freeze
      </Link>

      <div className="flex flex-1 flex-col justify-center">
        <p className="label mb-8 flex items-center gap-3 text-flare">
          <span aria-hidden className="signal inline-block h-1.5 w-1.5 bg-current" />
          System fault
        </p>

        <h1 className="display text-[length:var(--step-6)] leading-[0.85]">
          PIPELINE
          <br />
          INTERRUPTED
        </h1>

        <p className="lede mt-7">
          Something broke rendering this page: not in the research pipeline itself. Queued and
          running jobs are unaffected. Try again, or head back to the dashboard.
        </p>

        {error?.message && (
          <pre className="mt-8 max-w-[60ch] overflow-x-auto border border-[color:var(--line-strong)] bg-carbon-hi px-5 py-4 font-mono text-xs text-frost-muted">
            {error.message}
            {error.digest ? `\n\ndigest: ${error.digest}` : null}
          </pre>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Button onClick={() => reset()}>
            Retry
            <span aria-hidden className="transition-transform duration-300 group-hover:rotate-180">
              ↺
            </span>
          </Button>
          <Link href="/dashboard" className="label draw text-frost-muted hover:text-frost">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}