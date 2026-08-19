"use client";

/** Thin wrapper around the browser Notification API - handles support/permission checks. */

export type NotificationPermissionState = "default" | "granted" | "denied" | "unsupported";

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  const result = await Notification.requestPermission();
  return result;
}