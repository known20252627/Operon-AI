"use client";

import React from "react";
import type { ReviewCheckItem } from "@/types";
import { AI_REVIEW_CHECKS } from "@/lib/constants";

interface AIReviewChecklistProps {
  checks?: ReviewCheckItem[];
}

export function AIReviewChecklist({
  checks = AI_REVIEW_CHECKS,
}: AIReviewChecklistProps) {
  const passed = checks.filter((c) => c.severity === "success").length;
  const warnings = checks.filter((c) => c.severity === "warning").length;
  const errors = checks.filter((c) => c.severity === "error").length;

  return (
    <div className="ai-review-checklist">
      <h3>
        <span style={{ color: "var(--lav)", fontSize: 16 }}>✦</span> AI Quality
        Review
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {checks.map((check, idx) => (
          <div
            key={idx}
            className={`review-check-item ${
              check.severity === "success"
                ? "review-success"
                : check.severity === "warning"
                ? "review-warning"
                : "review-error"
            }`}
          >
            <div className="review-check-icon">
              {check.severity === "success" && "✓"}
              {check.severity === "warning" && "⚠"}
              {check.severity === "error" && "✗"}
            </div>
            <div className="review-check-content">
              <h4>{check.label}</h4>
              <p>{check.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="review-summary">
        {passed > 0 && (
          <span style={{ color: "var(--green)", fontWeight: 600 }}>
            {passed} passed
          </span>
        )}
        {warnings > 0 && (
          <span style={{ color: "var(--amber)", fontWeight: 600 }}>
            {warnings} warnings
          </span>
        )}
        {errors > 0 && (
          <span style={{ color: "var(--red)", fontWeight: 600 }}>
            {errors} errors
          </span>
        )}
      </div>
    </div>
  );
}
