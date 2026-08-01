import type { ExcelPayload } from "@/lib/excel";

export type QuotationEngineType = "legacy" | "exceljs";

export interface QuotationEngineMapping {
  productStartRow: number;
  productColumn: number;
  qtyColumn: number;
  priceColumn: number;
  gstColumn?: number;
  amountColumn: number;
  srNoColumn?: number;
  customerNameCell?: { row: number; col: number };
  addressCell?: { row: number; col: number };
  quotationNumberCell?: { row: number; col: number };
  dateCell?: { row: number; col: number };
}

export interface PreExportValidationResult {
  valid: boolean;
  missingProduct: boolean;
  missingQuantity: boolean;
  invalidPrice: boolean;
  brokenFormula: boolean;
  missingMapping: boolean;
  invalidTemplate: boolean;
  errors: string[];
}

export interface QuotationEngineResponse {
  warnings: string[];
}
