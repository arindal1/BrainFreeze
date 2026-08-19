"use client";

import { useEffect, useState } from "react";
import {
  getNotificationPermission,
  requestNotificationPermission,
  type NotificationPermissionState,
} from "@/lib/notifications";
import { isPushSupported, subscribeToPush } from "@/lib/pushClient";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/** Lets the user grant browser-notification permission so finished runs can alert them, and (when configured) registers a Web Push subscription so alerts fire even with no tab open. */
export function NotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermissionState>("unsupported");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only read (SSR always renders "unsupported" to avoid a hydration mismatch)
    setPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    // Already granted from a previous visit - make sure the push subscription still exists
    // (e.g. after clearing site data or reinstalling the browser it may have been dropped).
    if (permission === "granted" && VAPID_PUBLIC_KEY && isPushSupported()) {
      subscribeToPush(VAPID_PUBLIC_KEY).catch(() => {});
    }
  }, [permission]);

  if (permission === "unsupported") return null;

  if (permission === "granted") {
    return <span className="label hidden text-frost-dim sm:inline">Alerts on</span>;
  }

  if (permission === "denied") {
    return (
      <span
        className="label hidden text-frost-dim sm:inline"
        title="Notifications are blocked - enable them in your browser's site settings"
      >
        Alerts blocked
      </span>
    );
  }

  return (
    <button
      onClick={async () => {
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result === "granted" && VAPID_PUBLIC_KEY && isPushSupported()) {
          subscribeToPush(VAPID_PUBLIC_KEY).catch(() => {});
        }
      }}
      className="label draw inline-block text-frost-muted hover:text-flare"
      title="Get an alert (even with the tab closed, if push is supported) when a research run finishes"
    >
      <span className="sm:hidden">Alerts</span>
      <span className="hidden sm:inline">Enable alerts</span>
    </button>
  );
}