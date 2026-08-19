import "server-only";
import { db, schema } from "@/db";
import { and, desc, eq, gte, inArray } from "drizzle-orm";

const ACTIVE_STATUSES = ["PENDING", "QUEUED", "PROCESSING"] as const;

export const jobsRepository = {
  async create(userId: string, query: string, normalizedQuery: string) {
    const [job] = await db
      .insert(schema.researchJobs)
      .values({ userId, query, normalizedQuery })
      .returning();
    return job;
  },

  async findPendingDuplicate(userId: string, normalizedQuery: string) {
    const [existing] = await db
      .select()
      .from(schema.researchJobs)
      .where(
        and(
          eq(schema.researchJobs.userId, userId),
          eq(schema.researchJobs.normalizedQuery, normalizedQuery),
          inArray(schema.researchJobs.status, ACTIVE_STATUSES),
        ),
      )
      .orderBy(desc(schema.researchJobs.createdAt))
      .limit(1);

    return existing ?? null;
  },

  async listForUser(userId: string) {
    return db
      .select()
      .from(schema.researchJobs)
      .where(eq(schema.researchJobs.userId, userId))
      .orderBy(desc(schema.researchJobs.createdAt));
  },

  async findById(id: string) {
    const [job] = await db.select().from(schema.researchJobs).where(eq(schema.researchJobs.id, id));
    return job ?? null;
  },

  async updateStatus(
    id: string,
    status: (typeof schema.jobStatusEnum.enumValues)[number],
    fields: Partial<{ progress: number; statusMessage: string; error: string; startedAt: Date; completedAt: Date }> = {},
  ) {
    const [job] = await db
      .update(schema.researchJobs)
      .set({ status, ...fields })
      .where(eq(schema.researchJobs.id, id))
      .returning();
    return job;
  },

  async delete(id: string, userId: string) {
    await db
      .delete(schema.researchJobs)
      .where(and(eq(schema.researchJobs.id, id), eq(schema.researchJobs.userId, userId)));
  },
};

export const resultsRepository = {
  async save(jobId: string, title: string, markdown: string, durationMs: number) {
    const [result] = await db
      .insert(schema.researchResults)
      .values({ jobId, title, markdown, durationMs })
      .returning();
    return result;
  },

  async findByJobId(jobId: string) {
    const [result] = await db
      .select()
      .from(schema.researchResults)
      .where(eq(schema.researchResults.jobId, jobId));
    return result ?? null;
  },
};

export const providerLogsRepository = {
  async log(
    jobId: string,
    provider: string,
    agent: string,
    success: boolean,
    durationMs: number,
    errorMessage?: string,
    usage?: { promptTokens?: number; completionTokens?: number },
  ) {
    await db.insert(schema.providerLogs).values({
      jobId,
      provider,
      agent,
      success,
      durationMs,
      errorMessage,
      promptTokens: usage?.promptTokens,
      completionTokens: usage?.completionTokens,
    });
  },
};

export const pushSubscriptionsRepository = {
  async upsert(userId: string, endpoint: string, p256dh: string, auth: string) {
    const [sub] = await db
      .insert(schema.pushSubscriptions)
      .values({ userId, endpoint, p256dh, auth })
      .onConflictDoUpdate({
        target: schema.pushSubscriptions.endpoint,
        set: { userId, p256dh, auth },
      })
      .returning();
    return sub;
  },

  async listForUser(userId: string) {
    return db.select().from(schema.pushSubscriptions).where(eq(schema.pushSubscriptions.userId, userId));
  },

  async removeByEndpoint(endpoint: string, userId?: string) {
    await db
      .delete(schema.pushSubscriptions)
      .where(
        userId
          ? and(eq(schema.pushSubscriptions.endpoint, endpoint), eq(schema.pushSubscriptions.userId, userId))
          : eq(schema.pushSubscriptions.endpoint, endpoint),
      );
  },
};

export const usageRepository = {
  /** Jobs created this calendar month plus per-provider call/token aggregates, for the usage dashboard. */
  async summaryForUser(userId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [jobsThisMonth, totalJobs, logs] = await Promise.all([
      db
        .select()
        .from(schema.researchJobs)
        .where(and(eq(schema.researchJobs.userId, userId), gte(schema.researchJobs.createdAt, monthStart))),
      db.select().from(schema.researchJobs).where(eq(schema.researchJobs.userId, userId)),
      db
        .select({
          provider: schema.providerLogs.provider,
          success: schema.providerLogs.success,
          durationMs: schema.providerLogs.durationMs,
          promptTokens: schema.providerLogs.promptTokens,
          completionTokens: schema.providerLogs.completionTokens,
        })
        .from(schema.providerLogs)
        .innerJoin(schema.researchJobs, eq(schema.providerLogs.jobId, schema.researchJobs.id))
        .where(eq(schema.researchJobs.userId, userId)),
    ]);

    return { jobsThisMonthCount: jobsThisMonth.length, totalJobsCount: totalJobs.length, logs };
  },
};