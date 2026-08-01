"use client";

import type { QuoteItem, BrandSettings, CompanySettings, ClientDetails } from "@/types";
import { dispatchQuotationEngine, quotationEngine, setQuotationEngine } from "./quotationEngine";

export interface ExcelPayload {
  brand: BrandSettings;
  company: CompanySettings;
  items: QuoteItem[];
  discount: number;
  tax: number;
  total: number;
  quotationId: string;
  customerName: string;
  clientDetails?: ClientDetails;
  date: string;
}

/**
 * Dual Quotation Engine Architecture Switch:
 * Changing quotationEngine between "legacy" and "exceljs" instantly toggles the underlying generator.
 */
export { quotationEngine, setQuotationEngine };

/**
 * Main application export gateway for quotation spreadsheets.
 * Dispatches to either the High-Fidelity ExcelJS engine (with automatic legacy fallback)
 * or directly to the legacy engine according to configuration.
 */
export async function downloadQuotationExcel(payload: ExcelPayload): Promise<{ warnings: string[] }> {
  return dispatchQuotationEngine(payload);
}
