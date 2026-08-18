/**
 * Next.js instrumentation hook - runs once when the server process starts.
 *
 * Render's free web service tier spins the instance down after ~15 minutes
 * with no inbound HTTP traffic. Once the process is already awake, a
 * self-ping on a shorter interval than that idle window keeps it alive by
 * generating real inbound traffic to its own public URL. This does NOT help
 * the *first* request after a genuine cold start (nothing can run before the
 * process exists) - it only prevents an already-running instance from going
 * back to sleep. See docs/DEPLOYMENT.md.
 */
const SELF_PING_INTERVAL_MS = 10 * 60 * 1000; // shorter than Render's 15 min idle window

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const selfUrl = process.env.RENDER_EXTERNAL_URL ?? process.env.SELF_URL;
  if (!selfUrl) return; // no known public URL (e.g. local dev) - nothing to ping

  const globalForKeepAlive = globalThis as unknown as { _bfSelfPing?: ReturnType<typeof setInterval> };
  if (globalForKeepAlive._bfSelfPing) return;

  const ping = () => {
    fetch(new URL("/api/health", selfUrl)).catch((error) => {
      console.error("[keep-alive] self-ping failed", error);
    });
  };

  const interval = setInterval(ping, SELF_PING_INTERVAL_MS);
  interval.unref?.();
  globalForKeepAlive._bfSelfPing = interval;
}