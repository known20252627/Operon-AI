"use client";

import React, { useState } from "react";
import type { Quotation, BrandSettings, CompanySettings } from "@/types";
import { ToolModal } from "@/components/ui/Modal";
import { downloadQuotationPdf } from "@/lib/pdf";
import { downloadQuotationExcel } from "@/lib/excel";
import { saveBrandSettings } from "@/services/brand";
import { DEFAULT_COMPANY } from "@/lib/constants";

interface ExportDesignModalProps {
  selectedQuotes: Quotation[];
  brand: BrandSettings;
  company: CompanySettings;
  onClose: () => void;
  onOpenDesignStudio: () => void;
  notify: (msg: string) => void;
}

export function ExportDesignModal({
  selectedQuotes,
  brand,
  company,
  onClose,
  onOpenDesignStudio,
  notify,
}: ExportDesignModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<BrandSettings["templateStyle"]>(
    brand.templateStyle || "modern"
  );
  const [isExporting, setIsExporting] = useState(false);

  const totalValue = selectedQuotes.reduce((sum, q) => sum + q.total, 0);

  const handleExport = (format: "pdf" | "excel") => {
    if (selectedQuotes.length === 0) return;
    setIsExporting(true);

    // Apply the chosen design style to the export brand settings
    const exportBrand: BrandSettings = {
      ...brand,
      templateStyle: selectedStyle,
    };

    // Also persist their design choice as the new default
    saveBrandSettings(exportBrand);

    setTimeout(async () => {
      try {
        for (const quote of selectedQuotes) {
          if (format === "pdf") {
            downloadQuotationPdf({
              brand: exportBrand,
              company: company,
              items: quote.items || [],
              discount: quote.discount || 0,
              total: quote.total || 0,
              quotationId: quote.id,
              customerName: quote.customer,
              clientDetails: quote.clientDetails,
              date: quote.createdAt || new Date().toLocaleDateString("en-IN"),
            });
          } else {
            const res = await downloadQuotationExcel({
              brand: exportBrand,
              company: company,
              items: quote.items || [],
              discount: quote.discount || 0,
              tax: quote.tax || 0,
              total: quote.total || 0,
              quotationId: quote.id,
              customerName: quote.customer,
              clientDetails: quote.clientDetails,
              date: quote.createdAt || new Date().toLocaleDateString("en-IN"),
            });
            res?.warnings?.forEach((w) => notify(w));
          }
        }

        setIsExporting(false);
        notify(
          `🎉 Successfully exported ${selectedQuotes.length} quotation(s) in ${format.toUpperCase()} format using "${
            selectedStyle === "custom_uploaded"
              ? "Custom Uploaded Design"
              : selectedStyle?.toUpperCase()
          }" layout!`
        );
        onClose();
      } catch (err: any) {
        setIsExporting(false);
        console.error("Export failed:", err);
        notify(`⚠️ Export failed: ${err.message || "Please check quotation data"}`);
      }
    }, 400);
  };

  const hasCustomUploads = Boolean(
    brand.customExcelTemplate || brand.customHeaderImage || brand.customFooterImage || brand.watermarkText
  );

  return (
    <ToolModal
      title="🎨 Finalize & Export Quotation(s)"
      subtitle="Choose your layout design and export format for the selected quotes."
      onClose={onClose}
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* ── Section 1: Selected Quotations Summary ── */}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📑</span>
              <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                Selected for Export ({selectedQuotes.length} {selectedQuotes.length === 1 ? "Quotation" : "Quotations"})
              </h4>
            </div>
            <span className="text-xs font-extrabold bg-indigo-600 text-white px-3 py-1 rounded-full">
              Total: ₹{totalValue.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {selectedQuotes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs shadow-2sm"
              >
                <div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                    {q.id}
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {q.customer}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">{q.items.length} items</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    ₹{q.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2: Choose Design Layout ("Which Design?") ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                Step 2: Choose Quotation Design & Layout
              </h4>
              <p className="text-xs text-zinc-500">
                Select which layout design or custom template to apply for this export.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDesignStudio();
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800"
            >
              <span>⚙️</span> Upload / Manage Custom Templates →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Style 1: Modern */}
            <div
              onClick={() => setSelectedStyle("modern")}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedStyle === "modern"
                  ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/30 shadow-md transform scale-[1.01]"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">⚡</span>
                  {selectedStyle === "modern" && (
                    <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  Modern Clean
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Vibrant purple/blue accent header bar, clean modern typography, and structured item breakdown.
                </p>
              </div>
            </div>

            {/* Style 2: Classic */}
            <div
              onClick={() => setSelectedStyle("classic")}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedStyle === "classic"
                  ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/30 shadow-md transform scale-[1.01]"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">🏛️</span>
                  {selectedStyle === "classic" && (
                    <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  Classic Enterprise
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Formal boxed layout with shaded alternating table rows and traditional medical billing aesthetic.
                </p>
              </div>
            </div>

            {/* Style 3: Minimal Pro */}
            <div
              onClick={() => setSelectedStyle("minimal")}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedStyle === "minimal"
                  ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/30 shadow-md transform scale-[1.01]"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">💎</span>
                  {selectedStyle === "minimal" && (
                    <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  Minimal Pro
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Generous whitespace, bold black/white typography, and minimalist divider lines.
                </p>
              </div>
            </div>

            {/* Style 4: Custom Uploaded Design */}
            <div
              onClick={() => setSelectedStyle("custom_uploaded")}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedStyle === "custom_uploaded"
                  ? "border-green-600 bg-green-50/70 dark:bg-green-950/30 shadow-md transform scale-[1.01]"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-green-400 bg-white dark:bg-zinc-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">🖼️</span>
                  {selectedStyle === "custom_uploaded" && (
                    <span className="text-[10px] font-extrabold bg-green-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-green-900 dark:text-green-300 flex items-center gap-1.5">
                  <span>My Custom Uploaded Design</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Injects into your custom uploaded Excel template (`.xlsx`) or applies your custom letterhead header/footer.
                </p>

                {/* Status indicator of what is uploaded */}
                <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                  {hasCustomUploads ? (
                    <div className="space-y-1 text-green-700 dark:text-green-400 font-semibold">
                      {brand.customExcelTemplate && (
                        <div>✓ Excel Template: {brand.customExcelTemplateName || "Uploaded"}</div>
                      )}
                      {brand.customHeaderImage && <div>✓ Custom Header Banner Uploaded</div>}
                      {brand.customFooterImage && <div>✓ Custom Footer / Stamp Uploaded</div>}
                    </div>
                  ) : (
                    <div className="text-amber-600 dark:text-amber-400 font-medium">
                      ⚠️ No custom template uploaded yet. Click &apos;Upload / Manage Custom Templates&apos; above!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 3: Action Buttons ── */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={() => handleExport("pdf")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-extrabold shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <span>📄</span>
            <span>{isExporting ? "Generating..." : `Download as PDF (${selectedQuotes.length})`}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={() => handleExport("excel")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-extrabold shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <span>📊</span>
            <span>{isExporting ? "Generating..." : `Download as Excel (${selectedQuotes.length})`}</span>
          </button>
        </div>
      </div>
    </ToolModal>
  );
}
