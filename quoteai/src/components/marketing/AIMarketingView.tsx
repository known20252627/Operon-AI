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
  { id: "whatsapp",  label: "WhatsApp",  emoji: "💬", color: "#16a34a", hint: "Short broadcast message, under 500 chars" },
  { id: "email",     label: "Email",     emoji: "📧", color: "#4f46e5", hint: "Subject line + professional email body" },
  { id: "instagram", label: "Instagram", emoji: "📸", color: "#e1306c", hint: "Caption with emojis and hashtags" },
];

const TONE_VARIANTS = ["professional and formal", "professional and confident", "professional and concise", "professional and authoritative", "professional and courteous"];

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
    <div style={{ padding: "28px 32px", maxWidth: 780, margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>
          📣 AI Marketing Assistant
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, marginBottom: 0, lineHeight: 1.6 }}>
          Tell the AI what message you need, choose your platform, and get a polished, copyable message instantly.
          {company.businessDescription
            ? " Your business context from Settings is automatically included."
            : " Add your business description in Settings to improve results."}
        </p>
      </div>

      {/* ── Channel Selector ── */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Select Platform</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                  gap: 8,
                  padding: "9px 20px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `2px solid ${isActive ? ch.color : "var(--line)"}`,
                  background: isActive ? ch.color : "var(--card)",
                  color: isActive ? "#fff" : "var(--text)",
                  transition: "all 0.15s",
                  boxShadow: isActive ? `0 2px 12px ${ch.color}44` : "none",
                }}
              >
                <span style={{ fontSize: 16 }}>{ch.emoji}</span>
                {ch.label}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
          {activeChannel.hint}
        </p>
      </div>

      {/* ── Message Intent ── */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="mkt-intent" style={labelStyle}>
          What should the message be about?
        </label>
        <textarea
          id="mkt-intent"
          rows={3}
          style={textareaStyle}
          placeholder={
            channel === "whatsapp"
              ? "e.g. Announce a 10% discount on BP monitors this week for all hospitals in our list."
              : channel === "email"
              ? "e.g. Introduce our new ECG machine model with a special launch offer for existing clients."
              : "e.g. Showcase our fast delivery service for diagnostic equipment across Mumbai."
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
          gap: 8,
          padding: "10px 26px",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          cursor: isGenerating || !messageIntent.trim() ? "not-allowed" : "pointer",
          border: "none",
          background: activeChannel.color,
          color: "#fff",
          opacity: isGenerating || !messageIntent.trim() ? 0.5 : 1,
          transition: "opacity 0.15s",
          marginBottom: 24,
          boxShadow: `0 2px 14px ${activeChannel.color}55`,
        }}
      >
        {isGenerating ? "⏳ Generating…" : `✨ Generate ${activeChannel.label} Message`}
      </button>

      {/* ── Error ── */}
      {error && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 10,
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          color: "#b91c1c",
          fontSize: 13,
          marginBottom: 20,
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
          borderRadius: 14,
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          {/* Subject line (email only) */}
          {channel === "email" && result.subject && (
            <div>
              <p style={resultLabelStyle}>Subject Line</p>
              <div style={{
                padding: "9px 13px",
                borderRadius: 8,
                background: "var(--soft)",
                border: "1px solid var(--line)",
                fontSize: 13,
                fontWeight: 600,
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
              {channel === "email" ? "Email Body" : channel === "instagram" ? "Instagram Caption" : "WhatsApp Message"}
            </p>
            <textarea
              id="mkt-result-output"
              readOnly
              rows={channel === "email" ? 9 : channel === "instagram" ? 6 : 5}
              style={{
                ...textareaStyle,
                background: "var(--soft)",
                cursor: "default",
                lineHeight: 1.75,
              }}
              value={result.message}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              id="mkt-copy-btn"
              type="button"
              onClick={handleCopy}
              style={{
                ...outlineButtonStyle,
                background: copied ? activeChannel.color : "var(--card)",
                color: copied ? "#fff" : "var(--text)",
                borderColor: copied ? activeChannel.color : "var(--line)",
              }}
            >
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
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
              🔄 Regenerate
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
  fontSize: 12,
  fontWeight: 700,
  color: "var(--muted)",
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: 13,
  borderRadius: 10,
  border: "1px solid var(--line)",
  background: "var(--card)",
  color: "var(--text)",
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box",
  lineHeight: 1.6,
  fontFamily: "inherit",
};

const resultLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 8,
  marginTop: 0,
};

const outlineButtonStyle: React.CSSProperties = {
  padding: "8px 20px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  border: "1px solid var(--line)",
  background: "var(--card)",
  color: "var(--text)",
  transition: "all 0.15s",
};
