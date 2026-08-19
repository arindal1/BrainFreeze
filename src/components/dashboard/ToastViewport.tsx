"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { subscribeToasts, type Toast } from "@/lib/toastBus";
import { fireJobAlert } from "@/lib/jobAlerts";

const AUTO_DISMISS_MS = 8000;

/**
 * Renders in-app toasts pushed via `toastBus` and bridges service-worker
 * `push-job-update` messages (fired when a push arrives while a tab is
 * visible, see `public/sw.js`) into the same alert funnel as the SSE-driven
 * detector in `useResearchJobs`, so both paths dedupe against each other.
 */
export function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, AUTO_DISMISS_MS);
    });

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "push-job-update") return;
      fireJobAlert({
        id: event.data.jobId,
        query: event.data.body ?? "",
        status: event.data.title === "Research ready" ? "COMPLETED" : "FAILED",
      });
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", onMessage);
    }

    return () => {
      unsubscribe();
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", onMessage);
      }
    };
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-end gap-3 p-4 sm:p-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto w-full max-w-sm border-2 bg-[color:var(--carbon-hi)] px-5 py-4 ${
              toast.tone === "failed" ? "border-[#ff3b6b]" : "border-[color:var(--line-strong)]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className={`label ${toast.tone === "failed" ? "text-[#ff3b6b]" : "text-cryo"}`}>
                  {toast.title}
                </p>
                <p className="mt-1 truncate text-sm text-frost-muted">{toast.body}</p>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="label shrink-0 text-frost-dim hover:text-frost"
              >
                Close
              </button>
            </div>
            {toast.href && (
              <Link
                href={toast.href}
                onClick={() => dismiss(toast.id)}
                className="label draw mt-3 inline-block text-frost-muted hover:text-flare"
              >
                View document
              </Link>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}