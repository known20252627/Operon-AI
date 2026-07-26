/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useAITimeline } from "@/hooks/useAITimeline";
import { AITimeline } from "../ai/AITimeline";
import { ToolModal } from "@/components/ui/Modal";

import { executeRealOcrOnUploadedFile } from "@/services/ocr";
import type { QuoteItem } from "@/types";

interface ScanModalProps {
  onClose: () => void;
  onComplete: (items: QuoteItem[]) => void;
  notify: (msg: string) => void;
}

export function ScanModal({ onClose, onComplete, notify }: ScanModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const { steps, currentIndex, isRunning, isComplete, start } = useAITimeline();

  const [extractedItems, setExtractedItems] = useState<QuoteItem[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Product,Qty,Rate,GST\nExample Product,10,150,18";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "quoteai-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScan = async () => {
    if (!file) return notify("Please select a file");
    start();
    
    try {
      setErrorMsg("");
      const result = await executeRealOcrOnUploadedFile(file);
      setExtractedItems(result.items);
      notify(`Extracted ${result.items.length} items from ${file.name}`);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to extract data");
      notify("Extraction failed");
    }
  };

  return (
    <ToolModal
      title="Scan Document"
      subtitle="Extract data from PDF, JPG, PNG, XLSX, or CSV."
      onClose={onClose}
    >
      <div>
        <div className="upload-zone">
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
            onChange={(e) => {
              if (e.target.files) setFile(e.target.files[0]);
              setErrorMsg("");
              setExtractedItems([]);
            }}
          />
          <span>📄</span>
          <b>Click to upload or drag and drop</b>
          <small>PDF, JPG, PNG, XLSX, CSV (Max 10MB)</small>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); handleDownloadTemplate(); }}
            className="text-purple-600 hover:underline mt-2 text-sm z-10 relative"
          >
            Download sample template
          </button>
        </div>

        {file && (
          <div className="file-chip">
            <b>{file.name}</b>
            <button onClick={() => setFile(null)}>✕</button>
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={isRunning}
          className="primary-wide"
        >
          Extract with AI
        </button>

        {(isRunning || isComplete) && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <AITimeline
              steps={steps}
              currentIndex={currentIndex}
              isRunning={isRunning}
              isComplete={isComplete}
            />
          </div>
        )}

        {isComplete && (
          <div className="scan-result">
            <span>✓</span>
            <div>
              <b>{errorMsg ? "Scan Failed" : "Scan complete!"}</b>
              <small className={errorMsg ? "text-red-500" : ""}>
                {errorMsg 
                  ? errorMsg 
                  : (extractedItems.length > 0 
                      ? `Successfully extracted ${extractedItems.length} items.`
                      : "No items extracted. Please try another file.")}
              </small>
            </div>
            {extractedItems.length > 0 ? (
              <button onClick={() => onComplete(extractedItems)}>PROCEED →</button>
            ) : (
              <button onClick={onClose}>CLOSE</button>
            )}
          </div>
        )}
      </div>
    </ToolModal>
  );
}
