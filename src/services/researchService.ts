import "server-only";
import { normalizeQuery } from "@/lib/normalize";
import { jobsRepository } from "@/repositories/researchRepository";
import { enqueueResearchJob } from "@/workers/researchWorker";

export class NotFoundError extends Error {}
export class ConflictError extends Error {}

export const researchService = {
  async submit(userId: string, rawQuery: string) {
    const normalized = normalizeQuery(rawQuery);
    if (!normalized) throw new Error("Query cannot be empty");

    const duplicate = await jobsRepository.findPendingDuplicate(userId, normalized);
    if (duplicate) return { job: duplicate, deduped: true };

    const job = await jobsRepository.create(userId, rawQuery.trim(), normalized);
    await jobsRepository.updateStatus(job.id, "QUEUED", { progress: 1, statusMessage: "Queued" });
    enqueueResearchJob(job.id, userId);
    return { job, deduped: false };
  },

  async list(userId: string) {
    return jobsRepository.listForUser(userId);
  },

  async cancel(jobId: string, userId: string) {
    const job = await jobsRepository.findById(jobId);
    if (!job || job.userId !== userId) throw new NotFoundError("Not found");
    if (job.status === "COMPLETED") throw new ConflictError("Already completed");
    return jobsRepository.updateStatus(jobId, "CANCELLED", { completedAt: new Date() });
  },

  async remove(jobId: string, userId: string) {
    return jobsRepository.delete(jobId, userId);
  },
};