"use client";

import type { QuoteItem, BrandSettings, CompanySettings, ClientDetails } from "@/types";
import { generateDeterministicExcel } from "./template";
import { getDefaultTemplate, markTemplateUsed } from "@/services/template";

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
 * Enterprise Quotation Gateway:
 * Immediately generates a pristine, deterministic Excel quotation spreadsheet
 * using the company's official saved Operon AI template.
 */
export async function downloadQuotationExcel(payload: ExcelPayload): Promise<{ warnings: string[] }> {
  const template = getDefaultTemplate();
  markTemplateUsed(template.id);
  
  return generateDeterministicExcel({
    quotationId: payload.quotationId,
    customerName: payload.customerName,
    clientDetails: payload.clientDetails,
    date: payload.date,
    items: payload.items,
    discount: payload.discount,
    tax: payload.tax,
    total: payload.total,
    template,
  }, template);
}
