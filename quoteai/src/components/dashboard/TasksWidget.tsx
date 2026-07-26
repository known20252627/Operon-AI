/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import { TASKS } from "@/lib/constants";

export function TasksWidget() {
  return (
    <div className="panel tasks-widget">
      <div className="panel-head">
        <div>
          <h3>Today's Tasks</h3>
        </div>
        <span
          style={{
            background: "var(--lav)",
            color: "white",
            padding: "2px 8px",
            borderRadius: 12,
            fontSize: 10,
            fontWeight: "bold",
          }}
        >
          {TASKS.length}
        </span>
      </div>
      <div>
        {TASKS.map((task, i) => (
          <div key={i} className="task-item">
            <span className={`task-priority ${task.priority}`} />
            <div className="task-info">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
            </div>
            <span className={`task-type-badge ${task.type}`}>
              {task.type.replace("-", " ")}
            </span>
            <button
              style={{
                border: "1px solid var(--line)",
                background: "var(--surface)",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: 10,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Action
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
