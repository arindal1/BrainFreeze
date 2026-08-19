"use client";

/** Simple opt-out preference for the alert chime, stored per-browser. Toasts themselves always show - this only gates sound. */
const KEY = "bf-sound-enabled";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const value = window.localStorage.getItem(KEY);
    return value === null ? true : value === "1";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, enabled ? "1" : "0");
  } catch {
    // ignore storage-restricted contexts
  }
}