"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
};

export function useResearchJobs() {
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [loading, setLoading] = useState(true);
  const sourceRef = useRef<EventSource | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/research");
    if (!res.ok) return;
    const data = await res.json();
    setJobs(data.jobs);
    setLoading(false);
  }, []);

  useEffect(() => {
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