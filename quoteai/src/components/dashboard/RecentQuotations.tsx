"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_COMPANY } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { downloadQuotationPdf } from "@/lib/pdf";
import { downloadQuotationExcel } from "@/lib/excel";
import { getBrandSettings } from "@/services/brand";
import { getQuotations, deleteQuotation } from "@/services/quotations";
import { useToast } from "@/hooks/useToast";
import type { Quotation } from "@/types";

export function RecentQuotations() {
  const [quotesList, setQuotesList] = useState<Quotation[]>(() => getQuotations().slice(0, 5));
  const { notify } = useToast();

  useEffect(() => {
    const handleUpdate = () => {
      setQuotesList(getQuotations().slice(0, 5));
    };
    window.addEventListener("operon_ai_quotations_updated", handleUpdate);
    return () => window.removeEventListener("operon_ai_quotations_updated", handleUpdate);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete quotation ${id}?`)) {
      deleteQuotation(id);
      notify(`🗑️ Deleted quotation ${id}`);
    }
  };

  const handleDownload = (quote: Quotation, format: "pdf" | "excel") => {
    const brand = getBrandSettings();
    const company = DEFAULT_COMPANY;
    const items = quote.items && quote.items.length > 0 ? quote.items : [];

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
      downloadQuotationExcel({
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
    }
  };

  return (
    <section className="panel recent">
      <div className="panel-head">
        <div>
          <h3>Recent quotations</h3>
          <p>Latest activity across your team</p>
        </div>
        <button className="link-button">View all quotations</button>
      </div>
      <div className="quote-table">
        <div className="table-row table-head">
          <span>QUOTATION</span>
          <span>CUSTOMER</span>
          <span>VALUE</span>
          <span>STATUS</span>
          <span>DATE</span>
          <span />
        </div>
        {quotesList.map((quote, i) => (
          <div key={i} className="table-row items-center">
            <b>{quote.id}</b>
            <span>{quote.customer}</span>
            <b>{formatCurrency(quote.total)}</b>
            <span>
              <i className={`status ${quote.status.toLowerCase()}`} />
              {quote.status}
            </span>
            <span>{quote.createdAt}</span>
            <div className="flex items-center gap-1.5 justify-end">
              <button
                onClick={() => handleDownload(quote, "pdf")}
                title="Download Quotation PDF"
                className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 font-bold text-[11px] rounded border border-red-200 dark:border-red-800 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>📄</span> PDF
              </button>
              <button
                onClick={() => handleDownload(quote, "excel")}
                title="Download Quotation Excel"
                className="px-2 py-0.5 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 font-bold text-[11px] rounded border border-green-200 dark:border-green-800 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>📊</span> Excel
              </button>
              <button
                onClick={(e) => handleDelete(quote.id, e)}
                title="Delete Quotation"
                className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-950 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 font-bold text-[11px] rounded border border-zinc-200 dark:border-zinc-700 hover:border-red-300 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <span>🗑️</span> Delete
              </button>
            </div>
          </div>
        ))}
        {quotesList.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
            No recent quotations found. Create one in AI Workspace!
          </div>
        )}
      </div>
    </section>
  );
}
