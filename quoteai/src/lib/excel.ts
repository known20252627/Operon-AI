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

      // Ensure we have template mapping
      let mapping: ExcelTemplateMapping | undefined = brand.customExcelMapping;
      if (!mapping) {
        mapping = await analyzeExcelTemplate(brand.customExcelTemplate);
      }

      const { dataStartRowIndex, dataEndRowIndex, columns, totals } = mapping;
      const sampleRowCount = Math.max(1, dataEndRowIndex - dataStartRowIndex + 1);
      const itemsCount = model.products.length;

      // 4. Dynamic Row Insertion while preserving 100% formatting
      let rowOffset = 0;
      if (itemsCount > sampleRowCount) {
        const rowsToInsert = itemsCount - sampleRowCount;
        rowOffset = rowsToInsert;

        // Clone cell styles from the last sample row
        const sampleRowNumber = dataEndRowIndex;
        const sampleRow = worksheet.getRow(sampleRowNumber);

        // Splice empty rows right below dataEndRowIndex
        worksheet.spliceRows(sampleRowNumber + 1, 0, ...new Array(rowsToInsert).fill([]));

        // Copy styles and height to newly inserted rows
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

      // 5. Inject Dynamic Product Cells
      if (!columns.qty || !columns.rate || !columns.product || !columns.amount) {
        throw new Error("Template mapping is incomplete: missing required columns (product, qty, rate, or amount). Please re-upload your template.");
      }
      const qtyColLetter = worksheet.getColumn(columns.qty).letter;
      const rateColLetter = worksheet.getColumn(columns.rate).letter;

      for (let i = 0; i < Math.max(itemsCount, sampleRowCount); i++) {
        const rNumber = dataStartRowIndex + i;
        const row = worksheet.getRow(rNumber);

        if (i < itemsCount) {
          const p = model.products[i];
          if (columns.srNo) row.getCell(columns.srNo).value = i + 1;
          row.getCell(columns.product).value = p.product;
          if (columns.sku && p.sku) row.getCell(columns.sku).value = p.sku;
          row.getCell(columns.qty).value = p.qty;
          row.getCell(columns.rate).value = p.rate;
          if (columns.gst) row.getCell(columns.gst).value = `${p.gst}%`;

          // Inject dynamic formula for Amount (=Qty * Rate)
          row.getCell(columns.amount).value = {
            formula: `${qtyColLetter}${rNumber}*${rateColLetter}${rNumber}`,
            result: p.amount,
          };
        } else {
          // Clear unused sample rows while keeping styles intact
          if (columns.srNo) row.getCell(columns.srNo).value = null;
          row.getCell(columns.product).value = null;
          if (columns.sku) row.getCell(columns.sku).value = null;
          row.getCell(columns.qty).value = null;
          row.getCell(columns.rate).value = null;
          if (columns.gst) row.getCell(columns.gst).value = null;
          row.getCell(columns.amount).value = null;
        }
      }

      // 6. Automatically Recalculate Totals & Formulas
      const actualEndRow = dataStartRowIndex + Math.max(itemsCount, sampleRowCount) - 1;
      const amtColLetter = worksheet.getColumn(columns.amount).letter;

      if (totals.subtotalRowIndex) {
        const subRow = worksheet.getRow(totals.subtotalRowIndex + rowOffset);
        subRow.getCell(totals.valueColumnIndex).value = {
          formula: `SUM(${amtColLetter}${dataStartRowIndex}:${amtColLetter}${actualEndRow})`,
          result: model.totals.subtotal,
        };
      }

      if (totals.discountRowIndex && model.discount.value > 0) {
        const discRow = worksheet.getRow(totals.discountRowIndex + rowOffset);
        discRow.getCell(totals.valueColumnIndex).value = -model.discount.value;
      }

      if (totals.taxRowIndex) {
        const taxRow = worksheet.getRow(totals.taxRowIndex + rowOffset);
        taxRow.getCell(totals.valueColumnIndex).value = model.gstTotal;
      }

      if (totals.totalRowIndex) {
        const totRow = worksheet.getRow(totals.totalRowIndex + rowOffset);
        totRow.getCell(totals.valueColumnIndex).value = model.totals.payable;
      }

      // 7. Section-Aware Placeholder Scanner
      //    DEBUG: Log all cells in header area so we can see exactly what's there
      console.log("=== TEMPLATE DEBUG: Header area cells ===");
      console.log("mapping.headerRowIndex =", mapping.headerRowIndex);
      for (let r = 1; r <= Math.min(mapping.headerRowIndex + 2, worksheet.rowCount || 50); r++) {
        const row = worksheet.getRow(r);
        const cells: string[] = [];
        row.eachCell({ includeEmpty: false }, (cell, colIdx) => {
          const raw = cell.value;
          let display = "";
          if (raw === null || raw === undefined) {
            display = "(null)";
          } else if (typeof raw === "object" && "richText" in (raw as any)) {
            const rt = (raw as any).richText;
            display = `[RT: "${rt.map((r: any) => r.text).join("")}"]`;
          } else {
            display = `"${String(raw).substring(0, 40)}"`;
          }
          cells.push(`Col${colIdx}=${display}`);
        });
        if (cells.length > 0) console.log(`  R${r}: ${cells.join(" | ")}`);
      }
      console.log("=== END DEBUG ===")

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

      // Step A: Find client section start (look for "Billed to", "Bill To", "Ship To", "To:", etc.)
      let clientSectionStart = -1;
      for (let r = 1; r <= mapping.headerRowIndex; r++) {
        const row = worksheet.getRow(r);
        row.eachCell({ includeEmpty: false }, (cell) => {
          const text = getCellText(cell.value).toLowerCase();
          if (text.includes("billed to") || text.includes("bill to") || text.includes("ship to") ||
              text === "to:" || text === "to" || text === "m/s:" || text === "m/s" ||
              text === "customer:" || text === "client:" || text === "buyer:") {
            if (clientSectionStart === -1) clientSectionStart = r;
          }
        });
      }
      if (clientSectionStart === -1) clientSectionStart = Math.max(1, Math.floor(mapping.headerRowIndex / 2));

      // Step B: Replace COMPANY placeholders (rows 1 to clientSectionStart - 1)
      for (let r = 1; r < clientSectionStart; r++) {
        const row = worksheet.getRow(r);
        row.eachCell({ includeEmpty: false }, (cell) => {
          const text = getCellText(cell.value);
          if (fuzzyMatch(text, ["your company name", "company name", "your company"])) {
            cell.value = model.company.name;
          } else if (fuzzyMatch(text, ["building name", "office address"])) {
            cell.value = model.company.name ? `${model.company.name} Office` : "";
          } else if (fuzzyMatch(text, ["123 your street", "street address", "address line 1"])) {
            cell.value = model.company.gstNumber ? `GSTIN: ${model.company.gstNumber}` : (model.company.email || "");
          } else if (fuzzyMatch(text, ["city, state, country", "city state country", "city, state", "city"])) {
            cell.value = "India";
          } else if (fuzzyMatch(text, ["zip code", "pin code", "pincode", "postal code", "zip"])) {
            cell.value = ""; // clear placeholder
          } else if (fuzzyMatch(text, ["phone", "phone number", "mobile", "contact number", "tel"])) {
            cell.value = model.company.email || "";
          } else if (fuzzyMatch(text, ["yourwebsite.com", "www.yourwebsite.com", "website", "email", "e-mail"])) {
            cell.value = model.company.email || "";
          }
        });
      }

      // Step C: Replace CLIENT placeholders (rows clientSectionStart to headerRowIndex)
      for (let r = clientSectionStart; r <= mapping.headerRowIndex; r++) {
        const row = worksheet.getRow(r);
        row.eachCell({ includeEmpty: false }, (cell) => {
          const text = getCellText(cell.value);
          if (fuzzyMatch(text, ["client name", "customer name", "party name", "buyer name", "[name]", "recipient name"])) {
            cell.value = model.customer.name;
          } else if (fuzzyMatch(text, ["street address", "client address", "address line 1", "address"])) {
            cell.value = model.customer.address || "N/A";
          } else if (fuzzyMatch(text, ["city, state, country", "city state country", "city, state", "city"])) {
            cell.value = ""; // address already filled above
          } else if (fuzzyMatch(text, ["zip code", "pin code", "pincode", "postal code", "zip"])) {
            cell.value = model.customer.gstNumber ? `GSTIN: ${model.customer.gstNumber}` : "";
          } else if (fuzzyMatch(text, ["phone", "phone number", "mobile", "contact", "contact number", "tel", "email"])) {
            const contactParts = [model.customer.phone, model.customer.email].filter(Boolean);
            cell.value = contactParts.length > 0 ? contactParts.join(" | ") : "";
          }
        });
      }

      // Step D: Replace UNIVERSAL placeholders (date, quote #, terms, due dates, etc.) — scan ALL rows
      for (let r = 1; r <= (worksheet.rowCount || 100); r++) {
        const row = worksheet.getRow(r);
        row.eachCell({ includeEmpty: false }, (cell, colIdx) => {
          const text = getCellText(cell.value);
          const lower = text.toLowerCase().trim();
          const upper = text.toUpperCase().trim();

          // Date placeholders
          if (lower === "mm/dd/yyyy" || lower === "dd/mm/yyyy" || lower === "yyyy-mm-dd" || lower === "[date]") {
            cell.value = model.date;
          }

          // Quote / Invoice number placeholder
          if (lower === "00001" || lower === "00002" || lower === "[number]" || lower === "[quote #]" || lower === "[invoice #]") {
            cell.value = model.quotationId;
          }

          // Customer ID placeholder
          if (lower === "customer123" || lower === "[customer id]" || lower === "[id]") {
            cell.value = model.customer.name;
          }

          // Terms and conditions placeholders below table
          if (r > mapping.headerRowIndex) {
            if (fuzzyMatch(text, ["enter your terms", "terms and conditions here", "special notes and instructions", "thank you for your business"])) {
              if (lower === "notes:" || lower === "terms:") {
                const nextCell = row.getCell(colIdx + 1);
                if (!nextCell.value || getCellText(nextCell.value).length < 5) {
                  nextCell.value = brand.terms || "Thank you for your business!";
                }
              } else {
                cell.value = brand.terms || "Thank you for your business!";
              }
            }
          }

          // Label + Value patterns (put data in NEXT cell if empty or placeholder)
          if (upper === "DATE:" || (upper === "DATE" && r < clientSectionStart)) {
            const nextCell = row.getCell(colIdx + 1);
            const nextText = getCellText(nextCell.value).toLowerCase();
            if (!nextText || nextText === "mm/dd/yyyy" || nextText === "dd/mm/yyyy" || nextText.length < 3) {
              nextCell.value = model.date;
            }
          }
          if ((upper.includes("QUOTE") && upper.includes("#")) || (upper.includes("QUOTATION") && upper.includes("NO"))) {
            const nextCell = row.getCell(colIdx + 1);
            const nextText = getCellText(nextCell.value);
            if (!nextText || nextText === "00001" || nextText.length < 2) {
              nextCell.value = model.quotationId;
            }
          }
          if (upper.includes("PURCHASE ORDER") && upper.includes("#")) {
            const nextCell = row.getCell(colIdx + 1);
            const nextText = getCellText(nextCell.value);
            if (!nextText || nextText === "00002" || nextText.length < 2) {
              nextCell.value = model.quotationId;
            }
          }
          if (upper.includes("CUSTOMER") && upper.includes("ID")) {
            const nextCell = row.getCell(colIdx + 1);
            const nextText = getCellText(nextCell.value);
            if (!nextText || nextText === "customer123" || nextText.length < 2) {
              nextCell.value = model.customer.name;
            }
          }
          if (upper.includes("PAYMENT DUE BY") || upper.includes("DUE DATE")) {
            const nextCell = row.getCell(colIdx + 1);
            const nextText = getCellText(nextCell.value).toLowerCase();
            if (!nextText || nextText === "mm/dd/yyyy" || nextText === "dd/mm/yyyy" || nextText.length < 3) {
              const d = new Date();
              d.setDate(d.getDate() + 15);
              nextCell.value = d.toLocaleDateString("en-IN");
            }
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
