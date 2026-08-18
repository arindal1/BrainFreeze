import "server-only";
import { researchQueue } from "@/queue/researchQueue";
import { runResearchPipeline } from "@/pipeline/orchestrator";
import { jobsRepository } from "@/repositories/researchRepository";

/** Worker: picks queued jobs, runs the pipeline, contains no UI logic. */
export function enqueueResearchJob(jobId: string, userId: string) {
  researchQueue.enqueue(async () => {
    try {
      const job = await jobsRepository.findById(jobId);
      if (!job || job.status === "CANCELLED") return;

      await jobsRepository.updateStatus(jobId, "PROCESSING");
      await runResearchPipeline(jobId, userId);
    } catch (err) {
      console.error("[worker] job failed", jobId, err);
      await jobsRepository.updateStatus(jobId, "FAILED", {
        error: err instanceof Error ? err.message : "Unknown worker error",
        completedAt: new Date(),
      });
    }
  });
}