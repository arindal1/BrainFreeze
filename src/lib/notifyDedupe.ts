"use client";

/**
 * Cross-tab dedupe so a job's finish alert (toast/sound/OS notification)
 * fires from exactly one tab, not once per open dashboard tab. `localStorage`
 * is shared and synchronous across same-origin tabs, so a simple
 * check-then-claim is enough for this low-stakes race (worst case on a true
 * simultaneous write is one extra alert, not a crash or data loss).
 */
const TTL_MS = 60_000;
const PREFIX = "bf-notified:";

export function claimAlert(key: string): boolean {
  if (typeof window === "undefined") return true;

  try {
    const storageKey = `${PREFIX}${key}`;
    const existing = window.localStorage.getItem(storageKey);
    if (existing && Date.now() - Number(existing) < TTL_MS) return false;

    window.localStorage.setItem(storageKey, String(Date.now()));
    return true;
  } catch {
    // localStorage can throw in private-browsing/storage-restricted contexts - fail open.
    return true;
  }
}