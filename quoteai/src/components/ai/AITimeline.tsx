"use client";

import React from "react";
import type { AIStep } from "@/types";

interface AITimelineProps {
  steps: AIStep[];
  currentIndex: number;
  isRunning: boolean;
  isComplete: boolean;
}

export function AITimeline({
  steps,
  currentIndex,
  isRunning,
  isComplete,
}: AITimelineProps) {
  return (
    <div className="ai-timeline">
      {steps.map((step, idx) => {
        const isPast = idx < currentIndex || isComplete;
        const isCurrent = idx === currentIndex && isRunning;
        const status =
          step.status === "error"
            ? "error"
            : isCurrent
            ? "running"
            : isPast
            ? "complete"
            : "pending";

        return (
          <div
            key={step.id}
            className={`ai-timeline-step ai-step-${status}`}
          >
            <div className="ai-step-icon">
              {status === "complete" && "✓"}
              {status === "running" && (
                <div className="spinner"></div>
              )}
              {status === "error" && "✗"}
              {status === "pending" && "⏳"}
            </div>
            <div className="ai-step-content">
              <h4>{step.label}</h4>
              <p>{step.description}</p>
              {status === "complete" && step.duration && (
                <div className="ai-step-duration">{step.duration}ms</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
