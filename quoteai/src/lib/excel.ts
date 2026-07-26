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
            return upper.includes("PRODUCT") || upper.includes("ITEM") || upper.includes("DESCRIPTION") || upper.includes("SKU") || upper.includes("PARTICULARS") || upper.includes("NAME");
          })
        );

        if (headerRowIndex === -1) {
          headerRowIndex = Math.min(existingRows.length, 5);
          existingRows[headerRowIndex] = ["PRODUCT / DESCRIPTION", "SKU", "QTY", "RATE (₹)", "GST %", "AMOUNT (₹)"];
        }

        const topRows: any[][] = existingRows.slice(0, headerRowIndex + 1);
        const bottomRows: any[][] = existingRows.slice(headerRowIndex + 1);

        // Find where the template's footer / signature / totals start in bottomRows
        let footerStartIndex = bottomRows.findIndex((row) =>
          row && row.some((cell: any) => {
            if (typeof cell !== "string") return false;
            const upper = cell.toUpperCase();
            return upper.includes("SUBTOTAL") || upper.includes("TOTAL") || upper.includes("TERMS") || upper.includes("BANK") || upper.includes("SIGN") || upper.includes("FOR ") || upper.includes("CONDITIONS") || upper.includes("NOTE") || upper.includes("AUTHORISED");
          })
        );

        const newRows: any[][] = [...topRows];

        // Inject Quotation Line Items
        items.forEach((item) => {
          newRows.push([
            item.product,
            item.sku,
            item.qty,
            item.rate,
            `${item.gst}%`,
            item.qty * item.rate,
          ]);
        });

        newRows.push([]);

        // If template has its own footer/signature block below the table, preserve it!
        if (footerStartIndex !== -1) {
          const preservedFooter = bottomRows.slice(footerStartIndex);
          // Insert our totals right above their preserved footer
          newRows.push(["", "", "", "", "Subtotal:", subtotal]);
          if (discount > 0) {
            const discountVal = subtotal * (discount / 100);
            newRows.push(["", "", "", "", `Discount (${discount}%):`, -discountVal]);
          }
          newRows.push(["", "", "", "", "Tax (GST):", tax]);
          newRows.push(["", "", "", "", "Total Payable:", total]);
          newRows.push([]);
          newRows.push(...preservedFooter);
        } else {
          // Standard totals and terms if no custom footer found
          newRows.push(["", "", "", "", "Subtotal:", subtotal]);
          if (discount > 0) {
            const discountVal = subtotal * (discount / 100);
            newRows.push(["", "", "", "", `Discount (${discount}%):`, -discountVal]);
          }
          newRows.push(["", "", "", "", "Tax (GST):", tax]);
          newRows.push(["", "", "", "", "Total Payable:", total]);
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
