"use client";

import React from "react";
import { DASHBOARD_STATS } from "@/lib/constants";

export function StatsGrid() {
  return (
    <section className="stats-grid">
      {DASHBOARD_STATS.map((stat, i) => (
        <div key={i} className="stat-card">
          <span className="stat-icon">{stat.icon}</span>
          <p>{stat.label}</p>
          <h3>{stat.value}</h3>
          <small className={stat.positive ? "positive" : ""}>
            {stat.positive ? "↗ " : ""}{stat.change}
          </small>
        </div>
      ))}
    </section>
  );
}
