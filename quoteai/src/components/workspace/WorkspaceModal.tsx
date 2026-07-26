"use client";

import React, { useState, useEffect } from "react";
import type { BrandSettings, CompanySettings, QuoteItem } from "@/types";
import { useQuotation } from "@/hooks/useQuotation";
import { downloadQuotationPdf } from "@/lib/pdf";
import { downloadQuotationExcel } from "@/lib/excel";
import { RequestCard } from "./RequestCard";
import { QuotationBuilder } from "./QuotationBuilder";
import { AITimeline } from "../ai/AITimeline";
import { useAITimeline } from "@/hooks/useAITimeline";
import { Modal } from "@/components/ui/Modal";
import { autoLearnProductsFromQuoteItems } from "@/services/inventory";
import { addQuotation } from "@/services/quotations";
import { getBrandSettings } from "@/services/brand";
import { ExportDesignModal } from "@/components/quotation/ExportDesignModal";
import type { Quotation } from "@/types";

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
  const {
    items,
    discount,
    subtotal,
    discountValue,
    tax,
    total,
    updateQty,
    updateRate,
    addItem,
    incrementDiscount,
    decrementDiscount,
  } = useQuotation();
  
  // Merge newly scanned items into the quotation
  useEffect(() => {
    if (scannedItems && scannedItems.length > 0) {
      scannedItems.forEach(item => addItem(item));
      if (onScannedItemsProcessed) onScannedItemsProcessed();
    }
  }, [scannedItems, addItem, onScannedItemsProcessed]);
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentQuoteId] = useState(() => "QT-2026-" + Math.floor(1000 + Math.random() * 9000));

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
      customer: "Apollo Hospitals",
      customerId: "c1",
      items: items.map((item) => ({ ...item })),
      discount,
      subtotal,
      tax,
      total,
      status: "sent",
      versions: [{ version: 1, changes: [], createdAt: new Date().toISOString(), createdBy: "AI" }],
      currentVersion: 1,
      createdAt: new Date().toLocaleDateString("en-IN"),
      updatedAt: new Date().toLocaleDateString("en-IN"),
      approvalStatus: "approved",
    };
    addQuotation(newQuote);

    if (learnedProducts.length > 0) {
      notify(`🎉 Quote ${newId} Saved! ⚡ Operon AI learned ${learnedProducts.length} new product(s)!`);
    } else {
      notify(`✅ Quotation ${newId} finalized and saved to Quotations list!`);
    }
    onClose();
  };

  return (
    <Modal onClose={onClose} className="workspace-modal">
      <div className="workspace">
        <div className="workspace-head">
          <button className="close-btn" onClick={onClose}>✕</button>
          <div className="ai-pill">✨ Workspace</div>
          <h2>Create Quotation</h2>
          <p>Generate accurate quotes from customer requests using AI.</p>
        </div>

        <div className="tool-launchers">
          <button onClick={onScan}>📄 Scan request</button>
          <button onClick={onDesign}>🎨 Customize design</button>
        </div>

        <div className="workspace-grid">
          <div className="workspace-sidebar">
            <RequestCard
              request={request}
              onRequestChange={setRequest}
              onAttach={onScan}
              onAnalyze={handleAnalyze}
            />
            {(isRunning || isComplete) && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
                <AITimeline
                  steps={steps}
                  currentIndex={currentIndex}
                  isRunning={isRunning}
                  isComplete={isComplete}
                />
              </div>
            )}
          </div>

          <div className="workspace-main">
            <QuotationBuilder
              items={items}
              discount={discount}
              subtotal={subtotal}
              discountValue={discountValue}
              tax={tax}
              total={total}
              updateQty={updateQty}
              updateRate={updateRate}
              incrementDiscount={incrementDiscount}
              decrementDiscount={decrementDiscount}
              onDownloadPdf={handleDownload}
              onDownloadExcel={handleDownloadExcel}
              onCreateQuote={handleCreateQuote}
            />
          </div>
        </div>
      </div>

      {showExportModal && (
        <ExportDesignModal
          selectedQuotes={[
            {
              id: currentQuoteId,
              customer: "Apollo Hospitals",
              customerId: "c1",
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
