"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_COMPANY } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Quotation } from "@/types";
import { getQuotations, deleteQuotation } from "@/services/quotations";
import { getBrandSettings } from "@/services/brand";
import { useToast } from "@/hooks/useToast";
import { ExportDesignModal } from "@/components/quotation/ExportDesignModal";

const TABS = ["All", "Draft", "Sent", "Viewed", "Accepted"];

interface QuotationsViewProps {
  onOpenDesign?: () => void;
  onNewQuote?: () => void;
}

export function QuotationsView({ onOpenDesign, onNewQuote }: QuotationsViewProps) {
  const [activeTab, setActiveTab] = useState("All");
  const [quotesList, setQuotesList] = useState<Quotation[]>(() => getQuotations());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTargetQuotes, setExportTargetQuotes] = useState<Quotation[]>([]);
  const { notify } = useToast();

  useEffect(() => {
    const handleUpdate = () => {
      setQuotesList(getQuotations());
    };
    window.addEventListener("operon_ai_quotations_updated", handleUpdate);
    return () => window.removeEventListener("operon_ai_quotations_updated", handleUpdate);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete quotation ${id}?`)) {
      deleteQuotation(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      notify(`🗑️ Deleted quotation ${id}`);
    }
  };

  const handleOpenExportModal = (quote: Quotation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExportTargetQuotes([quote]);
    setShowExportModal(true);
  };

  const handleExportSelected = () => {
    const target = quotesList.filter((q) => selectedIds.includes(q.id));
    if (target.length === 0) return;
    setExportTargetQuotes(target);
    setShowExportModal(true);
  };

  const filteredQuotes =
    quotesList?.filter(
      (q: Quotation) =>
        activeTab === "All" ||
        q.status.toLowerCase() === activeTab.toLowerCase()
    ) || [];

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredQuotes.map((q) => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  return (
    <div className="quotations-view">
      <div className="quotations-view-header flex justify-between items-center mb-6">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>
            Quotations
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Manage and track your customer estimates and proforma invoices.</p>
        </div>
        <div className="flex gap-3 items-center">
          {selectedIds.length > 0 && (
            <button
              onClick={handleExportSelected}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 shadow-md transform hover:-translate-y-0.5 animate-pulse"
            >
              <span>📤</span> Export Selected ({selectedIds.length}) →
            </button>
          )}
          <button
            onClick={onOpenDesign}
            className="bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <span>🎨</span> Upload Design Template
          </button>
          <button
            onClick={onNewQuote}
            style={{
              background: "var(--lav)",
              color: "white",
              border: 0,
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            className="hover:opacity-90 transition-opacity shadow"
          >
            + New Quotation
          </button>
        </div>
      </div>

      <div className="quotation-filters">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`filter-tab ${
              activeTab === tab ? "filter-tab-active" : ""
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="quote-table" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "16px 20px" }}>
        <div className="table-row table-head" style={{ gridTemplateColumns: "28px 1.2fr 1.4fr 0.9fr 0.8fr 1fr 1fr 1.6fr" }}>
          <input
            type="checkbox"
            checked={filteredQuotes.length > 0 && selectedIds.length === filteredQuotes.length}
            onChange={toggleSelectAll}
            style={{ cursor: "pointer", width: 14, height: 14, accentColor: "#7052d7" }}
          />
          <span>QUOTATION</span>
          <span>CUSTOMER</span>
          <span>DATE</span>
          <span>VALUE</span>
          <span>STATUS</span>
          <span>APPROVAL</span>
          <span />
        </div>
        
        {filteredQuotes.map((quote: Quotation) => (
          <div
            key={quote.id}
            className="table-row"
            style={{
              gridTemplateColumns: "28px 1.2fr 1.4fr 0.9fr 0.8fr 1fr 1fr 1.6fr",
              background: selectedIds.includes(quote.id) ? "rgba(112, 82, 215, 0.05)" : undefined,
            }}
          >
            <div>
              <input
                type="checkbox"
                checked={selectedIds.includes(quote.id)}
                onChange={(e) => toggleSelect(quote.id, e)}
                style={{ cursor: "pointer", width: 14, height: 14, accentColor: "#7052d7" }}
              />
            </div>
            <div>
              <b>{quote.id}</b>
              {quote.versions && quote.versions.length > 1 && (
                <span
                  style={{
                    fontSize: 9,
                    background: "var(--soft)",
                    padding: "2px 4px",
                    borderRadius: 4,
                    marginLeft: 6,
                    color: "var(--muted)",
                  }}
                >
                  v{quote.versions.length}
                </span>
              )}
            </div>
            
            <span>{quote.customer}</span>
            <span>{quote.createdAt}</span>
            <b>{formatCurrency(quote.total)}</b>
            
            <span>
              <i className={`status ${quote.status.toLowerCase()}`} />
              {quote.status}
            </span>
            
            <span>
              <i
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  marginRight: 6,
                  background:
                    quote.approvalStatus === "approved"
                      ? "var(--green)"
                      : quote.approvalStatus === "draft"
                      ? "var(--muted)"
                      : "var(--amber)",
                }}
              />
              <span style={{ textTransform: "capitalize" }}>
                {quote.approvalStatus.replace("-", " ")}
              </span>
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => handleOpenExportModal(quote, e)}
                title="Choose Design & Download PDF"
                className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 font-bold text-xs rounded-lg border border-red-200 dark:border-red-800 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>📄</span> PDF
              </button>
              <button
                onClick={(e) => handleOpenExportModal(quote, e)}
                title="Choose Design & Download Excel"
                className="px-2.5 py-1 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 font-bold text-xs rounded-lg border border-green-200 dark:border-green-800 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>📊</span> Excel
              </button>
              <button
                onClick={(e) => handleDelete(quote.id, e)}
                title="Delete Quotation"
                className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-950 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 font-bold text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-red-300 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <span>🗑️</span> Delete
              </button>
            </div>
          </div>
        ))}

        {filteredQuotes.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            No quotations found for this filter.
          </div>
        )}
      </div>

      {showExportModal && (
        <ExportDesignModal
          selectedQuotes={exportTargetQuotes}
          brand={getBrandSettings()}
          onClose={() => setShowExportModal(false)}
          onOpenDesignStudio={() => {
            setShowExportModal(false);
            if (onOpenDesign) onOpenDesign();
          }}
          notify={notify}
        />
      )}
    </div>
  );
}

