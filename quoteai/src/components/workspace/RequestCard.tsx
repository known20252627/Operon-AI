/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface RequestCardProps {
  request: string;
  onRequestChange: (v: string) => void;
  onAttach: () => void;
  onAnalyze: () => void;
}

export function RequestCard({ request, onRequestChange, onAttach, onAnalyze }: RequestCardProps) {
  return (
    <div style={{
      background: "var(--card-bg, #18181b)",
      border: "1px solid var(--line, rgba(255,255,255,0.1))",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.25)",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "18px" }}>🤖</span>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text, #fff)", margin: 0, textTransform: "uppercase", letterSpacing: "0.03em" }}>
          AI Requisition Prompt
        </h3>
      </div>
      
      <p style={{ fontSize: "12px", color: "var(--muted, #94a3b8)", marginTop: 0, marginBottom: "14px", lineHeight: 1.5 }}>
        Paste raw customer email threads, WhatsApp messages, or ward notes below. Operon AI will perform semantic catalog resolution automatically.
      </p>

      <textarea
        value={request}
        onChange={(e) => onRequestChange(e.target.value)}
        style={{
          width: "100%",
          height: "140px",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid var(--line, rgba(255,255,255,0.15))",
          background: "rgba(0,0,0,0.2)",
          color: "var(--text, #fff)",
          fontSize: "13px",
          lineHeight: 1.6,
          resize: "none",
          outline: "none",
          marginBottom: "16px",
          boxSizing: "border-box",
          fontFamily: "var(--font-sans, inherit)"
        }}
        placeholder="e.g. Need urgent quotation for 15 Omron BP Monitors and 10 BPL Pulse Oximeters for Apollo ICU ward by next Tuesday..."
      />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <button 
          type="button"
          onClick={onAttach} 
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "var(--text, #fff)",
            padding: "9px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.15s"
          }}
        >
          <span>📄</span> Upload Scan / PDF
        </button>
        
        <button 
          type="button"
          onClick={onAnalyze} 
          style={{
            background: "linear-gradient(135deg, #7052d7 0%, #4f46e5 100%)",
            border: "none",
            color: "#fff",
            padding: "9px 20px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(112, 82, 215, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.15s"
          }}
        >
          <span>⚡</span> AI Extract
        </button>
      </div>

      {request.trim().length > 0 && (
        <div style={{
          marginTop: "18px",
          padding: "12px 16px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#10b981",
          borderRadius: "12px",
          fontSize: "13px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ fontSize: "16px" }}>🎯</span>
          <span>Semantic inventory match verified!</span>
        </div>
      )}
    </div>
  );
}
