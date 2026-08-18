/**
 * Minimal in-memory fixed-window rate limiter. Single-instance only (matches
 * the in-memory queue/eventBus/keyManager patterns already used in this repo).
 * Swap for Redis (e.g. Upstash) before scaling to multiple instances.
 */

type Bucket = { count: number; resetAt: number };

const globalForRateLimit = globalThis as unknown as { _bfRateLimit?: Map<string, Bucket> };
const store = globalForRateLimit._bfRateLimit ?? new Map<string, Bucket>();
globalForRateLimit._bfRateLimit = store;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}