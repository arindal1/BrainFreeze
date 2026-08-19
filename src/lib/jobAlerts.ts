"use client";

import { claimAlert } from "@/lib/notifyDedupe";
import { pushToast } from "@/lib/toastBus";
import { playAlertSound } from "@/lib/soundAlert";
import { isSoundEnabled } from "@/lib/soundPreference";

export type JobAlertInput = {
  id: string;
  query: string;
  status: string;
};

/**
 * Single funnel for "a job just finished" alerts, called from both the
 * SSE-driven transition detector (`useResearchJobs`) and the service-worker
 * push message bridge (`ToastViewport`). Whichever fires first wins the
 * cross-tab dedupe claim; the loser is a silent no-op, so a visible tab never
 * shows the same alert twice even though two independent signal paths (SSE
 * and Web Push) can both report the same completion.
 */
export function fireJobAlert(job: JobAlertInput) {
  if (!claimAlert(`job:${job.id}`)) return;

  const finished = job.status === "COMPLETED";
  const body = job.query.length > 90 ? `${job.query.slice(0, 87)}...` : job.query;

  pushToast({
    title: finished ? "Research ready" : "Research failed",
    body,
    href: finished ? `/dashboard/research/${job.id}` : undefined,
    tone: finished ? "ready" : "failed",
  });

  if (isSoundEnabled()) playAlertSound();
}