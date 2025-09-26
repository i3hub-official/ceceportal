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
          className={`relative card border-l-4 p-3 transition-all duration-300 ease-in-out transform animate-in slide-in-from-right-5 ${
            notification.type === "success"
              ? "border-l-success"
              : notification.type === "error"
                ? "border-l-error"
                : notification.type === "warning"
                  ? "border-l-warning"
                  : "border-l-info"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === "success" && (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
              {notification.type === "error" && (
                <XCircle className="h-4 w-4 text-error" />
              )}
              {notification.type === "warning" && (
                <AlertTriangle className="h-4 w-4 text-warning" />
              )}
              {notification.type === "info" && (
                <Info className="h-4 w-4 text-info" />
              )}
            </div>
            <div className="ml-2 flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate">
                {notification.title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 inline-flex text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <XCircle className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
