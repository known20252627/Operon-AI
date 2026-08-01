"use client";

import ExcelJS from "exceljs";
import type { ExcelPayload } from "@/lib/excel";
import type { QuotationEngineMapping, PreExportValidationResult, QuotationEngineResponse } from "./types";
import { runLegacyQuotationEngine } from "./legacyEngine";
import { createQuotationModel, type InternalQuotationModel } from "@/services/quotationModel";
import { analyzeExcelTemplate } from "@/services/excelAnalyzer";
import type { ExcelTemplateMapping } from "@/types";

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

function getCellText(cellValue: unknown): string {
  if (cellValue === null || cellValue === undefined) return "";
  if (typeof cellValue === "string") return cellValue.trim();
  if (typeof cellValue === "number" || typeof cellValue === "boolean") return String(cellValue);
  if (typeof cellValue === "object" && "richText" in (cellValue as any)) {
    const rt = (cellValue as any).richText;
    return rt.map((r: any) => r.text).join("").trim();
  }
  if (typeof cellValue === "object" && "result" in (cellValue as any)) {
    return String((cellValue as any).result || "").trim();
  }
  return String(cellValue).trim();
}

function fuzzyMatch(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase().trim();
  return keywords.some((kw) => lower === kw || lower.includes(kw));
}

function isBlankOrPlaceholder(val: any): boolean {
  if (val === null || val === undefined || val === "") return true;
  const s = getCellText(val).trim();
  if (!s) return true;
  if (/^\[.+\]$/.test(s) || /^<.+>$/.test(s) || /_{2,}/.test(s) || /^\s*[\-\.]+\s*$/.test(s) || s.toLowerCase() === "n/a") {
    return true;
  }
  return false;
}

/**
 * Extracts or converts existing template analysis into standard QuotationEngineMapping,
 * with intelligent column collision prevention.
 */
function toEngineMapping(mapping: ExcelTemplateMapping): QuotationEngineMapping {
  const clientCoords = mapping.clientDetailsCoords || {};

  const productCol = mapping.columns?.product || 1;
  const amountCol = mapping.columns?.amount || (productCol + 4);

  let qtyCol = mapping.columns?.qty;
  let priceCol = mapping.columns?.rate;
  let gstCol = mapping.columns?.gst;

  if (!qtyCol || !priceCol || qtyCol === amountCol || priceCol === amountCol || qtyCol === productCol || priceCol === productCol) {
    if (amountCol > productCol + 2) {
      priceCol = amountCol - 1;
      qtyCol = amountCol - 2;
    } else {
      qtyCol = productCol + 1;
      priceCol = productCol + 2;
    }
  }

  if (gstCol && (gstCol === productCol || gstCol === qtyCol || gstCol === priceCol || gstCol === amountCol)) {
    gstCol = undefined;
  }

  return {
    productStartRow: mapping.dataStartRowIndex || (mapping.headerRowIndex ? mapping.headerRowIndex + 1 : 12),
    productColumn: productCol,
    qtyColumn: qtyCol!,
    priceColumn: priceCol!,
    gstColumn: gstCol,
    amountColumn: amountCol,
    customerNameCell: clientCoords.nameRow && clientCoords.nameCol ? { row: clientCoords.nameRow, col: clientCoords.nameCol } : undefined,
    addressCell: clientCoords.addressRow && clientCoords.addressCol ? { row: clientCoords.addressRow, col: clientCoords.addressCol } : undefined,
    quotationNumberCell: mapping.quotationNoCoords?.row && mapping.quotationNoCoords?.col ? { row: mapping.quotationNoCoords.row, col: mapping.quotationNoCoords.col } : undefined,
    dateCell: mapping.dateCoords?.row && mapping.dateCoords?.col ? { row: mapping.dateCoords.row, col: mapping.dateCoords.col } : undefined,
  };
}

/**
 * Performs strict pre-export validation against both data model and populated spreadsheet.
 */
