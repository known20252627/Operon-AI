"use client";

import React from "react";
import { NOTIFICATIONS } from "@/lib/constants";
import type { AppNotification } from "@/types";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const getIcon = (type: AppNotification["type"]) => {
  switch (type) {
    case "quotation-ready": return "✦";
    case "review-required": return "⚠";
    case "low-stock": return "✗";
    case "customer-reply": return "✉";
    case "pending-followup": return "◷";
    default: return "ℹ";
  }
};

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  if (!isOpen) return null;

  return (
    <div className="notification-center">
      <div className="notification-center-header">
        <h3>Notifications</h3>
        <button onClick={onClose}>Mark all read</button>
      </div>
      <div>
        {NOTIFICATIONS.map((notif, i) => (
          <div key={i} className={`notification-item ${!notif.read ? "notification-unread" : ""}`}>
            <span className={`notification-icon ${notif.type}`}>{getIcon(notif.type)}</span>
            <div className="notification-content">
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <div className="notification-time">{notif.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
