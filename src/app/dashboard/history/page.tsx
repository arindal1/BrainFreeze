"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useResearchJobs } from "@/components/dashboard/useResearchJobs";
import { JobRow } from "@/components/dashboard/JobRow";
import { Input } from "@/components/ui/Field";

export default function ArchivePage() {
  const { jobs, loading, remove } = useResearchJobs();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const sorted = [...jobs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return q ? sorted.filter((j) => j.query.toLowerCase().includes(q)) : sorted;
  }, [jobs, search]);

  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-4 flex items-center gap-3 text-cryo">
            <span className="inline-block h-px w-8 bg-current" />
            Permanent record
          </p>
          <h1 className="display text-[length:var(--step-4)]">Archive</h1>
        </div>
        <p className="label text-frost-dim">
          {filtered.length} of {jobs.length}
        </p>
      </header>

      <div className="max-w-xl">
        <label htmlFor="search" className="label text-frost-dim">
          Filter
        </label>
        <Input
          id="search"
          type="search"
          placeholder="Search every query you've submitted"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="label text-frost-dim">Reading archive…</p>
      ) : filtered.length === 0 ? (
        <div className="hatch border border-[color:var(--line-strong)] px-6 py-14 text-center">
          <p className="display text-[length:var(--step-2)] text-frost-dim">
            {jobs.length === 0 ? "Nothing archived yet." : "No query matches that."}
          </p>
        </div>
      ) : (
        <ul className="border-t border-[color:var(--line-strong)]">
          <AnimatePresence initial={false}>
            {filtered.map((job, i) => (
              <JobRow key={job.id} job={job} n={i + 1} onDelete={remove} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}