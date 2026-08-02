"use client";

import React, { useState } from "react";
import type { CompanySettings } from "@/types";
import { generateMarketingMessage } from "@/services/marketing";

interface AIMarketingViewProps {
  company: CompanySettings;
  onCompanyChange: (c: CompanySettings) => void;
  notify: (msg: string) => void;
}

type Channel = "whatsapp" | "email" | "instagram";

const CHANNELS: { id: Channel; label: string; emoji: string; color: string; hint: string }[] = [
  { id: "whatsapp",  label: "WhatsApp",  emoji: "💬", color: "#16a34a", hint: "Organized executive B2B broadcast with bold banner, bulleted features & CTA" },
  { id: "email",     label: "Email",     emoji: "📧", color: "#4f46e5", hint: "Formal executive proposal with subject line, bulleted benefits & signature block" },
  { id: "instagram", label: "Instagram", emoji: "📸", color: "#e1306c", hint: "Authoritative corporate announcement with value pillars & professional hashtags" },
];

const TONE_VARIANTS = ["executive and authoritative", "highly structured and diplomatic", "corporate and precise", "strategic and analytical", "institutional and professional"];

export function AIMarketingView({ company, onCompanyChange, notify }: AIMarketingViewProps) {
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [messageIntent, setMessageIntent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ message: string; subject?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeChannel = CHANNELS.find((c) => c.id === channel)!;

  const handleChannelChange = (ch: Channel) => {
    setChannel(ch);
    setResult(null);
    setError(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setCopied(false);
    try {
      const tone = TONE_VARIANTS[regenerateCount % TONE_VARIANTS.length];
      const res = await generateMarketingMessage(
        messageIntent,
        channel,
        company.businessDescription || undefined,
        tone
      );
      setResult(res);
      setRegenerateCount((n) => n + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text =
      channel === "email" && result.subject
        ? `Subject: ${result.subject}\n\n${result.message}`
        : result.message;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      notify("📋 Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 880, margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(22,163,74,0.1) 100%)",
        border: "1px solid rgba(79,70,229,0.2)",
        borderRadius: 18,
        padding: "24px 28px",
        marginBottom: 32,
        boxShadow: "0 4px 20px -5px rgba(0,0,0,0.05)"
      }}>
        <span className="ai-pill" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <b style={{ color: "#7052d7" }}>✦</b> Operon AI · Executive Communications Division
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-0.4px" }}>
          📣 Corporate B2B Marketing &amp; Outreach Studio
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
          Generate organized, highly dignified corporate communication templates with zero casual slang. Engineered with strict structural formatting for institutional hospital directors and procurement decision-makers.
        </p>
      </div>

      {/* ── Channel Selector ── */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>1. Select Executive Communication Platform</label>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {CHANNELS.map((ch) => {
            const isActive = channel === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                id={`mkt-channel-${ch.id}`}
                onClick={() => handleChannelChange(ch.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 24px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `2px solid ${isActive ? ch.color : "var(--line)"}`,
                  background: isActive ? ch.color : "var(--card)",
                  color: isActive ? "#fff" : "var(--text)",
                  transition: "all 0.2s",
                  boxShadow: isActive ? `0 4px 16px ${ch.color}44` : "none",
                }}
              >
                <span style={{ fontSize: 18 }}>{ch.emoji}</span>
                {ch.label}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, fontWeight: 600 }}>
          ℹ️ {activeChannel.hint}
        </p>
      </div>

      {/* ── Message Intent ── */}
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="mkt-intent" style={labelStyle}>
          2. What is the Core Corporate Announcement or Offer?
        </label>
        <textarea
          id="mkt-intent"
          rows={4}
          style={textareaStyle}
          placeholder={
            channel === "whatsapp"
              ? "e.g. Announce Q3 immediate stock availability for Digital Blood Pressure Monitors and Patient Telemetry with special corporate rate contracts for partner hospitals."
              : channel === "email"
              ? "e.g. Formal enterprise commercial proposal to Apollo Hospitals procurement team regarding annual rate contracts for ICU surgical equipment and diagnostic instrumentation."
              : "e.g. Highlight our newly established Biomedical Logistics Hub providing guaranteed 48-hour equipment dispatch and dedicated on-site engineering calibration across Maharashtra."
          }
          value={messageIntent}
          onChange={(e) => setMessageIntent(e.target.value)}
        />
      </div>

      {/* ── Generate Button ── */}
      <button
        id="mkt-generate-btn"
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || !messageIntent.trim()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 32px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 700,
          cursor: isGenerating || !messageIntent.trim() ? "not-allowed" : "pointer",
          border: "none",
          background: activeChannel.color,
          color: "#fff",
          opacity: isGenerating || !messageIntent.trim() ? 0.6 : 1,
          transition: "all 0.2s",
          marginBottom: 32,
          boxShadow: `0 4px 18px ${activeChannel.color}55`,
        }}
      >
        {isGenerating ? "⏳ Generating Structured Corporate Output…" : `✨ Generate Organized ${activeChannel.label} Document`}
      </button>

      {/* ── Error ── */}
      {error && (
        <div style={{
          padding: "12px 18px",
          borderRadius: 12,
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          color: "#b91c1c",
          fontSize: 14,
          marginBottom: 24,
          lineHeight: 1.5,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: "26px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: activeChannel.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {activeChannel.emoji} Organized {activeChannel.label} B2B Format
            </span>
            <span style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
              ✓ Executive Verified
            </span>
          </div>

          {/* Subject line (email only) */}
          {channel === "email" && result.subject && (
            <div>
              <p style={resultLabelStyle}>Subject Line</p>
              <div style={{
                padding: "12px 16px",
                borderRadius: 10,
                background: "var(--soft)",
                border: "1px solid var(--line)",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.5,
              }}>
                {result.subject}
              </div>
            </div>
          )}

          {/* Message body */}
          <div>
            <p style={resultLabelStyle}>
              {channel === "email" ? "Executive Email Body" : channel === "instagram" ? "Corporate Instagram Presentation" : "WhatsApp Business Broadcast Schedule"}
            </p>
            <textarea
              id="mkt-result-output"
              readOnly
              rows={channel === "email" ? 18 : channel === "instagram" ? 15 : 14}
              style={{
                ...textareaStyle,
                background: "var(--soft)",
                cursor: "text",
                lineHeight: 1.8,
                fontSize: 14,
                fontFamily: "var(--font-mono, monospace, inherit)",
              }}
              value={result.message}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
            <button
              id="mkt-regenerate-btn"
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                ...outlineButtonStyle,
                opacity: isGenerating ? 0.5 : 1,
                cursor: isGenerating ? "not-allowed" : "pointer",
              }}
            >
              🔄 Regenerate Tone Variant
            </button>
            <button
              id="mkt-copy-btn"
              type="button"
              onClick={handleCopy}
              style={{
                ...outlineButtonStyle,
                background: copied ? activeChannel.color : "var(--primary, #7052d7)",
                color: "#fff",
                borderColor: copied ? activeChannel.color : "transparent",
                fontWeight: 700,
                padding: "10px 24px",
              }}
            >
              {copied ? "✅ Copied to Clipboard!" : "📋 Copy Formatted Text"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared style constants ──────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text)",
  marginBottom: 10,
  letterSpacing: "-0.01em",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
  fontSize: 14,
  borderRadius: 12,
  border: "1px solid var(--line)",
  background: "var(--card)",
  color: "var(--text)",
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box",
  lineHeight: 1.6,
  fontFamily: "inherit",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
};

const resultLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 8,
  marginTop: 0,
};

const outlineButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  border: "1px solid var(--line)",
  background: "var(--card)",
  color: "var(--text)",
  transition: "all 0.2s",
};
