"use client";

import React from "react";
import { FOLLOWUPS } from "@/lib/constants";

interface FollowUpsPanelProps {
  expanded?: boolean;
}

export function FollowUpsPanel({ expanded = false }: FollowUpsPanelProps) {
  return (
    <div className={`panel followups ${expanded ? "expanded" : ""}`}>
      <div className="panel-head">
        <div>
          <h3>{expanded ? "Follow-ups" : "Needs your attention"}</h3>
          <p>Follow-ups due today</p>
        </div>
        {!expanded && <button className="link-button">View all</button>}
      </div>
      {FOLLOWUPS.map((followup, i) => (
        <div key={i} className="follow-row">
          <span className="avatar" style={{ background: followup.color }}>
            {followup.initials}
          </span>
          <div>
            <b>{followup.name}</b>
            <small>{followup.company} · {followup.note}</small>
          </div>
          <button onClick={() => alert(`${followup.action} prepared for ${followup.name}`)}>
            {followup.action} →
          </button>
        </div>
      ))}
    </div>
  );
}
