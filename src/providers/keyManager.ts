/**
 * Rotates through multiple API keys per provider (GEMINI_KEY_1, GEMINI_KEY_2, ...,
 * OPENROUTER_KEY_1.. for Nemotron, TAVILY_KEY_1..). On failure the key is marked bad
 * for a cooldown period and the next key is tried. No restart required - state
 * lives in memory for the life of the worker process.
 */

type KeyState = { key: string; failures: number; disabledUntil: number };

const pools = new Map<string, KeyState[]>();

function loadPool(provider: string): KeyState[] {
  const existing = pools.get(provider);
  if (existing) return existing;

  const keys: string[] = [];
  // Support both PROVIDER_KEY and PROVIDER_KEY_1..N
  const single = process.env[`${provider}_KEY`];
  if (single) keys.push(single);
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`${provider}_KEY_${i}`];
    if (k) keys.push(k);
  }

  const pool = keys.map((key) => ({ key, failures: 0, disabledUntil: 0 }));
  pools.set(provider, pool);
  return pool;
}

const COOLDOWN_MS = 60_000;

export function getActiveKey(provider: string): string | null {
  const pool = loadPool(provider);
  const now = Date.now();
  const candidate = pool.find((k) => k.disabledUntil <= now);
  return candidate?.key ?? null;
}

export function reportKeyFailure(provider: string, key: string) {
  const pool = loadPool(provider);
  const entry = pool.find((k) => k.key === key);
  if (!entry) return;
  entry.failures += 1;
  entry.disabledUntil = Date.now() + COOLDOWN_MS * Math.min(entry.failures, 5);
}

export function reportKeySuccess(provider: string, key: string) {
  const pool = loadPool(provider);
  const entry = pool.find((k) => k.key === key);
  if (entry) entry.failures = 0;
}

export function hasAnyKey(provider: string): boolean {
  return loadPool(provider).length > 0;
}