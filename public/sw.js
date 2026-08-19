// Brain Freeze service worker: Web Push delivery + cross-tab dedupe.
//
// When a push arrives, the browser wakes this worker even if no dashboard
// tab is open. If a dashboard tab IS open and visible, we hand the update
// off to it via postMessage (so it renders a lightweight in-app toast
// instead) rather than also popping an OS notification - avoiding a
// double-alert for the user who's already looking at the screen.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const { jobId, title, body } = payload;

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const visibleClient = allClients.find((client) => client.visibilityState === "visible");

      if (visibleClient) {
        for (const client of allClients) {
          client.postMessage({ type: "push-job-update", jobId, title, body });
        }
        return;
      }

      await self.registration.showNotification(title, {
        body,
        tag: `research-${jobId}`,
        icon: "/favicon.svg",
        data: { jobId },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const jobId = event.notification.data?.jobId;
  const targetUrl = jobId ? `/dashboard/research/${jobId}` : "/dashboard";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = allClients.find((client) => client.url.includes("/dashboard"));
      if (existing) {
        existing.focus();
        existing.navigate(targetUrl);
      } else {
        self.clients.openWindow(targetUrl);
      }
    })(),
  );
});