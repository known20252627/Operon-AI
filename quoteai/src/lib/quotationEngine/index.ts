"use client";

import type { ExcelPayload } from "@/lib/excel";
import type { QuotationEngineType } from "./types";
import { runLegacyQuotationEngine } from "./legacyEngine";
import { runExcelJSQuotationEngine } from "./exceljsEngine";

/**
 * Switch engine between "legacy" and "exceljs".
 * Example: const quotationEngine = "exceljs";
 */
export let quotationEngine: QuotationEngineType = "exceljs";

export function setQuotationEngine(engine: QuotationEngineType): void {
  quotationEngine = engine;
  console.log(`🔄 Switched quotation engine to: [${engine.toUpperCase()}]`);
}

/**
 * Central engine dispatcher with automatic error handling and fallback capability.
 */
export async function dispatchQuotationEngine(payload: ExcelPayload): Promise<{ warnings: string[] }> {
  if (quotationEngine === "exceljs" && payload.brand.customExcelTemplate) {
    try {
      console.log("⚡ Executing High-Fidelity ExcelJS Engine...");
      const res = await runExcelJSQuotationEngine(payload);
      console.log("✅ ExcelJS Engine exported successfully to Quotation_Output.xlsx");
      return res;
    } catch (error: any) {
      console.warn("⚠️ ExcelJS Engine encountered validation failure or error. Automatically falling back to Legacy Engine...", error);
      const res = await runLegacyQuotationEngine(payload);
      res.warnings.push(`ExcelJS Engine fallback: ${error?.message || "Unknown error"}`);
      return res;
    }
  }

  console.log("⚡ Executing Legacy Quotation Engine...");
  return runLegacyQuotationEngine(payload);
}
