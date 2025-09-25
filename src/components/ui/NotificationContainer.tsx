// src/app/components/notifications/NotificationContainer.tsx
"use client";

import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { Notification, useNotification } from "./notifications";
import { useEffect } from "react";

export default function NotificationContainer() {
  const { notifications, removeNotification, addNotification } =
    useNotification();

  useEffect(() => {
    const handleAddNotification = (event: CustomEvent) => {
      const { type, message, title, duration } = event.detail;
      addNotification(type, message, title, duration);
    };

    window.addEventListener(
      "addNotification",
      handleAddNotification as EventListener
    );

    return () => {
      window.removeEventListener(
        "addNotification",
        handleAddNotification as EventListener
      );
    };
  }, [addNotification]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`relative bg-card rounded-lg shadow-lg border-l-4 p-3 transition-all duration-300 ease-in-out transform animate-in slide-in-from-right-5 border border-border ${
            notification.type === "success"
              ? "border-l-emerald-500"
              : notification.type === "error"
                ? "border-l-red-500"
                : notification.type === "warning"
                  ? "border-l-amber-500"
                  : "border-l-blue-500"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === "success" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
              {notification.type === "error" && (
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              {notification.type === "warning" && (
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              )}
              {notification.type === "info" && (
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="ml-2 flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate">
                {notification.title}
              </h4>
              <p className="mt-1 text-xs text-foreground/70 line-clamp-2">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 inline-flex text-foreground/50 hover:text-foreground/70 transition-colors p-1"
            >
              <XCircle className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
