// src/lib/notifications.ts
"use client";

import { useState, useCallback } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

// Configuration
const MAX_NOTIFICATIONS = 5; // Maximum number of notifications to show at once

// Store notifications in a global state
let globalNotifications: Notification[] = [];
let updateCallback: (notifications: Notification[]) => void = () => {};

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Set the update callback
  if (typeof window !== "undefined") {
    updateCallback = setNotifications;
    globalNotifications = notifications;
  }

  const removeNotification = useCallback((id: string) => {
    globalNotifications = globalNotifications.filter((n) => n.id !== id);
    updateCallback([...globalNotifications]);
  }, []);

  const addNotification = useCallback(
    (
      type: NotificationType,
      message: string,
      title?: string,
      duration: number = 5000
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const notificationTitle =
        title ||
        (type === "success"
          ? "Success"
          : type === "error"
          ? "Error"
          : type === "warning"
          ? "Warning"
          : "Info");

      const newNotification: Notification = {
        id,
        type,
        title: notificationTitle,
        message,
        duration,
      };

      // Enforce maximum notifications limit
      if (globalNotifications.length >= MAX_NOTIFICATIONS) {
        // Remove the oldest notification
        globalNotifications = globalNotifications.slice(1);
      }

      globalNotifications = [...globalNotifications, newNotification];
      updateCallback(globalNotifications);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [removeNotification]
  );

  return { notifications, removeNotification, addNotification };
}

// Individual export functions
export const notifySuccess = (
  message: string,
  title?: string,
  duration?: number
) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("addNotification", {
      detail: { type: "success", message, title, duration },
    });
    window.dispatchEvent(event);
  }
};

export const notifyError = (
  message: string,
  title?: string,
  duration?: number
) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("addNotification", {
      detail: { type: "error", message, title, duration },
    });
    window.dispatchEvent(event);
  }
};

export const notifyWarning = (
  message: string,
  title?: string,
  duration?: number
) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("addNotification", {
      detail: { type: "warning", message, title, duration },
    });
    window.dispatchEvent(event);
  }
};

export const notifyInfo = (
  message: string,
  title?: string,
  duration?: number
) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("addNotification", {
      detail: { type: "info", message, title, duration },
    });
    window.dispatchEvent(event);
  }
};

// Alias for notifyError
export const notifyFailure = notifyError;
