"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fireJobAlert } from "@/lib/jobAlerts";

export type ResearchJob = {
  id: string;
  query: string;
  status: "PENDING" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number;
  statusMessage: string | null;
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  openedAt: string | null;
};

const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED"]);

export function useResearchJobs() {
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [loading, setLoading] = useState(true);
  const sourceRef = useRef<EventSource | null>(null);
  // Tracks the last-seen status per job so we only notify on a transition into a
  // terminal state (not on first load, when a job may already be COMPLETED).
  const statusRef = useRef<Map<string, ResearchJob["status"]>>(new Map());

  const refresh = useCallback(async () => {
    const res = await fetch("/api/research");
    if (!res.ok) return;
    const data = await res.json();
    const nextJobs = data.jobs as ResearchJob[];

    for (const job of nextJobs) {
      const prevStatus = statusRef.current.get(job.id);
      if (prevStatus && prevStatus !== job.status && TERMINAL_STATUSES.has(job.status)) {
        fireJobAlert(job);
      }
      statusRef.current.set(job.id, job.status);
    }

    setJobs(nextJobs);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount, not a synchronous derived-state update
    refresh();

    const source = new EventSource("/api/events");
    sourceRef.current = source;
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.jobId) refresh();
      } catch {
        // ignore keep-alive/comment frames
      }
    };
    return () => source.close();
  }, [refresh]);

  const submit = useCallback(
    async (query: string) => {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Failed to submit research");
      await refresh();
      return data.job as ResearchJob;
    },
    [refresh],
  );

  const cancel = useCallback(
    async (id: string) => {
      await fetch(`/api/research/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await fetch(`/api/research/${id}`, { method: "DELETE" });
      await refresh();
    },
    [refresh],
  );

  return { jobs, loading, submit, cancel, remove, refresh };
}