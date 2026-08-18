import { pgTable, text, timestamp, uuid, integer, pgEnum, jsonb, boolean } from "drizzle-orm/pg-core";

export const jobStatusEnum = pgEnum("job_status", [
  "PENDING",
  "QUEUED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchJobs = pgTable("research_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  query: text("query").notNull(),
  normalizedQuery: text("normalized_query").notNull(),
  status: jobStatusEnum("status").notNull().default("PENDING"),
  progress: integer("progress").notNull().default(0),
  statusMessage: text("status_message"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const researchResults = pgTable("research_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => researchJobs.id, { onDelete: "cascade" }).unique(),
  title: text("title").notNull(),
  markdown: text("markdown").notNull(),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const providerLogs = pgTable("provider_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => researchJobs.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  agent: text("agent").notNull(),
  success: boolean("success").notNull(),
  durationMs: integer("duration_ms"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeyPool = pgTable("api_key_pool", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: text("provider").notNull(),
  keyLabel: text("key_label").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastFailureAt: timestamp("last_failure_at"),
  failureCount: integer("failure_count").notNull().default(0),
});

export const jobEvents = pgTable("job_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => researchJobs.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});