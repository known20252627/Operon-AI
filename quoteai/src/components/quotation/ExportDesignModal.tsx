"use client";

import React, { useState, useEffect } from "react";
import type { Quotation, BrandSettings, CompanySettings } from "@/types";
import type { QuotationTemplate } from "@/types/template";
import { ToolModal } from "@/components/ui/Modal";
import { generateDeterministicExcel, generateDeterministicPDF } from "@/lib/template";
import { getTemplates, getDefaultTemplate, markTemplateUsed } from "@/services/template";

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
  onClose,
  onOpenDesignStudio,
  notify,
}: ExportDesignModalProps) {
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const allTemplates = getTemplates();
    setTemplates(allTemplates);
    const def = allTemplates.find((t) => t.isDefault) || allTemplates[0];
    if (def) {
      setSelectedTemplateId(def.id);
    }
  }, []);

  const totalValue = selectedQuotes.reduce((sum, q) => sum + q.total, 0);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || getDefaultTemplate();

  const handlePrintOrPdf = async () => {
    if (selectedQuotes.length === 0 || !selectedTemplate) return;
    setIsExporting(true);
    markTemplateUsed(selectedTemplate.id);

    try {
      for (const quote of selectedQuotes) {
        await generateDeterministicPDF(
          {
            quotationId: quote.id,
            customerName: quote.customer || "Valued Customer",
            clientDetails: quote.clientDetails,
            date: quote.createdAt || new Date().toLocaleDateString("en-IN"),
            items: quote.items || [],
            discount: quote.discount || 0,
            tax: quote.tax || (quote.total * 0.12) / 1.12,
            total: quote.total || 0,
            template: selectedTemplate,
          },
          selectedTemplate
        );
      }
      notify(`🖨️ Opened high-resolution Print / PDF view using template "${selectedTemplate.name}"!`);
      onClose();
    } catch (err: any) {
      console.error("Print/PDF generation failed:", err);
      notify(`⚠️ Print/PDF generation failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExcelExport = async () => {
    if (selectedQuotes.length === 0 || !selectedTemplate) return;
    setIsExporting(true);
    markTemplateUsed(selectedTemplate.id);

    try {
      for (const quote of selectedQuotes) {
        const res = await generateDeterministicExcel(
          {
            quotationId: quote.id,
            customerName: quote.customer || "Valued Customer",
            clientDetails: quote.clientDetails,
            date: quote.createdAt || new Date().toLocaleDateString("en-IN"),
            items: quote.items || [],
            discount: quote.discount || 0,
            tax: quote.tax || (quote.total * 0.12) / 1.12,
            total: quote.total || 0,
            template: selectedTemplate,
          },
          selectedTemplate
        );
        res?.warnings?.forEach((w) => notify(w));
      }
      notify(`📊 Downloaded deterministic Excel spreadsheet in template "${selectedTemplate.name}"!`);
      onClose();
    } catch (err: any) {
      console.error("Excel export failed:", err);
      notify(`⚠️ Excel generation failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ToolModal
      title="🖨️ Print & Export Quotations in Template Made"
      subtitle="Render your quotations deterministically using your saved company templates."
      onClose={onClose}
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* ── Section 1: Selected Quotations Summary ── */}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📑</span>
              <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                Selected Quotations ({selectedQuotes.length})
              </h4>
            </div>
            <span className="text-xs font-extrabold bg-indigo-600 text-white px-3 py-1 rounded-full">
              Total Value: ₹{totalValue.toLocaleString("en-IN")}
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

        {/* ── Section 2: Choose Template Made ("Which Template?") ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>📑 Select Quotation Template to Print / Export In:</span>
              </h4>
              <p className="text-xs text-zinc-500">
                Choose from templates created in the Operon AI Template Lab. No arbitrary file uploading required.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDesignStudio();
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 cursor-pointer shadow-2xs"
            >
              <span>⚙️</span> Manage & Create Templates in Studio →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto p-1">
            {templates.map((tpl) => {
              const isSelected = tpl.id === selectedTemplateId;
              const primary = tpl.config.primaryColor || "#7052d7";
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/30 shadow-md transform scale-[1.01]"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
                  }`}
                  style={{ borderColor: isSelected ? primary : undefined }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[11px] font-bold"
                          style={{ background: primary }}
                        >
                          {tpl.name.charAt(0)}
                        </span>
                        <span className="font-bold text-sm text-zinc-900 dark:text-white truncate max-w-[170px]">
                          {tpl.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {tpl.isDefault && (
                          <span
                            className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider text-white"
                            style={{ background: primary }}
                          >
                            Default
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-xs text-green-600 font-extrabold">✓</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                      {tpl.description || `Theme: ${tpl.theme.toUpperCase()} · Font: ${tpl.config.font}`}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 flex justify-between items-center">
                    <span>Style: <strong className="text-zinc-600 dark:text-zinc-300 uppercase">{tpl.theme}</strong></span>
                    <span>Columns: {Object.values(tpl.config.columns).filter(Boolean).length} Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 3: Action Buttons ── */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 justify-end items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handlePrintOrPdf}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            <span className="text-base">🖨️</span>
            <span>{isExporting ? "Rendering..." : `Print in Template Made (${selectedQuotes.length})`}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExcelExport}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-extrabold shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            <span className="text-base">📊</span>
            <span>{isExporting ? "Generating..." : `Excel in Template Made (${selectedQuotes.length})`}</span>
          </button>
        </div>
      </div>
    </ToolModal>
  );
}
