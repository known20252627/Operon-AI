"use client";

import React, { useState, useEffect } from "react";
import { getQuotations } from "@/services/quotations";

export function OperationalTelemetry() {
  const [approvedCount, setApprovedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const quotes = getQuotations();
    setTotalCount(quotes.length);
    setApprovedCount(quotes.filter(q => q.status === "accepted" || q.approvalStatus === "approved").length);

    const handler = () => {
      const q = getQuotations();
      setTotalCount(q.length);
      setApprovedCount(q.filter(item => item.status === "accepted" || item.approvalStatus === "approved").length);
    };
    window.addEventListener("operon_ai_quotations_updated", handler);
    return () => window.removeEventListener("operon_ai_quotations_updated", handler);
  }, []);

  return (
    <div style={{
      background: "var(--surface, #18181b)",
      border: "1px solid var(--line, rgba(255,255,255,0.08))",
      borderRadius: "20px",
      padding: "24px 28px",
      boxShadow: "0 12px 35px -12px rgba(0,0,0,0.3)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }} className="panel telemetry-panel">
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line, rgba(255,255,255,0.08))", paddingBottom: "14px", marginBottom: "18px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "var(--text, #fff)" }}>
              AI Engine &amp; System Telemetry
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--muted, #94a3b8)" }}>
              Live diagnostics across Operon AI infrastructure
            </p>
          </div>
          <span style={{
            background: "rgba(16,185,129,0.15)",
            color: "#10b981",
            border: "1px solid rgba(16,185,129,0.3)",
            padding: "4px 10px",
            borderRadius: "99px",
            fontSize: "10px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
            99.9% UPTIME
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text, #e2e8f0)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🧠</span> 2-Stage Neural OCR Filter
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#a855f7", fontFamily: "var(--font-mono, monospace)" }}>
              ACTIVE &middot; 42ms
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text, #e2e8f0)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚡</span> Tabular Math Verification
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono, monospace)" }}>
              STRICT ENFORCEMENT ON
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text, #e2e8f0)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🏢</span> Corporate Approved Deals
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#3b82f6", fontFamily: "var(--font-mono, monospace)" }}>
              {approvedCount} / {totalCount} CONTRACTS
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text, #e2e8f0)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📑</span> Enterprise Template System
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#f59e0b", fontFamily: "var(--font-mono, monospace)" }}>
              OFFICIAL SYSTEM SET
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--muted, #64748b)" }}>
        <span>Operon AI Neural Engine Protocol v2.4</span>
        <span style={{ fontFamily: "var(--font-mono, monospace)", color: "#10b981", fontWeight: 700 }}>● All Systems Operational</span>
      </div>
    </div>
  );
}
