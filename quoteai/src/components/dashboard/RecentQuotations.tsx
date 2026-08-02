"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_COMPANY } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { downloadQuotationPdf } from "@/lib/pdf";
import { downloadQuotationExcel } from "@/lib/excel";
import { getBrandSettings } from "@/services/brand";
import { getQuotations, deleteQuotation, updateQuotation } from "@/services/quotations";
import { useToast } from "@/hooks/useToast";
import type { Quotation } from "@/types";

export function RecentQuotations() {
  const [quotesList, setQuotesList] = useState<Quotation[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const { notify } = useToast();

  useEffect(() => {
    const all = getQuotations();
    setTotalCount(all.length);
    setQuotesList(showAll ? all : all.slice(0, 5));

    const handleUpdate = () => {
      const updatedAll = getQuotations();
      setTotalCount(updatedAll.length);
      setQuotesList(showAll ? updatedAll : updatedAll.slice(0, 5));
    };
    window.addEventListener("operon_ai_quotations_updated", handleUpdate);
    return () => window.removeEventListener("operon_ai_quotations_updated", handleUpdate);
  }, [showAll]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete quotation ${id}?`)) {
      deleteQuotation(id);
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

  const handleDownload = async (quote: Quotation, format: "pdf" | "excel") => {
    const brand = getBrandSettings();
    const company = DEFAULT_COMPANY;
    const items = quote.items && quote.items.length > 0 ? quote.items : [];

    try {
      if (format === "pdf") {
        downloadQuotationPdf({
          brand,
          items,
          discount: quote.discount || 0,
          total: quote.total || 0,
          quotationId: quote.id,
          customerName: quote.customer,
          date: quote.createdAt || new Date().toLocaleDateString("en-IN"),
        });
        notify(`📄 Downloaded PDF for ${quote.id}`);
      } else {
        const res = await downloadQuotationExcel({
          brand,
          company,
          items,
          discount: quote.discount || 0,
          tax: quote.tax || 0,
          total: quote.total || 0,
          quotationId: quote.id,
          customerName: quote.customer,
          date: quote.createdAt || new Date().toLocaleDateString("en-IN"),
        });
        notify(`📊 Downloaded Excel for ${quote.id}`);
        res?.warnings?.forEach((w) => notify(w));
      }
    } catch (err: any) {
      console.error("Quick download failed:", err);
      notify(`⚠️ Download failed: ${err.message || "Please check quotation data"}`);
    }
  };

  return (
    <section style={{
      background: "var(--surface, #18181b)",
      border: "1px solid var(--line, rgba(255,255,255,0.08))",
      borderRadius: "20px",
      padding: "24px 28px",
      boxShadow: "0 12px 35px -12px rgba(0,0,0,0.3)",
      marginTop: "24px"
    }} className="panel recent animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line, rgba(255,255,255,0.08))", paddingBottom: "16px", marginBottom: "16px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 900, letterSpacing: "-0.5px", color: "var(--text, #fff)" }}>
            {showAll ? "Complete Quotations Schedule" : "Recent Enterprise Quotations"}
          </h3>
          <p style={{ color: "var(--muted, #94a3b8)", fontSize: "12px", margin: "4px 0 0 0" }}>
            Real-time status tracking across commercial hospital accounts
          </p>
        </div>
        <button
          onClick={() => setShowAll((prev) => !prev)}
          style={{ fontWeight: 800, fontSize: "12px", color: "#c084fc", cursor: "pointer", background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.3)", padding: "6px 14px", borderRadius: "10px" }}
          className="hover:opacity-90 transition-all"
        >
          {showAll ? "Show Recent (Top 5)" : `View Full Schedule (${totalCount})`}
        </button>
      </div>
      <div className="quote-table overflow-x-auto">
        <div className="table-row table-head" style={{ gridTemplateColumns: "1.3fr 1.6fr 1fr 1fr 1fr 2fr", borderBottom: "2px solid var(--line, rgba(255,255,255,0.1))", paddingBottom: "10px" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted, #94a3b8)", textTransform: "uppercase" }}>QUOTATION REF</span>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted, #94a3b8)", textTransform: "uppercase" }}>CUSTOMER ACCOUNT</span>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted, #94a3b8)", textTransform: "uppercase" }}>VALUATION</span>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted, #94a3b8)", textTransform: "uppercase" }}>STATUS</span>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted, #94a3b8)", textTransform: "uppercase" }}>ISSUE DATE</span>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted, #94a3b8)", textTransform: "uppercase", textAlign: "right" }}>ACTIONS &amp; APPROVALS</span>
        </div>
        
        {quotesList.map((quote) => {
          const isApproved = quote.status === "accepted" || quote.approvalStatus === "approved";

          return (
            <div
              key={quote.id}
              className="table-row items-center hover:bg-zinc-800/20 transition-colors"
              style={{
                gridTemplateColumns: "1.3fr 1.6fr 1fr 1fr 1fr 2fr",
                padding: "14px 0",
                borderBottom: "1px solid var(--line, rgba(255,255,255,0.05))"
              }}
            >
              <b style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "13px", color: "var(--text, #fff)" }}>{quote.id}</b>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text, #cbd5e1)" }}>{quote.customer}</span>
              <b style={{ fontFamily: "var(--font-mono, monospace)", color: "#c084fc", fontSize: "13px" }}>{formatCurrency(quote.total)}</b>
              <span>
                <i className={`status ${quote.status.toLowerCase()}`} style={{ marginRight: "6px" }} />
                <span style={{ textTransform: "capitalize", fontSize: "12px", fontWeight: 700 }}>{quote.status}</span>
              </span>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "12px", color: "var(--muted, #94a3b8)" }}>{quote.createdAt}</span>
              
              <div className="flex items-center gap-1.5 justify-end flex-wrap">
                <button
                  type="button"
                  onClick={(e) => handleToggleApproval(quote, e)}
                  style={{
                    background: isApproved ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "rgba(16, 185, 129, 0.1)",
                    color: isApproved ? "#fff" : "#10b981",
                    border: isApproved ? "none" : "1px solid rgba(16, 185, 129, 0.3)",
                    padding: "5px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <span>{isApproved ? "✅ Approved" : "✓ Approve"}</span>
                </button>
                <button
                  onClick={() => handleDownload(quote, "pdf")}
                  title="Download Quotation PDF"
                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>📄</span> PDF
                </button>
                <button
                  onClick={() => handleDownload(quote, "excel")}
                  title="Download Quotation Excel"
                  className="px-2 py-1 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 font-bold text-xs rounded-lg border border-green-200 dark:border-green-800 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>📊</span> Excel
                </button>
                <button
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
        {quotesList.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
            No recent quotations found. Create one via Enterprise Quotation Studio!
          </div>
        )}
      </div>
    </section>
  );
}
