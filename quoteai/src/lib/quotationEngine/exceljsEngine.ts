"use client";

import ExcelJS from "exceljs";
import type { ExcelPayload } from "@/lib/excel";
import type { QuotationEngineMapping, PreExportValidationResult, QuotationEngineResponse } from "./types";
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

/**
 * Extracts or converts existing template analysis into standard QuotationEngineMapping.
 */
function toEngineMapping(mapping: ExcelTemplateMapping): QuotationEngineMapping {
  const clientCoords = mapping.clientDetailsCoords || {};

  const productCol = mapping.columns?.product || 1;
  const amountCol = mapping.columns?.amount || (productCol + 4);

  let qtyCol = mapping.columns?.qty;
  let priceCol = mapping.columns?.rate;
  let gstCol = mapping.columns?.gst;

  // Prevent collisions when AI failed to identify qty or price columns
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

  // 1. Check Invalid Template
  if (!worksheet || !worksheet.rowCount || worksheet.rowCount <= 0) {
    invalidTemplate = true;
    errors.push("Invalid template: Worksheet is empty or cannot be accessed.");
  }

  // 2. Check Missing Mapping
  if (!mapping.productStartRow || !mapping.productColumn || !mapping.qtyColumn || !mapping.priceColumn || !mapping.amountColumn) {
    missingMapping = true;
    errors.push("Missing mapping: One or more essential column coordinates (product, qty, price, amount) are missing.");
  }

  // 3. Check Data Model & Populated Rows for Products, Quantities, Prices
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

  // 4. Check Broken Formulas across the entire sheet
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const val = cell.value;
      if (val !== null && typeof val === "object") {
        if ("error" in (val as any)) {
          const errCode = String((val as any).error);
          if (/^#(REF!|VALUE!|NAME\?|DIV\/0!|NULL!|N\/A|NUM!)/i.test(errCode)) {
            brokenFormula = true;
            errors.push(`Broken formula detected at cell ${cell.address} (Row ${rowNumber}, Col ${colNumber}): ${errCode}`);
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

/**
 * Helper: Shift relative row occurrences in an Excel formula string from oldRow to newRow.
 * E.g., shifting formula "E12*F12" from row 12 to 13 becomes "E13*F13".
 */
function shiftFormulaRow(formula: string, oldRow: number, newRow: number): string {
  const reg = new RegExp(`(\\b[A-Z]+)${oldRow}\\b`, "gi");
  return formula.replace(reg, `$1${newRow}`);
}

/**
 * SECOND Quotation Engine: High-Fidelity ExcelJS Engine
 * Implements strict, reliable mapping preservation and robust pre-export validation.
 */
export async function runExcelJSQuotationEngine(payload: ExcelPayload): Promise<QuotationEngineResponse> {
  const { brand, company, items, discount, tax, total, quotationId, customerName, clientDetails, date } = payload;
  const warnings: string[] = [];

  // 1. Build Data Model
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

  // 2. Require Custom Excel Template for ExcelJS Engine
  if (!brand.customExcelTemplate) {
    throw new Error("ExcelJS Engine requires a custom uploaded Excel template. Falling back...");
  }

  const buffer = base64ToArrayBuffer(brand.customExcelTemplate);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("Invalid template: No worksheet found in workbook.");
  }

  // 3. Retrieve or Analyze Template Mapping (Strictly once, NO redundant re-scans)
  let rawMapping: ExcelTemplateMapping | undefined = brand.customExcelMapping;
  if (!rawMapping) {
    console.log("⚡ ExcelJS Engine: No stored mapping found. Running single AI template analysis...");
    rawMapping = await analyzeExcelTemplate(brand.customExcelTemplate);
  } else {
    console.log("✨ ExcelJS Engine: Reusing stored template mapping without re-analysis.");
  }

  const engineMapping: QuotationEngineMapping = toEngineMapping(rawMapping);

  // 4. Fill Only Dynamic Fields via Exact Coordinate Mapping
  if (engineMapping.customerNameCell) {
    const cell = worksheet.getRow(engineMapping.customerNameCell.row).getCell(engineMapping.customerNameCell.col);
    cell.value = model.customer.name || "";
  }
  if (engineMapping.addressCell && model.customer.address) {
    const cell = worksheet.getRow(engineMapping.addressCell.row).getCell(engineMapping.addressCell.col);
    cell.value = model.customer.address;
  }
  if (engineMapping.quotationNumberCell) {
    const cell = worksheet.getRow(engineMapping.quotationNumberCell.row).getCell(engineMapping.quotationNumberCell.col);
    cell.value = model.quotationId;
  }
  if (engineMapping.dateCell) {
    const cell = worksheet.getRow(engineMapping.dateCell.row).getCell(engineMapping.dateCell.col);
    cell.value = model.date;
  }

  // 5. Determine Sample Rows & Handle Non-Destructive Dynamic Row Insertion
  const startRow = engineMapping.productStartRow;
  const origEndRow = rawMapping.dataEndRowIndex || startRow;
  const sampleRowCount = Math.max(1, origEndRow - startRow + 1);
  const itemsCount = model.products.length;
  let rowsInserted = 0;

  if (itemsCount > sampleRowCount) {
    rowsInserted = itemsCount - sampleRowCount;
    const sampleReferenceRowNumber = origEndRow;
    const sampleRefRow = worksheet.getRow(sampleReferenceRowNumber);

    // Splice blank rows above totals/footer while preserving sheet layout
    worksheet.spliceRows(sampleReferenceRowNumber + 1, 0, ...new Array(rowsInserted).fill([]));

    // Copy formatting, styles, heights, and borders cleanly to inserted rows
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

  // 6. Populate Dynamic Line Items & Preserve Formulas Whenever Possible
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
        // Automatically adjust row references in formula (e.g., E12*F12 -> E13*F13)
        const shiftedFormula = shiftFormulaRow(templateFormulaStr, startRow, currentRowNum);
        amountCell.value = {
          formula: shiftedFormula,
          result: p.amount,
        };
      } else {
        // Generate reliable calculation formula if template lacked one
        const qtyLetter = worksheet.getColumn(engineMapping.qtyColumn).letter;
        const priceLetter = worksheet.getColumn(engineMapping.priceColumn).letter;
        amountCell.value = {
          formula: `${qtyLetter}${currentRowNum}*${priceLetter}${currentRowNum}`,
          result: p.amount,
        };
      }
    } else {
      // For leftover sample rows in template when itemsCount < sampleRowCount, clear ONLY the item dynamic cells
      row.getCell(engineMapping.productColumn).value = null;
      row.getCell(engineMapping.qtyColumn).value = null;
      row.getCell(engineMapping.priceColumn).value = null;
      if (engineMapping.gstColumn) row.getCell(engineMapping.gstColumn).value = null;
      row.getCell(engineMapping.amountColumn).value = null;
    }
  }

  // 7. Recalculate Totals & Preserve Footer Formula Integrities
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
    // If original total already had a SUM or combination formula, ensure result is updated or assign standard payable
    if (!cellVal || typeof cellVal !== "object" || !("formula" in (cellVal as any))) {
      totalCell.value = model.totals.payable;
    } else {
      (cellVal as any).result = model.totals.payable;
    }
  }

  // 8. Execute Comprehensive Pre-Export Validation
  const validationReport = validatePreExport(model, worksheet, engineMapping);
  if (!validationReport.valid) {
    const errorSummary = `ExcelJS Engine Pre-Export Validation Failed:\n` + validationReport.errors.map((e) => `• ${e}`).join("\n");
    console.warn("⚠️ " + errorSummary);
    throw new Error(errorSummary);
  }

  // 9. Never Overwrite User's Original Template -> Always create Quotation_Output.xlsx
  const outputBuffer = await workbook.xlsx.writeBuffer();
  triggerDownload(outputBuffer, "Quotation_Output.xlsx");

  return { warnings };
}
