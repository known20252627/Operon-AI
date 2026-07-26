/* ──────────────────────────────────────────────
   QuoteAI — PDF Generation with Custom Design
   ────────────────────────────────────────────── */

import { jsPDF } from "jspdf";
import { formatCurrency } from "./utils";
import type { QuoteItem, BrandSettings } from "@/types";

export interface PdfPayload {
  brand: BrandSettings;
  items: QuoteItem[];
  discount: number;
  total: number;
  quotationId: string;
  customerName: string;
  date: string;
}

/** Generate and download a branded quotation PDF. */
export function downloadQuotationPdf(payload: PdfPayload): void {
  const { brand, items, discount, total, quotationId, customerName, date } = payload;
  const pdf = new jsPDF();

  // ── Watermark Text ──────────────────────────
  if (brand.watermarkText) {
    pdf.saveGraphicsState();
    pdf.setTextColor(240, 240, 245);
    pdf.setFontSize(50);
    pdf.text(brand.watermarkText.toUpperCase(), 35, 150, { angle: 45 });
    pdf.restoreGraphicsState();
  }

  // ── Header Bar or Uploaded Custom Letterhead ──
  if (brand.customHeaderImage) {
    try {
      pdf.addImage(brand.customHeaderImage, 0, 0, 210, 35);
    } catch (e) {
      console.error("Failed to render custom header image on PDF:", e);
      pdf.setFillColor(brand.accent || "#3b82f6");
      pdf.rect(0, 0, 210, 28, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text(brand.name || "Company Name", 16, 18);
    }
  } else if (brand.templateStyle === "classic") {
    pdf.setDrawColor(brand.accent || "#3b82f6");
    pdf.setLineWidth(1.5);
    pdf.line(16, 25, 194, 25);
    pdf.setTextColor(35, 31, 53);
    pdf.setFontSize(22);
    pdf.text(brand.name || "Company Name", 16, 18);
    pdf.setFontSize(10);
    pdf.setTextColor(105, 99, 120);
    pdf.text("OFFICIAL ESTIMATE / QUOTATION", 130, 18);
  } else if (brand.templateStyle === "custom_uploaded") {
    // Elegant Custom Design Banner
    pdf.setFillColor(brand.accent || "#4f46e5");
    pdf.rect(0, 0, 210, 32, "F");
    pdf.setFillColor(20, 20, 30);
    pdf.rect(0, 30, 210, 3, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text((brand.name || "Company Name").toUpperCase(), 16, 18);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("CUSTOM CERTIFIED QUOTATION DESIGN", 16, 26);
  } else if (brand.templateStyle === "minimal") {
    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text(brand.name || "Company Name", 16, 20);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(120, 120, 140);
    pdf.text("COMMERCIAL QUOTATION", 16, 27);
    pdf.setDrawColor(200, 200, 210);
    pdf.setLineWidth(0.5);
    pdf.line(16, 32, 194, 32);
  } else {
    // Default Modern Clean
    pdf.setFillColor(brand.accent || "#3b82f6");
    pdf.rect(0, 0, 210, 28, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text(brand.name || "Company Name", 16, 18);
  }

  // ── Title ───────────────────────────────────
  let y = (brand.customHeaderImage || brand.templateStyle === "custom_uploaded") ? 45 : 46;
  pdf.setTextColor(35, 31, 53);
  pdf.setFontSize(18);
  pdf.text("QUOTATION", 16, y);

  // ── Meta line ───────────────────────────────
  y += 8;
  pdf.setFontSize(10);
  pdf.setTextColor(105, 99, 120);
  pdf.text(`${quotationId}  |  To: ${customerName}  |  Date: ${date}`, 16, y);

  // ── Column headers ──────────────────────────
  y += 18;
  pdf.setFillColor(245, 245, 250);
  pdf.rect(16, y - 6, 178, 8, "F");
  pdf.setTextColor(70, 64, 86);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("PRODUCT DESCRIPTION & SKU", 18, y - 0.5);
  pdf.text("QTY", 120, y - 0.5);
  pdf.text("AMOUNT", 160, y - 0.5);
  pdf.setFont("helvetica", "normal");
  y += 8;

  // ── Line items ──────────────────────────────
  items.forEach((item) => {
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }
    pdf.setDrawColor(230, 228, 238);
    pdf.line(16, y + 2, 194, y + 2);
    pdf.setTextColor(35, 31, 53);
    pdf.setFontSize(10);
    
    // Product title & SKU
    const productLabel = `${item.product} (SKU: ${item.sku})`;
    const splitTitle = pdf.splitTextToSize(productLabel, 95);
    pdf.text(splitTitle, 18, y);
    pdf.text(String(item.qty), 122, y);
    pdf.text(formatCurrency(item.qty * item.rate), 160, y);
    y += Math.max(10, splitTitle.length * 6 + 4);
  });

  // ── Discount ────────────────────────────────
  if (discount > 0) {
    y += 4;
    pdf.setFontSize(10);
    pdf.setTextColor(105, 99, 120);
    pdf.text(`Discount: ${discount}%`, 122, y);
    y += 8;
  }

  // ── Total ───────────────────────────────────
  y += 6;
  pdf.setFontSize(11);
  pdf.setTextColor(35, 31, 53);
  pdf.setFont("helvetica", "bold");
  pdf.text("Total incl. GST", 122, y);
  pdf.setFontSize(15);
  pdf.setTextColor(brand.accent || "#3b82f6");
  pdf.text(formatCurrency(total), 160, y);
  pdf.setFont("helvetica", "normal");
  y += 18;

  // ── Terms & Conditions ──────────────────────
  if (y > 240) {
    pdf.addPage();
    y = 20;
  }
  pdf.setFontSize(8);
  pdf.setTextColor(120, 115, 135);
  pdf.setFont("helvetica", "bold");
  pdf.text("TERMS & CONDITIONS:", 16, y);
  pdf.setFont("helvetica", "normal");
  y += 5;
  const splitTerms = pdf.splitTextToSize(brand.terms || "Standard delivery and quotation terms apply.", 120);
  pdf.text(splitTerms, 16, y);

  // ── Footer Stamp & Signature ────────────────
  if (brand.customFooterImage) {
    try {
      // Position stamp on the bottom right
      const stampY = Math.min(245, y - 5);
      pdf.addImage(brand.customFooterImage, 140, stampY, 50, 22);
    } catch (e) {
      console.error("Failed to render custom footer image on PDF:", e);
    }
  }

  // ── Save ────────────────────────────────────
  pdf.save(`OperonAI_Quotation_${quotationId}.pdf`);
}
