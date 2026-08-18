"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Status } from "@/components/ui/Status";
import type { ResearchJob } from "./useResearchJobs";

function stamp(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTIVE = new Set(["PENDING", "QUEUED", "PROCESSING"]);

/**
 * Ledger row, not a card in a grid. Full-bleed hairline rows read as an
 * instrument log and let the query itself be the largest thing on screen.
 */
export function JobRow({
  job,
  n,
  onCancel,
  onDelete,
}: {
  job: ResearchJob;
  n: number;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const isActive = ACTIVE.has(job.status);
  const isReady = job.status === "COMPLETED";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative border-b border-[color:var(--line-strong)]"
    >
      <div className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-5 gap-y-3 py-6 md:grid-cols-[3.5rem_1fr_9rem_10rem] md:gap-x-8">
        <span className="label text-frost-dim">{String(n).padStart(2, "0")}</span>

        <div className="min-w-0">
          {isReady ? (
            <Link
              href={`/dashboard/research/${job.id}`}
              className="display block truncate text-[length:var(--step-2)] text-frost-muted transition-colors duration-300 hover:text-flare focus-visible:text-flare"
            >
              <span className="absolute inset-0" aria-hidden />
              {job.query}
            </Link>
          ) : (
            <p className="display truncate text-[length:var(--step-2)] text-frost-muted">
              {job.query}
            </p>
          )}

          {job.statusMessage && (
            <p className="label mt-2 truncate text-frost-dim">{job.statusMessage}</p>
          )}
          {job.error && (
            <p className="label mt-2 truncate text-[#ff3b6b]">{job.error}</p>
          )}
        </div>

        <span className="label col-start-2 text-frost-dim md:col-start-3">
          {stamp(job.createdAt)}
        </span>

        <div className="col-start-2 flex items-center justify-between gap-4 md:col-start-4">
          <Status status={job.status} />

          {(onCancel || onDelete) && (
            <span className="relative z-10 flex gap-4 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
              {isActive && onCancel && (
                <button
                  onClick={() => onCancel(job.id)}
                  className="label text-frost-dim hover:text-frost"
                >
                  Stop
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(job.id)}
                  className="label text-frost-dim hover:text-[#ff3b6b]"
                >
                  Delete
                </button>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Progress reads as an instrument trace along the row's baseline */}
      {isActive && (
        <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden bg-transparent">
          <div
            className="h-full bg-flare transition-[width] duration-700 ease-out"
            style={{ width: `${Math.max(job.progress, 3)}%` }}
          />
        </div>
      )}
    </motion.li>
  );
}