"use client";

import React, { useState } from "react";
import type { QuotationTemplate, TemplateWidget } from "@/types/template";
import type { QuoteItem } from "@/types";
import { generateDeterministicPDF, generateDeterministicExcel } from "@/lib/template";

interface TemplatePreviewProps {
  template: QuotationTemplate;
  inModal?: boolean;
  onClose?: () => void;
  onEdit?: () => void;
}

export function TemplatePreview({
  template,
  inModal = false,
  onClose,
  onEdit,
}: TemplatePreviewProps) {
  const [viewDevice, setViewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const cfg = template.config || {};
  const primary = cfg.primaryColor || "#7052d7";
  const accent = cfg.accentColor || "#f3f0ff";
  const fontName = cfg.font || "Inter";
  const isDark = cfg.theme === "dark";
  const fontScale = cfg.fontSizeScale === "compact" ? "11px" : cfg.fontSizeScale === "spacious" ? "14px" : "13px";
  const tableHeadScale = cfg.fontSizeScale === "compact" ? "10px" : cfg.fontSizeScale === "spacious" ? "13px" : "12px";

  const sampleItems: QuoteItem[] = [
    { id: 1, product: "Infusion Pump Modular System", sku: "IP-800", qty: 4, rate: 42500, gst: 12 },
    { id: 2, product: "Patient ECG Telemetry Monitor 12-Ch", sku: "TM-12C", qty: 2, rate: 85000, gst: 12 },
    { id: 3, product: "Surgical Sterile Consumable Kit (Pack of 50)", sku: "SSK-50", qty: 10, rate: 2400, gst: 12 },
  ];

  const subtotal = sampleItems.reduce((acc, item) => acc + item.qty * item.rate, 0);
  const tax = subtotal * 0.12;
  const grandTotal = subtotal + tax;

  const handleTestPDF = async () => {
    await generateDeterministicPDF({
      quotationId: "QT-PREVIEW-2026",
      customerName: "Apollo Hospitals (Demo)",
      clientDetails: { name: "Apollo Hospitals", address: "Bannerghatta Road, Bangalore", phone: "+91 80 2692 5999", gstNumber: "29AAACF4932H1Z2" },
      date: new Date().toLocaleDateString("en-IN"),
      items: sampleItems,
      discount: 0,
      tax,
      total: grandTotal,
      template,
    }, template);
  };

  const handleTestExcel = async () => {
    await generateDeterministicExcel({
      quotationId: "QT-PREVIEW-2026",
      customerName: "Apollo Hospitals (Demo)",
      clientDetails: { name: "Apollo Hospitals", address: "Bannerghatta Road, Bangalore", phone: "+91 80 2692 5999", gstNumber: "29AAACF4932H1Z2" },
      date: new Date().toLocaleDateString("en-IN"),
      items: sampleItems,
      discount: 0,
      tax,
      total: grandTotal,
      template,
    }, template);
  };

  const deviceWidth = viewDevice === "mobile" ? "380px" : viewDevice === "tablet" ? "640px" : "100%";
  const activeWidgets = (cfg.widgets || []).filter((w) => w.enabled);

  const renderWidget = (w: TemplateWidget) => {
    const isGrad = w.style === "gradient";
    const isBord = w.style === "bordered";
    const isWarn = w.style === "warning";
    const bg = isGrad
      ? "linear-gradient(135deg, rgba(112, 82, 215, 0.12) 0%, rgba(13, 148, 136, 0.08) 100%)"
      : isWarn
      ? "rgba(245, 158, 11, 0.1)"
      : isBord
      ? "transparent"
      : isDark
      ? "#1e293b"
      : "#f8fafc";
    const borderCol = isGrad ? primary : isWarn ? "#f59e0b" : isBord ? (isDark ? "#475569" : "#cbd5e1") : "transparent";

    return (
      <div
        key={w.id}
        style={{
          background: bg,
          border: `1px solid ${borderCol}`,
          borderLeft: isGrad || isWarn ? `4px solid ${borderCol}` : `1px solid ${borderCol}`,
          borderRadius: cfg.borderRadius === "none" ? "0px" : "8px",
          padding: "14px 18px",
          marginBottom: "24px",
          boxShadow: isGrad ? "0 4px 12px rgba(0,0,0,0.03)" : "none",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 800, color: isWarn ? "#d97706" : primary, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>{w.title}</span>
          <span style={{ fontSize: "9px", background: primary, color: "#fff", padding: "1px 6px", borderRadius: "10px", textTransform: "uppercase", opacity: 0.8 }}>
            Canva Widget
          </span>
        </div>
        <div style={{ fontSize: "12px", color: isDark ? "#cbd5e1" : "#475569", lineHeight: 1.5, whiteSpace: "pre-line" }}>
          {w.content}
        </div>
      </div>
    );
  };

  const aboveWidgets = activeWidgets.filter((w) => w.position === "above_table");
  const belowWidgets = activeWidgets.filter((w) => w.position === "below_table");
  const footerTopWidgets = activeWidgets.filter((w) => w.position === "footer_top");
  const watermarkWidget = activeWidgets.find((w) => w.position === "watermark");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: inModal ? "85vh" : "100%",
        background: "var(--bg)",
        borderRadius: inModal ? "16px" : "0",
        overflow: "hidden",
        boxShadow: inModal ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none",
        border: inModal ? "1px solid var(--line)" : "none",
      }}
    >
      {/* Top Controls Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          borderBottom: "1px solid var(--line)",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--fg)" }}>
            👁️ Live Quotation Preview — <span style={{ color: "var(--primary)" }}>{template.name}</span>
          </span>
          {template.isDefault && (
            <span style={{ fontSize: "11px", background: "var(--primary)", color: "#fff", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
              Default
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", background: "var(--soft)", borderRadius: "8px", padding: "2px", gap: "2px" }}>
            {(["desktop", "tablet", "mobile"] as const).map((device) => (
              <button
                key={device}
                type="button"
                onClick={() => setViewDevice(device)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: viewDevice === device ? "var(--surface)" : "transparent",
                  color: viewDevice === device ? "var(--fg)" : "var(--muted)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  boxShadow: viewDevice === device ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {device === "desktop" ? "🖥️ Desktop" : device === "tablet" ? "📱 Tablet" : "📲 Mobile"}
              </button>
            ))}
          </div>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--primary)", fontWeight: 700, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <span>⚙️</span> Edit Template
            </button>
          )}

          <button
            type="button"
            onClick={handleTestExcel}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              background: "#059669",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>📊</span> Test Excel
          </button>

          <button
            type="button"
            onClick={handleTestPDF}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              background: "var(--primary)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🖨️</span> Test Print / PDF
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: "20px", color: "var(--muted)", cursor: "pointer", padding: "0 4px" }}
              title="Close Preview"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Document Viewport */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px",
          background: "var(--soft)",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        <div
          style={{
            width: deviceWidth,
            minHeight: "800px",
            background: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#f8fafc" : "#1e293b",
            fontFamily: fontName,
            borderRadius: cfg.borderRadius === "none" ? "0px" : cfg.borderRadius === "sm" ? "4px" : "12px",
            padding: viewDevice === "mobile" ? "20px" : "48px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Watermark Widget Overlay */}
          {watermarkWidget && (
            <div
              style={{
                position: "absolute",
                top: "40%",
                left: "15%",
                transform: "rotate(-30deg)",
                fontSize: "72px",
                fontWeight: 900,
                color: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
                pointerEvents: "none",
                userSelect: "none",
                letterSpacing: "8px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {watermarkWidget.content || "PROFORMA ESTIMATE"}
            </div>
          )}

          <div>
            {/* Header section */}
            <div
              style={{
                display: "flex",
                flexDirection: viewDevice === "mobile" ? "column" : "row",
                justifyContent: "space-between",
                alignItems: viewDevice === "mobile" ? "flex-start" : "center",
                borderBottom: `2px solid ${primary}`,
                paddingBottom: "24px",
                marginBottom: "28px",
                gap: "16px",
              }}
            >
              <div>
                {cfg.company?.logo && (
                  <img src={cfg.company.logo} style={{ maxHeight: 40, marginBottom: 8, display: "block" }} alt="Logo" />
                )}
                <h1 style={{ fontSize: viewDevice === "mobile" ? "20px" : "24px", fontWeight: 800, color: primary, margin: "0 0 6px 0" }}>
                  {cfg.company?.name || "OPERON AI ENTERPRISE"}
                </h1>
                <p style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#64748b", margin: 0, maxWidth: "340px", lineHeight: 1.4 }}>
                  {cfg.company?.address || "India"}<br />
                  Email: {cfg.company?.email || "sales@operonai.com"} {cfg.company?.gstNumber && `· GSTIN: ${cfg.company.gstNumber}`}
                </p>
              </div>
              <div style={{ textAlign: viewDevice === "mobile" ? "left" : "right" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "1px", color: isDark ? "#e2e8f0" : "#0f172a" }}>
                  QUOTATION
                </h2>
                <div style={{ fontSize: "13px", color: isDark ? "#94a3b8" : "#475569", fontWeight: 600 }}>
                  #QT-PREVIEW-2026 &nbsp;·&nbsp; {new Date().toLocaleDateString("en-IN")}
                </div>
              </div>
            </div>

            {/* Bill To section */}
            <div
              style={{
                background: isDark ? "#1e293b" : "#f8fafc",
                borderLeft: `4px solid ${primary}`,
                padding: "16px 20px",
                borderRadius: "6px",
                marginBottom: "24px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: isDark ? "#94a3b8" : "#64748b", marginBottom: "4px" }}>
                Bill To / Prepared For:
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a" }}>
                Apollo Hospitals (Demo Customer)
              </div>
              <div style={{ fontSize: "13px", color: isDark ? "#cbd5e1" : "#64748b", marginTop: "2px" }}>
                Bannerghatta Road, Bangalore · GSTIN: 29AAACF4932H1Z2 · +91 80 2692 5999
              </div>
            </div>

            {/* Above Table Widgets */}
            {aboveWidgets.map((w) => renderWidget(w))}

            {/* Table section */}
            <div style={{ overflowX: "auto", marginBottom: "24px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: primary, color: "#fff", fontSize: tableHeadScale, textTransform: "uppercase" }}>
                    {cfg.columns?.srNo && <th style={{ padding: "12px 10px", textAlign: "center" }}>#</th>}
                    {cfg.columns?.product && <th style={{ padding: "12px 10px", textAlign: "left" }}>{cfg.columnLabels?.product}</th>}
                    {cfg.columns?.description && <th style={{ padding: "12px 10px", textAlign: "left" }}>{cfg.columnLabels?.description}</th>}
                    {cfg.columns?.hsn && <th style={{ padding: "12px 10px", textAlign: "center" }}>{cfg.columnLabels?.hsn}</th>}
                    {cfg.columns?.qty && <th style={{ padding: "12px 10px", textAlign: "right" }}>{cfg.columnLabels?.qty}</th>}
                    {cfg.columns?.unit && <th style={{ padding: "12px 10px", textAlign: "center" }}>{cfg.columnLabels?.unit}</th>}
                    {cfg.columns?.rate && <th style={{ padding: "12px 10px", textAlign: "right" }}>{cfg.columnLabels?.rate}</th>}
                    {cfg.columns?.gst && <th style={{ padding: "12px 10px", textAlign: "right" }}>{cfg.columnLabels?.gst}</th>}
                    {cfg.columns?.amount && <th style={{ padding: "12px 10px", textAlign: "right" }}>{cfg.columnLabels?.amount}</th>}
                  </tr>
                </thead>
                <tbody>
                  {sampleItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                        background: cfg.tableStyle === "striped" && idx % 2 === 1 ? (isDark ? "#1e293b" : "#f8fafc") : "transparent",
                        fontSize: fontScale,
                      }}
                    >
                      {cfg.columns?.srNo && <td style={{ padding: "12px 10px", textAlign: "center" }}>{idx + 1}</td>}
                      {cfg.columns?.product && <td style={{ padding: "12px 10px", fontWeight: 600 }}>{item.product}</td>}
                      {cfg.columns?.description && <td style={{ padding: "12px 10px", color: isDark ? "#cbd5e1" : "#64748b" }}>SKU: {item.sku} — Clinical grade medical device</td>}
                      {cfg.columns?.hsn && <td style={{ padding: "12px 10px", textAlign: "center" }}>90189099</td>}
                      {cfg.columns?.qty && <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 600 }}>{item.qty}</td>}
                      {cfg.columns?.unit && <td style={{ padding: "12px 10px", textAlign: "center" }}>Nos</td>}
                      {cfg.columns?.rate && <td style={{ padding: "12px 10px", textAlign: "right" }}>₹{item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>}
                      {cfg.columns?.gst && <td style={{ padding: "12px 10px", textAlign: "right" }}>{item.gst || 12}%</td>}
                      {cfg.columns?.amount && <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 700 }}>₹{(item.qty * item.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Below Table Widgets */}
            {belowWidgets.map((w) => renderWidget(w))}

            {/* Totals Section */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
              <div style={{ width: "300px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px", color: isDark ? "#cbd5e1" : "#475569" }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px", color: isDark ? "#cbd5e1" : "#475569" }}>
                  <span>Estimated Tax (GST 12%):</span>
                  <span>₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    marginTop: "8px",
                    borderTop: `2px solid ${isDark ? "#475569" : "#cbd5e1"}`,
                    borderBottom: `3px double ${isDark ? "#94a3b8" : "#0f172a"}`,
                    fontSize: "18px",
                    fontWeight: 800,
                    color: primary,
                  }}
                >
                  <span>GRAND TOTAL:</span>
                  <span>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer details */}
          <div>
            {/* Footer Top Widgets (Like Customer Sign off) */}
            {footerTopWidgets.map((w) => renderWidget(w))}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: viewDevice === "mobile" ? "1fr" : "1fr 1fr",
                gap: "32px",
                borderTop: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                paddingTop: "24px",
              }}
            >
              <div>
                <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: isDark ? "#e2e8f0" : "#334155", margin: "0 0 6px 0" }}>
                  Bank & Payment Details
                </h4>
                <p style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#64748b", margin: 0, lineHeight: 1.5 }}>
                  <strong>Bank A/C:</strong> {cfg.company?.bankDetails || "HDFC Bank · A/C: 502000123456"}<br />
                  <strong>UPI ID:</strong> {cfg.company?.upiId || "operonai@hdfcbank"}<br />
                  <strong>PAN:</strong> {cfg.company?.panNumber || "AABCM4521A"}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: isDark ? "#e2e8f0" : "#334155", margin: "0 0 6px 0" }}>
                  Terms & Conditions
                </h4>
                <p style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#64748b", margin: 0, whiteSpace: "pre-line", lineHeight: 1.5 }}>
                  {cfg.terms || "1. Validity: 15 Days from issue date.\n2. Payment: 100% advance along with PO."}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "36px", textAlign: "right" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: isDark ? "#e2e8f0" : "#1e293b", marginBottom: "40px" }}>
                  For {cfg.company?.name || "Operon AI Enterprise"}
                </div>
                {cfg.company?.authorizedSignature && (
                  <img src={cfg.company.authorizedSignature} style={{ maxHeight: 36, marginBottom: 4, display: "inline-block" }} alt="Sign" />
                )}
                <div style={{ borderTop: `1px solid ${isDark ? "#475569" : "#94a3b8"}`, paddingTop: "6px", fontSize: "11px", fontWeight: 600, color: isDark ? "#94a3b8" : "#64748b", width: "180px" }}>
                  AUTHORIZED SIGNATORY
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
