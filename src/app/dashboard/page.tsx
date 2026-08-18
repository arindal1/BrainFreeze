"use client";

import { AnimatePresence } from "framer-motion";
import { useResearchJobs } from "@/components/dashboard/useResearchJobs";
import { Console } from "@/components/dashboard/Console";
import { JobRow } from "@/components/dashboard/JobRow";

const ACTIVE = new Set(["PENDING", "QUEUED", "PROCESSING"]);

export default function ActivePage() {
  const { jobs, loading, submit, cancel, remove } = useResearchJobs();
  const active = jobs.filter((j) => ACTIVE.has(j.status));

  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-4 flex items-center gap-3 text-cryo">
            <span className="inline-block h-px w-8 bg-current" />
            Console
          </p>
          <h1 className="display text-[length:var(--step-4)]">Dispatch</h1>
        </div>
        <p className="label text-frost-dim">
          {active.length} run{active.length === 1 ? "" : "s"} in flight
        </p>
      </header>

      <Console onSubmit={submit} />

      <section>
        <h2 className="label mb-6 text-frost-dim">In flight</h2>

        {loading ? (
          <p className="label text-frost-dim">Reading queue…</p>
        ) : active.length === 0 ? (
          <div className="hatch border border-[color:var(--line-strong)] px-6 py-14 text-center">
            <p className="display text-[length:var(--step-2)] text-frost-dim">Nothing running.</p>
            <p className="label mt-3 text-frost-dim">
              Dispatch a question above — you don&apos;t have to stay.
            </p>
          </div>
        ) : (
          <ul className="border-t border-[color:var(--line-strong)]">
            <AnimatePresence initial={false}>
              {active.map((job, i) => (
                <JobRow key={job.id} job={job} n={i + 1} onCancel={cancel} onDelete={remove} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  );
}