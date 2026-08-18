"use client";

import { AnimatePresence } from "framer-motion";
import { useResearchJobs } from "@/components/dashboard/useResearchJobs";
import { JobRow } from "@/components/dashboard/JobRow";

export default function ReadyPage() {
  const { jobs, loading, remove } = useResearchJobs();
  const ready = jobs.filter((j) => j.status === "COMPLETED");

  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-4 flex items-center gap-3 text-cryo">
            <span className="inline-block h-px w-8 bg-current" />
            Output
          </p>
          <h1 className="display text-[length:var(--step-4)]">Ready to read</h1>
        </div>
        <p className="label text-frost-dim">
          {ready.length} document{ready.length === 1 ? "" : "s"}
        </p>
      </header>

      {loading ? (
        <p className="label text-frost-dim">Reading archive…</p>
      ) : ready.length === 0 ? (
        <div className="hatch border border-[color:var(--line-strong)] px-6 py-14 text-center">
          <p className="display text-[length:var(--step-2)] text-frost-dim">
            No finished documents yet.
          </p>
        </div>
      ) : (
        <ul className="border-t border-[color:var(--line-strong)]">
          <AnimatePresence initial={false}>
            {ready.map((job, i) => (
              <JobRow key={job.id} job={job} n={i + 1} onDelete={remove} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}