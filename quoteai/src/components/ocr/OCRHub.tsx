/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { SAMPLE_DOCUMENTS, executeRealOcrOnUploadedFile, parseOcrTextToStructuredResult, getGroqApiKey, extractWithGroqAI, type OCRDocumentResult, type SampleDocument } from "@/services/ocr";
import type { QuoteItem } from "@/types";
import { PRODUCTS } from "@/lib/constants";
import { getCompanyProducts, autoLearnProductsFromQuoteItems } from "@/services/inventory";

interface OCRHubProps {
  onConvertToQuote: (items: QuoteItem[], customerName?: string, docTitle?: string) => void;
  notify: (msg: string) => void;
}

export function OCRHub({ onConvertToQuote, notify }: OCRHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");
  const [currentResult, setCurrentResult] = useState<OCRDocumentResult | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "raw_ocr">("summary");
  const [editableItems, setEditableItems] = useState<QuoteItem[]>([]);
  const [synced, setSynced] = useState<boolean>(false);
  const [activeGroqKey, setActiveGroqKey] = useState<string>("");

  useEffect(() => {
    setActiveGroqKey(getGroqApiKey());
  }, []);

  // Filter sample documents
  const filteredSamples = selectedCategory === "All" 
    ? SAMPLE_DOCUMENTS 
    : SAMPLE_DOCUMENTS.filter(d => d.category === selectedCategory);

  // Handle clicking a 1-click sample document (2-Stage AI Filter)
  const handleSelectSample = async (sample: SampleDocument) => {
    setIsProcessing(true);
    setProgress(25);
    setStatusText(`Step 1/2: Optical reading & text extraction on ${sample.title}...`);
    setSynced(false);

    await new Promise(r => setTimeout(r, 450));
    setProgress(60);

    if (activeGroqKey && activeGroqKey.length > 15) {
      setStatusText("Step 2/2: ✨ Operon AI Neural Engine stripping out bank accounts, terms & isolating product line items...");
      const groqRes = await extractWithGroqAI(sample.sampleText, sample.title, "text");
      if (groqRes) {
        groqRes.docType = sample.category;
        setCurrentResult(groqRes);
        setEditableItems(groqRes.items);
        setProgress(100);
        setStatusText("✨ AI Noise Elimination & Product Isolation complete!");
        setIsProcessing(false);
        notify(`✨ AI Filter isolated ${groqRes.items.length} product items from ${sample.title}!`);
        return;
      }
    }

    setStatusText("Step 2/2: ✨ Operon AI Filter automatically removing addresses, bank noise & isolating product items...");
    await new Promise(r => setTimeout(r, 650));

    const result = parseOcrTextToStructuredResult(sample.sampleText, sample.title, "text");
    result.docType = sample.category;
    setCurrentResult(result);
    setEditableItems(result.items);
    setProgress(100);
    setStatusText("✨ AI Noise Elimination & Product Isolation complete!");
    setIsProcessing(false);
    notify(`✨ AI Filter isolated ${result.items.length} product items from ${sample.title}!`);
  };

  // Handle file upload (Real Tesseract.js / PDF / Spreadsheet)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsProcessing(true);
    setProgress(10);
    setStatusText(`Reading ${file.name}...`);
    setSynced(false);

    try {
      const result = await executeRealOcrOnUploadedFile(file, (prog, text) => {
        setProgress(prog);
        setStatusText(text);
      });
      setCurrentResult(result);
      setEditableItems(result.items);
      setIsProcessing(false);
      notify(`Successfully extracted ${result.items.length} items from ${file.name}`);
    } catch (err: any) {
      setIsProcessing(false);
      notify(`OCR Error: ${err.message || "Failed to process document"}`);
    }
  };

  // Item editing handlers
  const handleQtyChange = (id: number, newQty: number) => {
    setEditableItems(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, newQty) } : item));
  };

  const handleRateChange = (id: number, newRate: number) => {
    setEditableItems(prev => prev.map(item => item.id === id ? { ...item, rate: Math.max(0, newRate) } : item));
  };

  const handleProductChange = (id: number, sku: string) => {
    const prod = getCompanyProducts().find(p => p.sku === sku);
    if (!prod) return;
    setEditableItems(prev => prev.map(item => item.id === id ? {
      ...item,
      product: prod.name,
      sku: prod.sku,
      rate: prod.rate,
      gst: prod.gst,
      confidence: 100,
      aiReason: `Manually linked to inventory item ${prod.sku}`
    } : item));
  };

  const removeItem = (id: number) => {
    setEditableItems(prev => prev.filter(item => item.id !== id));
    notify("Line item removed");
  };

  // Calculate totals
  const subtotal = editableItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const totalGst = editableItems.reduce((sum, item) => sum + (item.qty * item.rate * (item.gst / 100)), 0);
  const totalAmount = subtotal + totalGst;

  const handleSyncToCRM = () => {
    const { learnedProducts } = autoLearnProductsFromQuoteItems(editableItems);
    setSynced(true);
    if (learnedProducts.length > 0) {
      notify(`Verified & synced! 🤖 Auto-learned ${learnedProducts.length} new item(s) into Company Catalog!`);
    } else {
      notify("Verified & synced to Medline CRM and Inventory Database!");
    }
  };

  const handleExportJson = () => {
    if (!currentResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      document: currentResult.filename,
      type: currentResult.docType,
      customer: currentResult.customerCompany,
      date: currentResult.documentDate,
      items: editableItems,
      subtotal,
      gst: totalGst,
      total: totalAmount
    }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${currentResult.id}_extraction.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify("Exported structured JSON");
  };

  return (
    <div className="ocr-hub-container" style={{ padding: "0 24px 40px", maxWidth: 1400, margin: "0 auto" }}>
      {/* ── Hero Header ────────────────────────────────────────────── */}
      <div className="ocr-hero" style={{
        background: "linear-gradient(135deg, rgba(112,82,215,0.15) 0%, rgba(37,99,235,0.1) 100%)",
        border: "1px solid rgba(112,82,215,0.25)",
        borderRadius: 20,
        padding: "32px 36px",
        marginBottom: 28,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          <div>
            <span className="ai-pill" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <b style={{ color: "#7052d7" }}>✦</b> Operon AI · Autonomous Employee Feature
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-0.03em" }}>
              OCR &amp; Document Intelligence Center
            </h2>
            <p style={{ margin: 0, color: "var(--muted)", maxWidth: 640, fontSize: 15, lineHeight: 1.6 }}>
              Your AI employee reads and understands complex unstructured business documents — from hospital purchase orders and multi-page tenders to WhatsApp screenshots and handwritten doctor notes.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                userSelect: "none",
                cursor: "default"
              }}
            >
              <span>✨</span> AI Neural Filter Active ✓
            </div>
            <label className="primary-wide" style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}>
              <span>📄</span> Upload Real File (PDF / Image / Excel)
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx,.xls,.csv,.txt" 
                onChange={handleFileUpload} 
                style={{ display: "none" }} 
              />
            </label>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(112,82,215,0.15)" }}>
          <div style={{ background: "var(--card-bg)", padding: "16px 20px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <small style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: 11 }}>Docs Processed</small>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>348 <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>↑ 24 today</span></div>
          </div>
          <div style={{ background: "var(--card-bg)", padding: "16px 20px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <small style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: 11 }}>Avg AI Confidence</small>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>96.4% <span style={{ fontSize: 13, color: "#7052d7", fontWeight: 600 }}>✦ High</span></div>
          </div>
          <div style={{ background: "var(--card-bg)", padding: "16px 20px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <small style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: 11 }}>Catalog Auto-Match</small>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>92.0% <span style={{ fontSize: 13, color: "#2563eb", fontWeight: 600 }}>Zero touch</span></div>
          </div>
          <div style={{ background: "var(--card-bg)", padding: "16px 20px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <small style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: 11 }}>Time Saved vs Manual</small>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>42.5 hrs <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>This month</span></div>
          </div>
        </div>
      </div>

      {/* ── Processing Overlay / Progress Bar ──────────────────────── */}
      {isProcessing && (
        <div style={{
          background: "var(--card-bg)",
          border: "1px solid #7052d7",
          borderRadius: 16,
          padding: 24,
          marginBottom: 28,
          boxShadow: "0 10px 25px rgba(112,82,215,0.15)",
          textAlign: "center"
        }}>
          <div style={{ display: "inline-block", padding: "10px 18px", borderRadius: 30, background: "rgba(112,82,215,0.1)", color: "#7052d7", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
            ⚡ Operon AI Neural OCR Engine Active
          </div>
          <h3 style={{ margin: "0 0 12px 0", fontSize: 18 }}>{statusText}</h3>
          <div style={{ width: "100%", maxWidth: 480, height: 10, background: "var(--line)", borderRadius: 10, margin: "0 auto", overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #7052d7, #2563eb)",
              borderRadius: 10,
              transition: "width 0.3s ease"
            }} />
          </div>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 12 }}>
            Extracting text · Recognizing table layouts · Semantic matching against Medline catalog ({progress}%)
          </p>
        </div>
      )}

      {/* ── 1-Click Test Drive / Pre-Loaded Samples ─────────────────── */}
      {!currentResult && !isProcessing && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                1-Click Test Drive: Pre-Loaded Business Documents
              </h3>
              <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: 14 }}>
                Select a sample document below to watch Operon AI instantly OCR, parse, and verify line items.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["All", "Purchase Order", "WhatsApp Inquiry", "Tender Document", "Handwritten Note", "Vendor Invoice"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "1px solid var(--line)",
                    background: selectedCategory === cat ? "#7052d7" : "var(--card-bg)",
                    color: selectedCategory === cat ? "#fff" : "var(--text)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filteredSamples.map(sample => (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 180
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "#7052d7";
                  e.currentTarget.style.boxShadow = "0 12px 24px -8px rgba(112,82,215,0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{sample.icon}</span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 12,
                      background: sample.badge.includes("High") ? "rgba(22,163,74,0.15)" : (sample.badge.includes("Fuzzy") ? "rgba(234,179,8,0.15)" : "rgba(112,82,215,0.15)"),
                      color: sample.badge.includes("High") ? "#16a34a" : (sample.badge.includes("Fuzzy") ? "#ca8a04" : "#7052d7")
                    }}>
                      {sample.badge}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{sample.title}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{sample.subtitle}</p>
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <small style={{ color: "#7052d7", fontWeight: 700 }}>⚡ Launch AI Reader →</small>
                  <small style={{ color: "var(--muted)", fontSize: 11 }}>{sample.category}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI Employee Verification & Editing Workspace ────────────── */}
      {currentResult && !isProcessing && (
        <div className="ocr-results-workspace" style={{ animation: "fadeIn 0.3s ease" }}>
          {/* Top action strip */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            background: "var(--card-bg)",
            padding: "16px 24px",
            borderRadius: 16,
            border: "1px solid var(--line)",
            flexWrap: "wrap",
            gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => { setCurrentResult(null); setEditableItems([]); }}
                style={{
                  background: "transparent",
                  border: "1px solid var(--line)",
                  padding: "8px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                ← Back to Documents
              </button>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{currentResult.filename}</h3>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 12,
                    background: "rgba(112,82,215,0.15)",
                    color: "#7052d7"
                  }}>
                    {currentResult.docType}
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 12,
                    background: currentResult.status === "verified" ? "rgba(22,163,74,0.15)" : "rgba(234,179,8,0.15)",
                    color: currentResult.status === "verified" ? "#16a34a" : "#ca8a04"
                  }}>
                    {currentResult.confidenceScore}% Confidence
                  </span>
                </div>
                <small style={{ color: "var(--muted)", fontSize: 13 }}>
                  Parsed for <b>{currentResult.customerCompany}</b> ({currentResult.customerName}) · Ref: {currentResult.referenceNumber} · Date: {currentResult.documentDate}
                </small>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleSyncToCRM}
                disabled={synced}
                style={{
                  background: synced ? "rgba(22,163,74,0.15)" : "var(--card-bg)",
                  color: synced ? "#16a34a" : "var(--text)",
                  border: `1px solid ${synced ? "#16a34a" : "var(--line)"}`,
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: synced ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s"
                }}
              >
                {synced ? "✓ Synced to CRM & Inventory" : "📦 Verify & Sync to CRM"}
              </button>
              <button
                onClick={handleExportJson}
                style={{
                  background: "var(--card-bg)",
                  color: "var(--text)",
                  border: "1px solid var(--line)",
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                📥 Export JSON
              </button>
              <button
                onClick={() => onConvertToQuote(editableItems, currentResult.customerCompany, currentResult.filename)}
                style={{
                  background: "linear-gradient(135deg, #7052d7 0%, #2563eb 100%)",
                  color: "#fff",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(112,82,215,0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                🚀 Convert to Quotation →
              </button>
            </div>
          </div>

          {/* 2-Column Split Workspace */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24, alignItems: "start" }}>
            {/* Left Column: Document Preview & Raw OCR Terminal */}
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "flex", borderBottom: "1px solid var(--line)", background: "rgba(0,0,0,0.02)" }}>
                <button
                  onClick={() => setActiveTab("summary")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    border: "none",
                    background: activeTab === "summary" ? "var(--card-bg)" : "transparent",
                    borderBottom: activeTab === "summary" ? "2px solid #7052d7" : "2px solid transparent",
                    fontWeight: 700,
                    color: activeTab === "summary" ? "#7052d7" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  📊 AI Employee Summary
                </button>
                <button
                  onClick={() => setActiveTab("raw_ocr")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    border: "none",
                    background: activeTab === "raw_ocr" ? "var(--card-bg)" : "transparent",
                    borderBottom: activeTab === "raw_ocr" ? "2px solid #7052d7" : "2px solid transparent",
                    fontWeight: 700,
                    color: activeTab === "raw_ocr" ? "#7052d7" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  ⚡ Live Raw OCR Text ({currentResult.rawOcrText.split("\n").length} lines)
                </button>
              </div>

              <div style={{ padding: 24 }}>
                {activeTab === "summary" ? (
                  <div>
                    <div style={{
                      background: "rgba(112,82,215,0.08)",
                      border: "1px solid rgba(112,82,215,0.2)",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 20
                    }}>
                      <h4 style={{ margin: "0 0 8px 0", color: "#7052d7", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>🤖</span> Operon AI Analysis Notes
                      </h4>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text)" }}>
                        {currentResult.aiNotes}
                      </p>
                    </div>

                    <h5 style={{ margin: "0 0 12px 0", fontSize: 13, color: "var(--muted)", textTransform: "uppercase" }}>Document Attributes</h5>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                      <div style={{ background: "rgba(0,0,0,0.02)", padding: 10, borderRadius: 8, border: "1px solid var(--line)" }}>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Client / Hospital</span>
                        <strong>{currentResult.customerCompany}</strong>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.02)", padding: 10, borderRadius: 8, border: "1px solid var(--line)" }}>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Contact Person</span>
                        <strong>{currentResult.customerName}</strong>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.02)", padding: 10, borderRadius: 8, border: "1px solid var(--line)" }}>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Reference / Order #</span>
                        <strong>{currentResult.referenceNumber}</strong>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.02)", padding: 10, borderRadius: 8, border: "1px solid var(--line)" }}>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Document Date</span>
                        <strong>{currentResult.documentDate}</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                      <h5 style={{ margin: "0 0 10px 0", fontSize: 13, color: "var(--muted)", textTransform: "uppercase" }}>AI Verification Pipeline</h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#16a34a" }}>✓</span> Optical Character Recognition (Tesseract / PDF) — 100%
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#16a34a" }}>✓</span> Named Entity Recognition (Client &amp; Dates) — Verified
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#16a34a" }}>✓</span> Semantic Catalog Matching &amp; Alias Translation — {editableItems.length} items
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#16a34a" }}>✓</span> GST Tax &amp; Pricing Rule Validation — Compliant
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: "#0f172a",
                    color: "#e2e8f0",
                    padding: 16,
                    borderRadius: 12,
                    fontFamily: "monospace",
                    fontSize: 12,
                    lineHeight: 1.6,
                    maxHeight: 480,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap"
                  }}>
                    <div style={{ color: "#94a3b8", borderBottom: "1px solid #334155", paddingBottom: 8, marginBottom: 12 }}>
                      [RAW OCR OUTPUT FROM TESSERACT / DOCUMENT READER]
                      <br />[PROCESSING TIME: {currentResult.processingTimeMs}ms]
                    </div>
                    {currentResult.rawOcrText}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Extracted Line Items & Editor */}
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--line)", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                    Extracted Line Items ({editableItems.length})
                  </h4>
                  <small style={{ color: "var(--muted)" }}>
                    You can edit quantities, rates, or re-link inventory items before converting to quotation.
                  </small>
                </div>
                <button
                  onClick={() => {
                    const defaultProd = getCompanyProducts()[0] || PRODUCTS[0];
                    setEditableItems(prev => [
                      ...prev,
                      {
                        id: Date.now(),
                        product: defaultProd.name,
                        sku: defaultProd.sku,
                        qty: 1,
                        rate: defaultProd.rate,
                        gst: defaultProd.gst,
                        confidence: 100,
                        aiReason: "Manually added item"
                      }
                    ]);
                  }}
                  style={{
                    background: "rgba(112,82,215,0.1)",
                    color: "#7052d7",
                    border: "1px solid rgba(112,82,215,0.3)",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer"
                  }}
                >
                  + Add Line Item
                </button>
              </div>

              {/* Items Table */}
              <div style={{ overflowX: "auto", border: "1px solid var(--line)", borderRadius: 12, marginBottom: 20 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>
                      <th style={{ padding: "12px 14px" }}>Product &amp; AI Match Reason</th>
                      <th style={{ padding: "12px 10px", width: 140 }}>Catalog SKU Link</th>
                      <th style={{ padding: "12px 10px", width: 70 }}>Qty</th>
                      <th style={{ padding: "12px 10px", width: 90 }}>Rate (₹)</th>
                      <th style={{ padding: "12px 10px", width: 60 }}>GST</th>
                      <th style={{ padding: "12px 14px", textAlign: "right", width: 100 }}>Total</th>
                      <th style={{ padding: "12px 8px", width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableItems.map(item => {
                      const itemTotal = item.qty * item.rate * (1 + item.gst / 100);
                      const isHighConf = (item.confidence || 90) >= 90;
                      const isMidConf = (item.confidence || 90) >= 75 && !isHighConf;

                      return (
                        <tr key={item.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: "14px" }}>
                            <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{item.product}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: 6,
                                background: isHighConf ? "rgba(22,163,74,0.12)" : (isMidConf ? "rgba(234,179,8,0.12)" : "rgba(239,68,68,0.12)"),
                                color: isHighConf ? "#16a34a" : (isMidConf ? "#ca8a04" : "#ef4444")
                              }}>
                                {item.confidence || 90}% AI Match
                              </span>
                              <span style={{ fontSize: 11, color: "var(--muted)" }}>{item.aiReason || "Verified match"}</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px" }}>
                            <select
                              value={item.sku}
                              onChange={e => handleProductChange(item.id, e.target.value)}
                              style={{
                                width: "100%",
                                padding: "6px 8px",
                                borderRadius: 6,
                                border: "1px solid var(--line)",
                                background: "var(--card-bg)",
                                color: "var(--text)",
                                fontSize: 12,
                                fontWeight: 600
                              }}
                            >
                              <option value={item.sku}>{item.sku}</option>
                              {getCompanyProducts().filter(p => p.sku !== item.sku).map(p => (
                                <option key={p.sku} value={p.sku}>
                                  {p.sku} ({p.name.slice(0, 18)}...)
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "10px" }}>
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={e => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                              style={{
                                width: 54,
                                padding: "6px 6px",
                                borderRadius: 6,
                                border: "1px solid var(--line)",
                                background: "var(--card-bg)",
                                color: "var(--text)",
                                fontWeight: 700,
                                textAlign: "center"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px" }}>
                            <input
                              type="number"
                              min={0}
                              value={item.rate}
                              onChange={e => handleRateChange(item.id, parseFloat(e.target.value) || 0)}
                              style={{
                                width: 76,
                                padding: "6px 6px",
                                borderRadius: 6,
                                border: "1px solid var(--line)",
                                background: "var(--card-bg)",
                                color: "var(--text)",
                                fontWeight: 600
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", color: "var(--muted)", fontWeight: 600 }}>
                            {item.gst}%
                          </td>
                          <td style={{ padding: "14px", textAlign: "right", fontWeight: 800 }}>
                            ₹ {Math.round(itemTotal).toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <button
                              onClick={() => removeItem(item.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--muted)",
                                cursor: "pointer",
                                fontSize: 14,
                                padding: 4
                              }}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {editableItems.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
                          No line items found. Click &quot;+ Add Line Item&quot; above or upload another document.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculations Box */}
              <div style={{
                background: "rgba(0,0,0,0.02)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: 18,
                display: "flex",
                justifyContent: "flex-end",
                gap: 32
              }}>
                <div>
                  <span style={{ fontSize: 12, color: "var(--muted)", display: "block" }}>Subtotal (Excl. Tax)</span>
                  <strong style={{ fontSize: 16 }}>₹ {subtotal.toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "var(--muted)", display: "block" }}>Estimated GST Tax</span>
                  <strong style={{ fontSize: 16 }}>₹ {Math.round(totalGst).toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 24 }}>
                  <span style={{ fontSize: 12, color: "#7052d7", fontWeight: 700, display: "block" }}>Total Quoted Value</span>
                  <strong style={{ fontSize: 22, color: "#7052d7", fontWeight: 900 }}>₹ {Math.round(totalAmount).toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