function validatePreExport(
  model: InternalQuotationModel,
  worksheet: ExcelJS.Worksheet,
  mapping: QuotationEngineMapping
): PreExportValidationResult {
  const errors: string[] = [];
  let missingProduct = false;
  let missingQuantity = false;
  let invalidPrice = false;
  let brokenFormula = false;
  let missingMapping = false;
  let invalidTemplate = false;

  if (!worksheet || !worksheet.rowCount || worksheet.rowCount <= 0) {
    invalidTemplate = true;
    errors.push("Invalid template: Worksheet is empty or cannot be accessed.");
  }

  if (!mapping.productStartRow || !mapping.productColumn || !mapping.qtyColumn || !mapping.priceColumn || !mapping.amountColumn) {
    missingMapping = true;
    errors.push("Missing mapping: Essential column coordinates are missing.");
  }

  if (!model.products || model.products.length === 0) {
    missingProduct = true;
    errors.push("Missing product: No products present in the quotation model.");
  } else {
    model.products.forEach((p, idx) => {
      const rowNum = mapping.productStartRow + idx;
      const row = worksheet.getRow(rowNum);
      const prodVal = row.getCell(mapping.productColumn).value;
      const qtyVal = row.getCell(mapping.qtyColumn).value;
      const priceVal = row.getCell(mapping.priceColumn).value;

      if (!p.product || !String(p.product).trim() || prodVal === null || prodVal === undefined) {
        missingProduct = true;
        errors.push(`Missing product at line #${idx + 1} (Row ${rowNum}).`);
      }
      if (!p.qty || p.qty <= 0 || isNaN(Number(p.qty)) || qtyVal === null || qtyVal === undefined) {
        missingQuantity = true;
        errors.push(`Missing or invalid quantity at line #${idx + 1} (Row ${rowNum}).`);
      }
      if (p.rate === undefined || p.rate < 0 || isNaN(Number(p.rate)) || priceVal === null || priceVal === undefined) {
        invalidPrice = true;
        errors.push(`Invalid price at line #${idx + 1} (Row ${rowNum}).`);
      }
    });
  }

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const val = cell.value;
      if (val !== null && typeof val === "object") {
        if ("error" in (val as any)) {
          const errCode = String((val as any).error);
          if (/^#(REF!|VALUE!|NAME\?|DIV\/0!|NULL!|N\/A|NUM!)/i.test(errCode)) {
            brokenFormula = true;
            errors.push(`Broken formula at cell ${cell.address} (Row ${rowNumber}, Col ${colNumber}): ${errCode}`);
          }
        }
        if ("formula" in (val as any)) {
          const formStr = String((val as any).formula);
          const res = (val as any).result;
          if (/^#(REF!|VALUE!|NAME\?|DIV\/0!|NULL!|N\/A)/i.test(formStr) || /^#(REF!|VALUE!|NAME\?|DIV\/0!|NULL!|N\/A)/i.test(String(res || ""))) {
            brokenFormula = true;
            errors.push(`Broken formula reference at cell ${cell.address}: ${formStr}`);
          }
        }
      } else if (typeof val === "string") {
        if (/^#(REF!|VALUE!|NAME\?|DIV\/0!|NULL!|N\/A)/i.test(val.trim())) {
          brokenFormula = true;
          errors.push(`Broken formula literal at cell ${cell.address}: ${val.trim()}`);
        }
      }
    });
  });

  return {
    valid: errors.length === 0,
    missingProduct,
    missingQuantity,
    invalidPrice,
    brokenFormula,
    missingMapping,
    invalidTemplate,
    errors,
  };
}

function shiftFormulaRow(formula: string, oldRow: number, newRow: number): string {
  const reg = new RegExp(`(\\b[A-Z]+)${oldRow}\\b`, "gi");
  return formula.replace(reg, `$1${newRow}`);
}

/**
 * UNIFIED MERGED QUOTATION ENGINE:
 * Merges high-fidelity ExcelJS structural preservation with robust Indian B2B keyword
 * and placeholder recognition from the legacy engine.
 */
