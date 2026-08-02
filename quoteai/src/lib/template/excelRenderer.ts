/* ══════════════════════════════════════════════
   QuoteAI — Deterministic Excel Quotation Renderer
   ══════════════════════════════════════════════ */

import ExcelJS from "exceljs";
import type { QuotationTemplate } from "@/types/template";
import type { QuoteItem, ClientDetails } from "@/types";

export interface ExportQuotationData {
  quotationId: string;
  customerName: string;
  clientDetails?: ClientDetails;
  date: string;
  items: QuoteItem[];
  discount: number;
  tax: number;
  total: number;
  template?: QuotationTemplate;
}

function hexToExcelColor(hex?: string, fallback = "FF7052D7"): string {
  if (!hex || !hex.startsWith("#")) return fallback;
  const clean = hex.replace("#", "").toUpperCase();
  if (clean.length === 6) return `FF${clean}`;
  if (clean.length === 3) return `FF${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`;
  return fallback;
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
 * Deterministically generates and downloads a professional Excel quotation file
 * based purely on the selected Operon AI QuotationTemplate configuration.
 */
export async function generateDeterministicExcel(data: ExportQuotationData, template: QuotationTemplate): Promise<{ warnings: string[] }> {
  const warnings: string[] = [];
  const cfg = template.config;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Operon AI Enterprise";
  workbook.lastModifiedBy = "Operon AI Platform";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Quotation", {
    pageSetup: {
      paperSize: (cfg.paperSize === "Letter" ? 1 : 9) as any,
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        top: (cfg.margins?.top || 15) / 25.4,
        bottom: (cfg.margins?.bottom || 15) / 25.4,
        left: (cfg.margins?.left || 15) / 25.4,
        right: (cfg.margins?.right || 15) / 25.4,
        header: 0.3,
        footer: 0.3,
      },
    },
    views: [{ showGridLines: true }],
  });

  // Determine active columns based on user toggle configuration
  const activeCols = cfg.columns;
  const colLabels = cfg.columnLabels;

  interface ColumnDef {
    key: string;
    header: string;
    width: number;
    align: "left" | "center" | "right";
    numFmt?: string;
  }

  const columns: ColumnDef[] = [];
  if (activeCols.srNo) columns.push({ key: "srNo", header: colLabels.srNo, width: 8, align: "center" });
  if (activeCols.product) columns.push({ key: "product", header: colLabels.product, width: 34, align: "left" });
  if (activeCols.description) columns.push({ key: "description", header: colLabels.description, width: 30, align: "left" });
  if (activeCols.hsn) columns.push({ key: "hsn", header: colLabels.hsn, width: 14, align: "center" });
  if (activeCols.qty) columns.push({ key: "qty", header: colLabels.qty, width: 10, align: "right", numFmt: "#,##0" });
  if (activeCols.unit) columns.push({ key: "unit", header: colLabels.unit, width: 8, align: "center" });
  if (activeCols.rate) columns.push({ key: "rate", header: colLabels.rate, width: 15, align: "right", numFmt: "₹#,##0.00" });
  if (activeCols.gst) columns.push({ key: "gst", header: colLabels.gst, width: 10, align: "right", numFmt: "0.0%" });
  if (activeCols.discount) columns.push({ key: "discount", header: colLabels.discount, width: 12, align: "right", numFmt: "0.0%" });
  if (activeCols.amount) columns.push({ key: "amount", header: colLabels.amount, width: 18, align: "right", numFmt: "₹#,##0.00" });

  if (columns.length === 0) {
    columns.push(
      { key: "product", header: "Product", width: 40, align: "left" },
      { key: "qty", header: "Qty", width: 12, align: "right" },
      { key: "rate", header: "Rate", width: 15, align: "right" },
      { key: "amount", header: "Amount", width: 18, align: "right" }
    );
  }

  const totalColCount = columns.length;
  worksheet.columns = columns.map((c) => ({ key: c.key, width: c.width }));

  const fontName = cfg.font || "Inter";
  const fontScaleSize = cfg.fontSizeScale === "compact" ? 10 : cfg.fontSizeScale === "spacious" ? 12 : 11;
  const primaryArgb = hexToExcelColor(cfg.primaryColor, "FF7052D7");
  const isDarkTheme = cfg.theme === "dark";

  let currentRowIdx = 1;

  // 1. COMPANY LOGO INSERTION
  if (cfg.company?.logo && cfg.company.logo.startsWith("data:image/")) {
    try {
      const [mimePart, base64Data] = cfg.company.logo.split(";base64,");
      if (base64Data) {
        const ext = mimePart.includes("png") ? "png" : mimePart.includes("gif") ? "gif" : "jpeg";
        const imageId = workbook.addImage({
          base64: base64Data,
          extension: ext as any,
        });
        const logoRow = worksheet.getRow(currentRowIdx);
        logoRow.height = 45; // Reserve row height for logo image
        worksheet.addImage(imageId, {
          tl: { col: 0, row: currentRowIdx - 1 }, // Top-left anchor (0-indexed)
          ext: { width: 140, height: 45 },
        });

        const quoteNoCell = logoRow.getCell(totalColCount);
        quoteNoCell.value = `QUOTATION #${data.quotationId}`;
        quoteNoCell.font = { name: fontName, size: 16, bold: true, color: { argb: isDarkTheme ? "FFE0F2FE" : "FF334155" } };
        quoteNoCell.alignment = { vertical: "middle", horizontal: "right" };
        
        currentRowIdx++;
      }
    } catch (err) {
      console.error("Failed to insert logo into Excel:", err);
      warnings.push("Could not render logo image into spreadsheet.");
    }
  }

  // 2. Company Header & Title Block
  const titleRow = worksheet.getRow(currentRowIdx);
  titleRow.height = 32;
  const titleCell = titleRow.getCell(1);
  titleCell.value = cfg.company.name || "OPERON AI ENTERPRISE";
  titleCell.font = { name: fontName, size: 17, bold: true, color: { argb: isDarkTheme ? "FFFFFFFF" : primaryArgb } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };

  // If logo wasn't inserted above, put Quotation number here
  if (!cfg.company?.logo || !cfg.company.logo.startsWith("data:image/")) {
    const quoteNoCell = titleRow.getCell(totalColCount);
    quoteNoCell.value = `QUOTATION #${data.quotationId}`;
    quoteNoCell.font = { name: fontName, size: 15, bold: true, color: { argb: isDarkTheme ? "FFE0F2FE" : "FF334155" } };
    quoteNoCell.alignment = { vertical: "middle", horizontal: "right" };
  } else {
    const dateTopCell = titleRow.getCell(totalColCount);
    dateTopCell.value = `Date: ${data.date || new Date().toLocaleDateString("en-IN")}`;
    dateTopCell.font = { name: fontName, size: 11, bold: true, color: { argb: "FF475569" } };
    dateTopCell.alignment = { vertical: "middle", horizontal: "right" };
  }
  currentRowIdx++;

  // 3. Company Address and Contact details
  const detailsRow = worksheet.getRow(currentRowIdx);
  detailsRow.height = 22;
  const addrCell = detailsRow.getCell(1);
  const gstText = cfg.company.gstNumber ? ` · GSTIN: ${cfg.company.gstNumber}` : "";
  addrCell.value = `${cfg.company.address || "India"} · Email: ${cfg.company.email || "sales@operonai.com"}${gstText}`;
  addrCell.font = { name: fontName, size: 10, color: { argb: "FF64748B" } };
  addrCell.alignment = { vertical: "top", horizontal: "left" };
  
  if (!cfg.company?.logo || !cfg.company.logo.startsWith("data:image/")) {
    const dateCell = detailsRow.getCell(totalColCount);
    dateCell.value = `Date: ${data.date || new Date().toLocaleDateString("en-IN")}`;
    dateCell.font = { name: fontName, size: 10, bold: true, color: { argb: "FF475569" } };
    dateCell.alignment = { vertical: "top", horizontal: "right" };
  }

  currentRowIdx += 2;

  // 4. Bill To / Customer Block
  const custTitleRow = worksheet.getRow(currentRowIdx);
  custTitleRow.height = 20;
  const custHeaderCell = custTitleRow.getCell(1);
  custHeaderCell.value = "BILL TO / PREPARED FOR:";
  custHeaderCell.font = { name: fontName, size: 11, bold: true, color: { argb: isDarkTheme ? "FFCBD5E1" : "FF334155" } };
  currentRowIdx++;

  const custNameRow = worksheet.getRow(currentRowIdx);
  custNameRow.height = 24;
  const cNameCell = custNameRow.getCell(1);
  cNameCell.value = data.customerName || "Valued Customer";
  cNameCell.font = { name: fontName, size: 13, bold: true, color: { argb: isDarkTheme ? "FFFFFFFF" : "FF0F172A" } };
  currentRowIdx++;

  if (data.clientDetails?.address || data.clientDetails?.gstNumber) {
    const custSubRow = worksheet.getRow(currentRowIdx);
    custSubRow.height = 20;
    const subText = [
      data.clientDetails.address,
      data.clientDetails.gstNumber ? `GSTIN: ${data.clientDetails.gstNumber}` : undefined,
      data.clientDetails.phone,
    ].filter(Boolean).join(" · ");
    custSubRow.getCell(1).value = subText;
    custSubRow.getCell(1).font = { name: fontName, size: 10, color: { argb: "FF64748B" } };
    currentRowIdx++;
  }

  currentRowIdx++;

  // Helper to render Canva Widgets in Excel
  function renderWidgetsInExcel(position: string) {
    const posWidgets = (cfg.widgets || []).filter((w) => w.enabled && w.position === position);
    posWidgets.forEach((w) => {
      const wRow = worksheet.getRow(currentRowIdx);
      wRow.height = 26;
      const wCell = wRow.getCell(1);
      wCell.value = `${w.title.toUpperCase()} — ${w.content}`;
      wCell.font = { name: fontName, size: 10, bold: true, color: { argb: w.style === "warning" ? "FFB45309" : primaryArgb } };
      wCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      wCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: w.style === "warning" ? "FFFFFBEB" : "FFF1F5F9" }
      };
      if (totalColCount > 1) {
        try {
          worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, totalColCount);
        } catch (e) {}
      }
      currentRowIdx += 2;
    });
  }

  // Render Above Table Widgets
  renderWidgetsInExcel("above_table");

  // 5. Product Table Header
  const headerRowIdx = currentRowIdx;
  const headerRow = worksheet.getRow(headerRowIdx);
  headerRow.height = 28;

  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header.toUpperCase();
    cell.font = { name: fontName, size: fontScaleSize + 1, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isDarkTheme ? "FF4C1D95" : primaryArgb },
    };
    cell.alignment = { vertical: "middle", horizontal: col.align as any };
    cell.border = {
      top: { style: "medium", color: { argb: "FF94A3B8" } },
      bottom: { style: "medium", color: { argb: "FF334155" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  currentRowIdx++;
  const tableDataStartRow = currentRowIdx;

  // 6. Populate Table Data Rows
  data.items.forEach((item, idx) => {
    const row = worksheet.getRow(currentRowIdx);
    row.height = 24;
    const isStriped = cfg.tableStyle === "striped" && idx % 2 === 1;

    columns.forEach((col, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      const key = col.key;

      if (key === "srNo") {
        cell.value = idx + 1;
      } else if (key === "product") {
        cell.value = item.product;
        cell.font = { name: fontName, size: fontScaleSize, bold: true, color: { argb: isDarkTheme ? "FFFFFFFF" : "FF0F172A" } };
      } else if (key === "description") {
        cell.value = (item as any).description || (item.sku ? `SKU: ${item.sku} — Clinical medical unit` : "Standard business device");
      } else if (key === "hsn") {
        cell.value = (item as any).hsn || "90189099";
      } else if (key === "qty") {
        cell.value = Number(item.qty) || 0;
      } else if (key === "unit") {
        cell.value = (item as any).unit || "Nos";
      } else if (key === "rate") {
        cell.value = Number(item.rate) || 0;
      } else if (key === "gst") {
        cell.value = (item.gst || 12) / 100;
      } else if (key === "discount") {
        cell.value = 0;
      } else if (key === "amount") {
        const qtyLetter = worksheet.getColumn(columns.findIndex((c) => c.key === "qty") + 1).letter || "C";
        const rateLetter = worksheet.getColumn(columns.findIndex((c) => c.key === "rate") + 1).letter || "E";
        cell.value = { formula: `${qtyLetter}${currentRowIdx}*${rateLetter}${currentRowIdx}` };
        cell.font = { name: fontName, size: fontScaleSize, bold: true, color: { argb: isDarkTheme ? "FFFFFFFF" : "FF0F172A" } };
      }

      if (col.numFmt) cell.numFmt = col.numFmt;
      if (!cell.font) cell.font = { name: fontName, size: fontScaleSize, color: { argb: isDarkTheme ? "FFCBD5E1" : "FF334155" } };
      cell.alignment = { vertical: "middle", horizontal: col.align as any };

      if (isStriped) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isDarkTheme ? "FF1E293B" : "FFF8FAFC" } };
      }

      cell.border = {
        bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFF1F5F9" } },
        right: { style: "thin", color: { argb: "FFF1F5F9" } },
      };
    });

    currentRowIdx++;
  });

  const tableDataEndRow = Math.max(tableDataStartRow, currentRowIdx - 1);

  // Render Below Table Widgets
  currentRowIdx++;
  renderWidgetsInExcel("below_table");

  // 7. Subtotal & Grand Total Section
  const amountColIdx = columns.findIndex((c) => c.key === "amount") + 1;
  const labelColIdx = Math.max(1, amountColIdx - 2);

  function addSummaryRow(label: string, formulaStr: string, isGrand = false) {
    const sRow = worksheet.getRow(currentRowIdx);
    sRow.height = isGrand ? 28 : 22;

    const lblCell = sRow.getCell(labelColIdx);
    lblCell.value = label;
    lblCell.font = { name: fontName, size: isGrand ? fontScaleSize + 1 : fontScaleSize, bold: true, color: { argb: isGrand ? (isDarkTheme ? "FFFFFFFF" : "FF0F172A") : "FF475569" } };
    lblCell.alignment = { vertical: "middle", horizontal: "right" };

    if (amountColIdx > 0) {
      const valCell = sRow.getCell(amountColIdx);
      valCell.value = { formula: formulaStr };
      valCell.numFmt = "₹#,##0.00";
      valCell.font = { name: fontName, size: isGrand ? fontScaleSize + 2 : fontScaleSize + 1, bold: true, color: { argb: isGrand ? (isDarkTheme ? "FFE0F2FE" : primaryArgb) : "FF0F172A" } };
      valCell.alignment = { vertical: "middle", horizontal: "right" };

      if (isGrand) {
        valCell.border = {
          top: { style: "thin", color: { argb: "FF475569" } },
          bottom: { style: "double", color: { argb: "FF0F172A" } },
        };
      }
    }
    currentRowIdx++;
  }

  const amtLetter = amountColIdx > 0 ? worksheet.getColumn(amountColIdx).letter : "D";
  const subtotalRowIdx = currentRowIdx;
  addSummaryRow("SUBTOTAL", `SUM(${amtLetter}${tableDataStartRow}:${amtLetter}${tableDataEndRow})`);
  
  const taxRowIdx = currentRowIdx;
  addSummaryRow("ESTIMATED TAX / GST", `${amtLetter}${subtotalRowIdx}*0.12`);
  
  if (data.discount > 0) {
    const discRowIdx = currentRowIdx;
    addSummaryRow("DISCOUNT REBATE", `${amtLetter}${subtotalRowIdx}*${(data.discount / 100).toFixed(4)}`);
    addSummaryRow("GRAND TOTAL", `${amtLetter}${subtotalRowIdx}+${amtLetter}${taxRowIdx}-${amtLetter}${discRowIdx}`, true);
  } else {
    addSummaryRow("GRAND TOTAL PAYABLE", `${amtLetter}${subtotalRowIdx}+${amtLetter}${taxRowIdx}`, true);
  }

  currentRowIdx += 2;

  // Render Footer Top Widgets
  renderWidgetsInExcel("footer_top");

  // 8. MULTI-ROW TERMS & CONDITIONS AND BANK DETAILS BLOCK
  const bankHeaderRow = worksheet.getRow(currentRowIdx);
  bankHeaderRow.height = 22;
  const bHCell = bankHeaderRow.getCell(1);
  bHCell.value = "BANK & PAYMENT DETAILS";
  bHCell.font = { name: fontName, size: fontScaleSize + 1, bold: true, color: { argb: isDarkTheme ? "FFCBD5E1" : "FF1E293B" } };
  bHCell.alignment = { vertical: "middle", horizontal: "left" };
  currentRowIdx++;

  const bankLines = [
    `Bank Account & Bank: ${cfg.company.bankDetails || "Standard Commercial Bank A/C"}`,
    `UPI ID / Virtual Address: ${cfg.company.upiId || "operonai@upi"}`,
    `Company PAN Number: ${cfg.company.panNumber || "N/A"}`,
  ];

  bankLines.forEach((line) => {
    const row = worksheet.getRow(currentRowIdx);
    row.height = 20;
    const cell = row.getCell(1);
    cell.value = line;
    cell.font = { name: fontName, size: fontScaleSize, color: { argb: "FF475569" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    if (totalColCount > 3) {
      try {
        worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, Math.min(totalColCount - 2, 6));
      } catch (e) {}
    }
    currentRowIdx++;
  });

  currentRowIdx++; // Blank spacing row

  // Terms & Conditions Header
  const termsHeaderRow = worksheet.getRow(currentRowIdx);
  termsHeaderRow.height = 22;
  const tHCell = termsHeaderRow.getCell(1);
  tHCell.value = "TERMS & CONDITIONS";
  tHCell.font = { name: fontName, size: fontScaleSize + 1, bold: true, color: { argb: isDarkTheme ? "FFCBD5E1" : "FF1E293B" } };
  tHCell.alignment = { vertical: "middle", horizontal: "left" };
  currentRowIdx++;

  // SPLIT TERMS INTO DISTINCT SEPARATE ROWS / BLOCKS
  const termsString = cfg.terms || "1. Validity: 15 Days from issue date.\n2. Payment: 100% advance along with PO.\n3. Taxes as applicable under GST rules.";
  const termsLines = termsString.split(/\r?\n/).map((t) => t.trim()).filter((t) => t.length > 0);

  termsLines.forEach((termLine) => {
    const termRow = worksheet.getRow(currentRowIdx);
    termRow.height = 22;
    const termCell = termRow.getCell(1);
    termCell.value = termLine;
    termCell.font = { name: fontName, size: fontScaleSize, color: { argb: "FF334155" } };
    termCell.alignment = { vertical: "middle", horizontal: "left" };
    
    // Merge across multiple columns so each condition rests cleanly on its own wide block without truncation
    if (totalColCount > 2) {
      try {
        worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, Math.min(totalColCount - 1, 8));
      } catch (e) {}
    }
    currentRowIdx++;
  });

  currentRowIdx += 2;

  // 9. Authorized Signatory & Digital Signature Stamp Block
  const sigRowIdx = currentRowIdx;
  if (cfg.company?.authorizedSignature && cfg.company.authorizedSignature.startsWith("data:image/")) {
    try {
      const [mimePart, base64Data] = cfg.company.authorizedSignature.split(";base64,");
      if (base64Data) {
        const ext = mimePart.includes("png") ? "png" : mimePart.includes("gif") ? "gif" : "jpeg";
        const sigImageId = workbook.addImage({
          base64: base64Data,
          extension: ext as any,
        });
        const targetCol = Math.max(0, totalColCount - 2);
        worksheet.addImage(sigImageId, {
          tl: { col: targetCol, row: sigRowIdx - 1 },
          ext: { width: 130, height: 40 },
        });
        currentRowIdx += 2; // Reserve space for signature stamp
      }
    } catch (e) {
      console.error("Failed to embed digital signature into Excel:", e);
    }
  }

  const sigCompanyRow = worksheet.getRow(currentRowIdx);
  const sigCompanyCell = sigCompanyRow.getCell(totalColCount);
  sigCompanyCell.value = `For ${cfg.company.name || "Operon AI Enterprise"}`;
  sigCompanyCell.font = { name: fontName, size: fontScaleSize, bold: true, color: { argb: "FF334155" } };
  sigCompanyCell.alignment = { vertical: "middle", horizontal: "right" };
  currentRowIdx += 3;

  const sigBottomRow = worksheet.getRow(currentRowIdx);
  const sigBottomCell = sigBottomRow.getCell(totalColCount);
  sigBottomCell.value = "AUTHORIZED SIGNATORY";
  sigBottomCell.font = { name: fontName, size: fontScaleSize - 1, italic: true, color: { argb: "FF64748B" } };
  sigBottomCell.alignment = { vertical: "middle", horizontal: "right" };
  sigBottomCell.border = { top: { style: "thin", color: { argb: "FF94A3B8" } } };

  // Export Buffer & Trigger Auto-Download
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanCustomer = (data.customerName || "Customer").replace(/[^a-z0-9]/gi, "_");
  const fileName = `Quotation_${cleanCustomer}_${data.quotationId}.xlsx`;
  triggerDownload(buffer, fileName);

  return { warnings };
}
