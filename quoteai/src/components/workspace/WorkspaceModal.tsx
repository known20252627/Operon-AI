"use client";

import React, { useState, useEffect } from "react";
import { useQuotation } from "@/hooks/useQuotation";
import { RequestCard } from "./RequestCard";
import { QuotationBuilder } from "./QuotationBuilder";
import { ExportDesignModal } from "../quotation/ExportDesignModal";
import type { BrandSettings, CompanySettings, QuoteItem, Quotation, ClientDetails } from "@/types";
import { AITimeline } from "../ai/AITimeline";
import { useAITimeline } from "@/hooks/useAITimeline";
import { Modal } from "@/components/ui/Modal";
import { autoLearnProductsFromQuoteItems } from "@/services/inventory";
import { addQuotation } from "@/services/quotations";
import { getBrandSettings } from "@/services/brand";

interface WorkspaceModalProps {
  brand: BrandSettings;
  company: CompanySettings;
  onClose: () => void;
  onScan: () => void;
  onDesign: () => void;
  notify: (msg: string) => void;
  scannedItems?: QuoteItem[] | null;
  onScannedItemsProcessed?: () => void;
}

export function WorkspaceModal({
  brand,
  company,
  onClose,
  onScan,
  onDesign,
  notify,
  scannedItems,
  onScannedItemsProcessed
}: WorkspaceModalProps) {
  const [request, setRequest] = useState("");
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: "Apollo Hospitals",
    email: "procurement@apollo.com",
    phone: "+91 98765 43210",
    address: "123 Health Ave, Bangalore, Karnataka 560001",
    gstNumber: "29ABCDE1234F1Z5"
  });
  const {
    items,
    discount,
    subtotal,
    discountValue,
    tax,
    total,
    updateQty,
    updateRate,
    updateItem,
    replaceItems,
    incrementDiscount,
    decrementDiscount,
  } = useQuotation();
  
  useEffect(() => {
    if (scannedItems && scannedItems.length > 0) {
      replaceItems(scannedItems);
      if (onScannedItemsProcessed) onScannedItemsProcessed();
    }
  }, [scannedItems, replaceItems, onScannedItemsProcessed]);
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentQuoteId, setCurrentQuoteId] = useState("QT-2026-0001");
  useEffect(() => {
    setCurrentQuoteId("QT-2026-" + Math.floor(1000 + Math.random() * 9000));
  }, []);

  const { steps, currentIndex, isRunning, isComplete, start } = useAITimeline();

  const handleAnalyze = () => {
    start();
  };

  const handleDownload = () => {
    setShowExportModal(true);
  };

  const handleDownloadExcel = () => {
    setShowExportModal(true);
  };

  const handleCreateQuote = () => {
    const { learnedProducts } = autoLearnProductsFromQuoteItems(items);
    
    const newId = `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuote: Quotation = {
      id: newId,
      customer: clientDetails.name || "Apollo Hospitals",
      customerId: "c1",
      clientDetails: clientDetails,
      items: items.map((item) => ({ ...item })),
      discount,
      subtotal,
      tax,
      total,
      status: "sent",
      versions: [{ version: 1, changes: [], createdAt: new Date().toISOString(), createdBy: "Operon AI Engine" }],
      currentVersion: 1,
      createdAt: new Date().toLocaleDateString("en-IN"),
      updatedAt: new Date().toLocaleDateString("en-IN"),
      approvalStatus: "approved",
    };
    addQuotation(newQuote);

    if (learnedProducts.length > 0) {
      notify(`🎉 Quotation ${newId} Saved! ⚡ Operon AI learned ${learnedProducts.length} new inventory item(s)!`);
    } else {
      notify(`✅ Quotation ${newId} generated and saved to official system!`);
    }
    onClose();
  };

  return (
    <Modal onClose={onClose} className="workspace-modal">
      <div style={{ color: "var(--text, #fff)", width: "100%" }}>
        
        {/* ── Exquisite Hero Header ── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(30,27,75,0.8) 0%, rgba(49,46,129,0.7) 50%, rgba(17,24,39,0.9) 100%)",
          border: "1px solid rgba(112,82,215,0.35)",
          borderRadius: "20px",
          padding: "28px 34px",
          marginBottom: "30px",
          position: "relative",
          boxShadow: "0 12px 36px -12px rgba(0,0,0,0.4)"
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: "24px",
              right: "26px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "var(--text, #fff)",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              fontSize: "16px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s"
            }}
            title="Close Workspace"
          >
            ✕
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{
              background: "rgba(16,185,129,0.15)",
              color: "#10b981",
              border: "1px solid rgba(16,185,129,0.3)",
              padding: "5px 12px",
              borderRadius: "99px",
              fontSize: "12px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span>✨</span> Operon AI · Autonomous Quotation Architecture
            </span>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 900, margin: "0 0 10px 0", letterSpacing: "-0.5px" }}>
            Intelligent Quotation Creation Suite
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--muted, #cbd5e1)", maxWidth: "700px", lineHeight: 1.6 }}>
            Construct immaculate enterprise quotation schedules powered by real-time neural catalog recognition, mathematical tabular validation, and your customized Operon AI Template Management System.
          </p>

          <div style={{ display: "flex", gap: "14px", marginTop: "22px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onScan}
              style={{
                background: "linear-gradient(135deg, #7052d7 0%, #4f46e5 100%)",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(112,82,215,0.35)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>📄</span> Import Document / OCR AI Scan
            </button>
            <button
              type="button"
              onClick={onDesign}
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>🎨</span> Customize Official Template System
            </button>
          </div>
        </div>

        {/* ── Main Responsive Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 380px) 1fr", gap: "28px", alignItems: "flex-start" }} className="workspace-responsive-grid">
          
          {/* Left Sidebar: Requisition Prompt & AI Timeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <RequestCard
              request={request}
              onRequestChange={setRequest}
              onAttach={onScan}
              onAnalyze={handleAnalyze}
            />
            {(isRunning || isComplete) && (
              <div style={{
                background: "var(--card-bg, #18181b)",
                border: "1px solid var(--line, rgba(255,255,255,0.1))",
                borderRadius: "16px",
                padding: "20px"
              }}>
                <h4 style={{ margin: "0 0 14px 0", fontSize: "13px", fontWeight: 800, textTransform: "uppercase", color: "#c084fc", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>⚡</span> Autonomous Reasoning Engine
                </h4>
                <AITimeline
                  steps={steps}
                  currentIndex={currentIndex}
                  isRunning={isRunning}
                  isComplete={isComplete}
                />
              </div>
            )}
          </div>

          {/* Right Main: Enterprise Quotation Builder */}
          <div style={{ minWidth: 0 }}>
            <QuotationBuilder
              clientDetails={clientDetails}
              setClientDetails={setClientDetails}
              items={items}
              discount={discount}
              subtotal={subtotal}
              discountValue={discountValue}
              tax={tax}
              total={total}
              updateQty={updateQty}
              updateRate={updateRate}
              updateItem={updateItem}
              incrementDiscount={incrementDiscount}
              decrementDiscount={decrementDiscount}
              onDownloadPdf={handleDownload}
              onDownloadExcel={handleDownloadExcel}
              onCreateQuote={handleCreateQuote}
            />
          </div>
        </div>
      </div>

      {/* ── Responsive styling for smaller screens ── */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .workspace-responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {showExportModal && (
        <ExportDesignModal
          selectedQuotes={[
            {
              id: currentQuoteId,
              customer: clientDetails.name || "Walk-in Customer",
              customerId: "c1",
              clientDetails: clientDetails,
              items: items.map((item) => ({ ...item })),
              discount,
              subtotal,
              tax,
              total,
              status: "draft",
              versions: [],
              currentVersion: 1,
              createdAt: new Date().toLocaleDateString("en-IN"),
              updatedAt: new Date().toLocaleDateString("en-IN"),
              approvalStatus: "draft",
            },
          ]}
          brand={getBrandSettings()}
          company={company}
          onClose={() => setShowExportModal(false)}
          onOpenDesignStudio={() => {
            setShowExportModal(false);
            onDesign();
          }}
          notify={notify}
        />
      )}
    </Modal>
  );
}
