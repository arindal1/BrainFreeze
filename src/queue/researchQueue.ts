import "server-only";

type Task = () => Promise<void>;

/**
 * Minimal in-process FIFO queue with configurable concurrency. Swappable
 * later for Redis/BullMQ/SQS without changing callers — they only see
 * `enqueue()`.
 */
class ResearchQueue {
  private queue: Task[] = [];
  private active = 0;
  private readonly concurrency: number;

  constructor(concurrency = Number(process.env.WORKER_CONCURRENCY ?? 2)) {
    this.concurrency = concurrency;
  }

  enqueue(task: Task) {
    this.queue.push(task);
    this.drain();
  }

  private drain() {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.active++;
      task()
        .catch((err) => console.error("[queue] task failed", err))
        .finally(() => {
          this.active--;
          this.drain();
        });
    }
  }
}

const globalForQueue = globalThis as unknown as { _bfQueue?: ResearchQueue };
export const researchQueue = globalForQueue._bfQueue ?? new ResearchQueue();
if (process.env.NODE_ENV !== "production") globalForQueue._bfQueue = researchQueue;