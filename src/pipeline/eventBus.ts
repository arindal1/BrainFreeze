import "server-only";
import { EventEmitter } from "node:events";

export type JobEventPayload = {
  jobId: string;
  type: "progress" | "completed" | "failed" | "cancelled";
  progress?: number;
  message?: string;
};

/** Observer pattern: pipeline stages publish, SSE routes subscribe per user. */
class JobEventBus extends EventEmitter {
  publish(userId: string, payload: JobEventPayload) {
    this.emit(userId, payload);
  }
  subscribe(userId: string, listener: (payload: JobEventPayload) => void) {
    this.on(userId, listener);
    return () => this.off(userId, listener);
  }
}

const globalForBus = globalThis as unknown as { _bfBus?: JobEventBus };
export const jobEventBus = globalForBus._bfBus ?? new JobEventBus().setMaxListeners(0);
if (process.env.NODE_ENV !== "production") globalForBus._bfBus = jobEventBus;