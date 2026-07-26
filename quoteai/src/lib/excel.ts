/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import type { QuoteItem, BrandSettings, CompanySettings } from "@/types";

export interface ExcelPayload {
  brand: BrandSettings;
  company: CompanySettings;
  items: QuoteItem[];
  discount: number;
  tax: number;
  total: number;
  quotationId: string;
  customerName: string;
  date: string;
}

/** Generate and download a branded quotation Excel file (supports custom uploaded Excel templates). */
export function downloadQuotationExcel(payload: ExcelPayload): void {
  const { brand, company, items, discount, tax, total, quotationId, customerName, date } = payload;
  const fileName = `${quotationId}-${customerName.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.rate, 0);

  // ── Custom Uploaded Excel Template Processing ──
  if (brand.customExcelTemplate) {
    try {
      const base64Data = brand.customExcelTemplate.includes(",")
        ? brand.customExcelTemplate.split(",")[1]
        : brand.customExcelTemplate;

      const customWorkbook = XLSX.read(base64Data, { type: "base64" });
      const firstSheetName = customWorkbook.SheetNames[0];
      const sheet = customWorkbook.Sheets[firstSheetName];

      if (sheet) {
        const existingRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Find table header row
        let headerRowIndex = existingRows.findIndex((row) =>
          row && row.some((cell: any) => {
            if (typeof cell !== "string") return false;
            const upper = cell.toUpperCase();
            return upper.includes("PRODUCT") || upper.includes("ITEM") || upper.includes("DESCRIPTION") || upper.includes("SKU") || upper.includes("PARTICULARS") || upper.includes("NAME") || upper.includes("SR") || upper.includes("SL") || upper.includes("QTY") || upper.includes("QUANTITY") || upper.includes("RATE") || upper.includes("PRICE") || upper.includes("AMOUNT") || upper.includes("SPECIFICATION") || upper.includes("EQUIPMENT") || upper.includes("MODEL") || upper.includes("COST");
          })
        );

        if (headerRowIndex === -1) {
          headerRowIndex = Math.min(existingRows.length, 5);
          while (existingRows.length < headerRowIndex) existingRows.push([]);
          existingRows.splice(headerRowIndex, 0, ["SR NO", "PRODUCT / DESCRIPTION", "SKU", "QTY", "RATE (₹)", "GST %", "AMOUNT (₹)"]);
        }

        const topRows: any[][] = existingRows.slice(0, headerRowIndex + 1);
        const bottomRows: any[][] = existingRows.slice(headerRowIndex + 1);

        // Map column indices from header row
        const headerRow = existingRows[headerRowIndex] || [];
        const colMap = { sr: -1, desc: -1, sku: -1, qty: -1, rate: -1, gst: -1, amount: -1 };
        headerRow.forEach((cell: any, idx: number) => {
          if (typeof cell !== "string") return;
          const u = cell.toUpperCase();
          if (u.includes("SR") || u.includes("SL") || u.includes("S.NO") || u.includes("S NO") || u.includes("NO.")) colMap.sr = idx;
          else if (u.includes("DESC") || u.includes("PROD") || u.includes("ITEM") || u.includes("PARTICULAR") || u.includes("NAME") || u.includes("SPEC") || u.includes("EQUIP")) colMap.desc = idx;
          else if (u.includes("SKU") || u.includes("MODEL") || u.includes("CODE") || u.includes("PART")) colMap.sku = idx;
          else if (u.includes("QTY") || u.includes("QUANT")) colMap.qty = idx;
          else if (u.includes("RATE") || u.includes("PRICE") || u.includes("COST")) colMap.rate = idx;
          else if (u.includes("GST") || u.includes("TAX")) colMap.gst = idx;
          else if (u.includes("AMOUNT") || u.includes("TOTAL") || u.includes("VALUE") || u.includes("NET")) colMap.amount = idx;
        });

        if (colMap.desc === -1) colMap.desc = colMap.sr !== -1 ? 1 : 0;
        if (colMap.sku === -1) colMap.sku = colMap.desc + 1;
        if (colMap.qty === -1) colMap.qty = colMap.sku + 1;
        if (colMap.rate === -1) colMap.rate = colMap.qty + 1;
        if (colMap.gst === -1) colMap.gst = colMap.rate + 1;
        if (colMap.amount === -1) colMap.amount = colMap.gst + 1;

        // Find where the template's footer / signature / totals start in bottomRows
        let footerStartIndex = bottomRows.findIndex((row) =>
          row && row.some((cell: any) => {
            if (typeof cell !== "string") return false;
            const upper = cell.toUpperCase();
            return upper.includes("SUBTOTAL") || upper.includes("TOTAL") || upper.includes("TERMS") || upper.includes("BANK") || upper.includes("SIGN") || upper.includes("FOR ") || upper.includes("CONDITIONS") || upper.includes("NOTE") || upper.includes("AUTHORISED");
          })
        );

        const newRows: any[][] = [...topRows];

        // Inject Quotation Line Items into exact mapped columns
        items.forEach((item, idx) => {
          const rowArr: any[] = [];
          if (colMap.sr !== -1) rowArr[colMap.sr] = idx + 1;
          rowArr[colMap.desc] = item.product;
          rowArr[colMap.sku] = item.sku;
          rowArr[colMap.qty] = item.qty;
          rowArr[colMap.rate] = item.rate;
          rowArr[colMap.gst] = `${item.gst}%`;
          rowArr[colMap.amount] = item.qty * item.rate;
          for (let c = 0; c < rowArr.length; c++) {
            if (rowArr[c] === undefined) rowArr[c] = "";
          }
          newRows.push(rowArr);
        });

        newRows.push([]);

        const labelCol = Math.max(0, colMap.amount - 1);
        const valCol = colMap.amount;
        const createTotalRow = (label: string, val: any) => {
          const r: any[] = [];
          r[labelCol] = label;
          r[valCol] = val;
          for (let c = 0; c <= valCol; c++) if (r[c] === undefined) r[c] = "";
          return r;
        };

        // If template has its own footer/signature block below the table, preserve it!
        if (footerStartIndex !== -1) {
          const preservedFooter = bottomRows.slice(footerStartIndex);
          newRows.push(createTotalRow("Subtotal:", subtotal));
          if (discount > 0) {
            const discountVal = subtotal * (discount / 100);
            newRows.push(createTotalRow(`Discount (${discount}%):`, -discountVal));
          }
          newRows.push(createTotalRow("Tax (GST):", tax));
          newRows.push(createTotalRow("Total Payable:", total));
          newRows.push([]);
          newRows.push(...preservedFooter);
        } else {
          newRows.push(createTotalRow("Subtotal:", subtotal));
          if (discount > 0) {
            const discountVal = subtotal * (discount / 100);
            newRows.push(createTotalRow(`Discount (${discount}%):`, -discountVal));
          }
          newRows.push(createTotalRow("Tax (GST):", tax));
          newRows.push(createTotalRow("Total Payable:", total));
          newRows.push([]);
          newRows.push(["Terms & Conditions:"]);
          const termsLines = (brand.terms || "Standard delivery and quotation terms apply.").split("\n");
          termsLines.forEach((line) => newRows.push([line]));
        }

        const updatedSheet = XLSX.utils.aoa_to_sheet(newRows);
        customWorkbook.Sheets[firstSheetName] = updatedSheet;
        XLSX.writeFile(customWorkbook, fileName);
        return;
      }
    } catch (err) {
      console.error("Failed to inject items into custom Excel template, falling back to default layout:", err);
    }
  }

  // ── Default Structured Excel Generation ──
  const rows: any[][] = [];
  
  // Company Header
  rows.push([brand.name.toUpperCase()]);
  rows.push([`GSTIN: ${company.gstNumber}`]);
  rows.push([`Email: ${company.email}`]);
  rows.push([]);
  
  // Quotation Meta
  rows.push(["QUOTATION NO:", quotationId]);
  rows.push(["DATE:", date]);
  rows.push(["CUSTOMER:", customerName]);
  rows.push([]);
  
  // Table Header
  rows.push(["PRODUCT DESCRIPTION", "SKU", "QTY", "RATE (₹)", "GST %", "AMOUNT (₹)"]);
  
  // Line Items
  items.forEach((item) => {
    rows.push([
      item.product,
      item.sku,
      item.qty,
      item.rate,
      `${item.gst}%`,
      item.qty * item.rate
    ]);
  });
  
  rows.push([]);
  
  // Totals
  rows.push(["", "", "", "", "Subtotal:", subtotal]);
  if (discount > 0) {
    const discountValue = subtotal * (discount / 100);
    rows.push(["", "", "", "", `Discount (${discount}%):`, -discountValue]);
  }
  rows.push(["", "", "", "", "Tax (GST):", tax]);
  rows.push(["", "", "", "", "Total Payable:", total]);
  
  rows.push([]);
  rows.push([]);
  
  // Terms
  rows.push(["Terms & Conditions:"]);
  const termsLines = (brand.terms || "Standard delivery and quotation terms apply.").split("\n");
  termsLines.forEach((line) => rows.push([line]));
  
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Quotation");
  
  XLSX.writeFile(workbook, fileName);
}
