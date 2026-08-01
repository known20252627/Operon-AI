"use client";

import React, { useState, useEffect } from "react";
import { useQuotation } from "@/hooks/useQuotation";
import { downloadQuotationPdf } from "@/lib/pdf";
import { downloadQuotationExcel } from "@/lib/excel";
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
    phone: "+91 9876543210",
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
    addItem,
    replaceItems,
    incrementDiscount,
    decrementDiscount,
  } = useQuotation();
  
  // Replace items with newly scanned items from OCR
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
