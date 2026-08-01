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
  let clientDetailsCoords: ExcelTemplateMapping["clientDetailsCoords"] = undefined;
  let quotationNoCoords: ExcelTemplateMapping["quotationNoCoords"] = undefined;
  let dateCoords: ExcelTemplateMapping["dateCoords"] = undefined;
  let companyNameCoords: ExcelTemplateMapping["companyNameCoords"] = undefined;

  const maxScanRows = Math.min(worksheet.rowCount || 50, 50);

  // --- AI Mapping Attempt ---
  try {
    // Build a labeled grid like "R1: val,val,val\nR2: val,val..."
    const gridLines: string[] = [];
    for (let r = 1; r <= maxScanRows; r++) {
      const row = worksheet.getRow(r);
      const rowVals: string[] = [];
      for (let c = 1; c <= 15; c++) {
        const cell = row.getCell(c);
        let val = "";
        if (cell.value !== null && cell.value !== undefined) {
          val = String(cell.value).replace(/\r?\n/g, " ").replace(/"/g, "'").trim();
        }
        if (val.includes(",")) val = `"${val}"`;
        rowVals.push(val);
      }
      // Only include rows that have at least some content
      const hasContent = rowVals.some(v => v !== "");
      gridLines.push(`R${r}: ${rowVals.join(",")}`);
      // Stop if we've seen 5+ empty rows in a row after content
      if (!hasContent && r > 10) {
        let emptyStreak = 0;
        for (let check = r; check >= Math.max(1, r - 4); check--) {
          const checkRow = worksheet.getRow(check);
          let checkEmpty = true;
          checkRow.eachCell({ includeEmpty: false }, () => { checkEmpty = false; });
          if (checkEmpty) emptyStreak++;
        }
        if (emptyStreak >= 5) break;
      }
    }

    const gridData = gridLines.join("\n");

    const res = await fetch("/api/analyze-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gridData })
    });

    if (res.ok) {
      const aiMapping = await res.json();
      if (aiMapping.headerRowIndex && aiMapping.columns) {
        headerRowIndex = aiMapping.headerRowIndex;
        // Only copy non-null column values from AI
        const aiCols = aiMapping.columns;
        if (aiCols.srNo) colMap.srNo = aiCols.srNo;
        if (aiCols.product) colMap.product = aiCols.product;
        if (aiCols.sku) colMap.sku = aiCols.sku;
        if (aiCols.qty) colMap.qty = aiCols.qty;
        if (aiCols.rate) colMap.rate = aiCols.rate;
        if (aiCols.gst) colMap.gst = aiCols.gst;
        if (aiCols.amount) colMap.amount = aiCols.amount;

        if (
          aiMapping.clientDetailsCoords &&
          (aiMapping.clientDetailsCoords.nameRow ||
            aiMapping.clientDetailsCoords.addressRow ||
            aiMapping.clientDetailsCoords.gstRow ||
            aiMapping.clientDetailsCoords.phoneRow)
        ) {
          clientDetailsCoords = aiMapping.clientDetailsCoords;
        }
        if (aiMapping.quotationNoCoords?.row) {
          quotationNoCoords = aiMapping.quotationNoCoords;
        }
        if (aiMapping.dateCoords?.row) {
          dateCoords = aiMapping.dateCoords;
        }
        if (aiMapping.companyNameCoords?.row) {
          companyNameCoords = aiMapping.companyNameCoords;
        }
        console.log("✅ AI Successfully mapped Excel template:", JSON.stringify(aiMapping, null, 2));
      }
    } else {
      const errBody = await res.text();
      console.warn("AI Mapping returned non-OK status:", res.status, errBody);
    }
  } catch (err) {
    console.error("AI Mapping failed, falling back to regex:", err);
  }

  // --- Fill in missing required columns with intelligent defaults ---
  if (headerRowIndex !== -1 && (!colMap.product || !colMap.qty || !colMap.rate || !colMap.amount)) {
    const baseCol = colMap.product || colMap.srNo ? (colMap.srNo ? colMap.srNo + 1 : 2) : 2;
    if (!colMap.product) colMap.product = baseCol;
    if (!colMap.qty) colMap.qty = (colMap.sku || colMap.product) + 1;
    if (!colMap.rate) colMap.rate = colMap.qty + 1;
    if (!colMap.gst) colMap.gst = colMap.rate + 1;
    if (!colMap.amount) colMap.amount = (colMap.gst || colMap.rate) + 1;
  }

  // --- Regex Fallback if AI Failed ---
  if (headerRowIndex === -1) {
    console.log("Using Regex Fallback for template mapping...");
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

      if (matchCount >= 2 && (tempColMap.product !== undefined || tempColMap.amount !== undefined || tempColMap.rate !== undefined)) {
        headerRowIndex = r;
        Object.assign(colMap, tempColMap);
        break;
      }
    }

    if (headerRowIndex === -1) {
      headerRowIndex = 11;
      colMap.srNo = 1; colMap.product = 2; colMap.sku = 3; colMap.qty = 4;
      colMap.rate = 5; colMap.gst = 6; colMap.amount = 7;
    } else {
      const baseCol = colMap.product || colMap.srNo ? (colMap.srNo ? colMap.srNo + 1 : 2) : 2;
      if (!colMap.product) colMap.product = baseCol;
      if (!colMap.sku) colMap.sku = colMap.product + 1;
      if (!colMap.qty) colMap.qty = colMap.sku + 1;
      if (!colMap.rate) colMap.rate = colMap.qty + 1;
      if (!colMap.gst) colMap.gst = colMap.rate + 1;
      if (!colMap.amount) colMap.amount = colMap.gst + 1;
    }
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
    clientDetailsCoords,
    quotationNoCoords,
    dateCoords,
    companyNameCoords,
  };
}
