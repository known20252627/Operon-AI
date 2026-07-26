"use client";

import React from "react";
import type { QuoteItem } from "@/types";

interface AIReasoningPanelProps {
  items: QuoteItem[];
}

export function AIReasoningPanel({ items }: AIReasoningPanelProps) {
  const reasoningItems = items.filter(
    (item) => item.aiReason || item.confidence
  );

  if (reasoningItems.length === 0) return null;

  return (
    <div className="reasoning-panel">
      <h3 style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ color: "var(--lav)" }}>✦</span> AI Matching Logic
      </h3>

      {reasoningItems.map((item) => (
        <div key={item.id} className="reasoning-item">
          {/* Match visualization */}
          <div className="reasoning-match">
            <span className="reasoning-from">
              &ldquo;{item.matchedFrom || "Query"}&rdquo;
            </span>
            <span className="reasoning-arrow">→</span>
            <span className="reasoning-to">{item.product}</span>
          </div>

          {/* Confidence */}
          {item.confidence && (
            <div
              className={`reasoning-confidence ${
                item.confidence >= 95
                  ? "confidence-high"
                  : item.confidence >= 80
                  ? "confidence-medium"
                  : "confidence-low"
              }`}
              style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 8 }}
            >
              {item.confidence}% match
            </div>
          )}

          {/* Reason */}
          <p className="reasoning-reason">
            {item.aiReason || "Matched based on semantic similarity."}
          </p>

          {/* Actions for lower confidence */}
          {item.confidence && item.confidence < 95 && (
            <div className="reasoning-actions">
              <button className="btn-approve">Approve</button>
              <button className="btn-correct">Correct match</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
