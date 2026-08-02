"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_COMPANY } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Quotation } from "@/types";
import { getQuotations, deleteQuotation, updateQuotation } from "@/services/quotations";
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
  const [quotesList, setQuotesList] = useState<Quotation[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTargetQuotes, setExportTargetQuotes] = useState<Quotation[]>([]);
  const { notify } = useToast();

  useEffect(() => {
    setQuotesList(getQuotations());
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

  const handleToggleApproval = (quote: Quotation, e: React.MouseEvent) => {
    e.stopPropagation();
    const isApproved = quote.status === "accepted" || quote.approvalStatus === "approved";
    const updatedQuote: Quotation = {
      ...quote,
      status: isApproved ? "sent" : "accepted",
      approvalStatus: isApproved ? "ai-review" : "approved",
      updatedAt: new Date().toLocaleDateString("en-IN")
    };
    updateQuotation(updatedQuote);
    if (!isApproved) {
      notify(`✅ Quotation ${quote.id} marked as Approved! Added to Analytics revenue.`);
    } else {
      notify(`ℹ️ Quotation ${quote.id} approval status removed.`);
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
      <div className="quotations-view-header flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px" }}>
            Quotations Management Hub
          </h1>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
            <span>Manage estimates, approve contracts, and sync revenue directly to Analytics.</span>
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
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
            className="bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>📑</span> Customize Templates
          </button>
          <button
            onClick={onNewQuote}
            style={{
              background: "linear-gradient(135deg, #7052d7 0%, #4f46e5 100%)",
              color: "white",
              border: 0,
              padding: "9px 18px",
              borderRadius: "12px",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: "13px",
              boxShadow: "0 4px 14px rgba(112, 82, 215, 0.35)"
            }}
            className="hover:opacity-95 transition-opacity"
          >
            + New Quotation
          </button>
        </div>
      </div>

      <div className="quotation-filters mb-6">
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

      <div className="quote-table overflow-x-auto" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "16px 20px", minWidth: 920 }}>
        <div className="table-row table-head" style={{ gridTemplateColumns: "28px 1.2fr 1.4fr 0.9fr 0.9fr 0.9fr 0.9fr 2.4fr" }}>
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
          <span style={{ textAlign: "center" }}>ACTIONS &amp; APPROVALS</span>
        </div>
        
        {filteredQuotes.map((quote: Quotation) => {
          const isApproved = quote.status === "accepted" || quote.approvalStatus === "approved";

          return (
            <div
              key={quote.id}
              className="table-row hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              style={{
                gridTemplateColumns: "28px 1.2fr 1.4fr 0.9fr 0.9fr 0.9fr 0.9fr 2.4fr",
                background: selectedIds.includes(quote.id) ? "rgba(112, 82, 215, 0.05)" : undefined,
                borderBottom: "1px solid var(--line, rgba(255,255,255,0.06))"
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
                      padding: "2px 5px",
                      borderRadius: 4,
                      marginLeft: 6,
                      color: "var(--muted)",
                      fontWeight: 700
                    }}
                  >
                    v{quote.versions.length}
                  </span>
                )}
              </div>
              
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{quote.customer}</span>
              <span className="text-zinc-500 text-xs font-mono">{quote.createdAt}</span>
              <b className="text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrency(quote.total)}</b>
              
              <span>
                <i className={`status ${quote.status.toLowerCase()}`} />
                <span className="capitalize text-xs font-semibold">{quote.status}</span>
              </span>
              
              <span>
                <i
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    marginRight: 6,
                    background: isApproved ? "var(--green, #10b981)" : "var(--amber, #f59e0b)",
                  }}
                />
                <span style={{ textTransform: "capitalize", fontSize: 12, fontWeight: isApproved ? 700 : 500, color: isApproved ? "#10b981" : undefined }}>
                  {quote.approvalStatus.replace("-", " ")}
                </span>
              </span>
              
              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                {/* ── Approved Toggle Button ── */}
                <button
                  type="button"
                  onClick={(e) => handleToggleApproval(quote, e)}
                  title={isApproved ? "Click to revoke approval" : "Click to Approve deal and count in Analytics revenue"}
                  style={{
                    background: isApproved ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "rgba(16, 185, 129, 0.1)",
                    color: isApproved ? "#fff" : "#10b981",
                    border: isApproved ? "none" : "1px solid rgba(16, 185, 129, 0.3)",
                    padding: "5px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: isApproved ? "0 2px 8px rgba(16, 185, 129, 0.35)" : "none",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em"
                  }}
                  className="hover:scale-102"
                >
                  <span>{isApproved ? "✅ Approved" : "✓ Approve"}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleOpenExportModal(quote, e)}
                  title="Print or Download PDF in Saved Template"
                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>🖨️</span> PDF
                </button>
                <button
                  type="button"
                  onClick={(e) => handleOpenExportModal(quote, e)}
                  title="Download Excel in Saved Template"
                  className="px-2 py-1 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 font-bold text-xs rounded-lg border border-green-200 dark:border-green-800 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>📊</span> Excel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(quote.id, e)}
                  title="Delete Quotation"
                  className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-950 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 font-bold text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-red-300 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          );
        })}

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
          company={DEFAULT_COMPANY}
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
