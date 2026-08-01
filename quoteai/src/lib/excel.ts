"use client";

import ExcelJS from "exceljs";
import type { QuoteItem, BrandSettings, CompanySettings, ExcelTemplateMapping, ClientDetails } from "@/types";
import { createQuotationModel, validateQuotationModel, type InternalQuotationModel } from "@/services/quotationModel";
import { analyzeExcelTemplate } from "@/services/excelAnalyzer";

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
export async function downloadQuotationExcel(payload: ExcelPayload): Promise<void> {
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

      // Ensure we have fallback template mapping
      let mapping: ExcelTemplateMapping | undefined = brand.customExcelMapping;
      if (!mapping) {
        mapping = await analyzeExcelTemplate(brand.customExcelTemplate);
      }

      // 3.5 Absolute Live Spreadsheet Analysis (Overriding buggy stored mappings)
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
          if (/^(SR|SL|S\.?\s*NO|NO\.|SNO)/.test(text)) { tempCols.srNo = colNum; currentMatches++; }
          else if (/^(PRODUCT|ITEM|DESCRIPTION|PARTICULARS|NAME|SPECIFICATION|GOODS|DETAILS)/.test(text)) { tempCols.product = colNum; currentMatches++; }
          else if (/^(SKU|MODEL|CODE|PART|ITEM\s*CODE)/.test(text)) { tempCols.sku = colNum; currentMatches++; }
          else if (/^(QTY|QUANTITY|PIECES|UNITS|NOS)/.test(text)) { tempCols.qty = colNum; currentMatches++; }
          else if (/^(RATE|PRICE|UNIT\s*COST|COST|UNIT\s*PRICE)/.test(text)) { tempCols.rate = colNum; currentMatches++; }
          else if (/^(GST|TAX|TAXED|TAXABLE|IGST|CGST|SGST|GST\s*%)/.test(text)) { tempCols.gst = colNum; currentMatches++; }
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
      
      const safeSrNoCol = liveCols.srNo;
      const safeSkuCol = liveCols.sku;
      const safeQtyCol = liveCols.qty;
      const safeRateCol = liveCols.rate;
      const safeGstCol = liveCols.gst;

      for (let i = 0; i < Math.max(itemsCount, sampleRowCount); i++) {
        const rNumber = dataStartRowIndex + i;
        const row = worksheet.getRow(rNumber);

        if (i < itemsCount) {
          const p = model.products[i];
          if (safeSrNoCol && safeSrNoCol !== safeProductCol) row.getCell(safeSrNoCol).value = i + 1;

          // Pure, unpolluted product description
          row.getCell(safeProductCol).value = p.product;

          if (safeSkuCol && safeSkuCol !== safeProductCol) row.getCell(safeSkuCol).value = p.sku;
          if (safeQtyCol && safeQtyCol !== safeProductCol) row.getCell(safeQtyCol).value = p.qty;
          if (safeRateCol && safeRateCol !== safeProductCol) row.getCell(safeRateCol).value = p.rate;
          if (safeGstCol && safeGstCol !== safeProductCol && safeGstCol !== safeAmountCol) {
            row.getCell(safeGstCol).value = p.gst ? `${p.gst}%` : "x";
          }

          if (safeQtyCol && safeRateCol) {
            const qtyColLetter = worksheet.getColumn(safeQtyCol).letter;
            const rateColLetter = worksheet.getColumn(safeRateCol).letter;
            row.getCell(safeAmountCol).value = {
              formula: `${qtyColLetter}${rNumber}*${rateColLetter}${rNumber}`,
              result: p.amount,
            };
          } else {
            row.getCell(safeAmountCol).value = p.amount;
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

      if (mapping.totals.subtotalRowIndex) {
        const subRow = worksheet.getRow(mapping.totals.subtotalRowIndex + rowOffset);
        subRow.getCell(mapping.totals.valueColumnIndex).value = {
          formula: `SUM(${amtColLetter}${dataStartRowIndex}:${amtColLetter}${actualEndRow})`,
          result: model.totals.subtotal,
        };
      }

      if (mapping.totals.discountRowIndex && model.discount.value > 0) {
        const discRow = worksheet.getRow(mapping.totals.discountRowIndex + rowOffset);
        discRow.getCell(mapping.totals.valueColumnIndex).value = -model.discount.value;
      }

      if (mapping.totals.taxRowIndex) {
        const taxRow = worksheet.getRow(mapping.totals.taxRowIndex + rowOffset);
        taxRow.getCell(mapping.totals.valueColumnIndex).value = model.gstTotal;
      }

      if (mapping.totals.totalRowIndex) {
        const totRow = worksheet.getRow(mapping.totals.totalRowIndex + rowOffset);
        totRow.getCell(mapping.totals.valueColumnIndex).value = model.totals.payable;
      }

      // 7. Comprehensive Section & Placeholder Scanner
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
          if (isHeaderArea && !isCompanySection) {
            if (fuzzyMatch(text, ["client name", "customer name", "party name", "buyer name", "[name]", "recipient name", "[company name]"])) {
              cell.value = model.customer.name;
              return;
            }
            if (fuzzyMatch(text, ["street address", "client address", "address line 1", "address", "[street address]"])) {
              cell.value = model.customer.address || "N/A";
              return;
            }
            if (fuzzyMatch(text, ["city, state, country", "city state country", "city, state", "[city, st zip]", "st zip", "[city, state, zip]"])) {
              cell.value = model.customer.gstNumber ? `GSTIN: ${model.customer.gstNumber}` : "";
              return;
            }
            if (fuzzyMatch(text, ["phone", "phone number", "mobile", "contact", "tel", "email", "[phone]", "[000-000-0000]"])) {
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
            if (fuzzyMatch(text, ["enter your terms", "terms and conditions here", "special notes and instructions", "thank you for your business"])) {
              cell.value = brand.terms || "Thank you for your business!";
              return;
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

      const outBuffer = await workbook.xlsx.writeBuffer();
      triggerDownload(outBuffer, fileName);
      return;
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
}
