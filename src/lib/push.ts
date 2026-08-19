import "server-only";
import webpush from "web-push";
import { pushSubscriptionsRepository } from "@/repositories/researchRepository";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT ?? "mailto:support@example.com";

const configured = Boolean(publicKey && privateKey);
if (configured) {
  webpush.setVapidDetails(subject, publicKey!, privateKey!);
}

export function isPushConfigured() {
  return configured;
}

export type PushPayload = {
  jobId: string;
  title: string;
  body: string;
};

/**
 * Sends a Web Push notification to every subscription the user has
 * registered (e.g. one per browser/device). Runs even if no dashboard tab is
 * open, since the browser's push service wakes the service worker. Silently
 * no-ops if VAPID keys aren't configured (push is an opt-in enhancement on
 * top of the existing SSE + in-app alerts, not a hard dependency).
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!configured) return;

  const subscriptions = await pushSubscriptionsRepository.listForUser(userId);
  if (subscriptions.length === 0) return;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (err) {
        // 404/410 means the subscription is gone (browser data cleared, unsubscribed, etc.) - prune it.
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await pushSubscriptionsRepository.removeByEndpoint(sub.endpoint);
        } else {
          console.error("[push] send failed", err);
        }
      }
    }),
  );
}