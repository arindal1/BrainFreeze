"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center bg-void px-5 text-frost">
        <div className="grain w-full max-w-lg text-center">
          <p className="label mb-6 flex items-center justify-center gap-3 text-flare">
            <span aria-hidden className="signal inline-block h-1.5 w-1.5 bg-current" />
            Critical fault
          </p>

          <h1 className="display text-[length:var(--step-4)] leading-[0.85]">
            INSTRUMENT
            <br />
            OFFLINE
          </h1>

          <p className="lede mx-auto mt-6">
            The application shell failed to render. Reloading usually clears it.
          </p>

          <button
            onClick={() => reset()}
            className="pressure group label mt-10 inline-flex items-center gap-3 border border-[color:var(--line-hot)] px-7 py-4 text-flare transition-colors duration-300 hover:text-frost"
          >
            Reload
            <span aria-hidden className="transition-transform duration-300 group-hover:rotate-180">
              ↺
            </span>
          </button>
        </div>
      </body>
    </html>
  );
}