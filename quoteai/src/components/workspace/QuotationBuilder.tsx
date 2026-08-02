/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { LineItem } from "./LineItem";
import type { QuoteItem, ClientDetails } from "@/types";

interface BuilderProps {
  clientDetails: ClientDetails;
  setClientDetails: (details: ClientDetails) => void;
  items: QuoteItem[];
  discount: number;
  subtotal: number;
  discountValue: number;
  tax: number;
  total: number;
  updateQty: (id: number, qty: number) => void;
  updateRate?: (id: number, rate: number) => void;
  updateItem?: (id: number, patch: Partial<QuoteItem>) => void;
  incrementDiscount: () => void;
  decrementDiscount: () => void;
  onDownloadPdf: () => void;
  onDownloadExcel: () => void;
  onCreateQuote?: () => void;
}

export function QuotationBuilder({
  clientDetails, setClientDetails,
  items, discount, subtotal, discountValue, tax, total,
  updateQty, updateRate, updateItem, incrementDiscount, decrementDiscount, onDownloadPdf, onDownloadExcel, onCreateQuote
}: BuilderProps) {
  const [quoteId, setQuoteId] = useState("QTE-2026-0419");
  useEffect(() => {
    setQuoteId(`QTE-${Math.floor(100000 + Math.random() * 900000)}`);
  }, []);

  const money = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{
      background: "var(--card-bg, #18181b)",
      border: "1px solid var(--line, rgba(255,255,255,0.1))",
      borderRadius: "20px",
      padding: "32px",
      boxShadow: "0 20px 40px -15px rgba(0,0,0,0.3)",
      display: "flex",
      flexDirection: "column",
      gap: "28px"
    }}>
      {/* ── Top Bar & Actions ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid var(--line, rgba(255,255,255,0.08))", paddingBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text, #fff)", margin: 0, letterSpacing: "-0.5px" }}>
              Enterprise Quotation Studio
            </h2>
            <span style={{
              background: "rgba(234, 179, 8, 0.15)",
              color: "#facc15",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              padding: "4px 10px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Draft Schedule
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--muted, #94a3b8)" }}>
            Ref ID: <b style={{ fontFamily: "var(--font-mono, monospace, inherit)", color: "#c084fc" }}>{quoteId}</b> &middot; Using Operon AI Official Template System
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="button"
            onClick={onDownloadExcel}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "transform 0.15s, box-shadow 0.15s"
            }}
          >
            <span>📑</span> Export Excel Schedule
          </button>
          <button
            type="button"
            onClick={onDownloadPdf}
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "transform 0.15s, box-shadow 0.15s"
            }}
          >
            <span>📕</span> Generate PDF
          </button>
        </div>
      </div>

      {/* ── Client Dossier Box ── */}
      <div style={{
        background: "rgba(0,0,0,0.2)",
        border: "1px solid var(--line, rgba(255,255,255,0.08))",
        borderRadius: "16px",
        padding: "24px"
      }}>
        <h3 style={{
          fontSize: "13px",
          fontWeight: 800,
          color: "var(--text, #fff)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          margin: "0 0 16px 0",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ fontSize: "16px" }}>🏢</span> Corporate Client &amp; Billing Profile
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Client / Hospital Organization</label>
            <input
              type="text"
              value={clientDetails.name}
              onChange={(e) => setClientDetails({ ...clientDetails, name: e.target.value })}
              placeholder="e.g. Apollo Hospitals Enterprise"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>GST Registration Number</label>
            <input
              type="text"
              value={clientDetails.gstNumber || ""}
              onChange={(e) => setClientDetails({ ...clientDetails, gstNumber: e.target.value })}
              placeholder="e.g. 29ABCDE1234F1Z5"
              style={{ ...inputStyle, fontFamily: "var(--font-mono, monospace, inherit)", textTransform: "uppercase" }}
            />
          </div>
          <div>
            <label style={labelStyle}>Procurement Email Address</label>
            <input
              type="email"
              value={clientDetails.email || ""}
              onChange={(e) => setClientDetails({ ...clientDetails, email: e.target.value })}
              placeholder="procurement@hospital-group.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Contact / Desk Phone</label>
            <input
              type="text"
              value={clientDetails.phone || ""}
              onChange={(e) => setClientDetails({ ...clientDetails, phone: e.target.value })}
              placeholder="+91 98765 43210"
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Official Billing &amp; Dispatch Address</label>
            <input
              type="text"
              value={clientDetails.address || ""}
              onChange={(e) => setClientDetails({ ...clientDetails, address: e.target.value })}
              placeholder="123 Health Ave, Bangalore, Karnataka 560001"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* ── Line Items Table Section ── */}
      <div style={{
        background: "rgba(0,0,0,0.15)",
        border: "1px solid var(--line, rgba(255,255,255,0.08))",
        borderRadius: "16px",
        overflow: "hidden"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          padding: "14px 20px",
          borderBottom: "1px solid var(--line, rgba(255,255,255,0.08))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text, #fff)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🛒 Line Items Schedule ({items.length}) &middot; <span style={{ color: "#c084fc" }}>✏️ All Names &amp; GST Rates Editable</span>
          </span>
          <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 700 }}>
            ⚡ Tabular Math Verification Active
          </span>
        </div>
        
        {items.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted, #94a3b8)", fontSize: "14px" }}>
            No line items added yet. Use the AI Requisition Prompt on the left or click &quot;Scan Request&quot; above to add products!
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <LineItem
                key={item.id}
                item={item}
                onUpdateQty={updateQty}
                onUpdateRate={updateRate}
                onUpdateItem={updateItem}
                money={money}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Financial Breakdown Summary ── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "12px",
        paddingTop: "12px",
        borderTop: "1px solid var(--line, rgba(255,255,255,0.08))"
      }}>
        <div style={summaryRowStyle}>
          <span style={{ color: "var(--muted, #94a3b8)" }}>Net Subtotal:</span>
          <span style={{ width: "160px", textAlign: "right", fontWeight: 700, color: "var(--text, #fff)", fontFamily: "var(--font-mono, monospace, inherit)" }}>
            {money(subtotal)}
          </span>
        </div>

        <div style={{ ...summaryRowStyle, color: "#ef4444" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--muted, #94a3b8)" }}>Special Discount ({discount}%):</span>
            <div style={{ display: "flex", gap: "4px" }}>
              <button type="button" onClick={decrementDiscount} style={btnSmallStyle}>−</button>
              <button type="button" onClick={incrementDiscount} style={btnSmallStyle}>+</button>
            </div>
          </div>
          <span style={{ width: "160px", textAlign: "right", fontWeight: 700, fontFamily: "var(--font-mono, monospace, inherit)" }}>
            −{money(discountValue)}
          </span>
        </div>

        <div style={summaryRowStyle}>
          <span style={{ color: "var(--muted, #94a3b8)" }}>Estimated GST (Calculated Live):</span>
          <span style={{ width: "160px", textAlign: "right", fontWeight: 700, color: "var(--text, #fff)", fontFamily: "var(--font-mono, monospace, inherit)" }}>
            {money(tax)}
          </span>
        </div>

        <div style={{
          ...summaryRowStyle,
          marginTop: "8px",
          paddingTop: "16px",
          borderTop: "2px dashed rgba(255,255,255,0.15)",
          fontSize: "20px",
          fontWeight: 800
        }}>
          <span style={{ color: "var(--text, #fff)" }}>Grand Total:</span>
          <span style={{ width: "200px", textAlign: "right", color: "#10b981", fontFamily: "var(--font-mono, monospace, inherit)" }}>
            {money(total)}
          </span>
        </div>
      </div>

      {/* ── Checkout Footer Button ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", paddingTop: "20px", borderTop: "1px solid var(--line, rgba(255,255,255,0.08))" }}>
        <button
          type="button"
          onClick={onCreateQuote}
          style={{
            background: "linear-gradient(135deg, #7052d7 0%, #4f46e5 100%)",
            color: "#fff",
            border: "none",
            padding: "16px 36px",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 6px 24px rgba(112, 82, 215, 0.45)",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            transition: "transform 0.15s, box-shadow 0.15s"
          }}
        >
          <span style={{ fontSize: "18px" }}>✓</span>
          <span>Approve &amp; Generate Official Quotation (+ Auto-Learn Items)</span>
        </button>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--muted, #94a3b8)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "6px"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid var(--line, rgba(255,255,255,0.15))",
  background: "rgba(0,0,0,0.25)",
  color: "var(--text, #fff)",
  fontSize: "14px",
  fontWeight: 600,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s"
};

const summaryRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  maxWidth: "380px",
  fontSize: "14px",
  lineHeight: 1.4
};

const btnSmallStyle: React.CSSProperties = {
  width: "24px",
  height: "24px",
  background: "rgba(255,255,255,0.1)",
  color: "var(--text, #fff)",
  border: "none",
  borderRadius: "6px",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px"
};