export async function runExcelJSQuotationEngine(payload: ExcelPayload): Promise<QuotationEngineResponse> {
  const { brand, company, items, discount, tax, total, quotationId, customerName, clientDetails, date } = payload;
  const warnings: string[] = [];

  // If no custom Excel template is provided, directly invoke legacy default styled layout generator
  if (!brand.customExcelTemplate) {
    console.log("✨ No custom template detected. Using standard legacy styled Excel generation...");
    return runLegacyQuotationEngine(payload);
  }

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

  const buffer = base64ToArrayBuffer(brand.customExcelTemplate);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("Invalid template: No worksheet found in workbook.");
  }

  // Retrieve or analyze template mapping strictly once
  let rawMapping: ExcelTemplateMapping | undefined = brand.customExcelMapping;
  if (!rawMapping) {
    console.log("⚡ Merged Engine: No stored mapping found. Running single AI template analysis...");
    rawMapping = await analyzeExcelTemplate(brand.customExcelTemplate);
  } else {
    console.log("✨ Merged Engine: Reusing stored template mapping without re-analysis.");
  }

  const engineMapping: QuotationEngineMapping = toEngineMapping(rawMapping);

  // Apply explicit AI coordinates first
  if (engineMapping.customerNameCell) {
    worksheet.getRow(engineMapping.customerNameCell.row).getCell(engineMapping.customerNameCell.col).value = model.customer.name || "";
  }
  if (engineMapping.addressCell && model.customer.address) {
    worksheet.getRow(engineMapping.addressCell.row).getCell(engineMapping.addressCell.col).value = model.customer.address;
  }
  if (engineMapping.quotationNumberCell) {
    worksheet.getRow(engineMapping.quotationNumberCell.row).getCell(engineMapping.quotationNumberCell.col).value = model.quotationId;
  }
  if (engineMapping.dateCell) {
    worksheet.getRow(engineMapping.dateCell.row).getCell(engineMapping.dateCell.col).value = model.date;
  }

  const hasAiClientDetails = !!(engineMapping.customerNameCell || engineMapping.addressCell);
  const headerRowIndex = rawMapping.headerRowIndex || engineMapping.productStartRow - 1;

  // MERGED LAYER: Comprehensive B2B Keyword & Universal Placeholder Scanner
  let termsInjected = false;
  for (let r = 1; r <= (worksheet.rowCount || 100); r++) {
    const row = worksheet.getRow(r);
    const isHeaderArea = r < engineMapping.productStartRow;
    const isCompanySection = r <= Math.max(6, Math.floor(engineMapping.productStartRow / 2) - 1);

    row.eachCell({ includeEmpty: false }, (cell, colIdx) => {
      const text = getCellText(cell.value);
      if (!text) return;

      const lower = text.toLowerCase().trim();
      const upper = text.toUpperCase().trim();

      // Company Info placeholders
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

      // Client & Indian B2B Placeholders
      if (!hasAiClientDetails && isHeaderArea && !isCompanySection) {
        const trimmedText = text.trim();

        // Colon label neighbor check (e.g. "M/s:", "Bill To:", "Attn:", "Address:")
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
            targetValue = contactParts.length > 0 ? `Phone: ${contactParts.join(" | ")}` : "";
          }

          if (targetValue) {
            const cellRight = row.getCell(colIdx + 1);
            const nextRow = worksheet.getRow(r + 1);
            const cellBelow = nextRow.getCell(colIdx);
            if (isBlankOrPlaceholder(cellRight.value)) {
              cellRight.value = targetValue;
            } else if (isBlankOrPlaceholder(cellBelow.value)) {
              cellBelow.value = targetValue;
            } else {
              cell.value = `${trimmedText} ${targetValue}`;
            }
            return;
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

      // Universal Placeholders
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

      // Terms & Conditions section below table
      if (r > engineMapping.productStartRow) {
        const termsRegex = /terms\s*(&|and)?\s*condition|^terms:?$|\bt\s*&\s*c\b/i;
        const isTermsPhrase = fuzzyMatch(text, ["enter your terms", "terms and conditions here", "special notes and instructions", "thank you for your business"]);
        if (termsRegex.test(text) || isTermsPhrase) {
          if (termsInjected) {
            cell.value = /thank\s*you/i.test(text) ? "Thank you for your business!" : null;
            return;
          }
          termsInjected = true;
          const termsText = brand.terms || "Standard delivery and quotation terms apply.";
          const isHeadingLabel = text.length < 30 && !/enter|here|instruction|thank you/i.test(text);
          if (!isHeadingLabel) {
            cell.value = termsText;
          } else {
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
              if (hitOtherSection) break;
              if (targetCell) {
                if (!replaced) {
                  targetCell.value = termsText;
                  replaced = true;
                } else {
                  targetCell.value = null;
                }
              }
            }
            if (!replaced) {
              worksheet.getRow(r + 1).getCell(colIdx).value = termsText;
            }
          }
          return;
        }
      }

      if (typeof cell.value === "string" && cell.value.trim().startsWith("[") && cell.value.trim().endsWith("]")) {
        cell.value = null;
      }
    });
  }

  // Determine sample rows & perform non-destructive dynamic row insertion
  const startRow = engineMapping.productStartRow;
  const origEndRow = rawMapping.dataEndRowIndex || startRow;
  const sampleRowCount = Math.max(1, origEndRow - startRow + 1);
  const itemsCount = model.products.length;
  let rowsInserted = 0;

  if (itemsCount > sampleRowCount) {
    rowsInserted = itemsCount - sampleRowCount;
    const sampleReferenceRowNumber = origEndRow;
    const sampleRefRow = worksheet.getRow(sampleReferenceRowNumber);

    worksheet.spliceRows(sampleReferenceRowNumber + 1, 0, ...new Array(rowsInserted).fill([]));

    for (let i = 1; i <= rowsInserted; i++) {
      const targetRowNumber = sampleReferenceRowNumber + i;
      const targetRow = worksheet.getRow(targetRowNumber);
      targetRow.height = sampleRefRow.height;

      sampleRefRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
        const targetCell = targetRow.getCell(colIdx);
        targetCell.style = Object.assign({}, cell.style);
        if (cell.numFmt) targetCell.numFmt = cell.numFmt;
      });
    }
  }

  // Populate line items while preserving formulas and without destroying adjacent columns
  const referenceSampleRow = worksheet.getRow(startRow);
  const sampleAmountCellVal = referenceSampleRow.getCell(engineMapping.amountColumn).value;
  let hasNativeAmountFormula = false;
  let templateFormulaStr = "";

  if (sampleAmountCellVal && typeof sampleAmountCellVal === "object" && "formula" in (sampleAmountCellVal as any)) {
    hasNativeAmountFormula = true;
    templateFormulaStr = String((sampleAmountCellVal as any).formula);
  }

  for (let i = 0; i < Math.max(itemsCount, sampleRowCount); i++) {
    const currentRowNum = startRow + i;
    const row = worksheet.getRow(currentRowNum);

    if (i < itemsCount) {
      const p = model.products[i];
      row.getCell(engineMapping.productColumn).value = p.product;
      row.getCell(engineMapping.qtyColumn).value = p.qty;
      row.getCell(engineMapping.priceColumn).value = p.rate;

      if (engineMapping.gstColumn) {
        row.getCell(engineMapping.gstColumn).value = p.gst ? `${p.gst}%` : "0%";
      }

      const amountCell = row.getCell(engineMapping.amountColumn);
      if (hasNativeAmountFormula && templateFormulaStr) {
        const shiftedFormula = shiftFormulaRow(templateFormulaStr, startRow, currentRowNum);
        amountCell.value = {
          formula: shiftedFormula,
          result: p.amount,
        };
      } else {
        const qtyLetter = worksheet.getColumn(engineMapping.qtyColumn).letter;
        const priceLetter = worksheet.getColumn(engineMapping.priceColumn).letter;
        amountCell.value = {
          formula: `${qtyLetter}${currentRowNum}*${priceLetter}${currentRowNum}`,
          result: p.amount,
        };
      }
    } else {
      row.getCell(engineMapping.productColumn).value = null;
      row.getCell(engineMapping.qtyColumn).value = null;
      row.getCell(engineMapping.priceColumn).value = null;
      if (engineMapping.gstColumn) row.getCell(engineMapping.gstColumn).value = null;
      row.getCell(engineMapping.amountColumn).value = null;
    }
  }

  // Recalculate totals & preserve footer formulas
  const actualEndRow = startRow + Math.max(itemsCount, sampleRowCount) - 1;
  const amtLetter = worksheet.getColumn(engineMapping.amountColumn).letter;
  const valCol = rawMapping.totals?.valueColumnIndex || engineMapping.amountColumn;

  if (rawMapping.totals?.subtotalRowIndex) {
    const shiftedSubRowIdx = rawMapping.totals.subtotalRowIndex + rowsInserted;
    const subCell = worksheet.getRow(shiftedSubRowIdx).getCell(valCol);
    subCell.value = {
      formula: `SUM(${amtLetter}${startRow}:${amtLetter}${actualEndRow})`,
      result: model.totals.subtotal,
    };
  }
  if (rawMapping.totals?.discountRowIndex && model.discount.value > 0) {
    const shiftedDiscIdx = rawMapping.totals.discountRowIndex + rowsInserted;
    worksheet.getRow(shiftedDiscIdx).getCell(valCol).value = -model.discount.value;
  }
  if (rawMapping.totals?.taxRowIndex) {
    const shiftedTaxIdx = rawMapping.totals.taxRowIndex + rowsInserted;
    worksheet.getRow(shiftedTaxIdx).getCell(valCol).value = model.gstTotal;
  }
  if (rawMapping.totals?.totalRowIndex) {
    const shiftedTotalIdx = rawMapping.totals.totalRowIndex + rowsInserted;
    const totalCell = worksheet.getRow(shiftedTotalIdx).getCell(valCol);
    const cellVal = totalCell.value;
    if (!cellVal || typeof cellVal !== "object" || !("formula" in (cellVal as any))) {
      totalCell.value = model.totals.payable;
    } else {
      (cellVal as any).result = model.totals.payable;
    }
  }

  // Execute Comprehensive Pre-Export Validation
  const validationReport = validatePreExport(model, worksheet, engineMapping);
  if (!validationReport.valid) {
    const errorSummary = `Merged Engine Pre-Export Validation Failed:\n` + validationReport.errors.map((e) => `• ${e}`).join("\n");
    console.warn("⚠️ " + errorSummary);
    throw new Error(errorSummary);
  }

  const outputBuffer = await workbook.xlsx.writeBuffer();
  triggerDownload(outputBuffer, "Quotation_Output.xlsx");

  return { warnings };
}
