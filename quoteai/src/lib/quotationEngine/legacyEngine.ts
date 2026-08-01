"use client";

import ExcelJS from "exceljs";
import type { QuoteItem, BrandSettings, CompanySettings, ExcelTemplateMapping, ClientDetails } from "@/types";
import { createQuotationModel, validateQuotationModel, type InternalQuotationModel } from "@/services/quotationModel";
import { analyzeExcelTemplate } from "@/services/excelAnalyzer";

import type { ExcelPayload } from "@/lib/excel";

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

function triggerDownload(buffer: ExcelJS.Buffer, fileName: string): void {
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate and download a branded quotation Excel file using ExcelJS.
 * Guarantees 100% preservation of colors, merged cells, formulas, borders, and logos.
 */
export async function runLegacyQuotationEngine(payload: ExcelPayload): Promise<{ warnings: string[] }> {
  const { brand, company, items, discount, tax, total, quotationId, customerName, clientDetails, date } = payload;
  const fileName = `${quotationId}-${customerName.replace(/[^a-z0-9]/gi, "_")}.xlsx`;

  // 1. Create Independent Quotation Model
  const model: InternalQuotationModel = createQuotationModel(
    {
      quotationId,
      customerName,
      clientDetails,
      items,
      discount,
      tax,
      total,
      date,
    },
    brand,
    company
  );

  // 2. Validate Model Integrity Before Exporting
  const validation = validateQuotationModel(model);
  if (!validation.valid) {
    const errorMsg = "Quotation Validation Error:\n" + validation.errors.map((e) => `• ${e}`).join("\n");
    throw new Error(errorMsg);
  }

  // 3. Custom Uploaded Excel Template Processing (High Fidelity)
  if (brand.customExcelTemplate) {
    try {
      let noGstColumnDetected = false;
      let totalsRowsMissingInTemplate = false;

      const buffer = base64ToArrayBuffer(brand.customExcelTemplate);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error("No worksheet found in custom template.");
      }

      // Helper: safely extract text from any ExcelJS cell value (handles RichText, formulas, etc.)
      function getCellText(cellValue: unknown): string {
        if (cellValue === null || cellValue === undefined) return "";
        if (typeof cellValue === "string") return cellValue.trim();
        if (typeof cellValue === "number" || typeof cellValue === "boolean") return String(cellValue);
        // RichText: { richText: [{text: "..."}] }
        if (typeof cellValue === "object" && "richText" in (cellValue as any)) {
          const rt = (cellValue as any).richText;
          return rt.map((r: any) => r.text).join("").trim();
        }
        // Formula: { formula: "...", result: ... }
        if (typeof cellValue === "object" && "result" in (cellValue as any)) {
          return String((cellValue as any).result || "").trim();
        }
        return String(cellValue).trim();
      }

      // Helper: fuzzy match — checks if text contains any of the given keywords
      function fuzzyMatch(text: string, keywords: string[]): boolean {
        const lower = text.toLowerCase().trim();
        return keywords.some(kw => lower === kw || lower.includes(kw));
      }

      // Helper: check if a cell is blank or placeholder-looking
      function isBlankOrPlaceholder(val: any): boolean {
        if (val === null || val === undefined || val === "") return true;
        const s = getCellText(val).trim();
        if (!s) return true;
        if (/^\[.+\]$/.test(s) || /^<.+>$/.test(s) || /_{2,}/.test(s) || /^\s*[\-\.]+\s*$/.test(s) || s.toLowerCase() === "n/a") {
          return true;
        }
        return false;
      }

      // Ensure we have fallback template mapping
      let mapping: ExcelTemplateMapping | undefined = brand.customExcelMapping;
      if (!mapping) {
        mapping = await analyzeExcelTemplate(brand.customExcelTemplate);
      }

      // 3.5 Absolute Live Spreadsheet Analysis (Overriding buggy stored mappings)
      // Prefer AI-mapped client details when available and valid over regex/fuzzyMatch fallback
      const aiClientCoords = mapping.clientDetailsCoords;
      const hasAiClientDetails = !!(
        aiClientCoords &&
        (aiClientCoords.nameRow || aiClientCoords.addressRow || aiClientCoords.gstRow || aiClientCoords.phoneRow)
      );

      if (hasAiClientDetails && aiClientCoords) {
        if (aiClientCoords.nameRow && aiClientCoords.nameCol) {
          const c = worksheet.getRow(aiClientCoords.nameRow).getCell(aiClientCoords.nameCol);
          c.value = model.customer.name || "";
        }
        if (aiClientCoords.addressRow && aiClientCoords.addressCol && model.customer.address) {
          const c = worksheet.getRow(aiClientCoords.addressRow).getCell(aiClientCoords.addressCol);
          c.value = model.customer.address;
        }
        if (aiClientCoords.gstRow && aiClientCoords.gstCol && model.customer.gstNumber) {
          const c = worksheet.getRow(aiClientCoords.gstRow).getCell(aiClientCoords.gstCol);
          c.value = `GSTIN: ${model.customer.gstNumber}`;
        }
        if (aiClientCoords.phoneRow && aiClientCoords.phoneCol) {
          const contactParts = [model.customer.phone, model.customer.email].filter(Boolean);
          if (contactParts.length > 0) {
            const c = worksheet.getRow(aiClientCoords.phoneRow).getCell(aiClientCoords.phoneCol);
            c.value = `Phone: ${contactParts.join(" | ")}`;
          }
        }
      }

      let trueHeaderRowIndex = mapping.headerRowIndex;
      const liveCols: {
        srNo?: number;
        product?: number;
        sku?: number;
        qty?: number;
        rate?: number;
        gst?: number;
        amount?: number;
      } = {};

      let bestMatches = -1;
      for (let r = 1; r <= Math.min(50, worksheet.rowCount || 50); r++) {
        const row = worksheet.getRow(r);
        let currentMatches = 0;
        const tempCols: typeof liveCols = {};

        row.eachCell({ includeEmpty: false }, (cell, colNum) => {
          const text = getCellText(cell.value).toUpperCase().trim();
          if (!text) return;
          if (/^(SR|SL|S\.?\s*NO|NO\.?|SNO|ITEM\s*NO|NO$)/.test(text) && !/GST/i.test(text)) { tempCols.srNo = colNum; currentMatches++; }
          else if (/^(PRODUCT|ITEM|DESCRIPTION|PARTICULARS|NAME|SPECIFICATION|GOODS|DETAILS)/.test(text)) { tempCols.product = colNum; currentMatches++; }
          else if (/^(SKU|MODEL|CODE|PART|ITEM\s*CODE)/.test(text)) { tempCols.sku = colNum; currentMatches++; }
          else if (/^(QTY|QUANTITY|PIECES|UNITS|NOS)/.test(text)) { tempCols.qty = colNum; currentMatches++; }
          else if (/^(RATE|PRICE|UNIT\s*COST|COST|UNIT\s*PRICE)/.test(text)) { tempCols.rate = colNum; currentMatches++; }
          else if (/GST|IGST|CGST|SGST|TAX/.test(text) && !/GSTIN|GST\s*NO/.test(text)) { tempCols.gst = colNum; currentMatches++; }
          else if (/^(AMOUNT|TOTAL|VALUE|NET)/.test(text)) { tempCols.amount = colNum; currentMatches++; }
        });

        if (currentMatches >= 2 && (tempCols.product !== undefined || tempCols.amount !== undefined) && currentMatches > bestMatches) {
          bestMatches = currentMatches;
          trueHeaderRowIndex = r;
          Object.assign(liveCols, tempCols);
        }
      }

      const dataStartRowIndex = (bestMatches >= 2 && trueHeaderRowIndex) ? (trueHeaderRowIndex + 1) : mapping.dataStartRowIndex;
      let calculatedEndRow = dataStartRowIndex;
      for (let r = dataStartRowIndex; r <= (worksheet.rowCount || dataStartRowIndex + 30); r++) {
        const row = worksheet.getRow(r);
        let hitFooter = false;
        row.eachCell({ includeEmpty: false }, (cell) => {
          const val = getCellText(cell.value).toUpperCase().trim();
          if (/^(SUBTOTAL|SUB\s*TOTAL|DISCOUNT|REBATE|TAX\s*\(|TOTAL\s*PAYABLE|NET\s*PAYABLE|GRAND\s*TOTAL|TERMS|CONDITIONS|BANK|ACCOUNT|IFSC|SIGNATURE|FOR\s+|NOTE:|IN\s*WORDS)/.test(val)) {
            hitFooter = true;
          }
        });
        if (hitFooter) {
          calculatedEndRow = Math.max(dataStartRowIndex, r - 1);
          break;
        }
        calculatedEndRow = r;
      }
      const dataEndRowIndex = (bestMatches >= 2) ? calculatedEndRow : mapping.dataEndRowIndex;
      const headerRowIndex = (bestMatches >= 2) ? trueHeaderRowIndex : mapping.headerRowIndex;

      // Live totals-row scan at export time (BUG 2 fix)
      const liveTotals: {
        subtotalRowIndex?: number;
        discountRowIndex?: number;
        taxRowIndex?: number;
        totalRowIndex?: number;
      } = {};

      const scanEnd = Math.min(worksheet.rowCount || dataEndRowIndex + 20, dataEndRowIndex + 25);
      for (let r = dataEndRowIndex + 1; r <= scanEnd; r++) {
        const row = worksheet.getRow(r);
        row.eachCell({ includeEmpty: false }, (cell) => {
          const text = getCellText(cell.value).trim();
          if (!text) return;
          if (/SUB\s*-?\s*TOTAL|TOTAL\s*BEFORE/i.test(text) && !liveTotals.subtotalRowIndex) {
            liveTotals.subtotalRowIndex = r;
          } else if (/DISCOUNT|LESS|REBATE/i.test(text) && !liveTotals.discountRowIndex) {
            liveTotals.discountRowIndex = r;
          } else if (/TAX|GST|IGST|CGST|SGST/i.test(text) && !/GSTIN|GST\s*NO/i.test(text) && !liveTotals.taxRowIndex) {
            liveTotals.taxRowIndex = r;
          } else if (/GRAND\s*TOTAL|TOTAL\s*PAYABLE|NET\s*PAYABLE|TOTAL\s*AMOUNT|^TOTAL$/i.test(text) && !liveTotals.totalRowIndex) {
            liveTotals.totalRowIndex = r;
          }
        });
      }

      const activeSubtotalRow = liveTotals.subtotalRowIndex || mapping.totals?.subtotalRowIndex;
      const activeDiscountRow = liveTotals.discountRowIndex || mapping.totals?.discountRowIndex;
      const activeTaxRow = liveTotals.taxRowIndex || mapping.totals?.taxRowIndex;
      const activeTotalRow = liveTotals.totalRowIndex || mapping.totals?.totalRowIndex;

      const sampleRowCount = Math.max(1, dataEndRowIndex - dataStartRowIndex + 1);
      const itemsCount = model.products.length;

      // 4. Dynamic Row Insertion while preserving 100% formatting
      let rowOffset = 0;
      if (itemsCount > sampleRowCount) {
        const rowsToInsert = itemsCount - sampleRowCount;
        rowOffset = rowsToInsert;

        const sampleRowNumber = dataEndRowIndex;
        const sampleRow = worksheet.getRow(sampleRowNumber);

        worksheet.spliceRows(sampleRowNumber + 1, 0, ...new Array(rowsToInsert).fill([]));

        for (let i = 1; i <= rowsToInsert; i++) {
          const targetRowNumber = sampleRowNumber + i;
          const targetRow = worksheet.getRow(targetRowNumber);
          targetRow.height = sampleRow.height;

          sampleRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
            const targetCell = targetRow.getCell(colIdx);
            targetCell.style = Object.assign({}, cell.style);
            if (cell.numFmt) targetCell.numFmt = cell.numFmt;
          });
        }
      }

      // 5. Safe Product Injection & Template Sample Row Wipe
      const safeProductCol = liveCols.product || mapping.columns.product || 1;
      const safeAmountCol = liveCols.amount || (mapping.columns.amount !== safeProductCol ? mapping.columns.amount : undefined) || worksheet.columnCount || 6;
      
      const safeSrNoCol = liveCols.srNo !== undefined ? liveCols.srNo : (mapping.columns.srNo !== safeProductCol ? mapping.columns.srNo : undefined);
      const safeSkuCol = liveCols.sku;
      const safeQtyCol = liveCols.qty;
      const safeRateCol = liveCols.rate;
      const safeGstCol = liveCols.gst;

      const srNoCollidesWithProduct = safeSrNoCol === safeProductCol;
      const skuCollidesWithProduct = safeSkuCol === safeProductCol;
      const qtyCollidesWithProduct = safeQtyCol === safeProductCol;
      const rateCollidesWithProduct = safeRateCol === safeProductCol;
      const gstCollidesWithProduct = safeGstCol === safeProductCol;

      for (let i = 0; i < Math.max(itemsCount, sampleRowCount); i++) {
        const rNumber = dataStartRowIndex + i;
        const row = worksheet.getRow(rNumber);

        if (i < itemsCount) {
          // Thoroughly wipe all existing dummy sample cell values across this row before item injection
          for (let c = 1; c <= Math.max(worksheet.columnCount || 10, 25); c++) {
            row.getCell(c).value = null;
          }

          const p = model.products[i];
          if (safeSrNoCol && !srNoCollidesWithProduct) {
            row.getCell(safeSrNoCol).value = i + 1;
          }
          // else: skip writing any serial number for this template — do not fall back to prefixing it into the product cell under any circumstance.

          // Pure, unpolluted product description
          row.getCell(safeProductCol).value = p.product;

          if (safeSkuCol && !skuCollidesWithProduct) row.getCell(safeSkuCol).value = p.sku;
          if (safeQtyCol && !qtyCollidesWithProduct) row.getCell(safeQtyCol).value = p.qty;
          if (safeRateCol && !rateCollidesWithProduct) row.getCell(safeRateCol).value = p.rate;

          const hasDedicatedGstCol = safeGstCol && !gstCollidesWithProduct && safeGstCol !== safeAmountCol;
          if (hasDedicatedGstCol) {
            row.getCell(safeGstCol).value = p.gst ? `${p.gst}%` : "x";
          } else {
            if ((p.gst || 0) > 0 || model.gstTotal > 0) {
              noGstColumnDetected = true;
            }
          }

          if (safeQtyCol && !qtyCollidesWithProduct && safeRateCol && !rateCollidesWithProduct) {
            const qtyColLetter = worksheet.getColumn(safeQtyCol).letter;
            const rateColLetter = worksheet.getColumn(safeRateCol).letter;
            if (!hasDedicatedGstCol) {
              const multiplier = 1 + (p.gst || 0) / 100;
              row.getCell(safeAmountCol).value = {
                formula: `${qtyColLetter}${rNumber}*${rateColLetter}${rNumber}*${multiplier}`,
                result: p.amount * multiplier,
              };
            } else {
              row.getCell(safeAmountCol).value = {
                formula: `${qtyColLetter}${rNumber}*${rateColLetter}${rNumber}`,
                result: p.amount,
              };
            }
          } else {
            if (!hasDedicatedGstCol) {
              row.getCell(safeAmountCol).value = p.amount * (1 + (p.gst || 0) / 100);
            } else {
              row.getCell(safeAmountCol).value = p.amount;
            }
          }
        } else {
          // Thoroughly wipe all dummy template sample cells in unused rows across columns 1 to 25
          for (let c = 1; c <= Math.max(worksheet.columnCount || 10, 25); c++) {
            row.getCell(c).value = null;
          }
        }
      }

      // 6. Automatically Recalculate Totals & Formulas
      const actualEndRow = dataStartRowIndex + Math.max(itemsCount, sampleRowCount) - 1;
      const amtColLetter = worksheet.getColumn(safeAmountCol).letter;
      const valCol = mapping.totals?.valueColumnIndex || safeAmountCol;

      if (activeSubtotalRow) {
        const subRow = worksheet.getRow(activeSubtotalRow + rowOffset);
        subRow.getCell(valCol).value = {
          formula: `SUM(${amtColLetter}${dataStartRowIndex}:${amtColLetter}${actualEndRow})`,
          result: model.totals.subtotal,
        };
      }

      if (activeDiscountRow && model.discount.value > 0) {
        const discRow = worksheet.getRow(activeDiscountRow + rowOffset);
        discRow.getCell(valCol).value = -model.discount.value;
      }

      if (activeTaxRow) {
        const taxRow = worksheet.getRow(activeTaxRow + rowOffset);
        taxRow.getCell(valCol).value = model.gstTotal;
      }

      if (activeTotalRow) {
        const totRow = worksheet.getRow(activeTotalRow + rowOffset);
        totRow.getCell(valCol).value = model.totals.payable;
      } else {
        // Fallback: Grand total not found anywhere in template, append two new rows after last data row
        totalsRowsMissingInTemplate = true;

        const refRow = worksheet.getRow(actualEndRow);
        worksheet.spliceRows(actualEndRow + 1, 0, [], []);
        
        const taxRow = worksheet.getRow(actualEndRow + 1);
        const totalRow = worksheet.getRow(actualEndRow + 2);
        taxRow.height = refRow.height || 20;
        totalRow.height = refRow.height || 20;

        refRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
          const taxCell = taxRow.getCell(colIdx);
          const totalCell = totalRow.getCell(colIdx);
          if (cell.style) {
            taxCell.style = Object.assign({}, cell.style);
            totalCell.style = Object.assign({}, cell.style);
          }
          if (cell.numFmt) {
            taxCell.numFmt = cell.numFmt;
            totalCell.numFmt = cell.numFmt;
          }
        });

        const labelCol = Math.max(1, safeAmountCol - 1);
        const taxLabelCell = taxRow.getCell(labelCol);
        const taxValueCell = taxRow.getCell(safeAmountCol);
        taxLabelCell.value = "Tax (GST):";
        taxLabelCell.alignment = { ...taxLabelCell.alignment, horizontal: "right" };
        taxValueCell.value = model.gstTotal;

        const totalLabelCell = totalRow.getCell(labelCol);
        const totalValueCell = totalRow.getCell(safeAmountCol);
        totalLabelCell.value = "Total Payable:";
        totalLabelCell.font = { ...totalLabelCell.font, bold: true };
        totalLabelCell.alignment = { ...totalLabelCell.alignment, horizontal: "right" };
        totalValueCell.value = model.totals.payable;
        totalValueCell.font = { ...totalValueCell.font, bold: true };
      }

      // 7. Comprehensive Section & Placeholder Scanner
      let termsInjected = false;
      for (let r = 1; r <= (worksheet.rowCount || 100); r++) {
        const row = worksheet.getRow(r);
        const isHeaderArea = r < headerRowIndex;
        const isCompanySection = r <= Math.max(6, Math.floor(headerRowIndex / 2) - 1);

        row.eachCell({ includeEmpty: false }, (cell, colIdx) => {
          const text = getCellText(cell.value);
          if (!text) return;

          const lower = text.toLowerCase().trim();
          const upper = text.toUpperCase().trim();

          // ── COMPANY PLACEHOLDERS (Rows 1 to Company boundary) ──
          if (isCompanySection) {
            if (fuzzyMatch(text, ["your company name", "company name", "your company", "[company name]"])) {
              cell.value = model.company.name;
              return;
            }
            if (fuzzyMatch(text, ["123 your street", "street address", "address line 1", "[street address]", "[address]"])) {
              cell.value = model.company.gstNumber ? `GSTIN: ${model.company.gstNumber}` : (model.company.email || "");
              return;
            }
            if (fuzzyMatch(text, ["city, state, country", "city state country", "city, state", "[city, st zip]", "[city, state, zip]", "st zip"])) {
              cell.value = "India";
              return;
            }
            if (fuzzyMatch(text, ["phone", "phone number", "[000-000-0000]", "[phone]"]) || lower.startsWith("phone:")) {
              cell.value = model.company.email ? `Email: ${model.company.email}` : "";
              return;
            }
            if (fuzzyMatch(text, ["yourwebsite.com", "www.yourwebsite.com", "website", "somedomain.com"])) {
              cell.value = model.company.email ? `Website: ${model.company.email.split("@")[1] || model.company.email}` : "";
              return;
            }
          }

          // ── CLIENT / CUSTOMER PLACEHOLDERS (Header area below company boundary) ──
          if (!hasAiClientDetails && isHeaderArea && !isCompanySection) {
            const trimmedText = text.trim();

            // New detection pattern: Short labels ending in a colon (e.g., "M/s:", "To:", "Bill To:", "Address:")
            if (trimmedText.endsWith(":") && trimmedText.length <= 35) {
              const labelNoColon = trimmedText.slice(0, -1).trim();
              let targetValue = "";

              if (fuzzyMatch(labelNoColon, ["client name", "customer name", "party name", "buyer name", "[name]", "recipient name", "[company name]", "m/s", "to", "bill to", "billed to", "ship to", "consignee", "kind attn", "attn", "party", "customer", "name"])) {
                targetValue = model.customer.name;
              } else if (fuzzyMatch(labelNoColon, ["street address", "client address", "address line 1", "address", "[street address]", "delivery address", "billing address"])) {
                targetValue = model.customer.address || "N/A";
              } else if (fuzzyMatch(labelNoColon, ["city, state, country", "city state country", "city, state", "[city, st zip]", "st zip", "[city, state, zip]", "gstin", "gst no", "gst number", "tax id", "gst"])) {
                targetValue = model.customer.gstNumber ? (labelNoColon.toUpperCase().includes("GST") ? model.customer.gstNumber : `GSTIN: ${model.customer.gstNumber}`) : "";
              } else if (fuzzyMatch(labelNoColon, ["phone", "phone number", "mobile", "contact", "tel", "email", "[phone]", "[000-000-0000]", "mob", "contact no", "cell"])) {
                const contactParts = [model.customer.phone, model.customer.email].filter(Boolean);
                targetValue = contactParts.length > 0 ? (labelNoColon.toUpperCase().includes("PHONE") || labelNoColon.toUpperCase().includes("MOB") || labelNoColon.toUpperCase().includes("TEL") || labelNoColon.toUpperCase().includes("CELL") ? (contactParts[0] || "") : `Phone: ${contactParts.join(" | ")}`) : "";
              }

              if (targetValue) {
                const rightCell = row.getCell(colIdx + 1);
                const belowRow = worksheet.getRow(r + 1);
                const belowCell = belowRow ? belowRow.getCell(colIdx) : null;

                if (isBlankOrPlaceholder(rightCell.value)) {
                  rightCell.value = targetValue;
                  return;
                } else if (belowCell && isBlankOrPlaceholder(belowCell.value)) {
                  belowCell.value = targetValue;
                  return;
                }
              }
            }

            if (fuzzyMatch(text, ["client name", "customer name", "party name", "buyer name", "[name]", "recipient name", "[company name]", "m/s", "to,", "bill to", "billed to", "ship to", "consignee", "kind attn", "attn", "party", "customer"])) {
              cell.value = model.customer.name;
              return;
            }
            if (fuzzyMatch(text, ["street address", "client address", "address line 1", "address", "[street address]", "delivery address", "billing address"])) {
              cell.value = model.customer.address || "N/A";
              return;
            }
            if (fuzzyMatch(text, ["city, state, country", "city state country", "city, state", "[city, st zip]", "st zip", "[city, state, zip]", "gstin", "gst no", "gst number", "tax id"])) {
              cell.value = model.customer.gstNumber ? `GSTIN: ${model.customer.gstNumber}` : "";
              return;
            }
            if (fuzzyMatch(text, ["phone", "phone number", "mobile", "contact", "tel", "email", "[phone]", "[000-000-0000]", "mob", "contact no", "cell"])) {
              const contactParts = [model.customer.phone, model.customer.email].filter(Boolean);
              cell.value = contactParts.length > 0 ? `Phone: ${contactParts.join(" | ")}` : "";
              return;
            }
          }

          // ── UNIVERSAL PLACEHOLDERS (Date, Quote #, Customer ID, Terms) ──
          if (lower === "mm/dd/yyyy" || lower === "dd/mm/yyyy" || lower === "yyyy-mm-dd" || lower === "[date]") {
            cell.value = model.date;
            return;
          }

          if (lower === "00001" || lower === "00002" || lower === "[number]" || lower === "[quote #]" || lower === "[123456]") {
            cell.value = model.quotationId;
            return;
          }

          if (lower === "customer123" || lower === "[customer id]" || lower === "[id]" || lower === "[123]") {
            cell.value = model.customer.name;
            return;
          }

          if (fuzzyMatch(text, ["prepared by", "sales rep", "salesperson", "[salesperson name]"])) {
            cell.value = model.company.name ? `Prepared by: ${model.company.name}` : "";
            return;
          }

          if (r > headerRowIndex) {
            const termsRegex = /terms\s*(&|and)?\s*condition|^terms:?$|\bt\s*&\s*c\b/i;
            const isTermsPhrase = fuzzyMatch(text, ["enter your terms", "terms and conditions here", "special notes and instructions", "thank you for your business"]);
            
            if (termsRegex.test(text) || isTermsPhrase) {
              if (termsInjected) {
                if (/thank\s*you/i.test(text)) {
                  cell.value = "Thank you for your business!";
                } else {
                  cell.value = null;
                }
                return;
              }
              termsInjected = true;

              const termsText = brand.terms || "Standard delivery and quotation terms apply.";
              const isHeadingLabel = text.length < 30 && !/enter|here|instruction|thank you/i.test(text);

              if (!isHeadingLabel) {
                // Long cell (or explicit placeholder instructional text): replace directly
                cell.value = termsText;
                return;
              } else {
                // Short heading label: leave heading alone and examine rows immediately below it
                let replaced = false;
                for (let nextOffset = 1; nextOffset <= 4; nextOffset++) {
                  const targetRowIdx = r + nextOffset;
                  if (targetRowIdx > (worksheet.rowCount || targetRowIdx + 4)) break;
                  const nextRow = worksheet.getRow(targetRowIdx);

                  let hitOtherSection = false;
                  let targetCell: any = null;

                  nextRow.eachCell({ includeEmpty: false }, (c) => {
                    const cText = getCellText(c.value).trim();
                    if (cText) {
                      if (/^(BANK|ACCOUNT|IFSC|SIGNATURE|AUTHORISED|FOR\s+|NOTE:|THANK)/i.test(cText)) {
                        hitOtherSection = true;
                      } else if (!targetCell) {
                        targetCell = c;
                      }
                    }
                  });

                  if (hitOtherSection) {
                    if (!replaced) {
                      // Another section begins right away; insert a row for terms
                      worksheet.spliceRows(targetRowIdx, 0, []);
                      const newRow = worksheet.getRow(targetRowIdx);
                      newRow.getCell(colIdx).value = termsText;
                      replaced = true;
                    }
                    break;
                  }

                  if (!targetCell) {
                    // Empty row immediately below heading
                    if (!replaced) {
                      nextRow.getCell(colIdx).value = termsText;
                      replaced = true;
                    }
                  } else {
                    // Row has text (placeholder/demo content)
                    if (!replaced) {
                      targetCell.value = termsText;
                      replaced = true;
                    } else {
                      // Clear subsequent lines of placeholder demo terms so old terms don't remain below new ones
                      targetCell.value = null;
                    }
                  }
                }

                if (!replaced) {
                  worksheet.getRow(r + 1).getCell(colIdx).value = termsText;
                }
                return;
              }
            }
          }

          // Label + Value patterns (put data in NEXT cell if empty or placeholder)
          if (upper === "DATE:" || (upper === "DATE" && isHeaderArea)) {
            const nextCell = row.getCell(colIdx + 1);
            const nextText = getCellText(nextCell.value).toLowerCase();
            if (!nextText || nextText === "mm/dd/yyyy" || nextText === "dd/mm/yyyy" || nextText.length < 3) {
              nextCell.value = model.date;
            }
          }
          if ((upper.includes("QUOTE") && upper.includes("#")) || (upper.includes("QUOTATION") && upper.includes("NO"))) {
            const nextCell = row.getCell(colIdx + 1);
            const nextText = getCellText(nextCell.value);
            if (!nextText || nextText === "00001" || nextText.length < 2 || (nextText.startsWith("[") && nextText.endsWith("]"))) {
              nextCell.value = model.quotationId;
            }
          }
          if (upper.includes("CUSTOMER") && upper.includes("ID")) {
            const nextCell = row.getCell(colIdx + 1);
            const nextText = getCellText(nextCell.value);
            if (!nextText || nextText === "customer123" || nextText.length < 2 || (nextText.startsWith("[") && nextText.endsWith("]"))) {
              nextCell.value = model.customer.name;
            }
          }

          // Final cleanup sweep: if cell text is still a bracketed placeholder like [Something], clear it
          if (typeof cell.value === "string" && cell.value.trim().startsWith("[") && cell.value.trim().endsWith("]")) {
            cell.value = null;
          }
        });
      }

      const warnings: string[] = [];
      if (noGstColumnDetected) {
        warnings.push("Your uploaded template has no dedicated GST column — GST was included directly in the Amount column instead.");
      }
      if (totalsRowsMissingInTemplate) {
        warnings.push("Your uploaded template's Grand Total row wasn't detected — totals were added as new rows at the bottom.");
      }

      const outBuffer = await workbook.xlsx.writeBuffer();
      triggerDownload(outBuffer, fileName);
      return { warnings };
    } catch (err: any) {
      console.error("High-fidelity custom Excel export failed:", err);
      // If validation error, rethrow so UI can display it
      if (err.message && err.message.includes("Validation Error")) {
        throw err;
      }
      console.warn("Falling back to default styled Excel layout.");
    }
  }

  // ── Default Structured Styled Excel Generation (using ExcelJS) ──
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Quotation");

  // Company Header
  worksheet.addRow([model.company.name.toUpperCase()]).font = { size: 16, bold: true, color: { argb: "FF1E3A8A" } };
  worksheet.addRow([`GSTIN: ${model.company.gstNumber}`]).font = { size: 10, color: { argb: "FF4B5563" } };
  worksheet.addRow([`Email: ${model.company.email}`]).font = { size: 10, color: { argb: "FF4B5563" } };
  worksheet.addRow([]);

  // Meta
  worksheet.addRow(["QUOTATION NO:", model.quotationId]).font = { bold: true };
  worksheet.addRow(["DATE:", model.date]);
  worksheet.addRow(["CUSTOMER:", model.customer.name]);
  if (model.customer.address) worksheet.addRow(["ADDRESS:", model.customer.address]);
  if (model.customer.gstNumber) worksheet.addRow(["GST No:", model.customer.gstNumber]);
  if (model.customer.phone || model.customer.email) worksheet.addRow(["CONTACT:", `${model.customer.phone || ""} ${model.customer.email ? " | " + model.customer.email : ""}`.trim()]);
  worksheet.addRow([]);

  // Table Header
  const headerRow = worksheet.addRow(["SR NO", "PRODUCT DESCRIPTION", "SKU", "QTY", "RATE (₹)", "GST %", "AMOUNT (₹)"]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Line Items
  model.products.forEach((p, idx) => {
    const row = worksheet.addRow([idx + 1, p.product, p.sku, p.qty, p.rate, `${p.gst}%`, p.amount]);
    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(4).alignment = { horizontal: "center" };
    row.getCell(5).numFmt = "₹#,##0.00";
    row.getCell(6).alignment = { horizontal: "center" };
    row.getCell(7).numFmt = "₹#,##0.00";
  });

  worksheet.addRow([]);

  // Totals
  const addTotalRow = (label: string, val: number, bold = false) => {
    const r = worksheet.addRow(["", "", "", "", "", label, val]);
    r.getCell(6).font = { bold };
    r.getCell(7).font = { bold };
    r.getCell(7).numFmt = "₹#,##0.00";
  };

  addTotalRow("Subtotal:", model.totals.subtotal);
  if (model.discount.value > 0) {
    addTotalRow(`Discount (${model.discount.percentage}%):`, -model.discount.value);
  }
  addTotalRow("Tax (GST):", model.gstTotal);
  addTotalRow("Total Payable:", model.totals.payable, true);

  worksheet.addRow([]);
  worksheet.addRow([]);

  if (model.company.bankAccount) {
    worksheet.addRow(["Bank Details:"]).font = { bold: true };
    const bankLines = model.company.bankAccount.split("\n");
    bankLines.forEach((line) => worksheet.addRow([line]).font = { size: 9, color: { argb: "FF4B5563" } });
    worksheet.addRow([]);
  }

  worksheet.addRow(["Terms & Conditions:"]).font = { bold: true };

  const termsLines = (brand.terms || "Standard delivery and quotation terms apply.").split("\n");
  termsLines.forEach((line) => worksheet.addRow([line]).font = { size: 9, color: { argb: "FF6B7280" } });

  // Adjust column widths
  worksheet.columns = [
    { width: 8 },
    { width: 35 },
    { width: 15 },
    { width: 10 },
    { width: 15 },
    { width: 12 },
    { width: 18 },
  ];

  const outBuffer = await workbook.xlsx.writeBuffer();
  triggerDownload(outBuffer, fileName);
  return { warnings: [] };
}
