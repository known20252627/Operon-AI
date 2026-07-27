"use client";

import React, { useState } from "react";
import type { BrandSettings } from "@/types";
import { ToolModal } from "@/components/ui/Modal";
import { saveBrandSettings } from "@/services/brand";
import { analyzeExcelTemplate } from "@/services/excelAnalyzer";

interface DesignModalProps {
  brand: BrandSettings;
  onBrandChange: (b: BrandSettings) => void;
  onClose: () => void;
  notify: (msg: string) => void;
}

export function DesignModal({
  brand,
  onBrandChange,
  onClose,
  notify,
}: DesignModalProps) {
  const [localBrand, setLocalBrand] = useState<BrandSettings>(() => ({
    templateStyle: "modern",
    ...brand,
  }));
  const [previewMode, setPreviewMode] = useState<"pdf" | "excel">("pdf");
  const [activeTab, setActiveTab] = useState<"templates" | "upload" | "brand">("templates");

  const handleSave = () => {
    saveBrandSettings(localBrand);
    onBrandChange(localBrand);
    notify("🎨 Quotation Design & Uploaded Templates saved successfully!");
    onClose();
  };

  const handleImageUpload = (field: "customHeaderImage" | "customFooterImage", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify("⚠️ Please upload an image smaller than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLocalBrand((prev) => ({ ...prev, [field]: reader.result }));
        notify(`✅ Uploaded ${field === "customHeaderImage" ? "Header Letterhead / Logo" : "Footer Stamp / Signature"}!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (field: "customHeaderImage" | "customFooterImage") => {
    setLocalBrand((prev) => ({ ...prev, [field]: undefined }));
    notify(`🗑️ Removed uploaded ${field === "customHeaderImage" ? "header" : "footer"}.`);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      notify("⚠️ Please upload an Excel file smaller than 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        const base64Str = reader.result;
        try {
          const mapping = await analyzeExcelTemplate(base64Str);
          setLocalBrand((prev) => ({
            ...prev,
            customExcelTemplate: base64Str,
            customExcelTemplateName: file.name,
            customExcelMapping: mapping,
          }));
          notify(`📊 Analyzed template "${file.name}"! Found table header at row ${mapping.headerRowIndex}.`);
        } catch (err: any) {
          console.error("Failed to analyze Excel template:", err);
          setLocalBrand((prev) => ({
            ...prev,
            customExcelTemplate: base64Str,
            customExcelTemplateName: file.name,
          }));
          notify(`⚠️ Uploaded template, but analysis had a warning: ${err.message || "Unknown structure"}`);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const removeExcelTemplate = () => {
    setLocalBrand((prev) => ({
      ...prev,
      customExcelTemplate: undefined,
      customExcelTemplateName: undefined,
      customExcelMapping: undefined,
    }));
    notify("🗑️ Removed uploaded Excel template and structure mapping.");
  };

  const templateStyles = [
    {
      id: "modern",
      name: "Modern Clean",
      desc: "Vibrant accent header bar with sleek modern typography.",
      icon: "⚡",
    },
    {
      id: "classic",
      name: "Classic Enterprise",
      desc: "Formal boxed layout with shaded alternating table rows.",
      icon: "🏛️",
    },
    {
      id: "minimal",
      name: "Minimal Pro",
      desc: "Clean whitespace, bold titles, and subtle divider lines.",
      icon: "💎",
    },
    {
      id: "custom_uploaded",
      name: "Custom Uploaded Design",
      desc: "Use your uploaded letterhead banner, footer, and watermark.",
      icon: "🖼️",
    },
  ] as const;

  const currentStyle = localBrand.templateStyle || "modern";

  return (
    <ToolModal
      title="Customize Quotation Design"
      subtitle="Upload custom letterheads, logos, watermarks, and select layout templates."
      onClose={onClose}
    >
      <div className="flex flex-col md:flex-row gap-6 max-h-[75vh] overflow-hidden">
        {/* Left Column: Editor Controls */}
        <div className="flex-1 flex flex-col overflow-y-auto pr-2 space-y-5">
          {/* Sub-navigation tabs */}
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-max">
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "templates"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              🏛️ Templates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "upload"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              🖼️ Upload Design
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("brand")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "brand"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              ⚙️ Brand & Terms
            </button>
          </div>

          {/* TAB 1: Templates Selection */}
          {activeTab === "templates" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                Select Layout Template
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templateStyles.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setLocalBrand({ ...localBrand, templateStyle: style.id })}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      currentStyle === style.id
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{style.icon}</span>
                        {currentStyle === style.id && (
                          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{style.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1 leading-snug">{style.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Upload Custom Design */}
          {activeTab === "upload" && (
            <div className="space-y-5">
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-xl text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                💡 <strong>Pro Tip:</strong> Upload your company letterhead (header banner) and official stamp/signature image. When you build quotes, Operon AI will embed your exact custom branding into the downloaded PDFs!
              </div>

              {/* Header Uploader */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Header Letterhead / Logo Banner
                  </label>
                  {localBrand.customHeaderImage && (
                    <button
                      type="button"
                      onClick={() => removeImage("customHeaderImage")}
                      className="text-[11px] text-red-500 hover:underline font-semibold"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                {localBrand.customHeaderImage ? (
                  <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 bg-white dark:bg-zinc-900 overflow-hidden relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={localBrand.customHeaderImage}
                      alt="Uploaded Header Preview"
                      className="max-h-24 w-full object-contain mx-auto rounded"
                    />
                    <div className="text-[10px] text-center text-zinc-400 mt-1">✓ Custom Header Uploaded</div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-zinc-50 dark:bg-zinc-800/40 transition-colors">
                    <span className="text-2xl mb-1">📤</span>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Click to upload header / letterhead banner
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">PNG, JPG or WebP (max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("customHeaderImage", e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Footer Uploader */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Footer Banner / Stamp & Signature
                  </label>
                  {localBrand.customFooterImage && (
                    <button
                      type="button"
                      onClick={() => removeImage("customFooterImage")}
                      className="text-[11px] text-red-500 hover:underline font-semibold"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                {localBrand.customFooterImage ? (
                  <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 bg-white dark:bg-zinc-900 overflow-hidden relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={localBrand.customFooterImage}
                      alt="Uploaded Footer Preview"
                      className="max-h-20 w-full object-contain mx-auto rounded"
                    />
                    <div className="text-[10px] text-center text-zinc-400 mt-1">✓ Custom Footer Stamp Uploaded</div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-zinc-50 dark:bg-zinc-800/40 transition-colors">
                    <span className="text-2xl mb-1">✍️</span>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Click to upload footer or stamp & sign
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">PNG, JPG or WebP (max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("customFooterImage", e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Watermark Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Watermark Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CONFIDENTIAL / DRAFT / OPERON AI CERTIFIED"
                  value={localBrand.watermarkText || ""}
                  onChange={(e) => setLocalBrand({ ...localBrand, watermarkText: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              {/* Excel Template Uploader */}
              <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400 flex items-center gap-1">
                    <span>📊</span> Excel Proforma / Quotation Template (.xlsx / .xls)
                  </label>
                  {localBrand.customExcelTemplate && (
                    <button
                      type="button"
                      onClick={removeExcelTemplate}
                      className="text-[11px] text-red-500 hover:underline font-semibold"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                {localBrand.customExcelTemplate ? (
                  <div className="border border-green-300 dark:border-green-800 rounded-xl p-3 bg-green-50 dark:bg-green-950/30 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">📑</span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-green-900 dark:text-green-200 truncate">
                            {localBrand.customExcelTemplateName || "Custom_Quotation_Template.xlsx"}
                          </div>
                          <div className="text-[10px] text-green-700 dark:text-green-400">
                            ✓ Ready for automated Excel quotation generation
                          </div>
                        </div>
                      </div>
                    </div>
                    {localBrand.customExcelMapping && (
                      <div className="pt-2 border-t border-green-200 dark:border-green-800/60 text-[11px] text-green-800 dark:text-green-300 grid grid-cols-2 gap-1.5 bg-white/60 dark:bg-black/20 p-2.5 rounded-lg">
                        <div>📌 <strong>Header Row:</strong> Row #{localBrand.customExcelMapping.headerRowIndex}</div>
                        <div>📦 <strong>Product Col:</strong> Col #{localBrand.customExcelMapping.columns.product}</div>
                        <div>🔢 <strong>Qty Col:</strong> Col #{localBrand.customExcelMapping.columns.qty}</div>
                        <div>💰 <strong>Rate Col:</strong> Col #{localBrand.customExcelMapping.columns.rate}</div>
                        <div>🧮 <strong>Amount Col:</strong> Col #{localBrand.customExcelMapping.columns.amount}</div>
                        <div>📈 <strong>Total Row:</strong> Row #{localBrand.customExcelMapping.totals.totalRowIndex || "Auto"}</div>
                        <div className="col-span-2 text-[10px] text-green-700 dark:text-green-400 mt-1 font-semibold">
                          ✨ All merged cells, colors, formulas, borders, and logos will be 100% preserved!
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-green-300 dark:border-green-800/60 hover:border-green-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-green-50/50 dark:bg-green-950/10 transition-colors">
                    <span className="text-2xl mb-1">📗</span>
                    <span className="text-xs font-semibold text-green-800 dark:text-green-300">
                      Upload your company Excel quotation template
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">.xlsx, .xls, or .csv spreadsheets</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Brand & Terms */}
          {activeTab === "brand" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Company Name
                </label>
                <input
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium"
                  type="text"
                  value={localBrand.name || ""}
                  onChange={(e) => setLocalBrand({ ...localBrand, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Brand Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={localBrand.accent || "#3b82f6"}
                    onChange={(e) => setLocalBrand({ ...localBrand, accent: e.target.value })}
                    className="w-10 h-10 rounded-lg border cursor-pointer p-0.5 bg-white dark:bg-zinc-800 shrink-0"
                  />
                  <input
                    type="text"
                    value={localBrand.accent || "#3b82f6"}
                    onChange={(e) => setLocalBrand({ ...localBrand, accent: e.target.value })}
                    className="w-32 px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Default Terms & Conditions
                </label>
                <textarea
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white h-28 leading-relaxed"
                  value={localBrand.terms || ""}
                  onChange={(e) => setLocalBrand({ ...localBrand, terms: e.target.value })}
                  placeholder="Enter terms valid for quotations..."
                />
              </div>
            </div>
          )}

          <div className="pt-4 mt-auto border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <span>✓</span> Save Quotation Design
            </button>
          </div>
        </div>

        {/* Right Column: Live Design Preview Panel */}
        <div className="w-full md:w-80 flex flex-col bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Live Layout Preview</span>
            <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-md">
              <button
                type="button"
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewMode === "pdf" ? "bg-white dark:bg-zinc-700 shadow text-indigo-600" : "text-zinc-500"}`}
                onClick={() => setPreviewMode("pdf")}
              >
                PDF
              </button>
              <button
                type="button"
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewMode === "excel" ? "bg-white dark:bg-zinc-700 shadow text-green-600" : "text-zinc-500"}`}
                onClick={() => setPreviewMode("excel")}
              >
                Excel
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-md p-4 relative overflow-hidden flex flex-col text-[10px]">
            {/* Watermark Overlay */}
            {localBrand.watermarkText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-[0.07] text-zinc-900 dark:text-white font-black text-2xl -rotate-45 select-none whitespace-nowrap">
                {localBrand.watermarkText}
              </div>
            )}

            {previewMode === "pdf" ? (
              <div className="flex-1 flex flex-col relative z-10">
                {/* Header Section */}
                {localBrand.customHeaderImage ? (
                  <div className="-mx-4 -mt-4 mb-3 border-b border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={localBrand.customHeaderImage} alt="Header" className="w-full h-14 object-contain" />
                  </div>
                ) : currentStyle === "modern" ? (
                  <div
                    className="-mx-4 -mt-4 p-3 mb-3 text-white font-bold text-xs flex justify-between items-center"
                    style={{ background: localBrand.accent || "#3b82f6" }}
                  >
                    <span>{localBrand.name || "Company Name"}</span>
                    <span className="text-[9px] opacity-80">QUOTATION</span>
                  </div>
                ) : currentStyle === "classic" ? (
                  <div className="border-b-2 pb-2 mb-3 flex justify-between items-end" style={{ borderColor: localBrand.accent || "#3b82f6" }}>
                    <div>
                      <h3 className="font-bold text-xs text-zinc-900 dark:text-white">{localBrand.name}</h3>
                      <p className="text-[9px] text-zinc-400">GSTIN: 27AABCM4521A1Z5</p>
                    </div>
                    <div className="text-right font-mono font-bold text-xs" style={{ color: localBrand.accent || "#3b82f6" }}>
                      ESTIMATE
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 pb-1 border-b border-zinc-200">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">{localBrand.name}</span>
                  </div>
                )}

                {/* Meta info */}
                <div className="flex justify-between text-[9px] text-zinc-500 mb-3 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 rounded">
                  <span>To: Apollo Hospital</span>
                  <span>Date: Today</span>
                </div>

                {/* Table */}
                <table className="w-full text-left mb-3 border-collapse text-[9px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-400">
                      <th className="pb-1">ITEM DESCRIPTION</th>
                      <th className="pb-1 text-center">QTY</th>
                      <th className="pb-1 text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    <tr>
                      <td className="py-1.5 font-medium">Digital Pulse Oximeter</td>
                      <td className="py-1.5 text-center">2</td>
                      <td className="py-1.5 text-right font-semibold">₹4,900</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium">ICU Ventilator Pro V2</td>
                      <td className="py-1.5 text-center">1</td>
                      <td className="py-1.5 text-right font-semibold">₹4,50,000</td>
                    </tr>
                  </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-700 pt-2 mb-4 font-bold text-xs">
                  <span>Total (incl. GST)</span>
                  <span style={{ color: localBrand.accent || "#3b82f6" }}>₹4,54,900</span>
                </div>

                {/* Terms */}
                <div className="text-[8px] text-zinc-400 mt-auto leading-tight line-clamp-2">
                  <b>Terms:</b> {localBrand.terms || "Standard delivery and quotation terms apply."}
                </div>

                {/* Footer Section */}
                {localBrand.customFooterImage && (
                  <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={localBrand.customFooterImage} alt="Footer Stamp" className="h-10 object-contain" />
                  </div>
                )}
              </div>
            ) : (
              /* Excel Layout Preview */
              <div
                className="flex-1 font-mono text-[9px] bg-zinc-50 dark:bg-zinc-900 p-2 rounded border-l-4 overflow-hidden"
                style={{ borderLeftColor: localBrand.accent || "#3b82f6" }}
              >
                {localBrand.customExcelTemplate ? (
                  <div className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 p-2.5 rounded mb-2 text-green-900 dark:text-green-200">
                    <div className="font-bold text-[11px] flex items-center gap-1 mb-1">
                      <span>⚡</span> Custom Template Active
                    </div>
                    <div className="text-[9px] opacity-90 leading-tight font-sans">
                      Using uploaded file: <strong>{localBrand.customExcelTemplateName}</strong>. Operon AI will inject your line items directly into this spreadsheet when downloaded!
                    </div>
                  </div>
                ) : null}
                <div className="font-bold text-[11px] mb-1" style={{ color: localBrand.accent || "#3b82f6" }}>
                  {localBrand.name.toUpperCase()}
                </div>
                <div className="text-zinc-500 mb-2">QUOTATION WORKBOOK (XLSX)</div>
                <table className="w-full border-collapse border border-zinc-300 dark:border-zinc-700 mb-2 bg-white dark:bg-zinc-800">
                  <thead>
                    <tr className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                      <th className="border p-1">SKU</th>
                      <th className="border p-1">PRODUCT NAME</th>
                      <th className="border p-1 text-right">PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-1">OX-01</td>
                      <td className="border p-1">Pulse Oximeter</td>
                      <td className="border p-1 text-right">₹2450</td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-[8px] text-zinc-400 mt-2">[Sheet: Operon_AI_Quotation]</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolModal>
  );
}
