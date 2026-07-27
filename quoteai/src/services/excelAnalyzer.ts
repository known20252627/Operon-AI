"use client";

import ExcelJS from "exceljs";
import type { ExcelTemplateMapping } from "@/types";

/**
 * Converts a base64 string (with or without data URL prefix) to an ArrayBuffer.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const cleanBase64 = base64.replace(/^data:.*;base64,/, "");
  const binaryString = window.atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Automatically inspects an uploaded Excel workbook to detect its structure,
 * including table header row, item column indices, sample item boundaries,
 * and total calculation rows.
 */
export async function analyzeExcelTemplate(base64Data: string): Promise<ExcelTemplateMapping> {
  const buffer = base64ToArrayBuffer(base64Data);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("Uploaded Excel workbook contains no worksheets.");
  }

  const sheetName = worksheet.name;
  let headerRowIndex = -1;
  const colMap: {
    srNo?: number;
    product?: number;
    sku?: number;
    qty?: number;
    rate?: number;
    gst?: number;
    amount?: number;
  } = {};

  const maxScanRows = Math.min(worksheet.rowCount || 50, 50);

  // 1. Detect Header Row and Column Mappings
  for (let r = 1; r <= maxScanRows; r++) {
    const row = worksheet.getRow(r);
    let matchCount = 0;
    const tempColMap: typeof colMap = {};

    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const val = cell.value ? String(cell.value).toUpperCase().trim() : "";
      if (!val) return;

      if (/^(SR|SL|S\.?\s*NO|NO\.|SR\.\s*NO|SL\.\s*NO|SNO)/.test(val)) {
        tempColMap.srNo = colNumber;
        matchCount++;
      } else if (/^(PRODUCT|ITEM|DESCRIPTION|PARTICULARS|NAME|SPECIFICATION|EQUIPMENT|GOODS|DETAILS)/.test(val)) {
        tempColMap.product = colNumber;
        matchCount++;
      } else if (/^(SKU|MODEL|CODE|PART|CATALOG|ITEM\s*CODE)/.test(val)) {
        tempColMap.sku = colNumber;
        matchCount++;
      } else if (/^(QTY|QUANTITY|PIECES|UNITS|NOS|QUANT)/.test(val)) {
        tempColMap.qty = colNumber;
        matchCount++;
      } else if (/^(RATE|PRICE|UNIT\s*COST|COST|UNIT\s*PRICE|RATE\s*\(₹\)|PRICE\s*\(₹\))/i.test(val)) {
        tempColMap.rate = colNumber;
        matchCount++;
      } else if (/^(GST|TAX|IGST|CGST|SGST|GST\s*%|TAX\s*%)/.test(val)) {
        tempColMap.gst = colNumber;
        matchCount++;
      } else if (/^(AMOUNT|TOTAL|VALUE|NET|NET\s*VALUE|TOTAL\s*\(₹\)|AMOUNT\s*\(₹\)|TOTAL\s*PRICE)/.test(val)) {
        tempColMap.amount = colNumber;
        matchCount++;
      }
    });

    // If we matched at least 2 distinct table headers, we found the table header row!
    if (matchCount >= 2 && (tempColMap.product !== undefined || tempColMap.amount !== undefined || tempColMap.rate !== undefined)) {
      headerRowIndex = r;
      Object.assign(colMap, tempColMap);
      break;
    }
  }

  // Fallback if no header row was detected cleanly
  if (headerRowIndex === -1) {
    headerRowIndex = 11; // Standard enterprise fallback row
    colMap.srNo = 1;
    colMap.product = 2;
    colMap.sku = 3;
    colMap.qty = 4;
    colMap.rate = 5;
    colMap.gst = 6;
    colMap.amount = 7;
  } else {
    // Fill in missing column defaults based on relative offsets
    const baseCol = colMap.product || colMap.srNo ? (colMap.srNo ? colMap.srNo + 1 : 2) : 2;
    if (!colMap.product) colMap.product = baseCol;
    if (!colMap.sku) colMap.sku = colMap.product + 1;
    if (!colMap.qty) colMap.qty = colMap.sku + 1;
    if (!colMap.rate) colMap.rate = colMap.qty + 1;
    if (!colMap.gst) colMap.gst = colMap.rate + 1;
    if (!colMap.amount) colMap.amount = colMap.gst + 1;
  }

  const dataStartRowIndex = headerRowIndex + 1;
  let firstFooterRowIndex = -1;

  // 2. Scan down from dataStartRowIndex to find where sample items end and footer/totals start
  for (let r = dataStartRowIndex; r <= (worksheet.rowCount || dataStartRowIndex + 30); r++) {
    const row = worksheet.getRow(r);
    let hasFooterKeyword = false;

    row.eachCell({ includeEmpty: false }, (cell) => {
      const val = cell.value ? String(cell.value).toUpperCase().trim() : "";
      if (/^(SUBTOTAL|SUB\s*TOTAL|DISCOUNT|REBATE|TAX\s*\(|TOTAL\s*PAYABLE|NET\s*PAYABLE|GRAND\s*TOTAL|TERMS|CONDITIONS|BANK|ACCOUNT|IFSC|SIGNATURE|FOR\s+|AUTHORISED|NOTE:|IN\s*WORDS)/.test(val)) {
        hasFooterKeyword = true;
      }
    });

    if (hasFooterKeyword) {
      firstFooterRowIndex = r;
      break;
    }
  }

  const dataEndRowIndex = firstFooterRowIndex !== -1
    ? Math.max(dataStartRowIndex, firstFooterRowIndex - 1)
    : Math.max(dataStartRowIndex, worksheet.rowCount || dataStartRowIndex);

  // 3. Scan for Totals Rows below sample items
  const totals: ExcelTemplateMapping["totals"] = {
    valueColumnIndex: colMap.amount || 7,
  };

  const scanEnd = Math.min(worksheet.rowCount || dataEndRowIndex + 20, dataEndRowIndex + 25);
  for (let r = dataEndRowIndex + 1; r <= scanEnd; r++) {
    const row = worksheet.getRow(r);
    row.eachCell({ includeEmpty: false }, (cell) => {
      const val = cell.value ? String(cell.value).toUpperCase().trim() : "";
      if (/^(SUBTOTAL|SUB\s*TOTAL|TOTAL\s*BEFORE)/.test(val) && !totals.subtotalRowIndex) {
        totals.subtotalRowIndex = r;
      } else if (/^(DISCOUNT|LESS|REBATE)/.test(val) && !totals.discountRowIndex) {
        totals.discountRowIndex = r;
      } else if (/^(TAX|GST|IGST|CGST|SGST)/.test(val) && !totals.taxRowIndex) {
        totals.taxRowIndex = r;
      } else if (/^(TOTAL\s*PAYABLE|NET\s*PAYABLE|GRAND\s*TOTAL|TOTAL\s*AMOUNT|^TOTAL$)/.test(val) && !totals.totalRowIndex) {
        totals.totalRowIndex = r;
      }
    });
  }

  // 4. Scan top rows for Company Info
  const companyInfo: ExcelTemplateMapping["companyInfo"] = {};
  for (let r = 1; r < headerRowIndex; r++) {
    const row = worksheet.getRow(r);
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const val = cell.value ? String(cell.value).trim() : "";
      if (val.toUpperCase().includes("GSTIN") || val.toUpperCase().includes("GST NO")) {
        companyInfo.nameRow = r;
        companyInfo.nameCol = colNumber;
      }
    });
  }

  return {
    sheetName,
    headerRowIndex,
    dataStartRowIndex,
    dataEndRowIndex,
    columns: {
      srNo: colMap.srNo,
      product: colMap.product!,
      sku: colMap.sku,
      qty: colMap.qty!,
      rate: colMap.rate!,
      gst: colMap.gst,
      amount: colMap.amount!,
    },
    totals,
    companyInfo,
  };
}
