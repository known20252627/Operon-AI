"use client";

import React from "react";

interface HeroCardProps {
  onStart: () => void;
}

export function HeroCard({ onStart }: HeroCardProps) {
  return (
    <section style={{
      background: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.9) 50%, rgba(15,23,42,0.95) 100%)",
      border: "1px solid rgba(112, 82, 215, 0.35)",
      borderRadius: "24px",
      padding: "36px 44px",
      marginBottom: "32px",
      boxShadow: "0 20px 45px -15px rgba(0,0,0,0.5)",
      position: "relative",
      overflow: "hidden",
      color: "#fff"
    }} className="hero-card-enterprise">
      {/* Subtle glowing orb background effect */}
      <div style={{
        position: "absolute",
        right: "-80px",
        top: "-80px",
        width: "360px",
        height: "360px",
        background: "radial-gradient(circle, rgba(112,82,215,0.2) 0%, rgba(0,0,0,0) 70%)",
        pointerEvents: "none"
      }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "center", position: "relative", zIndex: 2 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <span style={{
              background: "rgba(16,185,129,0.15)",
              color: "#10b981",
              border: "1px solid rgba(16,185,129,0.3)",
              padding: "5px 14px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(16,185,129,0.2)"
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              OPERON AI NEURAL ENGINE &middot; ENTERPRISE SUITE ONLINE
            </span>
            <span style={{
              background: "rgba(255,255,255,0.08)",
              color: "#cbd5e1",
              padding: "5px 12px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "var(--font-mono, monospace)"
            }}>
              v2.4 Corporate Release
            </span>
          </div>

          <h2 style={{
            fontSize: "32px",
            fontWeight: 900,
            lineHeight: 1.2,
            margin: "0 0 14px 0",
            letterSpacing: "-0.75px",
            color: "#ffffff"
          }}>
            Autonomous Institutional Quotation &amp; <span style={{ color: "#c084fc", background: "linear-gradient(90deg, #c084fc 0%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Commercial Intelligence Suite</span>
          </h2>
          
          <p style={{
            margin: "0 0 28px 0",
            fontSize: "14px",
            color: "#94a3b8",
            maxWidth: "680px",
            lineHeight: 1.65,
            fontWeight: 500
          }}>
            Streamline clinical tender schedules, extract unstructured requisition documents via two-stage neural OCR, conduct mathematical tabular verification, and generate executive-ready proforma contracts instantly with zero manual friction.
          </p>

          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={onStart}
              style={{
                background: "linear-gradient(135deg, #7052d7 0%, #4f46e5 100%)",
                color: "#ffffff",
                border: "none",
                padding: "14px 28px",
                borderRadius: "14px",
                fontSize: "14px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(112,82,215,0.45)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "transform 0.15s, box-shadow 0.15s",
                letterSpacing: "0.01em"
              }}
              className="hover:scale-102 hover:shadow-xl"
            >
              <span>⚡</span> Launch Enterprise Quotation Studio <span>→</span>
            </button>
          </div>
        </div>

        {/* Professional Proforma Status Card */}
        <div style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "18px",
          padding: "24px",
          minWidth: "260px",
          boxShadow: "inset 0 2px 12px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }} className="hidden md:flex">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Live Engine Feed
            </span>
            <span style={{ color: "#10b981", fontSize: "12px", fontWeight: 800 }}>⚡ Active</span>
          </div>

          <div>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>
              Latest Verified Schedule
            </div>
            <div style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: "18px", color: "#c084fc" }}>
              ₹ 4,52,000.00
            </div>
          </div>

          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", padding: "10px 12px", fontSize: "11px", color: "#10b981", fontWeight: 700 }}>
            ✓ Math Verification &amp; OCR Pass Complete. Ready for Corporate Approval.
          </div>
        </div>
      </div>
    </section>
  );
}
