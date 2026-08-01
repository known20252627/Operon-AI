"use client";

import React, { useState } from "react";
import { FOLLOWUPS } from "@/lib/constants";
import { useToast } from "@/hooks/useToast";

interface FollowUpsPanelProps {
  expanded?: boolean;
}

export function FollowUpsPanel({ expanded = false }: FollowUpsPanelProps) {
  const [showAll, setShowAll] = useState(expanded);
  const [actioned, setActioned] = useState<Record<number, boolean>>({});
  const { notify } = useToast();

  const handleAction = (idx: number, name: string, action: string) => {
    setActioned((prev) => ({ ...prev, [idx]: true }));
    notify(`🚀 ${action} successfully executed for ${name}!`);
  };

  const displayList = showAll ? FOLLOWUPS : FOLLOWUPS.slice(0, 3);

  return (
    <div className={`panel followups ${expanded ? "expanded" : ""} animate-fade-in`}>
      <div className="panel-head" style={{ borderBottom: "1px solid var(--line)", paddingBottom: "14px", marginBottom: "4px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 800 }}>{expanded ? "Follow-ups & Outreach" : "Needs Your Attention"}</h3>
          <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "2px" }}>Follow-ups and AI alerts due today</p>
        </div>
        {!expanded && (
          <button
            className="link-button"
            onClick={() => setShowAll((p) => !p)}
            style={{ fontWeight: 700, fontSize: "12px", color: "var(--lav)", background: "none", border: "none", cursor: "pointer" }}
          >
            {showAll ? "Show fewer" : `View all (${FOLLOWUPS.length})`}
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {displayList.map((followup, i) => {
          const isDone = !!actioned[i];
          return (
            <div
              key={i}
              className="follow-row"
              style={{
                padding: "14px 16px",
                opacity: isDone ? 0.6 : 1,
                transition: "all 0.3s var(--ease)",
              }}
            >
              <span
                className="avatar"
                style={{
                  background: followup.color || "var(--lav)",
                  width: "34px",
                  height: "34px",
                  fontSize: "12px",
                  fontWeight: 800,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {followup.initials}
              </span>
              <div style={{ flex: 1, minWidth: 0, marginLeft: "8px" }}>
                <b style={{ fontSize: "13px", color: isDone ? "var(--muted)" : "var(--ink)" }}>
                  {followup.name}
                  {isDone && <span style={{ color: "var(--green)", fontSize: "11px", marginLeft: "6px" }}>[Dispatched]</span>}
                </b>
                <small style={{ fontSize: "11px", color: "var(--muted)" }}>
                  {followup.company} · {followup.note}
                </small>
              </div>
              <button
                onClick={() => handleAction(i, followup.name, followup.action)}
                disabled={isDone}
                style={{
                  background: isDone ? "var(--green-bg)" : "linear-gradient(135deg, #f1edff, #e4dbff)",
                  color: isDone ? "var(--green)" : "#6366f1",
                  border: isDone ? "1px solid var(--green)" : "1px solid rgba(99, 102, 241, 0.2)",
                  padding: "8px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 800,
                  fontSize: "11px",
                  cursor: isDone ? "default" : "pointer",
                  transition: "all var(--duration) var(--ease)",
                  boxShadow: isDone ? "none" : "0 2px 8px rgba(99, 102, 241, 0.15)",
                }}
              >
                {isDone ? "✓ Dispatched" : `${followup.action} →`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
