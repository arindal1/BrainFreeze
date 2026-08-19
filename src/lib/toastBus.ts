"use client";

export type Toast = {
  id: string;
  title: string;
  body: string;
  href?: string;
  tone?: "ready" | "failed";
};

type Listener = (toast: Toast) => void;

/**
 * Minimal module-level pub/sub so any client code (hooks, the service-worker
 * message bridge) can push a toast without needing React context/provider
 * wiring - `ToastViewport` is the single subscriber that renders them.
 */
const listeners = new Set<Listener>();

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushToast(toast: Omit<Toast, "id"> & { id?: string }) {
  const full: Toast = { id: toast.id ?? crypto.randomUUID(), ...toast };
  for (const listener of listeners) listener(full);
}