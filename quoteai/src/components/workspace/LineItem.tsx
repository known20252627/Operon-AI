"use client";

import React from "react";
import type { QuoteItem } from "@/types";

interface LineItemProps {
  item: QuoteItem;
  onUpdateQty: (id: number, qty: number) => void;
  onUpdateRate?: (id: number, rate: number) => void;
  onUpdateItem?: (id: number, patch: Partial<QuoteItem>) => void;
  money: (v: number) => string;
}

export function LineItem({ item, onUpdateQty, onUpdateRate, onUpdateItem, money }: LineItemProps) {
  const isHighConfidence = (item.confidence || 95) >= 85;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "minmax(200px, 1.5fr) auto auto auto auto",
      alignItems: "center",
      gap: "16px",
      padding: "16px 20px",
      borderBottom: "1px solid var(--line, rgba(255,255,255,0.08))",
      transition: "background 0.15s ease",
      background: "transparent"
    }}
    className="line-item-row hover:bg-zinc-800/30 dark:hover:bg-white/5"
    >
      {/* 1. Editable Product Name & AI Confidence */}
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "10px",
            background: isHighConfidence ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
            color: isHighConfidence ? "#10b981" : "#f59e0b",
            border: `1px solid ${isHighConfidence ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
            padding: "2px 8px",
            borderRadius: "6px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <span>✨</span> {item.confidence || 96}% AI Verified
          </span>
        </div>

        {/* Editable Item Name Terminal */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="text"
            value={item.product}
            onChange={(e) => onUpdateItem && onUpdateItem(item.id, { product: e.target.value })}
            style={{
              width: "100%",
              padding: "7px 12px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(0,0,0,0.3)",
              color: "var(--text, #fff)",
              fontSize: "14px",
              fontWeight: 700,
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15)"
            }}
            placeholder="Enter Product or Equipment Specification Name..."
            title="Click to edit item name directly"
          />
        </div>

        <p style={{ fontSize: "11px", color: "var(--muted, #94a3b8)", margin: 0 }}>
          SKU: <b style={{ fontFamily: "var(--font-mono, monospace, inherit)", color: "var(--text, #cbd5e1)" }}>{item.sku}</b>
          {item.aiReason && <span style={{ marginLeft: "6px", opacity: 0.85 }}>({item.aiReason.replace("✨ Operon AI Filter: ", "")})</span>}
        </p>
      </div>

      {/* 2. Editable GST Rate Editor */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted, #94a3b8)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.05em" }}>
          GST Rate (%)
        </span>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="number"
            value={item.gst}
            onChange={(e) => onUpdateItem && onUpdateItem(item.id, { gst: Math.max(0, parseFloat(e.target.value) || 0) })}
            style={{
              width: "66px",
              padding: "7px 24px 7px 10px",
              fontSize: "13px",
              borderRadius: "10px",
              border: "1px solid rgba(234, 179, 8, 0.4)",
              background: "rgba(234, 179, 8, 0.08)",
              color: "#facc15",
              fontWeight: 800,
              textAlign: "right",
              outline: "none",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15)",
              fontFamily: "var(--font-mono, monospace, inherit)"
            }}
            title="Edit GST percentage rate"
          />
          <span style={{ position: "absolute", right: "8px", color: "#facc15", fontSize: "12px", fontWeight: 800, pointerEvents: "none" }}>
            %
          </span>
        </div>
      </div>

      {/* 3. Quantity Editor */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted, #94a3b8)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.05em" }}>
          Unit Qty
        </span>
        <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.25)", border: "1px solid var(--line, rgba(255,255,255,0.15))", borderRadius: "10px", overflow: "hidden", padding: "2px" }}>
          <button
            type="button"
            onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
            style={{
              width: "26px",
              height: "28px",
              background: "rgba(255,255,255,0.05)",
              border: "none",
              color: "var(--text, #fff)",
              fontWeight: 800,
              cursor: "pointer",
              borderRadius: "8px",
              transition: "background 0.15s"
            }}
          >
            −
          </button>
          <input
            type="number"
            value={item.qty}
            onChange={(e) => onUpdateQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
            style={{
              width: "40px",
              textAlign: "center",
              background: "transparent",
              border: "none",
              color: "var(--text, #fff)",
              fontSize: "13px",
              fontWeight: 800,
              outline: "none"
            }}
          />
          <button
            type="button"
            onClick={() => onUpdateQty(item.id, item.qty + 1)}
            style={{
              width: "26px",
              height: "28px",
              background: "rgba(255,255,255,0.05)",
              border: "none",
              color: "var(--text, #fff)",
              fontWeight: 800,
              cursor: "pointer",
              borderRadius: "8px",
              transition: "background 0.15s"
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* 4. Custom Rate Editor */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted, #94a3b8)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.05em" }}>
          Unit Rate (₹)
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="number"
            value={item.rate}
            onChange={(e) => onUpdateRate && onUpdateRate(item.id, parseFloat(e.target.value) || 0)}
            style={{
              width: "105px",
              padding: "7px 12px",
              fontSize: "13px",
              borderRadius: "10px",
              border: "1px solid rgba(112,82,215,0.4)",
              background: "rgba(112,82,215,0.08)",
              color: "#c084fc",
              fontWeight: 800,
              textAlign: "right",
              outline: "none",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
              fontFamily: "var(--font-mono, monospace, inherit)"
            }}
            title="Custom Rate for this Quotation Schedule"
          />
        </div>
      </div>

      {/* 5. Total Item Value */}
      <div style={{ textAlign: "right", minWidth: "105px" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted, #94a3b8)", textTransform: "uppercase", display: "block", marginBottom: "6px", letterSpacing: "0.05em" }}>
          Net Amount
        </span>
        <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text, #fff)", fontFamily: "var(--font-mono, monospace, inherit)" }}>
          {money(item.rate * item.qty)}
        </div>
      </div>
    </div>
  );
}
